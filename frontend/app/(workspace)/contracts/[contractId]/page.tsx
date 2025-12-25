"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchContractText, normalizeContract, detectLeakage } from "@/lib/api";

export default function ContractTextPage() {
  const params = useParams();
  const contractId = params.contractId as string;
  const [normalized, setNormalized] = useState<any>(null);
  const [text, setText] = useState("");
  const [findings, setFindings] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatReply, setChatReply] = useState("");

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

  async function handleLeakageCheck() {
    const res = await detectLeakage(contractId);
    setFindings(res.findings);
  }

  async function sendChat() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/chat/${contractId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      }
    );
    const data = await res.json();
    setChatReply(data.reply);
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

      <button
        onClick={handleLeakageCheck}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Run Revenue Leakage Check
      </button>

      {findings.length > 0 && (
        <div className="mt-6 space-y-4">
          {findings.map((f, i) => (
            <div key={i} className="border p-4 rounded">
              <h3 className="font-semibold">{f.type}</h3>
              <p className="text-sm text-gray-700">{f.message}</p>
              <p className="text-xs mt-2 italic">{f.explanation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <h2 className="font-semibold mb-2">Contract Chat</h2>

        <textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Ask about this contract..."
        />

        <button
          onClick={sendChat}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Ask
        </button>

        {chatReply && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            {chatReply}
          </div>
        )}
      </div>
    </main>
  );
}
