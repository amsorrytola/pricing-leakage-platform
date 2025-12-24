// frontend/app/signup/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message || "Signup failed");
      setLoading(false);
      return;
    }

    // 1️⃣ create institution
    const { data: institutionRow, error: instError } = await supabase
      .from("institutions")
      .insert({ name: institution })
      .select()
      .single();

    if (instError) {
      setError("Failed to create institution");
      setLoading(false);
      return;
    }

    // 2️⃣ link user to institution
    await supabase.from("profiles").insert({
      id: data.user.id,
      institution_id: institutionRow.id,
      email,
    });

    router.push("/workspace");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md border p-8 rounded"
      >
        <h1 className="text-2xl font-semibold mb-6">
          Create Institution Workspace
        </h1>

        <input
          placeholder="Institution name"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="w-full mb-4 border p-2"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 border p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 border p-2"
          required
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
