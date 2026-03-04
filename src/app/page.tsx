import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[3px] text-[#D73F09] mb-2">
          Postgame
        </div>
        <h1 className="text-4xl font-black mb-4">Campaign Recaps</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Build and publish beautiful campaign recap galleries for your athlete
          content.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-[#D73F09] text-white font-bold rounded-lg hover:bg-[#B33407] transition-colors"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
