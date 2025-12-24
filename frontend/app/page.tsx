// frontend/app/(public)/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* ================= HERO SECTION ================= */}
      <section className="px-8 py-24 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Identify Revenue Leakage Hidden Inside Commercial Contracts
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Extract, normalize, and analyze pricing terms across thousands of
          commercial contracts — and surface underpricing, expired discounts,
          and missed escalations with full explainability.
        </p>

        <div className="flex gap-4">
          <a
            href="/signup"
            className="px-6 py-3 bg-black text-white rounded-md"
          >
            Get Started
          </a>

          <a
            href="#how-it-works"
            className="px-6 py-3 border border-gray-300 rounded-md"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* ================= PROBLEM SECTION ================= */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-10">
            The Problem Financial Institutions Face
          </h2>

          <ul className="space-y-4 text-gray-700">
            <li>• Commercial contracts contain complex, unstructured pricing terms</li>
            <li>• Discounts silently carry forward beyond their intended validity</li>
            <li>• Escalation clauses are missed or inconsistently applied</li>
            <li>• Different teams negotiate overlapping and inconsistent pricing</li>
            <li>• Leadership lacks centralized visibility into pricing deviations</li>
          </ul>

          <p className="mt-8 font-medium">
            The result: revenue leakage, profitability erosion, and uncontrolled
            commercial drift.
          </p>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-12">
            How the Platform Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-2">1. Ingest Contracts</h3>
              <p className="text-gray-600">
                Upload commercial contracts and pricing addendums securely.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Extract Pricing Terms</h3>
              <p className="text-gray-600">
                Identify transaction fees, discounts, tiers, and escalation
                clauses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Normalize Pricing</h3>
              <p className="text-gray-600">
                Compare contract terms against your standard pricing catalogue.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Surface Leakage</h3>
              <p className="text-gray-600">
                Detect underpricing, expired concessions, and missed escalations
                with clear explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CAPABILITIES ================= */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-10">
            Key Capabilities
          </h2>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <li>• Contract-level pricing term extraction</li>
            <li>• Client-level commercial profiles</li>
            <li>• Standard vs agreed pricing comparison</li>
            <li>• Revenue leakage detection and quantification</li>
            <li>• Explainable insights for leadership and audit teams</li>
            <li>• Centralized pricing visibility across the institution</li>
          </ul>
        </div>
      </section>

      {/* ================= WHO IT IS FOR ================= */}
      <section className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold mb-8">
            Built For
          </h2>

          <ul className="space-y-3 text-gray-700">
            <li>• Banks and financial institutions</li>
            <li>• Pricing and revenue management teams</li>
            <li>• Commercial operations leaders</li>
            <li>• Finance and profitability teams</li>
          </ul>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-8 py-24 bg-black text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6">
            Create Your Institution Workspace
          </h2>

          <p className="text-gray-300 mb-10">
            Gain visibility into pricing deviations and stop revenue leakage
            before it compounds.
          </p>

          <a
            href="/signup"
            className="px-8 py-4 bg-white text-black rounded-md"
          >
            Sign Up
          </a>
        </div>
      </section>
    </main>
  );
}
