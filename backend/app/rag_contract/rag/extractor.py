import ollama
import json
from rag.retriever import retrieve_contract_context,get_pricing_chunks
from rag.prompts import CONTRACT_EXTRACTION_PROMPT , STANDARD_SERVICES, load_standard_pricing
from extraction_post_processing import apply_applicability,normalize_units,filter_non_price_items,enforce_standard_match_consistency
from rag.utils import safe_json_load , compare_with_standard
standard_catalog = load_standard_pricing("data/standard_pricing.json")


def extract_contract_pricing(contract_id: str):
    docs = get_pricing_chunks(contract_id)
    if not docs:
        raise ValueError(f"Contract {contract_id} not found")

    context = "\n\n".join(
        f"[SECTION {d.metadata.get('section_number')}]\n{d.page_content}"
        for d in docs
    )
    prompt = CONTRACT_EXTRACTION_PROMPT.replace(
        "<<CONTRACT_TEXT>>",
        context
    )
    # assert "<<CONTRACT_TEXT>>" not in prompt, "Contract text not injected!"

    response = ollama.chat(
        model="llama3.1:8b",
        messages=[{"role": "user", "content": prompt}],
        stream=False,
    )

    return response["message"]["content"].strip()
    # try:
    #     extracted = safe_json_load(response["message"]["content"].strip())
    # except json.JSONDecodeError:
    #     raise ValueError("LLM output is not valid JSON")
        
    # extracted = enforce_standard_match_consistency(extracted)
    # extracted = filter_non_price_items(extracted)
    # extracted = normalize_units(extracted)
    # extracted = apply_applicability(extracted)


    

    # return extracted
    # ,compare_with_standard(extracted, standard_catalog)
