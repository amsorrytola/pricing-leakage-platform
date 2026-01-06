# SYNTHETIC CONTRACTS DATASET FOR REVENUE LEAKAGE ANALYSIS
## Problem 3: Extract, Normalize & Analyze Pricing Terms to Identify Revenue Leakage

**Dataset Generated:** December 15, 2024  
**Total Contracts:** 15 Commercial Banking Services Agreements  
**Data Format:** Markdown (.md) files + Metadata CSV  
**Purpose:** NLP-based pricing term extraction and revenue leakage detection

---

## DATASET OVERVIEW

### Structure
```
synthetic_contracts/
├── ZCB_COM_2025_001.md to ZCB_COM_2025_015.md (15 complete contracts)
├── contracts_metadata.csv (ground truth labels & pricing data)
└── README.md (this file)
```

### Key Characteristics
- **Realistic Commercial Banking Context:** All contracts follow Zenith Commercial Bank's template
- **Multi-Page Format:** ~10-12 pages each, professionally formatted with sections and subsections
- **Embedded Anomalies:** Each contract contains 1-2 pricing deviations from the Standard Pricing Catalogue
- **Natural Language Pricing Clauses:** Pricing terms embedded in natural contract language, not isolated in tables
- **Indian Banking Compliance:** References to RBI guidelines, GST, FATCA, KYC/AML
- **Cross-Reference Complexity:** Contracts reference Schedule C (Standard Pricing Catalogue) requiring document linking

---

## 15 REVENUE LEAKAGE SCENARIOS

### Contract 1: ZCB/COM/2025/001 (TechVision Industries Limited)
**Leakage Type:** NEGOTIATED_DISCOUNT  
**Service:** ACH Origination Fee  
**Standard Price:** INR 500.00/file  
**Contract Price:** INR 400.00/file (20% discount)  
**Detection Challenge:** Discount explicitly stated but requires comparison with Schedule C  
**NLP Task:** Extract both prices and compare; identify discount percentage  

### Contract 2: ZCB/COM/2025/002 (GlobalTrade Exporters Pvt Ltd)
**Leakage Type:** EXPIRED_PROMOTIONAL_RATE  
**Service:** International Wire Transfer Fee  
**Standard Price:** INR 850.00/transaction  
**Contract Price:** INR 750.00/transaction (12% promotional)  
**Validity:** Jan 1, 2025 - Dec 31, 2025 ONLY  
**Detection Challenge:** Promotional validity expires; future revenue loss if not tracked  
**NLP Task:** Extract dates, identify temporary pricing, flag auto-reversion risk  

### Contract 3: ZCB/COM/2025/003 (IndiaManufacturing Solutions Pvt Ltd)
**Leakage Type:** VOLUME_COMMITMENT_DISCOUNT  
**Service:** Bank Guarantee Issuance  
**Standard Price:** INR 12,500.00/guarantee  
**Contract Price:** INR 10,000.00/guarantee (20% discount if ≥10 guarantees/year)  
**Condition:** Minimum 10 guarantees per annum  
**Current Status:** Only 8 guarantees issued (shortfall, discount invalid)  
**Detection Challenge:** Conditional pricing; requires volume tracking & reconciliation  
**NLP Task:** Extract condition clauses, identify thresholds, flag volume metrics  

### Contract 4: ZCB/COM/2025/004 (ConsumerGoods Trading Company Limited)
**Leakage Type:** MISSED_ESCALATION  
**Service:** Account Maintenance Fee  
**Standard Price:** INR 2,500.00/month (with 3.5% p.a. escalation)  
**Contract Price:** INR 2,500.00/month (FROZEN for 24 months - no escalation)  
**Escalation Loss:** ≈INR 175/month forgone in Year 2 (compounding)  
**Detection Challenge:** Escalation freeze hidden in custom escalation clause section  
**NLP Task:** Extract escalation rates, identify freezes/suspensions, calculate cumulative loss  

