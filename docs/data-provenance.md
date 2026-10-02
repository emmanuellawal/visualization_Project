# Data provenance and interpretation

The three employment CSVs are preserved from the original repository. Their source URLs, series IDs, extraction methods, and retrieval dates are not recorded. Although the previous README attributed them to BLS, that attribution cannot be verified and is not repeated as fact.

| File                           | Observations | Coverage                       | Status                        |
| ------------------------------ | ------------ | ------------------------------ | ----------------------------- |
| `employment_by_generation.csv` | 22           | Selected years, 2000–2023      | Unverified demonstration data |
| `earnings_by_generation.csv`   | 22           | Selected years, 2000–2023      | Unverified demonstration data |
| `employment_by_industry.csv`   | 48           | 12 industries × 4 labels, 2023 | Unverified demonstration data |

## Known limitations

1. Age ranges are inconsistent. In 2023, Gen Z is recorded as 29–38 in employment and earnings but 18–28 in industry data. These are not consistent birth cohorts.
2. The observations occur in 2000, 2005, 2010, 2015, 2020, and 2023, with Gen Z starting in 2010. Connecting lines do not supply annual values.
3. Source industry shares may not sum to 100%; the app does not normalize or invent an “other” category.
4. The earnings file contains a supplied inflation-adjusted field, but no price index or deflator methodology. “2023 dollars” describes that field, not an independently verified calculation.
5. Cross-sectional comparisons confound age, period, cohort, and selection effects. They do not demonstrate causal disadvantages or justify policy conclusions.
6. The files stop in 2023. The date of a software update does not make the dataset current.

## Display rules

- CSV rates and earnings are used as provided, after schema and numeric checks.
- Employment and earnings join by generation and year, never array position.
- Missing earnings remain null. Missing records appear as a dash or an absent point, not zero.
- Empty, malformed, out-of-range, and duplicate observations raise an error with a retry path.
- Summary cards show the latest available value and the difference from the first available value in the selected period. Rate changes are percentage points, not percent change.
- The industry panel is an independent 2023 view with its own generation selector.
- CSV exports include the metric, unit, and unverified dataset status.

[BLS Current Population Survey](https://www.bls.gov/cps/) is a reference for future source work, not a validated citation for these archived files.
