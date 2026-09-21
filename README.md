# Emergency Department Access Dashboard

A public-health decision-support website for state health agencies and hospital administrators to compare emergency department stay times, reporting gaps, and hospital volume categories.

**Live website:** https://community-health-resource-planner.tong-zhou.chatgpt.site/

**Presentation Video Link:** https://drive.google.com/file/d/1YRK0smwJkUUwvGdj_mzBk_DAF-jqs9Ki/view?usp=share_link

## Run locally

No package installation or build step is required. With Python 3 installed, run from this repository:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Use an HTTP server rather than opening the HTML file directly, because the dashboard loads JavaScript modules and JSON data.

## Features

- Interactive US state map and hospital ranking
- Distribution histogram and hospital results by ED volume category
- State/territory, city, volume, measure, and hospital search filters
- Sortable hospital table, missing-result filter, hospital profiles, and CSV export
- Filter-aware findings and three practical, evidence-supported recommendations
- Responsive desktop and phone layouts
- Source links, reporting periods, measure definitions, and limitations

## Data and interpretation

The supplied `Timely_and_Effective_Care-Hospital.csv` contains 138,084 records. The dashboard retains 27,948 emergency-care records for 4,658 hospitals, joined by Facility ID. The public subset and prepared JSON are included, so the dashboard works without downloading additional data.

| Measure | Meaning | Unit | Reporting period in this snapshot |
| --- | --- | --- | --- |
| OP-18a | Median ED stay, all discharged patients | Minutes | October 2024–September 2025 |
| OP-18b | Median ED stay, excluding mental health and transfer patients | Minutes | October 2024–September 2025 |
| OP-18c | Median ED stay, mental health patients | Minutes | October 2024–September 2025 |
| OP-18d | Median ED stay, transfer patients | Minutes | October 2024–September 2025 |
| OP-22 | Patients leaving before being seen | Percent | January–December 2024 |
| EDV | Emergency department volume category | Low / medium / high / very high | January–December 2024 |

OP-18 measures the whole ED visit, including care and treatment, **not the wait until a clinician first sees the patient**. Summaries are unweighted statistics across hospital-reported values, not pooled patient-level results. Missing values remain missing; zero is retained as a valid score. EDV is categorical and is not an exact annual visit count.

This snapshot was processed on September 21, 2026. Its original download and release dates were not supplied; the current online CMS release may differ. Data limitations include incomplete reporting, varying patient populations, sampling, differing reporting periods, and absent confidence intervals. The dashboard cannot establish causes, persistent trends, or staffing requirements.

### Sources

- [CMS Timely and Effective Care – Hospital](https://data.cms.gov/provider-data/dataset/yv7e-xc69)
- [CMS measure definitions and collection periods](https://data.cms.gov/provider-data/topics/hospitals/measures-and-current-data-collection-periods)
- [CMS reporting methodology](https://data.cms.gov/provider-data/topics/hospitals/about-data)
- [CMS footnote crosswalk](https://data.cms.gov/provider-data/dataset/y9us-9xdf)
- [US Atlas](https://github.com/topojson/us-atlas): simplified 2017 US Census cartographic boundaries, Albers projection; state paths are included in `dist/states.json`.

## Source layout

```text
dist/
  index.html                 Page structure and methodology
  style.css                  Responsive styling
  app.js                     Filters, charts, table, export, and profiles
  analytics.mjs              Shared calculation functions
  hospitals.json             Prepared hospital data and provenance
  emergency-care-source.csv  Public source subset used by the dashboard
  states.json                Projected state boundary paths
prepare_ed_data.py           Original CSV processing script
check.mjs                    Runnable validation checks
.openai/hosting.json         Existing Sites hosting configuration
```

## Validate

With Node.js installed:

```sh
node check.mjs
```

Checks cover all five numeric measures against independently calculated snapshot summaries, unique hospital IDs, missing versus zero values, quartiles, sorting, filtering, histogram outliers, paired comparisons, and CSV quoting.

## Reproduce data preparation

The original 33 MB homework CSV is not included. Obtain the matching source snapshot and pass its path:

```sh
python3 prepare_ed_data.py /path/to/Timely_and_Effective_Care-Hospital.csv
node check.mjs
```

With no path argument, the script uses `../hw1/Timely_and_Effective_Care-Hospital.csv`, the original homework layout. Snapshot-specific assertions intentionally protect reproducibility; review the dates, assumptions, page text, and validation expectations before substituting a newer CMS release. The original CSV SHA-256 is recorded in `dist/hospitals.json` and on the website.

The published site can be served by any static web server. The `.openai/hosting.json` file identifies the existing Sites deployment; it contains no credentials and is not needed for local hosting. Do not reuse that deployment identity for a separate site.
