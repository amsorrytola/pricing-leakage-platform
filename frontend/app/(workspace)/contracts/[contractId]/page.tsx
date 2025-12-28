// frontend/app/(workspace)/contracts/[contractId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchContractText, normalizeContract, detectLeakage } from "@/lib/api";

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
  const [findings, setFindings] = useState<any[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [billingPeriod, setBillingPeriod] = useState("2024-11");
  const [loadingServices, setLoadingServices] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatReply, setChatReply] = useState("");

  /* ---------------- LOAD CONTRACT TEXT ---------------- */
  useEffect(() => {
    if (!contractId) return;

    fetchContractText(contractId).then((d) => {
      setText(d.raw_text);
    });
  }, [contractId]);

  /* ---------------- LOAD NORMALIZED CONTRACT ---------------- */
  useEffect(() => {
    async function loadNormalized() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/normalize/${contractId}`
      ).then((r) => r.json());

      if (res.normalized) {
        setNormalized(res.terms);
      }

      console.log("Loaded normalized contract:", res);
    }

    if (contractId) loadNormalized();
  }, [contractId]);

  /* ---------------- LOAD BILLABLE SERVICES WHEN NORMALIZED ---------------- */
  useEffect(() => {
    async function loadServices() {
      if (!normalized) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/contracts/${contractId}/billable-services`
      ).then((r) => r.json());

      setServices(res.services || []);
    }

    loadServices();
  }, [normalized, contractId]);

  /* ---------------- LOAD LEAKAGE FINDINGS ---------------- */
  useEffect(() => {
    async function loadLeakage() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/leakage/${contractId}`
      ).then((r) => r.json());

      if (res.analyzed) {
        setFindings(res.findings);
      }
    }

    if (contractId) loadLeakage();
  }, [contractId]);

  /* ---------------- LOAD VOLUMES WHEN SERVICES OR BILLING PERIOD CHANGES ---------------- */

  useEffect(() => {
    async function loadVolumes() {
      if (!contractId || !billingPeriod) return;
      if (services.length === 0) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/volume/by-contract?` +
          new URLSearchParams({
            contract_id: contractId,
            billing_period: billingPeriod,
          })
      ).then((r) => r.json());

      if (!res.volumes) return;

      const initialVolumes: Record<string, number> = {};
      for (const v of res.volumes) {
        initialVolumes[v.service_code] = v.volume;
      }

      console.log("Loaded volumes:", initialVolumes);

      setVolumes(initialVolumes);
    }

    loadVolumes();
  }, [contractId, billingPeriod, services]);

  useEffect(() => {
    async function loadPeriods() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/volume/periods?contract_id=${contractId}`
      ).then((r) => r.json());

      if (res.periods?.length) {
        setBillingPeriod(res.periods[0]); // latest month
      }
    }

    if (contractId) loadPeriods();
  }, [contractId]);

  /* ---------------- ACTIONS ---------------- */
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

  async function handleLeakage() {
    const res = await detectLeakage(contractId);
    setFindings(res.findings);
  }

  async function submitVolume() {
    const payload = {
      contract_id: contractId,
      billing_period: billingPeriod,
      volumes: Object.entries(volumes).map(([service_code, volume]) => ({
        service_code,
        volume,
      })),
    };

    if (!payload.volumes.length) {
      alert("Enter at least one volume");
      return;
    }

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/volume/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Volume saved");
  }

  async function sendChat() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/chat/${contractId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      }
    ).then((r) => r.json());

    setChatReply(res.reply);
  }

  /* ---------------- UI ---------------- */
  return (
    <main className="max-w-6xl mx-auto p-10 space-y-10">
      {/* CONTRACT TEXT */}
      <section>
        <h1 className="text-2xl font-semibold mb-3">Contract</h1>
        <pre className="border rounded p-4 text-sm max-h-[60vh] overflow-auto">
          {text}
        </pre>
      </section>

      {/* NORMALIZATION */}
      <section className="border rounded p-6 space-y-4">
        <h2 className="font-semibold text-lg">Pricing Normalization</h2>

        {!normalized ? (
          <button
            onClick={handleNormalize}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Normalize Contract
          </button>
        ) : (
          <>
            <p className="text-green-600 text-sm">
              Contract pricing normalized
            </p>

            {/* NORMALIZED TERMS VIEW */}
            <div className="mt-4 bg-gray-50 border rounded p-4 text-sm space-y-3">
              {Object.entries(normalized).map(([key, value]) => (
                <div key={key}>
                  <div className="font-semibold text-gray-700">
                    {key.replaceAll("_", " ").toUpperCase()}
                  </div>

                  <pre className="mt-1 text-xs bg-white border rounded p-2 overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* VOLUME */}
      {normalized && services.length > 0 && (
        <section className="border rounded p-6">
          <h2 className="font-semibold mb-4">Volume Report</h2>

          <input
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            className="border p-2 rounded mb-4"
            placeholder="YYYY-MM"
          />

          <div className="space-y-3">
            {services.map((code) => (
              <div key={code} className="grid grid-cols-3 items-center gap-4">
                <div className="font-mono text-sm">{code}</div>
                <div className="text-xs text-gray-500">
                  {SERVICE_MASTER_HINT[code] ?? "per unit"}
                </div>
                <input
                  type="number"
                  className="border p-2 rounded"
                  value={volumes[code] ?? ""}
                  onChange={(e) =>
                    setVolumes({ ...volumes, [code]: Number(e.target.value) })
                  }
                />
              </div>
            ))}
          </div>

          <button
            onClick={submitVolume}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Volume
          </button>
        </section>
      )}

      {/* LEAKAGE */}
      <section className="border rounded p-6">
        <h2 className="font-semibold mb-4">Revenue Leakage</h2>

        <button
          onClick={handleLeakage}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Run Leakage Analysis
        </button>

        {findings.length > 0 && (
          <div className="mt-4 space-y-3">
            {findings.map((f, i) => (
              <div key={i} className="border p-4 rounded">
                <div className="font-semibold">{f.type}</div>
                <div className="text-sm">{f.message}</div>
                <div className="text-xs italic text-gray-500 mt-1">
                  {f.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CHAT */}
      <section className="border rounded p-6">
        <h2 className="font-semibold mb-3">Contract Chat</h2>

        <textarea
          className="border w-full p-2 rounded"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask a question about this contract..."
        />

        <button
          onClick={sendChat}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Ask
        </button>

        {chatReply && (
          <div className="mt-3 bg-gray-100 p-3 rounded text-sm">
            {chatReply}
          </div>
        )}
      </section>
    </main>
  );
}
