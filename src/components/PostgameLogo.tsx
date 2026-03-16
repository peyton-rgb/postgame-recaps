export function PostgameLogo({ className = "", size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const h = size === "md" ? "h-5 md:h-6" : "h-4 md:h-5";
  return (
    <img src="/postgame-logo-white.png" className={`${h} object-contain ${className}`} alt="Postgame" />
  );
}
