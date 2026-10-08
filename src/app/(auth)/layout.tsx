import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-dot-grid text-ink">
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-control bg-primary text-white flex items-center justify-center font-bold text-sm tracking-tight transition group-hover:bg-primary-hover">
          SB
        </div>
        <span className="font-semibold text-lg text-ink tracking-tight">
          SkillBridge
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
