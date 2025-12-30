import json
from pathlib import Path

# def load_standard_pricing(path="data/standard_pricing.json"):
#     path = Path(path)
#     if not path.exists():
#         raise FileNotFoundError(f"Standard pricing file not found: {path}")

#     with open(path, "r") as f:
#         data = json.load(f)

#     return data
# def get_standard_service_names():
#     catalog = load_standard_pricing()
#     return list(catalog.keys())
# STANDARD_SERVICES = get_standard_service_names()   

# CONTRACT_EXTRACTION_PROMPT="""
# OUTPUT MUST BE A VALID JSON ARRAY ONLY.
# NO prose. NO markdown. NO explanations.

# ROLE:
# You are a senior financial contract analyst AI.

# TASK:
# Extract ALL and ONLY EXPLICIT PRICING TERMS from the contract text.

# THIS IS A PRICING EXTRACTION TASK — NOT A SERVICE LISTING TASK.

# --------------------------------------------------
# ALLOWED SERVICE LIST (USE ONLY THESE NAMES)
# --------------------------------------------------
# - Account Maintenance
# - Daily Statement (Email)
# - Monthly Reconciliation
# - Custom MIS Reports
# - ACH File Origination
# - ACH Transaction
# - RTGS Transaction
# - NEFT Transaction
# - Cheque Clearing
# - Standing Instruction Setup
# - Standing Instruction Monthly
# - SWIFT Wire Transfer
# - FATCA Screening
# - Currency Conversion Markup
# - Correspondent Charges
# - LC Issuance
# - LC Amendment
# - LC Negotiation
# - LC Discrepancy Handling
# - Bank Guarantee
# - Additional Guarantee Year
# - Online Portal Access
# - Sweep Account Management
# - API Setup
# - API Transaction Fee



# --------------------------------------------------
# ABSOLUTE RULES (NON-NEGOTIABLE)
# --------------------------------------------------

# 1. ONLY extract a pricing term if the SAME sentence or table row explicitly contains:
#    - a numeric amount (₹, INR, %, etc.)
#    - OR explicit pricing words (FREE, REDUCED, FIXED, FROZEN, ESCALATION, INTEREST)

# 2. NEVER extract pricing from:
#    - descriptive or operational text
#    - service explanations
#    - general policy statements
#    - headings or introductions

# 3. EVERY output object MUST be grounded to ONE concrete pricing sentence.
#    That sentence MUST be copied verbatim into "source_clause".

# 4. If a sentence does NOT itself state a price or rate → DO NOT extract it.

# --------------------------------------------------
# SERVICE RULES
# --------------------------------------------------

# - "service" MUST be one of the ALLOWED SERVICE LIST above
# - Use the closest matching name from the list
# - DO NOT invent new services
# - DO NOT add category prefixes
# - If no service from the list applies → DO NOT extract

# --------------------------------------------------
# PRICING RULES
# --------------------------------------------------

# - Flat amount → use "price"
# - Percentage / rate → use "rate" and "rate_unit"
# - FREE → price = 0
# - REDUCED / FIXED / FROZEN → extract stated value exactly
# - NEVER infer or calculate
# - NEVER convert percentages into amounts

# --------------------------------------------------
# DUPLICATION RULES
# --------------------------------------------------

# - ONE pricing sentence = ONE JSON object
# - SAME service may appear multiple times ONLY if:
#   → price/rate is different
#   → source_clause is different
# - NEVER repeat identical (service, price, rate)

# --------------------------------------------------
# STRICT OUTPUT CONSTRAINTS
# --------------------------------------------------

# - JSON ARRAY ONLY
# - No empty objects
# - No object with BOTH price and rate null
# - Every object MUST include all keys below
# - Use null explicitly when not applicable

# --------------------------------------------------
# OUTPUT FORMAT (STRICT)
# --------------------------------------------------

# [
#   {
#     "service": string,
#     "price": number | null,
#     "rate": number | null,
#     "rate_unit": string | null,
#     "source_clause": string
#   }
# ]

# --------------------------------------------------
# IMPORTANT EXAMPLES (DO NOT OUTPUT)
# --------------------------------------------------

