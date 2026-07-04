import Link from "next/link";

export default function Home() {
  return (
    <div className="text-brand-navy">
      <main className="mx-auto flex max-w-5xl flex-col justify-center gap-8 px-6 py-14 sm:px-8 lg:px-12">
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-red">
            Bitspace · Connectivity Feasibility
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Discover what connectivity is feasible at any business address.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
            Enter a business address and instantly check fibre and wireless availability across
            South Africa&apos;s major providers. Several are checked automatically; the rest are
            compiled into one consolidated feasibility report you can export and share.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/feasibility"
              className="inline-flex items-center justify-center rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy-700"
            >
              Start feasibility study
            </Link>
            <a
              href="#overview"
              className="inline-flex items-center justify-center rounded-full border border-brand-navy/30 px-6 py-3 text-sm font-semibold text-brand-navy transition hover:bg-zinc-100"
            >
              How it works
            </a>
          </div>
        </section>

        <section
          id="overview"
          className="grid gap-8 rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-sm sm:grid-cols-2"
        >
          <div>
            <h2 className="text-2xl font-semibold">How it works</h2>
            <p className="mt-3 text-base leading-7 text-zinc-600">
              Type an address, pick it from Google&apos;s suggestions, and start the study. Providers
              with a live connection fill in on their own; the others get a quick manual check with a
              direct link to their coverage tool.
            </p>
          </div>
          <ul className="space-y-3 text-base leading-7 text-zinc-700">
            <li className="flex gap-3">
              <span className="text-brand-red">→</span> Google-accurate address lookup and geocoding
            </li>
            <li className="flex gap-3">
              <span className="text-brand-red">→</span> Automated coverage checks across multiple providers
            </li>
            <li className="flex gap-3">
              <span className="text-brand-red">→</span> Available networks and speeds listed per provider
            </li>
            <li className="flex gap-3">
              <span className="text-brand-red">→</span> One consolidated report, exportable as Markdown
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