### Contract 5: ZCB/COM/2025/005 (FinanceHub Capital Markets Limited)
**Leakage Type:** NO_ESCALATION_CLAUSE  
**Service:** Online Portal Access Fee  
**Standard Price:** INR 1,000.00/month (with standard 3.5% escalation per Schedule C)  
**Contract Price:** INR 1,000.00/month  
**Issue:** Escalation clause NOT explicitly mentioned in contract pricing section  
**Dispute Risk:** Client may claim no escalation applies due to contract silence  
**Detection Challenge:** Absence of clause is difficult to detect; requires Schedule C comparison  
**NLP Task:** Flag missing escalation clauses, compare against Schedule C defaults  

### Contract 6: ZCB/COM/2025/006 (PharmaLogistics Distribution Network)
**Leakage Type:** TIERED_PRICING_MISMATCH  
**Service:** ACH Transaction Fees  
**Standard Price:** INR 2.50/transaction (with volume-based discounts in Schedule C)  
**Contract Price:** INR 2.50/transaction (flat rate, volume tiers not documented)  
**Issue:** Schedule C defines volume tiers (5-12% discounts), but contract doesn't reference them  
**Ambiguity:** Unclear if per-transaction fees or transaction counts qualify for discounts  
**Detection Challenge:** Requires cross-document analysis (contract vs. Schedule C vs. billing)  
**NLP Task:** Identify volume tier clauses, reconcile with pricing structure  

### Contract 7: ZCB/COM/2025/007 (AutoComponents Manufacturing Inc)
**Leakage Type:** HIDDEN_MULTI_YEAR_DISCOUNT  
**Service:** Letter of Credit Issuance  
**Standard Price:** INR 15,000.00/LC  
**Contract Price:** INR 13,500.00/LC (10% discount for 3-year contract term only)  
**Duration:** Valid Jan 1, 2025 - Dec 31, 2027 ONLY; reverts to standard post-expiry  
**Visibility Issue:** Discount percentage not prominently highlighted; buried in section  
**Post-Expiry Impact:** Sharp price increase expected Jan 1, 2028 (from ₹13,500 to ₹15,000)  
**Detection Challenge:** Requires temporal analysis and contract duration mapping  
**NLP Task:** Link pricing to contract duration, flag time-bound terms  

### Contract 8: ZCB/COM/2025/008 (AgriTrade Export Corporation)
**Leakage Type:** ESCALATION_CAP  
**Service:** NEFT Processing Fee  
**Standard Price:** INR 25.00/transaction (with 3.5% p.a. escalation = ₹0.88/year)  
**Contract Price:** INR 25.00/transaction  
**Special Term:** Annual escalation capped at maximum INR 0.50/transaction/year  
**Impact:** Underpays escalation by ₹0.38/year per transaction  
**3-Year Loss:** ≈₹3.90 per transaction; with 500 daily transactions = ₹700,000/year loss  
**Detection Challenge:** Requires understanding of percentage vs. absolute cap  
**NLP Task:** Extract escalation formulas, identify caps/limits, calculate financial impact  

### Contract 9: ZCB/COM/2025/009 (RetailChain Hypermarkets Ltd)
**Leakage Type:** SILENT_DISCOUNT_EXPIRY  
**Service:** Sweep Account Management  
**Standard Price:** INR 3,500.00/month  
**Contract Price:** INR 3,150.00/month (10% discount, Jan 1 - June 30, 2025 only)  
**Silent Expiry:** No explicit reminder; fee reverts July 1, 2025  
**Operational Issue:** Bank must manually update billing; easy to miss deadline  
**Client Impact:** Unexpected ₹350/month increase starting July 2025  
**Detection Challenge:** Buried in custom escalation clause; may not receive advance notice  
**NLP Task:** Track temporal validity windows, flag renewal/reversion dates  

### Contract 10: ZCB/COM/2025/010 (EnergySector Solutions India Pvt Ltd)
**Leakage Type:** CONDITIONAL_TIERED_PRICING  
**Service:** Domestic Wire Transfer  
**Standard Price:** INR 100.00/transaction  
**Tiered Pricing:**
- Tier 1 (< 100 txns/month): INR 100.00
- Tier 2 (100-500 txns/month): INR 90.00 (10% discount)
- Tier 3 (> 500 txns/month): INR 85.00 (15% discount)
**Ambiguity:** Not clear if tiers apply prospectively or retrospectively  
**October 2025 Issue:** Client had 450 transactions (qualifies for Tier 2) but billed at Tier 1  
**Detection Challenge:** Requires transaction-level billing analysis & comparison  
**NLP Task:** Extract tier definitions, map transaction volumes to pricing, identify billing mismatches  

