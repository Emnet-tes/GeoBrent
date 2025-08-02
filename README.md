# GeoBrent: Analyzing Brent Oil Price Fluctuations and Geopolitical Events

## Project Overview

This project analyzes the relationship between Brent oil price fluctuations and major geopolitical events using advanced time series analysis and change point detection models. The goal is to identify statistical correlations between oil price movements and significant global events while maintaining rigorous distinction between correlation and causation.

## Dataset

### Brent Oil Prices

- **Source**: `data/BrentOilPrices.csv`
- **Time Period**: May 20, 1987 to November 14, 2022
- **Frequency**: Daily (business days)
- **Total Observations**: 9,012 data points
- **Format**: Date, Price (USD per barrel)

### Geopolitical Events

- **Source**: `data/geopolitical_events.csv`
- **Coverage**: 16 major events from 1990-2022
- **Event Types**: Military conflicts, economic crises, OPEC decisions, sanctions, terrorist attacks
- **Format**: Date, Event Type, Description, Expected Impact, Notes


## Task 1 Completion: Foundation Analysis

### ✅ Data Analysis Workflow Defined

A comprehensive 5-phase workflow has been established:

1. **Data Preparation and Exploration**
2. **Time Series Analysis** (stationarity, trends, volatility)
3. **Change Point Detection** (multiple algorithms, validation)
4. **Event Correlation Analysis** (statistical correlation, causal considerations)
5. **Results and Validation** (out-of-sample testing, interpretation)

### ✅ Geopolitical Events Database Created

Compiled a structured dataset of 16 major events including:

- Gulf War (1990-1991)
- Asian Financial Crisis (1997)
- September 11 Attacks (2001)
- Iraq War (2003)
- Global Financial Crisis (2008)
- Arab Spring (2010-2011)
- OPEC Production Decisions (2014, 2016)
- Iran Sanctions (2018)
- COVID-19 Pandemic (2020)
- Russia-Ukraine War (2022)

### ✅ Assumptions and Limitations Identified

**Critical Insight**: This analysis identifies **statistical correlations in time**, not causal relationships. Key limitations include:

- Confounding variables
- Reverse causality possibilities
- Omitted variable bias
- Multiple testing problems
- Event selection and timing precision issues

### ✅ Communication Strategy Established

Defined multi-channel approach targeting:

- Academic/research community (technical papers)
- Financial industry (executive summaries, risk insights)
- Policy makers (policy briefs)
- General public (accessible visualizations)

## Time Series Properties and Modeling Approach

### Expected Data Characteristics

- **Non-stationary** price levels with potential unit roots
- **Stationary** first differences (returns)
- **Volatility clustering** (ARCH/GARCH effects)
- **Structural breaks** corresponding to major market regime changes
- **Fat-tailed** return distributions

### Change Point Detection Strategy

Multiple methodological approaches:

- Bayesian change point detection
- CUSUM-based methods
- Structural break tests (Chow, Bai-Perron)
- Online change point detection

### Expected Outputs

- Change point dates with confidence intervals
- Regime-specific parameters (mean, volatility, trends)
- Statistical significance measures
- Economic interpretation and event correspondence

## Key Methodological Considerations

### Statistical vs. Causal Inference

**IMPORTANT**: This project will identify temporal correlations between oil price changes and geopolitical events. However:

- Correlation ≠ Causation
- Multiple confounding factors exist
- Market anticipation effects complicate timing
- Reverse causality is possible

### Robustness Requirements

- Multiple change point detection algorithms
- Sensitivity analysis across different parameters
- Out-of-sample validation
- Bootstrap confidence intervals
- Cross-validation procedures

## Next Steps (Tasks 2-4)

1. **Task 2**: Implement exploratory data analysis and time series preprocessing
2. **Task 3**: Develop and apply change point detection algorithms
3. **Task 4**: Conduct event correlation analysis and results interpretation

## Requirements

See `requirements.txt` for Python package dependencies. Key libraries expected:

- pandas, numpy (data manipulation)
- matplotlib, seaborn (visualization)
- scipy, statsmodels (statistical analysis)
- ruptures, changepoint (change point detection)
- arch (volatility modeling)

## Academic References

Key concepts and methodologies are based on:

- Hamilton, J.D. (1994). Time Series Analysis
- Tsay, R.S. (2010). Analysis of Financial Time Series
- Bai, J. & Perron, P. (2003). Computation and Analysis of Multiple Structural Change Models
- Killick, R. & Eckley, I. (2014). changepoint: An R Package for Changepoint Analysis

---

## Contact and Contribution

This project is part of the 10Academy data science training program. For questions or contributions, please follow the established GitHub workflow for the GeoBrent repository.

**Current Branch**: task-1 (Foundation Analysis)
**Status**: Task 1 Complete ✅

