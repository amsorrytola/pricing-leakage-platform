"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchContractText } from "@/lib/api";
import { normalizeContract } from "@/lib/api";

export default function ContractTextPage() {
  const params = useParams();
  const contractId = params.contractId as string;
  const [normalized, setNormalized] = useState<any>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!contractId) return;

    async function load() {
      console.log("DEBUG: contractId =", contractId);
      const data = await fetchContractText(contractId);
      setText(data.raw_text);
    }

    load();
  }, [contractId]);

  async function handleNormalize() {
    const res = await normalizeContract(contractId);
    setNormalized(res.terms);
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold mb-6">Extracted Contract Text</h1>

      <pre className="whitespace-pre-wrap border p-4 rounded text-sm max-h-[80vh] overflow-auto">
        {text}
      </pre>

      <button
        onClick={handleNormalize}
        className="mt-6 px-4 py-2 bg-black text-white rounded"
      >
        Normalize Contract
      </button>

      {normalized && (
        <pre className="mt-6 bg-gray-100 p-4 rounded text-sm">
          {JSON.stringify(normalized, null, 2)}
        </pre>
      )}
    </main>
  );
}
