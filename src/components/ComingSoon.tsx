export default function ComingSoon({ label }: { label: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4 opacity-20">
        <svg
          className="mx-auto"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-500 mb-2">{label}</h2>
      <p className="text-sm text-gray-600">Coming soon.</p>
    </div>
  );
}
