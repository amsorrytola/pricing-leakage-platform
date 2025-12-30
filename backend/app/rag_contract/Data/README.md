# MULTI-BANK DATASET - COMPLETE PACKAGE

## 📦 Package Contents

### Ready for Download (9 files):
1. `ICICI_Catalogue_Jan2025.md` - Premium bank pricing
2. `HDFC_Catalogue_Jan2025.md` - Competitive pricing
3. `SBI_Catalogue_Jan2025.md` - Public sector pricing
4. `Axis_Catalogue_Jan2025.md` - Growth-oriented pricing
5. `Kotak_Catalogue_Jan2025.md` - Premium selective pricing
6. `contracts_metadata_all_25.csv` ⭐ MAIN DATA FILE
7. `DATASET_SUMMARY_MULTIBANK.txt` - Complete documentation
8. `QUICK_REFERENCE.txt` - Implementation guide
9. `ALL_CONTRACTS_MASTER_LIST.md` - All 25 contracts detailed

### Optional Generation:
10. `generate_all_contracts.py` - Script to create all 25 contracts

---

## 🚀 Quick Start for Hackathon

### Option A: Use CSV Data (Recommended - Fastest)
```python
import pandas as pd

# Load contract metadata
df = pd.read_csv('contracts_metadata_all_25.csv')

# Load bank catalogues
icici_catalogue = open('ICICI_Catalogue_Jan2025.md').read()
# ... load other banks ...

# Extract anomalies from CSV
for _, contract in df.iterrows():
    print(f"Contract: {contract['Contract_ID']}")
    print(f"Anomaly 1: {contract['Anomaly_1']}")
    # Your NLP extraction logic here...
```

### Option B: Generate Full Contracts
```bash
python generate_all_contracts.py
```
This creates all 25 contracts (25-30 pages each) in ~5-10 minutes.

---

## 📊 Dataset Statistics

- **Contracts:** 25 (5 per bank)
- **Banks:** 5 (different pricing strategies)
- **Anomalies:** 20 unique types
- **Revenue at Risk:** ₹5.99M annual / ₹17.98M 3-year
- **Difficulty:** 5 Medium, 12 High, 8 Very High
- **Pages:** ~650-750 total (if all generated)

---

## 🎯 For Hackathon Judges

This dataset provides:
✅ Complete configurations for 25 contracts
✅ Ground truth for validation (CSV)
✅ 5 different bank pricing baselines
✅ 20 unique anomaly types for detection
✅ Revenue impact calculations
✅ Production-ready format

**Files to review:**
1. `contracts_metadata_all_25.csv` - All contract data
2. Any bank catalogue (e.g., `ICICI_Catalogue_Jan2025.md`)
3. `DATASET_SUMMARY_MULTIBANK.txt` - Full documentation

---

## 📞 Support

Generated: December 25, 2025 for Hackathon Use
Status: ✅ Production-Ready
Format: CSV + Markdown + Documentation

Good luck with your hackathon! 🚀
