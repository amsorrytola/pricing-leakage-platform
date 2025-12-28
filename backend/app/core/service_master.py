# Single canonical registry
# DO NOT change service_code values

SERVICE_MASTER = {
    # Cash Management
    "ACCT_MAINT": {"category": "cash_management", "unit": "per_month"},
    "DAILY_STMT_EMAIL": {"category": "cash_management", "unit": "per_statement"},
    "MONTHLY_RECON": {"category": "cash_management", "unit": "per_report"},
    "CUSTOM_REPORT": {"category": "cash_management", "unit": "per_report"},

    # Domestic Payments
    "ACH_FILE": {"category": "domestic_payments", "unit": "per_file"},
    "ACH_TXN": {"category": "domestic_payments", "unit": "per_transaction"},
    "RTGS": {"category": "domestic_payments", "unit": "per_transaction"},
    "NEFT": {"category": "domestic_payments", "unit": "per_transaction"},
    "CHEQUE": {"category": "domestic_payments", "unit": "per_cheque"},

    # Standing Instructions
    "SI_SETUP": {"category": "domestic_payments", "unit": "one_time"},
    "SI_MONTHLY": {"category": "domestic_payments", "unit": "per_month"},

    # International
    "SWIFT": {"category": "international_payments", "unit": "per_transaction"},
    "FX_MARKUP": {"category": "international_payments", "unit": "percentage"},

    # Digital
    "API_SETUP": {"category": "digital_services", "unit": "one_time"},
    "API_TXN": {"category": "digital_services", "unit": "per_transaction"},
}
