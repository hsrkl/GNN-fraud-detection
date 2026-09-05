A transaction fraud detection pipeline combining a Heterogeneous Graph Neural Network (GNN) for relational representation learning with XGBoost for downstream classification. Served via a Flask REST API and consumed by a React/TypeScript frontend.

## Dataset

* **Primary:** [IBM Credit Card Transactions Dataset](https://www.kaggle.com/datasets/ealtman2019/credit-card-transactions) (24M+ transactions, highly imbalanced).
* **Prototyping:** [PaySim Synthetic Mobile Money Dataset](https://www.kaggle.com/datasets/ealaxi/paysim1) (used for initial feature validation).

## System Architecture

```
[ Transaction / Customer / Merchant / User Nodes ]
                         │
                         ▼
             [ Heterogeneous Graph ]
                         │
                         ▼
              [ 2-Layer HeteroSAGE ]
                         │
                         ▼
  [ Node Embeddings ] + [ Engineered Tabular Features ]
                         │
                         ▼
                [ XGBoost Classifier ]
                         │
                         ▼
             [ Fraud / Legitimate Decision ]

```

### Components

* **Graph Structure:** Constructs a heterogeneous graph with `Transaction`, `Customer` (card-level), `Merchant`, and `User` (account-level) nodes.
	* `Customer -[made]-> Transaction`
	* `Merchant -[involved_in]-> Transaction`
	* `User -[has_card]-> Customer`

* **Representation Learning:** 2-layer `HeteroSAGE` (`HeteroConv` wrapping `SAGEConv`) with Layer Normalization and raw-feature residual skip connections to generate transaction embeddings.
* **Classification:** XGBoost model trained on concatenated GNN embeddings and engineered tabular features.
* **Serving Layer:** Flask backend exposed via ngrok, paired with a React/TypeScript dashboard featuring preset test cases.

## Feature Engineering & Data Integrity

Features are computed using strict temporal boundaries to eliminate target and temporal leakage:

* **Temporal Train/Test Split:** Data is split chronologically by transaction year. All statistics, encodings, and aggregates are computed strictly on the training set and inductively mapped to validation/test sets.
* **Transaction Velocity:** Rolling transaction frequency and volume metrics use a 1-period shift (`shift(1)`) to exclude the current transaction.
* **Behavioral Aggregates:** Customer and merchant historical metrics exclude target-derived attributes (e.g., historical fraud rate is omitted).
* **Categorical Encodings:** Merchant Category Code (MCC) frequency encodings are fit exclusively on training data.

## Loss Function & Optimization

* **Training Objective:** Class-weighted Focal Loss combined with VICReg (Variance-Invariance-Covariance Regularization) to prevent representation collapse under extreme class imbalance.
* **Decision Thresholding:** Precision-Recall curve analysis rather than a default 0.5 probability cutoff.
* **Hyperparameter Optimization:** Optuna Bayesian optimization utilizing an overfit-penalized objective function:

$$\text{Objective} = \text{Test F1} - \lambda \cdot (\text{Train PR-AUC} - \text{Test PR-AUC})$$

* **Ablation Benchmark:** Evaluated against an un-networked baseline (XGBoost on raw engineered features without GNN embeddings) to quantify graph-structure lift.
* **Model Interpretability:** Attempted to add SHAP (SHapley Additive exPlanations) values, so that features can be explained. GNN embeddings can't be explained using SHAP, and the implementation is hence not at all finished.
## Tech Stack

* **Frameworks:** PyTorch, PyTorch Geometric (`HeteroData`, `SAGEConv`, `HeteroConv`), XGBoost, Scikit-Learn
* **Optimization & Interpretability:** Optuna, SHAP
* **Backend & Serving:** Flask, ngrok
* **Frontend:** React, TypeScript
* **Environment:** Google Colab
