"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchContractText, normalizeContract } from "@/lib/api";
import ServiceLogCard from "@/components/ServiceLogCard";

const SERVICE_MASTER_HINT: Record<string, string> = {
  ACH_TXN: "per transaction",
  RTGS: "per transaction",
  NEFT: "per transaction",
  SWIFT: "per transaction",
  ACH_FILE: "per file",
  API_TXN: "per transaction",
  API_SETUP: "one-time",
  ACCT_MAINT: "per month",
};

export default function ContractPage() {
  const { contractId } = useParams<{ contractId: string }>();

  const [text, setText] = useState("");
  const [normalized, setNormalized] = useState<any>(null);
  const [services, setServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [contractMetadata, setContractMetadata] = useState<any>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!contractId) return;

    async function loadContract() {
      try {
        // 1️⃣ Fetch contract metadata (SAFE)
        const metaRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}`
        );

        if (!metaRes.ok) throw new Error("Failed to load contract metadata");
        const metadata = await metaRes.json();
        setContractMetadata(metadata);

        // 2️⃣ Fetch signed PDF URL (SAFE)
        if (metadata.file_path) {
          const pdfRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/pdf-url`
          );

          if (pdfRes.ok) {
            const { url } = await pdfRes.json();
            setPdfUrl(url);
          }
        }

        // 3️⃣ Fetch extracted text
        const textData = await fetchContractText(contractId);
        setText(textData.raw_text);
      } catch (err) {
        console.error("Contract load failed:", err);
      }
    }

    loadContract();
  }, [contractId]);

  useEffect(() => {
    async function loadNormalized() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/normalize/${contractId}`
      ).then((r) => r.json());

      if (res.normalized) {
        setNormalized(res.terms);
      }
    }

    if (contractId) loadNormalized();
  }, [contractId]);





  async function handleNormalize() {
    const res = await normalizeContract(contractId);
    setNormalized(res.terms);

    setLoadingServices(true);
    const svc = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/billable-services`
    ).then((r) => r.json());
    setServices(svc.services || []);
    setLoadingServices(false);
  }



  async function sendChat() {
    setChatLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/chat/${contractId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      }
    ).then((r) => r.json());

    setChatReply(res.reply);
    setChatLoading(false);
  }

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {contractMetadata?.name || "Contract Analysis"}
          </h1>
          <p className="text-sm text-slate-600">
            Review contract document and extracted intelligence
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Contract Document
                    </h2>
                    <p className="text-xs text-slate-500">
                      Original contract file
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-50">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Contract PDF"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 mb-4">
                      <svg
                        className="h-8 w-8 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Loading document...
                    </p>
                    <p className="text-xs text-slate-500">Please wait</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-[480px] flex flex-col gap-6 flex-shrink-0 overflow-y-auto max-h-full">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Pricing Analysis
                </h2>
                <p className="text-xs text-slate-500">
                  Normalize and analyze contract terms
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {!normalized ? (
              <button
                onClick={handleNormalize}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Normalize Contract
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    Contract normalized
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(normalized).map(([key, value]) => (
                    <details key={key} className="group">
                      <summary className="cursor-pointer p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                        <span className="text-sm font-medium text-slate-900 capitalize">
                          {key.replaceAll("_", " ")}
                        </span>
                      </summary>
                      <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-auto max-h-40">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <ServiceLogCard contractId={contractId} />


        

        

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  AI Contract Assistant
                </h2>
                <p className="text-xs text-slate-500">
                  Ask questions about this contract
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4 text-slate-900">
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about pricing terms, clauses, or specific details..."
              rows={3}
            />

            <button
              onClick={sendChat}
              disabled={chatLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {chatLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  Ask Question
                </>
              )}
            </button>

            {chatReply && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">
                    {chatReply}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