### Contract 11: ZCB/COM/2025/011 (HealthcareServices Hospital Network)
**Leakage Type:** FREQUENCY_BASED_SURCHARGE  
**Service:** Letter of Credit Amendment Fee  
**Standard Price:** INR 5,000.00 per amendment (first 10/year)  
**Surcharge:** INR 6,500.00 per amendment (after 10/year; +30% surcharge)  
**Ambiguity:** Definition of "amendment" unclear (full modification vs. minor change)  
**Threshold Incentive:** Creates perverse incentive to avoid frequent amendments  
**2025 Trend:** Client approaching 12 amendments/year; will trigger surcharge Q4 2025  
**Detection Challenge:** Requires volume tracking and threshold monitoring  
**NLP Task:** Extract frequency-based pricing tiers, track cumulative volumes, predict surcharge trigger dates  

### Contract 12: ZCB/COM/2025/012 (LogisticsExpress Courier Services)
**Leakage Type:** CONCURRENT_FEE_AMBIGUITY  
**Service:** ACH Origination & Transaction Fees  
**Pricing Structure:** INR 500/file + INR 2.50/transaction  
**Ambiguity:** Not specified whether BOTH fees apply to single ACH batch or mutually exclusive  
**Scenario:** 1 ACH file with 1,000 transactions  
- Interpretation A: ₹500 + ₹2,500 = ₹3,000
- Interpretation B: ₹500 only
- Interpretation C: ₹2,500 only
**Revenue Variance:** ±INR 2,500 per batch depending on interpretation  
**Detection Challenge:** Requires understanding of service bundling and exclusivity logic  
**NLP Task:** Map service dependencies, identify mutually exclusive vs. cumulative fees  

### Contract 13: ZCB/COM/2025/013 (ITServices GlobalStaff Solutions)
**Leakage Type:** ONE_TIME_FEE_AMBIGUITY  
**Service:** API Integration Setup  
**Standard Price:** INR 25,000.00 (one-time, no escalation)  
**One-Time Definition Issue:**
- Client Interpretation: Single charge for entire contract term
- Bank Interpretation: Charge per major upgrade OR per new system integration
**2025 Billing:** 2 upgrades charged = ₹50,000 (client claims should be ₹25,000)  
**Dispute Likelihood:** HIGH (conflicting one-time definitions)  
**Detection Challenge:** Requires understanding of scope and trigger conditions for "one-time" fee  
**NLP Task:** Extract one-time fee definitions, identify what triggers re-charging, track usage  

### Contract 14: ZCB/COM/2025/014 (RealEstateInvest Property Development Corp)
**Leakage Type:** SEASONAL_MINIMUM_FEE  
**Service:** Minimum Activity Fee  
**Standard Price:** INR 5,000/month if monthly transactions < 25  
**Issue:** No exemption for seasonal businesses  
**Client Profile:** Real estate company (Q1-Q2 active, Q3 monsoon slack, Q4 year-end close)  
**Q3 Impact:** 5-10 transactions/month × 3 months = ₹15,000 in disputed fees  
**Client Expectation:** Seasonal exemption should apply (missing contract clause)  
**Detection Challenge:** Requires understanding business context and contract fairness  
**NLP Task:** Flag minimum fee clauses without exemptions, identify seasonal impact  

### Contract 15: ZCB/COM/2025/015 (EducationTech E-Learning Platform)
**Leakage Type:** MANDATORY_FEE_MISAPPLICATION  
**Service:** FATCA Compliance Screening  
**Standard Price:** INR 75.00 per transaction  
**Issue:** Auto-applied to NON-FATCA-eligible payments (non-US bound)  
**FATCA Scope:** Applies ONLY to US-source income & US-destination transfers  
**Client Profile:** EdTech receiving international student fees (60% non-US)  
**Overcharging:** ₹75 × 60 non-US transactions/month = ₹4,500/month incorrect charges  
**Annual Loss:** ≈₹54,000 in erroneous FATCA fees  
**Detection Challenge:** Requires understanding FATCA regulations and transaction destination mapping  
**NLP Task:** Extract fee eligibility rules, map transaction characteristics, identify scope violations  

