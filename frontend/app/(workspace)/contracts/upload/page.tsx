"use client";

import { useState } from "react";
import { getInstitutionId } from "@/lib/auth";

export default function UploadContractPage() {
  const [clientName, setClientName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;

    const institutionId = await getInstitutionId();
    if (!institutionId) return;

    const formData = new FormData();
    formData.append("institution_id", institutionId);
    formData.append("client_name", clientName);
    formData.append("file", file);

    setLoading(true);
    console.log("DEBUG: Uploading contract");

    await fetch("http://localhost:8000/api/contracts/upload", {
      method: "POST",
      body: formData
    });

    setLoading(false);
    alert("Contract uploaded successfully");
  }

  return (
    <main className="p-10 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">
        Upload Contract
      </h1>

      <input
        className="border p-2 w-full mb-4"
        placeholder="Client name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />

      <input
        type="file"
        className="mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </main>
  );
}
