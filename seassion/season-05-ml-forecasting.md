# Season 5 — ML Forecasting & Risk Prediction

> Historical plan — superseded on 2026-10-13. Follow the [Odoo-powered product scope](../docs/GARMENT_ERP_13_MODULES_MASTER_PLAN.md) and [current milestone roadmap](../docs/integration_design/04-200-commit-implementation-roadmap.md). The instructions and estimates below are retained for context, not execution. Dedicated cutting/CAD, device integration, specialist optimization, and duplicate ERP engines are excluded.

Building machine learning models for demand forecasting and production risk prediction.

- [ ] Build synthetic historical order dataset (delays, defects, lead times)
- [ ] Random Forest model for delay-risk / defect-risk classification
- [ ] Baseline forecasting model (ARIMA or Prophet) for demand/lead-time
- [ ] LSTM model for the same forecasting task, compared against baseline
- [ ] Model evaluation report (accuracy, precision/recall, forecast error)
- [ ] Serve predictions via API endpoint, show risk indicators in dashboard

## Progress Notes

_Add implementation notes here as you progress through Season 5 tasks._
