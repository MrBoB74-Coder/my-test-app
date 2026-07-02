"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PROVIDERS,
  STATUS_LABELS,
  emptyResult,
  type FeasibilityStatus,
  type ProviderResult,
} from "@/lib/providers";

const STATUS_STYLES: Record<FeasibilityStatus, string> = {
  pending:
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  checking:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  feasible:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "not-feasible":
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  unknown:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

type Results = Record<string, ProviderResult>;

function initialResults(): Results {
  return Object.fromEntries(PROVIDERS.map((p) => [p.id, emptyResult()]));
}

export default function FeasibilityPage() {
  const [address, setAddress] = useState("");
  const [studyAddress, setStudyAddress] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number; formattedAddress: string } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [results, setResults] = useState<Results>(initialResults);
  const [copied, setCopied] = useState(false);

  function updateResult(id: string, patch: Partial<ProviderResult>) {
    setResults((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function startStudy(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) return;
    setStudyAddress(trimmed);
    setResults(initialResults());
    setGeo(null);
    setGeoError(null);

    // Geocode once so every provider check uses the same coordinates.
    let coords: { lat?: number; lng?: number } = {};
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeo(data);
        coords = { lat: data.lat, lng: data.lng };
      } else {
        setGeoError(data.error ?? "Could not locate address");
      }
    } catch {
      setGeoError("Geocoding failed");
    }

    // Fire auto-checks for any providers with an API adapter.
    for (const provider of PROVIDERS.filter((p) => p.checkType === "api")) {
      updateResult(provider.id, { status: "checking" });
      fetch("/api/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: trimmed, providerId: provider.id, ...coords }),
      })
        .then((res) => res.json())
        .then((data) =>
          updateResult(provider.id, {
            status: data.status ?? "unknown",
            notes: data.detail ?? "",
          })
        )
        .catch(() => updateResult(provider.id, { status: "unknown" }));
    }
  }

  function buildMarkdown(): string {
    const lines = [
      `# Feasibility Study`,
      ``,
      `- **Address:** ${studyAddress}`,
      `- **Date:** ${new Date().toISOString().slice(0, 10)}`,
      ``,
      `| Provider | Status | Package | Price | Notes |`,
      `| --- | --- | --- | --- | --- |`,
    ];
    for (const p of PROVIDERS) {
      const r = results[p.id];
      lines.push(
        `| ${p.name} | ${STATUS_LABELS[r.status]} | ${r.packageInfo || "—"} | ${r.price || "—"} | ${r.notes || "—"} |`
      );
    }
    return lines.join("\n");
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(buildMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadMarkdown() {
    const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feasibility-${(studyAddress ?? "study").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const summary = PROVIDERS.reduce(
    (acc, p) => {
      const s = results[p.id].status;
      if (s === "feasible") acc.feasible++;
      else if (s === "not-feasible") acc.notFeasible++;
      else acc.outstanding++;
      return acc;
    },
    { feasible: 0, notFeasible: 0, outstanding: 0 }
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12 sm:px-8 lg:px-12">
        <header className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                Feasibility Study
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Business connectivity feasibility check
              </h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-zinc-950 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Back to Home
            </Link>
          </div>

          <form onSubmit={startStudy} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              id="address"
              name="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main Rd, Sandton, Johannesburg"
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-700"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {studyAddress ? "Restart study" : "Start study"}
            </button>
          </form>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Google Maps address autocomplete coming next — for now, enter the full address.
          </p>
        </header>

        {studyAddress && (
          <>
            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Results for: {studyAddress}</h2>
                  {geo && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Located: {geo.formattedAddress} ({geo.lat.toFixed(5)}, {geo.lng.toFixed(5)})
                    </p>
                  )}
                  {geoError && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {geoError} — automated checks may be less accurate.
                    </p>
                  )}
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {summary.feasible} feasible · {summary.notFeasible} not feasible ·{" "}
                    {summary.outstanding} outstanding
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={copyMarkdown}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    {copied ? "Copied!" : "Copy as Markdown"}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Download .md
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Open each provider&apos;s coverage checker, test the address, and record the
                outcome below. Providers with automated checks will fill in on their own.
              </p>

              <div className="mt-6 space-y-4">
                {PROVIDERS.map((provider) => {
                  const r = results[provider.id];
                  return (
                    <div
                      key={provider.id}
                      className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-base font-semibold">{provider.name}</h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                          >
                            {STATUS_LABELS[r.status]}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                            {provider.checkType === "api" ? "Auto" : "Manual check"}
                          </span>
                        </div>
                        <a
                          href={provider.coverageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                        >
                          Open coverage checker ↗
                        </a>
                      </div>
                      {provider.notes && (
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {provider.notes}
                        </p>
                      )}
                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <label className="grid gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          Status
                          <select
                            value={r.status}
                            onChange={(e) =>
                              updateResult(provider.id, {
                                status: e.target.value as FeasibilityStatus,
                              })
                            }
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="feasible">Feasible</option>
                            <option value="not-feasible">Not feasible</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </label>
                        <label className="grid gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          Package / product
                          <input
                            type="text"
                            value={r.packageInfo}
                            onChange={(e) =>
                              updateResult(provider.id, { packageInfo: e.target.value })
                            }
                            placeholder="e.g. 100/100 Mbps FTTB"
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          Price (p/m)
                          <input
                            type="text"
                            value={r.price}
                            onChange={(e) =>
                              updateResult(provider.id, { price: e.target.value })
                            }
                            placeholder="e.g. R1 499"
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </label>
                        <label className="grid gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                          Notes
                          <input
                            type="text"
                            value={r.notes}
                            onChange={(e) =>
                              updateResult(provider.id, { notes: e.target.value })
                            }
                            placeholder="Install lead time, contention, etc."
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
