"""
test_fraud_api.py

Standalone test script for the GNN + XGBoost fraud detection endpoint
running in Colab behind ngrok.

Usage:
    python test_fraud_api.py --url https://your-ngrok-url.ngrok-free.app
    python test_fraud_api.py --url https://your-ngrok-url.ngrok-free.app --verbose
    python test_fraud_api.py --url https://your-ngrok-url.ngrok-free.app --repeat 5
"""

import argparse
import json
import sys
import time
from typing import Any, Dict, List, Tuple

import requests

HEADERS = {"Content-Type": "application/json", "ngrok-skip-browser-warning": "true"}
TIMEOUT_SECS = 15


# ────────────────────────────────────────────────────────────────────────────
# Test cases: (name, payload, expectation)
# expectation is one of "low", "high", "any" — "any" is used for the
# cold-start case where you don't actually know what the model should say,
# you're just checking it responds without error.
# ────────────────────────────────────────────────────────────────────────────
TEST_CASES: List[Tuple[str, Dict[str, Any], str]] = [
    (
        "normal_daytime_swipe",
        {
            "User": 1, "Card": 0, "Year": 2024, "Month": 6, "Day": 15,
            "Time": "13:42", "Amount": "$47.20",
            "Merchant Name": 3527213246127876916,
            "MCC": 5411,
            "Use Chip": "Swipe Transaction",
            "Errors?": "No error",
        },
        "low",
    ),
    (
        "odd_hour_large_online_cvv_error",
        {
            "User": 1, "Card": 0, "Year": 2024, "Month": 6, "Day": 15,
            "Time": "03:17", "Amount": "$1894.99",
            "Merchant Name": 9184223317239487261,
            "MCC": 5999,
            "Use Chip": "Online Transaction",
            "Errors?": "Bad CVV",
        },
        "high",
    ),
    (
        "cold_start_unseen_user_and_merchant",
        {
            "User": 999999, "Card": 9, "Year": 2024, "Month": 6, "Day": 15,
            "Time": "11:05", "Amount": "$312.00",
            "Merchant Name": 1111111111111111111,
            "MCC": 5732,
            "Use Chip": "Chip Transaction",
            "Errors?": "No error",
        },
        "any",
    ),
    (
        "missing_required_field",  # deliberately malformed — should 400, not 500
        {
            "User": 1, "Card": 0, "Year": 2024, "Month": 6, "Day": 15,
            "Amount": "$50.00",
            "Merchant Name": 3527213246127876916,
            "MCC": 5411,
            "Use Chip": "Swipe Transaction",
            "Errors?": "No error",
        },
        "error",
    ),
]


def check_health(base_url: str) -> bool:
    try:
        r = requests.get(f"{base_url}/health", headers=HEADERS, timeout=TIMEOUT_SECS)
        ok = r.status_code == 200
        print(f"[health] {'OK' if ok else 'FAIL'} — status {r.status_code}")
        return ok
    except requests.exceptions.RequestException as e:
        print(f"[health] FAIL — {e}")
        return False


def run_case(base_url: str, name: str, payload: Dict[str, Any],
             expectation: str, verbose: bool) -> bool:
    try:
        t0 = time.time()
        r = requests.post(f"{base_url}/predict", headers=HEADERS,
                           json=payload, timeout=TIMEOUT_SECS)
        latency_ms = (time.time() - t0) * 1000
    except requests.exceptions.RequestException as e:
        print(f"[{name}] FAIL — request error: {e}")
        return False

    # Case is deliberately malformed — we want a clean 400, not a 500 or a
    # 200 with garbage.
    if expectation == "error":
        passed = r.status_code == 400
        status = "PASS" if passed else "FAIL"
        print(f"[{name}] {status} — expected 400, got {r.status_code} "
              f"({latency_ms:.0f}ms)")
        if verbose or not passed:
            print(f"    body: {r.text[:300]}")
        return passed

    if r.status_code != 200:
        print(f"[{name}] FAIL — status {r.status_code} ({latency_ms:.0f}ms)")
        print(f"    body: {r.text[:300]}")
        return False

    try:
        body = r.json()
    except json.JSONDecodeError:
        print(f"[{name}] FAIL — response wasn't valid JSON "
              f"(likely an ngrok interstitial page, not your API)")
        print(f"    body: {r.text[:300]}")
        return False

    required_keys = {"probability", "is_fraud", "threshold",
                      "customer_known", "merchant_known"}
    missing = required_keys - body.keys()
    if missing:
        print(f"[{name}] FAIL — response missing keys: {missing}")
        print(f"    body: {body}")
        return False

    proba = body["probability"]
    if not isinstance(proba, (int, float)):
        print(f"[{name}] FAIL — probability is not numeric: {type(proba)}")
        return False
    if not (0.0 <= proba <= 1.0):
        print(f"[{name}] FAIL — probability out of [0,1] range: {proba}")
        return False

    # Soft directional check — a heuristic sanity check, not a hard model
    # correctness test. A "low"/"high" mismatch is worth a look but isn't
    # necessarily a bug: it just means this specific case didn't land where
    # you expected, which could be the model, the thresholds, or your
    # assumption about the case.
    directional_ok = True
    if expectation == "low" and proba >= 0.5:
        directional_ok = False
    elif expectation == "high" and proba < 0.5:
        directional_ok = False

    status = "PASS" if directional_ok else "WARN"
    print(f"[{name}] {status} — proba={proba:.4f} is_fraud={body['is_fraud']} "
          f"cust_known={body['customer_known']} merch_known={body['merchant_known']} "
          f"({latency_ms:.0f}ms)")
    if verbose:
        print(f"    full response: {body}")

    # WARN doesn't fail the run — it's a flag for you to look at, not a
    # broken endpoint.
    return True


def main():
    parser = argparse.ArgumentParser(description="Test the fraud detection API")
    parser.add_argument("--url", required=True,
                         help="Base ngrok URL, e.g. https://abc123.ngrok-free.app")
    parser.add_argument("--verbose", action="store_true",
                         help="Print full response bodies")
    parser.add_argument("--repeat", type=int, default=1,
                         help="Repeat the case suite N times (checks rolling-history "
                              "state changes across repeated calls for the same user)")
    args = parser.parse_args()

    base_url = args.url.rstrip("/")

    print(f"Testing {base_url}\n")

    if not check_health(base_url):
        print("\nHealth check failed — is the Colab cell still running? "
              "Is the ngrok URL current (it rotates on every restart unless "
              "you reserved a static domain)?")
        sys.exit(1)

    print()
    all_passed = True
    for run_idx in range(args.repeat):
        if args.repeat > 1:
            print(f"--- run {run_idx + 1}/{args.repeat} ---")
        for name, payload, expectation in TEST_CASES:
            passed = run_case(base_url, name, payload, expectation, args.verbose)
            all_passed = all_passed and passed
        print()

    if not all_passed:
        print("One or more tests failed.")
        sys.exit(1)
    print("All tests passed (WARNs above are directional flags, not failures).")


if __name__ == "__main__":
    main()
