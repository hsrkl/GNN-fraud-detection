# SAFEGUARD AI — Financial Fraud Detection System

An end-to-end fraud detection system built for [Hackathon Name] — from raw transaction data to a live, model-connected web dashboard.

## What this is

A binary classification system that detects fraudulent financial transactions using the [PaySim](https://www.kaggle.com/datasets/ealaxi/paysim1) synthetic dataset, deployed behind a real-time web interface with a live transaction risk scanner and a CSV-based monitoring dashboard.

## Project structure

```
├── notebooks/         ML pipeline: EDA, feature engineering, training, evaluation
├── backend/            Flask API serving the trained model (/predict, /metrics)
└── frontend/           React + TypeScript live scanner UI (Paras's build)
```

## The problem

PaySim contains ~6.36M simulated mobile money transactions, of which only ~8,213 (0.13%) are fraudulent — a severely imbalanced binary classification problem. Fraud only occurs in `TRANSFER` and `CASH_OUT` transaction types.

## Approach

1. **EDA** — confirmed fraud only occurs in TRANSFER/CASH_OUT, and identified structural balance inconsistencies (e.g. merchant destination balances always zero) as a real signal rather than dirty data.
2. **Feature engineering** — instead of discarding inconsistent balance data, engineered it into predictive features: `errorBalanceOrig`, `errorBalanceDest`, `orig_emptied`, chain-account flags (accounts appearing as both sender and receiver — a money-laundering "layering" signal), and per-account transaction velocity.
3. **Modeling** — Logistic Regression baseline, XGBoost (with `scale_pos_weight` to handle class imbalance without discarding data) as the main model.
4. **Evaluation** — Precision, Recall, F1, ROC-AUC, and PR-AUC (not accuracy, which is meaningless under this level of imbalance).

## Results

| Model | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|
| Logistic Regression | — | — | — | — |
| XGBoost | — | — | — | — |

*(fill in your team's real final numbers here before submitting)*

## Running it

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend (React):**
```bash
cd frontend/Project_1
npm install
npm run dev
```

## Team

- [Name] — Machine learning / model training
- [Name] — Backend API
- Tanish Gadiya — Frontend
- [Name] — [role]

## Acknowledgements

Dataset: [PaySim1 by Edgar Lopez-Rojas](https://www.kaggle.com/datasets/ealaxi/paysim1). Feature engineering approach informed in part by an independently published, award-winning Kaggle analysis of this dataset.