# ❌ INVALID:
# "source_clause": "All fees are in Indian Rupees exclusive of GST"

# ✅ VALID:
# "source_clause": "Account Maintenance (Monthly) | ₹3,500"

# ❌ INVALID:
# Extracting pricing from operational descriptions

# ✅ VALID:
# Extracting pricing only from tables, anomalies, or explicit fee sentences

# --------------------------------------------------
# CONTRACT TEXT:
# <<CONTRACT_TEXT>>
# """
CASH_MANAGEMENT_SERVICES_EXTRACTION_PROMPT= """
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a contract pricing analyst.

TASK:
Extract ONLY Cash Management service prices from the contract text.

IMPORTANT RULES:
- Extract ONLY explicitly stated prices
- DO NOT assume, infer, or calculate anything
- Ignore all non–cash management services
- If a service is not priced → price = null

CASH MANAGEMENT SERVICES (ONLY THESE):

- Account Maintenance → key: account_maintenance
- Daily Statement (Email) → key: daily_statement_email
- Monthly Reconciliation → key: monthly_reconciliation
- Custom MIS Reports → key: custom_reports

OUTPUT FORMAT (STRICT):

{
  "account_maintenance": {
    "price": number | null,
    "unit": "per_month",
    "source_clause": string | null
  },
  "daily_statement_email": {
    "price": number | null,
    "unit": "per_statement",
    "source_clause": string | null
  },
  "monthly_reconciliation": {
    "price": number | null,
    "unit": "per_report",
    "source_clause": string | null
  },
  "custom_reports": {
    "price": number | null,
    "unit": "per_report",
    "source_clause": string | null
  }
}

FINAL RULES:
- JSON only
- All keys must exist
- No extra services
- Parsable by json.loads()

CONTRACT TEXT:
<<CONTRACT_TEXT>>
"""
DOMESTIC_PAYMENTS_EXTRACTION_PROMPT = """
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a contract pricing analyst.

TASK:
Extract ONLY Domestic Payment service prices from the contract text.

IMPORTANT RULES:
- Extract ONLY explicitly stated prices
- DO NOT assume, infer, or calculate anything
- Ignore all non–domestic payment services
- If a price is not explicitly stated → price = null
- Use numbers only (no currency symbols)

DOMESTIC PAYMENT SERVICES (ONLY THESE):

- ACH File Origination → key: ach_file
- ACH Transaction → key: ach_transaction
- RTGS Transaction → key: rtgs
- NEFT Transaction → key: neft
- Cheque Processing / Cheque Clearing → key: cheque_processing
- Standing Instruction Setup → key: standing_instruction.setup_fee
- Standing Instruction Monthly → key: standing_instruction.monthly_fee

OUTPUT FORMAT (STRICT):

{
  "ach_file": {
    "price": number | null,
    "unit": "per_file",
    "source_clause": string | null
  },
  "ach_transaction": {
    "price": number | null,
    "unit": "per_transaction",
    "source_clause": string | null
  },
  "rtgs": {
    "price": number | null,
    "unit": "per_transaction",
    "source_clause": string | null
  },
  "neft": {
    "price": number | null,
    "unit": "per_transaction",
    "source_clause": string | null
  },
  "cheque_processing": {
    "price": number | null,
    "unit": "per_cheque",
    "source_clause": string | null
  },
  "standing_instruction": {
    "setup_fee": {
      "price": number | null,
      "unit": "one_time",
      "source_clause": string | null
    },
    "monthly_fee": {
      "price": number | null,
      "unit": "per_month",
      "source_clause": string | null
    }
  }
}

FINAL RULES:
- JSON only
- All keys must exist
- No extra services
- Parsable by json.loads()

CONTRACT TEXT:
<<CONTRACT_TEXT>>
"""
INTERNATIONAL_PAYMENTS_EXTRACTION_PROMPT = """
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a contract pricing analyst.

TASK:
Extract ONLY International Payment service prices from the contract text.

IMPORTANT RULES:
- Extract ONLY explicitly stated prices or percentages
- DO NOT assume, infer, normalize, or calculate anything
- Ignore all non–international payment services
- If a price or percentage is not explicitly stated → set it to null
- Use numbers only (no currency symbols, no % sign)
-Percentages MUST be returned as numeric percentages exactly as written (e.g. 0.75% → 0.75, NOT 75 or 750).

INTERNATIONAL PAYMENT SERVICES (ONLY THESE):

- SWIFT Wire Transfer → key: swift_wire
- FATCA Screening → key: fatca_screening
- Correspondent Bank Charges (handling %) → key: correspondent_charges
- FX Conversion Markup → key: fx_markup

OUTPUT FORMAT (STRICT):

{
  "swift_wire": {
    "price": number | null,
    "unit": "per_transaction",
    "source_clause": string | null
  },
  "fatca_screening": {
    "price": number | null,
    "unit": "per_transaction",
    "source_clause": string | null
  },
  "correspondent_charges": {
    "handling_fee_percent": number | null,
    "unit": "percentage_plus_actual",
    "source_clause": string | null
  },
  "fx_markup": {
    "price": number | null,
    "unit": "percentage",
    "source_clause": string | null
  }
}

FINAL RULES:
- JSON only
- All keys must exist
- No extra services
- Parsable by json.loads()

CONTRACT TEXT:
<<CONTRACT_TEXT>>
"""
TRADE_FINANCE_EXTRACTION_PROMPT = """
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a contract pricing analyst.

TASK:
Extract ONLY Trade Finance service prices from the contract text.

SERVICES TO EXTRACT (ONLY THESE):

- LC Issuance → key: lc_issuance
- LC Amendment → key: lc_amendment
- LC Negotiation → key: lc_negotiation
- LC Discrepancy Handling → key: lc_discrepancy
- Bank Guarantee (1 year + additional year) → key: bank_guarantee

RULES:
- Extract ONLY explicitly stated prices
- DO NOT infer or calculate
- If reduced / special price exists, extract the reduced price
- If additional year price exists, extract separately
- If not mentioned → price = null

OUTPUT FORMAT (STRICT):

{
  "lc_issuance": {
    "price": number | null,
    "unit": "per_lc",
    "source_clause": string | null
  },
  "lc_amendment": {
    "price": number | null,
    "unit": "per_amendment",
    "source_clause": string | null
  },
  "lc_negotiation": {
    "price": number | null,
    "unit": "per_document_set",
    "source_clause": string | null
  },
  "lc_discrepancy": {
    "price": number | null,
    "unit": "per_lc",
    "source_clause": string | null
  },
  "bank_guarantee": {
    "price": number | null,
    "unit": "per_year",
    "additional_year_price": number | null,
    "source_clause": string | null
  }
}

FINAL RULES:
- JSON only
- All keys must exist
- No extra services
- Parsable by json.loads()

CONTRACT TEXT:
<<CONTRACT_TEXT>>
"""