---

## GROUND TRUTH LABELS (Metadata CSV)

The `contracts_metadata.csv` file contains:
- `contract_id`: Unique contract identifier (e.g., ZCB/COM/2025/001)
- `filename`: Full path to markdown contract file
- `client`: Client name
- `leakage_type`: Category of revenue leakage (see 15 types above)
- `leakage_service`: Service affected by leakage
- `standard_price`: List price from Schedule C (Zenith's official pricing)
- `contract_price`: Actual contracted price

**This metadata serves as your ground truth for validation of extraction pipeline.**

---

## EXPECTED NLP/TEXT EXTRACTION TASKS

### 1. Text Extraction
- Extract all pricing-related clauses from Section 3 (Fees and Charges)
- Identify pricing deviations from Standard Pricing Catalogue (Schedule C)
- Extract temporal conditions (valid until dates, promotional periods)
- Extract conditional pricing (volume-based, frequency-based, tiered)

### 2. Normalization
- Standardize currency (all in INR)
- Standardize units (per transaction, per file, per month, etc.)
- Extract base prices and discount percentages
- Calculate effective prices after discounts/escalations

### 3. Comparison & Analysis
- Compare contract pricing against Standard Pricing Catalogue
- Identify deviations and categorize leakage type
- Calculate revenue impact (discount percentage × volume × duration)
- Flag temporal conditions (expiry dates, escalation freezes)

### 4. Validation
- Cross-reference contract Section 3.2 (Contract-Specific Terms) with Section 3.1 (Standard Catalogue)
- Verify escalation clauses match Schedule C defaults
- Check for missing or ambiguous escalation clauses
- Validate that Schedule C precedence rules (Section 10.2) are respected

---

## KEY CHALLENGES FOR JUDGES & EVALUATORS

### 1. Document Complexity
- Contracts are 10-12 pages with cross-references to Schedule C
- Pricing buried in natural language, not isolated in tables
- Multiple sections addressing same service (Section 3.1, 3.2, 3.3)

### 2. Semantic Ambiguities
- "One-time fee" with unclear trigger conditions
- "Annual escalation" that might be frozen or capped
- "Volume discounts" that may or may not apply to per-transaction fees
- "First 10 amendments" threshold with fuzzy definition boundaries

### 3. Temporal Complexity
- Promotional rates with explicit expiry dates
- Escalation freezes lasting specific durations
- Discount periods with silent reversion clauses
- Multi-year contracts with changing terms at renewal

### 4. Quantitative Validation
- Calculate total revenue leakage in INR (accounting for volumes & durations)
- Compare estimated loss across all 15 contracts
- Project forward impact if leakage goes undetected for 3-year contract term

---

## SAMPLE DETECTION RULES

Your extraction pipeline should identify:

```
1. NEGOTIATED_DISCOUNT: contract_price < standard_price
   Detection: Simple price comparison

2. EXPIRED_PROMOTIONAL_RATE: contract_price + validity_end_date in past
   Detection: Extract end date, compare to current date

3. VOLUME_COMMITMENT_DISCOUNT: contract_price + "if minimum X units" condition
   Detection: Extract conditional clause + numeric threshold

4. MISSED_ESCALATION: escalation_rate = 0% for duration > 0
   Detection: Find escalation clause, check if rate is 0% or frozen

5. TIERED_PRICING_MISMATCH: contract states flat_rate but Schedule C shows tiers
   Detection: Compare contract language with Schedule C tiers

6. SILENT_DISCOUNT_EXPIRY: promotional_period + NO explicit reversion clause
   Detection: Find validity period without explicit reversion language
```

---

## RECOMMENDED PIPELINE ARCHITECTURE

```
1. Document Preprocessing
   ├─ Convert .md to structured text
   ├─ Identify Section 3 (Fees and Charges)
   └─ Extract subsections (3.1, 3.2, 3.3, 3.4, 3.5, 3.6)

2. Entity Extraction (NER/Information Extraction)
   ├─ Service Names (ACH, RTGS, Wire Transfer, LC, Guarantee, etc.)
   ├─ Prices (INR amounts, units like /month, /transaction)
   ├─ Escalation Rates (3.5%, frozen, capped, etc.)
   ├─ Conditions (volumes, durations, frequencies)
   └─ Temporal Markers (dates, "until", "from")

3. Relationship Extraction
   ├─ Link Service → Standard Price (from Schedule C reference)
   ├─ Link Service → Contract Price (from Section 3.2)
   ├─ Link Price → Escalation Rate
   ├─ Link Price → Validity Period
   └─ Link Price → Conditions

4. Normalization & Calculation
   ├─ Standardize all prices to base units
   ├─ Calculate discount percentages
   ├─ Project escalation over contract term
   ├─ Calculate cumulative revenue impact

5. Comparison & Flagging
   ├─ Compare contract vs. standard prices
   ├─ Identify and categorize leakage type
   ├─ Flag missing escalation clauses
   ├─ Check temporal validities and expirations
   └─ Output: Leakage Report (15 detected anomalies)

6. Validation Against Ground Truth
   ├─ Match extracted leakage_type to contracts_metadata.csv
   ├─ Verify standard_price and contract_price extraction accuracy
   ├─ Calculate precision, recall, F1-score
   └─ Output: Performance Metrics
```

---

## DATA QUALITY & AUTHENTICITY

✓ **Real-World Realism:**
- Contracts follow Indian Banking regulatory framework
- Pricing complies with RBI guidelines and GST treatment
- Client names, registration numbers, and structures authentic to India
- Service descriptions match actual banking operations

✓ **Realistic Leakage Scenarios:**
- Based on actual revenue leakage patterns observed in banking
- Pricing anomalies consistent with contract negotiation practices
- Temporal conditions match real-world promotional structures
- Ambiguities reflect actual contract interpretation disputes

✓ **Ground Truth Accuracy:**
- All 15 leakage scenarios explicitly documented in contract text
- Metadata CSV provides definitive labels for validation
- Standard vs. contract pricing clearly differentiated in documents
- Leakage types correspond to real-world banking issues

---

## FILE INVENTORY

**Total Files:** 16
- `ZCB_COM_2025_001.md` through `ZCB_COM_2025_015.md` (15 contracts, ~10-12 pages each)
- `contracts_metadata.csv` (ground truth labels & pricing data)

**Total Contract Pages:** ~150-180 pages of synthetic contract text

**Data Volume:** ~500-600 KB of unstructured contract data + structured metadata

---

## EVALUATION CRITERIA FOR JUDGES

1. **Completeness:** Can the pipeline extract ALL 15 leakage scenarios?
2. **Accuracy:** Does extracted pricing match ground truth in metadata CSV?
3. **Categorization:** Are leakage types correctly identified?
4. **Ambiguity Resolution:** How does pipeline handle semantic ambiguities?
5. **Quantification:** Can the pipeline calculate revenue impact in INR?
6. **Temporal Handling:** Are validity periods and expirations correctly identified?
7. **Cross-Document Linking:** Can the pipeline correlate contract terms with Schedule C?

---

## USAGE INSTRUCTIONS FOR PARTICIPANTS

1. **Download the Dataset:**
   - Extract all 15 .md contract files
   - Load contracts_metadata.csv as ground truth

2. **Build Your Pipeline:**
   - Implement NER for pricing entities (services, amounts, conditions)
   - Build relationship extractors to link prices with escalation rates
   - Implement normalization and calculation logic
   - Develop comparison rules against standard pricing

3. **Test & Validate:**
   - Run pipeline on all 15 contracts
   - Compare extracted pricing to contracts_metadata.csv
   - Calculate precision, recall, F1 on leakage detection
   - Document any edge cases or undetected scenarios

4. **Generate Output Report:**
   - Identify all 15 leakage scenarios
   - Categorize by type
   - Calculate total revenue impact
   - Provide recommendations for each contract

---

**Dataset Ready for Revenue Leakage Detection Analysis**  
*Generated: December 15, 2024*  
*For: Problem 3 - Extract, Normalize & Analyze Pricing Terms*