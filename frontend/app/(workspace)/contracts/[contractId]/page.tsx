"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchContractText } from "@/lib/api";

export default function ContractTextPage() {
  const params = useParams();
  const contractId = params.contractId as string;

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

  return (
    <main className="p-10">
      <h1 className="text-2xl font-semibold mb-6">
        Extracted Contract Text
      </h1>

      <pre className="whitespace-pre-wrap border p-4 rounded text-sm max-h-[80vh] overflow-auto">
        {text}
      </pre>
    </main>
  );
}
