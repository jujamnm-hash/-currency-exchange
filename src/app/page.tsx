import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden atmosphere grain">
      <div className="absolute inset-0">
        <div className="hero-glow absolute -left-20 top-10 h-72 w-72 rounded-full bg-teal-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[70%] w-[55%] bg-[radial-gradient(circle_at_70%_40%,rgba(15,107,106,0.18),transparent_60%)]" />
        <svg
          className="absolute inset-y-0 left-0 hidden h-full w-[48%] opacity-[0.14] lg:block"
          viewBox="0 0 400 800"
          fill="none"
          aria-hidden
        >
          <path d="M40 80h220M40 140h160M40 200h200M40 280h140" stroke="#0f6b6a" strokeWidth="10" strokeLinecap="round" />
          <rect x="40" y="340" width="180" height="120" rx="16" stroke="#0f6b6a" strokeWidth="8" />
          <rect x="40" y="500" width="240" height="90" rx="16" stroke="#c47a1a" strokeWidth="8" />
          <circle cx="300" cy="620" r="48" stroke="#0f6b6a" strokeWidth="8" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-10">
        <p className="animate-fade-up font-display text-5xl font-bold tracking-tight text-teal-700 sm:text-7xl lg:text-8xl">
          هەژمار
        </p>
        <h1 className="animate-fade-up mt-5 max-w-xl text-2xl font-semibold text-ink sm:text-3xl" style={{ animationDelay: "80ms" }}>
          ژمێریاری و کۆگا لە یەک شوێن
        </h1>
        <p className="animate-fade-up mt-4 max-w-lg text-base leading-8 text-ink-soft sm:text-lg" style={{ animationDelay: "140ms" }}>
          فرۆشتن، کڕین، کۆگا، خەرجی، حیسابات و ڕاپۆرت — هەمووی بە کوردی سۆرانی، ئامادە بۆ Vercel.
        </p>
        <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "200ms" }}>
          <Link href="/dashboard" className="btn-primary px-6 py-3 text-base">
            چوونە ناو سیستەم
          </Link>
          <Link href="/sales/new" className="btn-ghost px-6 py-3 text-base">
            پسوڵەی فرۆشتن
          </Link>
        </div>
      </div>
    </div>
  );
}
