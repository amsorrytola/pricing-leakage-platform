axis_catalog = {"cash_management": {
      "account_maintenance": {
        "service_code": "ACCT_MAINT",
        "unit": "per_month",
        "price": 2600,
        "escalation_applicable": 'truecash' 
      },
      "daily_statement_email": {
        "service_code": "DAILY_STMT_EMAIL",
        "unit": "per_statement",
        "price": 120
      },
      "monthly_reconciliation": {
        "service_code": "MONTHLY_RECON",
        "unit": "per_report",
        "price": 700
      },
      "custom_reports": {
        "service_code": "CUSTOM_REPORT",
        "unit": "per_report",
        "price": 1200
      }
    },

    "domestic_payments": {
      "ach_file": {
        "service_code": "ACH_FILE",
        "unit": "per_file",
        "price": 450
      },
      "ach_transaction": {
        "service_code": "ACH_TXN",
        "unit": "per_transaction",
        "price": 2.5
      },
      "rtgs": {
        "service_code": "RTGS",
        "unit": "per_transaction",
        "price": 45
      },
      "neft": {
        "service_code": "NEFT",
        "unit": "per_transaction",
        "price": 22
      },
      "cheque_processing": {
        "service_code": "CHEQUE",
        "unit": "per_cheque",
        "price": 30
      },
      "standing_instruction": {
        "setup_fee": {
          "unit": "one_time",
          "price": 300
        },
        "monthly_fee": {
          "unit": "per_month",
          "price": 300
        }
      }
    },

    "international_payments": {
      "swift_wire": {
        "service_code": "SWIFT",
        "unit": "per_transaction",
        "price": 800
      },
      "fatca_screening": {
        "service_code": "FATCA",
        "unit": "per_transaction",
        "price": 60
      },
      "correspondent_charges": {
        "service_code": "CORR_BANK",
        "unit": "percentage_plus_actual",
        "handling_fee_percent": 5.5
      },
      "fx_markup": {
        "service_code": "FX_MARKUP",
        "unit": "percentage",
        "price": 0.7
      }
    },

    "trade_finance": {
      "lc_issuance": {
        "service_code": "LC_ISSUE",
        "unit": "per_lc",
        "price": 13500
      },
      "lc_amendment": {
        "service_code": "LC_AMEND",
        "unit": "per_amendment",
        "price": 4500
      },
      "lc_negotiation": {
        "service_code": "LC_NEG",
        "unit": "per_document_set",
        "price": 3000
      },
      "lc_discrepancy": {
        "service_code": "LC_DISC",
        "unit": "per_lc",
        "price": 3500
      },
      "bank_guarantee": {
        "service_code": "BG",
        "unit": "per_year",
        "price": 11000,
        "additional_year_price": 2200
      }
    },

    "digital_services": {
      "online_portal": {
        "service_code": "PORTAL",
        "unit": "per_month",
        "price": 1000
      },
      "sweep_account": {
        "service_code": "SWEEP",
        "unit": "per_month",
        "price": 2500
      },
      "api_setup": {
        "service_code": "API_SETUP",
        "unit": "one_time",
        "price": 25000
      },
      "api_transaction": {
        "service_code": "API_TXN",
        "unit": "per_transaction",
        "price": 1.75
      }
    }}