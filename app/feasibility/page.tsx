import Link from "next/link";

export default function FeasibilityPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-12 sm:px-8 lg:px-12">
        <header className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Feasibility Study
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Discover what technology and connectivity are feasible for your address.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
            Enter your location to evaluate available services, connectivity options,
            and site-specific feasibility. We’ll build the foundation for the full
            mapping and third-party integration workflow here.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Back to Home
            </Link>
            <a
              href="#address-form"
              className="inline-flex items-center justify-center rounded-full border border-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Start Your Study
            </a>
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-semibold">Address feasibility input</h2>
          <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            For now, submit an address and we’ll show the feasibility summary framework.
            Later we will connect Google Maps and data sources for live results.
          </p>
          <form className="mt-8 grid gap-6" id="address-form" action="#">
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Address or location
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="123 Main St, Johannesburg"
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-700"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Project notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Tell us what you want to evaluate at this location."
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-700"
              />
            </div>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
            >
              View feasibility framework
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-2xl font-semibold">What we’ll add next</h2>
          <ul className="mt-6 space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            <li>• Google Maps address/geocoding integration</li>
            <li>• Service availability lookup for fibre, mobile, and fixed wireless</li>
            <li>• Data aggregation from partner sites for connectivity, security, and power</li>
            <li>• Feasibility scorecards for connectivity, infrastructure, and automation</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
