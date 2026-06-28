import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 px-6 py-16 sm:px-8 lg:px-12">
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Bitspace feasibility study
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Discover what is feasible at your address.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            We’re building a feasibility study page that will let users enter a location and
            evaluate connectivity, infrastructure, and service feasibility. This is the foundation
            for Google Maps integration and data aggregation from partner sources.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/feasibility"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Start feasibility study
            </Link>
            <a
              href="#overview"
              className="inline-flex items-center justify-center rounded-full border border-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 dark:border-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Learn more
            </a>
          </div>
        </section>

        <section id="overview" className="grid gap-6 rounded-[2rem] border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">What we will build first</h2>
            <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-300">
              The feasibility study will start with structured address input, then expand to map
              visualization and data gathering from multiple service and infrastructure sources.
            </p>
          </div>
          <div className="space-y-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            <p>• Address lookup with Google Maps geocoding</p>
            <p>• Connectivity and infrastructure feasibility checks</p>
            <p>• Aggregation of compatibility and availability data</p>
            <p>• Feasibility summary for fibre, power, security, and automation</p>
          </div>
        </section>
      </main>
    </div>
  );
}