DIGITAL_SERVICESEXTRACTION_PROMPT= """
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a contract pricing analyst.

TASK:
Extract ONLY Digital Services prices from the contract text.

SERVICES TO EXTRACT (ONLY THESE):

- Online Portal Access → key: online_portal
- Sweep Account Management → key: sweep_account
- API Setup → key: api_setup
- API Transaction Fee → key: api_transaction

RULES:
- Extract ONLY explicitly stated prices
- Ignore operational descriptions
- If service is frozen or fixed, still extract price
- If not priced → price = null

OUTPUT FORMAT (STRICT):

{
  "online_portal": {
    "price": number | null,
    "unit": "per_month",
    "source_clause": string | null
  },
  "sweep_account": {
    "price": number | null,
    "unit": "per_month",
    "source_clause": string | null
  },
  "api_setup": {
    "price": number | null,
    "unit": "one_time",
    "source_clause": string | null
  },
  "api_transaction": {
    "price": number | null,
    "unit": "per_transaction",
    "source_clause": string | null
  }
}

FINAL RULES:
- JSON only
- All keys must exist
- No extra services
- Parsable by json.loads()

CONTRACT TEXT:
<<<CONTRACT_TEXT>>
"""
CREDIT_FACILITIES_EXTRACTION_PROMPT="""
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a contract pricing analyst.

TASK:
Extract ONLY Credit Facility interest rates from the contract text.

SERVICES TO EXTRACT (ONLY THESE):

- Cash Credit Facility → key: cash_credit
- Trade Credit Line → key: trade_credit
- Overdraft Facility → key: overdraft

RULES:
- Extract ONLY explicitly stated interest rates
- If ranges are mentioned, extract min and max
- DO NOT calculate spreads or totals
- Percentages must be numeric (e.g. 10.5, not "10.5%")
-If a single interest rate is stated, set both min and max to the same value.


OUTPUT FORMAT (STRICT):

{
  "cash_credit": {
    "total_rate_percent_range": [number | null, number | null],
    "source_clause": string | null
  },
  "trade_credit": {
    "total_rate_percent_range": [number | null, number | null],
    "source_clause": string | null
  },
  "overdraft": {
    "total_rate_percent_range": [number | null, number | null],
    "source_clause": string | null
  }
}

FINAL RULES:
- JSON only
- All keys must exist
- Parsable by json.loads()

CONTRACT TEXT:
<<CONTRACT_TEXT>>
"""
PROGRAMS_and_DISCOUNTS_EXTRACTION_PROMPT="""
OUTPUT MUST BE VALID JSON ONLY.
NO prose. NO markdown.

ROLE:
You are a financial contract analyst.

TASK:
Extract ONLY explicitly stated DISCOUNTS, WAIVERS, FREE SERVICES, or PRICE FREEZES from the contract text.

CRITICAL RULES (VERY IMPORTANT):
- DO NOT calculate percentages or differences
- DO NOT infer discounts
- DO NOT convert prices into percentages
- DO NOT assume duration unless explicitly stated
- Extract ONLY what is explicitly written

WHAT COUNTS AS A DISCOUNT / PROGRAM:
- Reduced price compared to another stated price
- Services provided FREE
- Fees marked as FROZEN or FIXED
- Special pricing conditions for a client

DO NOT:
- Invent early adopter programs
- Calculate discount_percent
- Assume contract duration

OUTPUT FORMAT (STRICT):

{
  "reduced_lc_fee": {
    "original_price": number | null,
    "reduced_price": number | null,
    "condition": string | null,
    "source_clause": string | null
  },
  "free_discrepancy_corrections": {
    "free_quantity": number | null,
    "unit": string | null,
    "condition": string | null,
    "source_clause": string | null
  },
  "frozen_online_portal_fee": {
    "price": number | null,
    "frozen": boolean,
    "condition": string | null,
    "source_clause": string | null
  },
  "fixed_api_transaction_fee": {
    "price": number | null,
    "fixed": boolean,
    "condition": string | null,
    "source_clause": string | null
  }
}

FINAL RULES:
- JSON ONLY
- All keys must exist
- Use null if not mentioned
- No extra fields
- Parsable by json.loads()

CONTRACT TEXT:
<<CONTRACT_TEXT>>

"""

CLASSIFY_PRICING_PROMPT = """
You are a contract analysis assistant.

Your task is to classify the following contract text into ONE category.

CATEGORIES:
- PRICING_RELATED
- NON_PRICING

PRICING_RELATED if the text contains ANY of the following:
- fees, charges, costs, pricing
- monetary amounts (₹, $, INR, USD, etc.)llama3.1
- rates or percentages (interest, escalation, markup, penalty)
- service descriptions that mention prices or rates
- credit facilities with interest rates or fees
- SLA clauses that include financial penalties or credits
- payment terms, minimum fees, late payment interest

NON_PRICING if the text:
- contains NO prices, fees, rates, or monetary terms
- is purely legal, descriptive, operational, or procedural

RULES:
- Ignore section titles; judge ONLY by content.
- If even ONE price or rate appears → PRICING_RELATED.
- Do NOT extract data.
- Do NOT explain reasoning.
- Respond with ONLY ONE word.

TEXT:
<<<
{text}
>>>

Answer:
"""
