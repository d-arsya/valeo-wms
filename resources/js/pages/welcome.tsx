import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { dashboard, login } from '@/routes';

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 1800, active: boolean = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!active) {
return;
}

        let startTime: number | null = null;
        const tick = (ts: number) => {
            if (!startTime) {
startTime = ts;
}

            const p = Math.min((ts - startTime) / duration, 1);
            setCount(Math.floor(p * target));

            if (p < 1) {
requestAnimationFrame(tick);
}
        };
        requestAnimationFrame(tick);
    }, [target, duration, active]);

    return count;
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const WarehouseIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: size, height: size }}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const QrIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 26, height: 26 }}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h3v3h-3zM18 18h3v3h-3z" strokeWidth={0} fill="currentColor" />
    </svg>
);

const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 26, height: 26 }}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const LogIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 26, height: 26 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const PdfIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 26, height: 26 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 16, height: 16 }}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: 14, height: 14 }}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Welcome({ canRegister = false }: { canRegister?: boolean }) {
    const { auth } = usePage().props;
    const statsRef = useRef<HTMLDivElement>(null);
    const [statsVisible, setStatsVisible] = useState(false);

    const binsCount    = useCountUp(248,   1600, statsVisible);
    const itemsCount   = useCountUp(1540,  1900, statsVisible);
    const logsCount    = useCountUp(12000, 2100, statsVisible);

    useEffect(() => {
        const io = new IntersectionObserver(
            ([e]) => {
 if (e.isIntersecting) {
setStatsVisible(true);
} 
},
            { threshold: 0.3 },
        );

        if (statsRef.current) {
io.observe(statsRef.current);
}

        return () => io.disconnect();
    }, []);

    return (
        <>
            <Head title="Valeo WMS — Warehouse Management System">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <meta name="description" content="Valeo Warehouse Management System — Real-time spare parts stock control with QR scanning, automated stock alerts, and PDF reporting for production lines." />

                <style>{`
                /* ── Reset ── */
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                /* Valeo Brand Tokens */
                :root {
                    --v-lime:       #CCFF00;
                    --v-lime-hover: #B8E600;
                    --v-dark:       #3D3D3D;
                    --v-black:      #000000;
                    --v-white:      #FFFFFF;
                    --v-gray:       #F5F5F5;
                    --v-mid-gray:   #999999;
                    --v-teal:       #00A8A8;
                    --v-orange:     #FF9900;
                    --v-lime-light: #E6FF33;
                }

                body.welcome-page {
                    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
                    background: var(--v-white);
                    color: var(--v-dark);
                }

                /* ── Navbar ── */
                .w-nav {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 2rem;
                    background: var(--v-dark);
                    border-bottom: 3px solid var(--v-lime);
                }

                .w-nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                }

                .w-nav-icon {
                    width: 36px;
                    height: 36px;
                    background: var(--v-lime);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--v-dark);
                    flex-shrink: 0;
                }

                .w-nav-brand { line-height: 1.15; }

                .w-nav-valeo {
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--v-mid-gray);
                }

                .w-nav-sys {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--v-white);
                }

                /* ── CTA Buttons ── */
                .w-btn-lime {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 1.4rem;
                    border-radius: 6px;
                    background: var(--v-lime);
                    color: var(--v-dark);
                    font-weight: 700;
                    font-size: 0.875rem;
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: background 0.18s, transform 0.15s;
                }
                .w-btn-lime:hover {
                    background: var(--v-lime-hover);
                    transform: translateY(-1px);
                }

                .w-btn-outline {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 1.4rem;
                    border-radius: 6px;
                    background: transparent;
                    color: var(--v-white);
                    font-weight: 500;
                    font-size: 0.875rem;
                    text-decoration: none;
                    border: 1px solid rgba(255,255,255,0.3);
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: border-color 0.18s, background 0.18s;
                }
                .w-btn-outline:hover {
                    border-color: var(--v-lime);
                    color: var(--v-lime);
                    background: rgba(204,255,0,0.06);
                }

                /* ── Hero ── */
                .w-hero {
                    background: var(--v-dark);
                    padding: 6rem 1.5rem 5rem;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    min-height: calc(100vh - 64px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                /* Subtle grid overlay */
                .w-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(204,255,0,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(204,255,0,0.04) 1px, transparent 1px);
                    background-size: 48px 48px;
                    pointer-events: none;
                }

                /* Lime glow */
                .w-hero::after {
                    content: '';
                    position: absolute;
                    top: -10%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 700px;
                    height: 400px;
                    background: radial-gradient(ellipse, rgba(204,255,0,0.12) 0%, transparent 70%);
                    pointer-events: none;
                }

                .w-hero-badge {
                    position: relative;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.3rem 1rem;
                    border-radius: 999px;
                    border: 1px solid rgba(204,255,0,0.4);
                    background: rgba(204,255,0,0.08);
                    color: var(--v-lime);
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-bottom: 2rem;
                }

                .w-hero-badge-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--v-lime);
                    animation: blink 2s infinite;
                }

                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }

                .w-hero-title {
                    position: relative;
                    z-index: 1;
                    font-size: clamp(2.4rem, 6vw, 4.2rem);
                    font-weight: 800;
                    line-height: 1.06;
                    letter-spacing: -0.03em;
                    color: var(--v-white);
                    margin-bottom: 1.5rem;
                    max-width: 800px;
                }

                .w-hero-accent { color: var(--v-lime); }

                .w-hero-sub {
                    position: relative;
                    z-index: 1;
                    font-size: clamp(1rem, 2vw, 1.15rem);
                    color: var(--v-mid-gray);
                    max-width: 560px;
                    line-height: 1.75;
                    margin-bottom: 2.5rem;
                    font-weight: 400;
                }

                .w-hero-ctas {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .w-btn-hero-lime {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.9rem 2.4rem;
                    border-radius: 6px;
                    background: var(--v-lime);
                    color: var(--v-dark);
                    font-weight: 700;
                    font-size: 1rem;
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: background 0.18s, transform 0.15s;
                    letter-spacing: -0.01em;
                }
                .w-btn-hero-lime:hover {
                    background: var(--v-lime-hover);
                    transform: translateY(-2px);
                }

                .w-btn-hero-ghost {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.9rem 2.4rem;
                    border-radius: 6px;
                    background: transparent;
                    color: var(--v-white);
                    font-weight: 500;
                    font-size: 1rem;
                    text-decoration: none;
                    border: 1px solid rgba(255,255,255,0.2);
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.18s;
                }
                .w-btn-hero-ghost:hover {
                    border-color: var(--v-lime);
                    color: var(--v-lime);
                }

                /* ── Stats ── */
                .w-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    background: var(--v-black);
                    border-top: 1px solid #222;
                    border-bottom: 1px solid #222;
                }

                @media (max-width: 640px) {
                    .w-stats { grid-template-columns: 1fr; }
                }

                .w-stat {
                    padding: 2.5rem 2rem;
                    text-align: center;
                    border-right: 1px solid #222;
                }
                .w-stat:last-child { border-right: none; }

                .w-stat-value {
                    font-size: 2.75rem;
                    font-weight: 800;
                    color: var(--v-lime);
                    line-height: 1;
                    margin-bottom: 0.4rem;
                    letter-spacing: -0.03em;
                }

                .w-stat-label {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--v-mid-gray);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                /* ── Sections ── */
                .w-section {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 5rem 1.5rem;
                }

                .w-section-eyebrow {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--v-teal);
                    margin-bottom: 0.75rem;
                    display: block;
                }

                .w-section-title {
                    font-size: clamp(1.6rem, 3vw, 2.2rem);
                    font-weight: 700;
                    color: var(--v-dark);
                    letter-spacing: -0.02em;
                    margin-bottom: 0.75rem;
                }

                .w-section-sub {
                    font-size: 1rem;
                    color: var(--v-mid-gray);
                    line-height: 1.75;
                    max-width: 520px;
                    margin-bottom: 3rem;
                }

                /* ── Feature Cards ── */
                .w-features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 1.25rem;
                }

                .w-feature-card {
                    background: var(--v-white);
                    border: 1px solid #e8e8e8;
                    border-radius: 12px;
                    padding: 1.75rem;
                    transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
                }
                .w-feature-card:hover {
                    box-shadow: 0 6px 24px rgba(0,0,0,0.08);
                    transform: translateY(-3px);
                    border-color: var(--v-lime);
                }

                .w-feature-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }

                .w-feature-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--v-dark);
                    margin-bottom: 0.5rem;
                }

                .w-feature-desc {
                    font-size: 0.875rem;
                    color: var(--v-mid-gray);
                    line-height: 1.65;
                }

                /* ── Status Badges ── */
                .w-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }

                .w-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                }

                .w-badge-ok {
                    background: #ECFDF5;
                    border: 1px solid #86efac;
                    color: #16a34a;
                }

                .w-badge-attention {
                    background: #FFFBEB;
                    border: 1px solid #fcd34d;
                    color: #d97706;
                }

                .w-badge-ng {
                    background: #FEF2F2;
                    border: 1px solid #fca5a5;
                    color: #dc2626;
                }

                /* ── How it Works (dark strip) ── */
                .w-how-strip {
                    background: var(--v-dark);
                    padding: 5rem 1.5rem;
                }

                .w-how-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .w-how-title {
                    font-size: clamp(1.6rem, 3vw, 2.2rem);
                    font-weight: 700;
                    color: var(--v-white);
                    letter-spacing: -0.02em;
                    margin-bottom: 0.75rem;
                }

                .w-how-sub {
                    font-size: 1rem;
                    color: var(--v-mid-gray);
                    line-height: 1.75;
                    margin-bottom: 3rem;
                    max-width: 500px;
                }

                .w-steps {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 1.25rem;
                }

                .w-step {
                    padding: 1.75rem;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    background: rgba(255,255,255,0.03);
                    transition: border-color 0.25s;
                }
                .w-step:hover {
                    border-color: rgba(204,255,0,0.3);
                }

                .w-step-num {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    color: var(--v-lime);
                    margin-bottom: 1rem;
                }

                .w-step-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 10px;
                    background: rgba(204,255,0,0.1);
                    border: 1px solid rgba(204,255,0,0.2);
                    color: var(--v-lime);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1.25rem;
                }

                .w-step-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--v-white);
                    margin-bottom: 0.5rem;
                }

                .w-step-desc {
                    font-size: 0.875rem;
                    color: var(--v-mid-gray);
                    line-height: 1.65;
                }

                /* ── CTA Banner ── */
                .w-cta-band {
                    background: var(--v-lime);
                    padding: 3.5rem 1.5rem;
                    text-align: center;
                }

                .w-cta-title {
                    font-size: clamp(1.4rem, 3vw, 2rem);
                    font-weight: 800;
                    color: var(--v-dark);
                    letter-spacing: -0.02em;
                    margin-bottom: 0.5rem;
                }

                .w-cta-sub {
                    font-size: 1rem;
                    color: var(--v-dark);
                    opacity: 0.7;
                    margin-bottom: 2rem;
                }

                .w-btn-dark {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.85rem 2.2rem;
                    border-radius: 6px;
                    background: var(--v-dark);
                    color: var(--v-white);
                    font-weight: 700;
                    font-size: 1rem;
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: background 0.18s, transform 0.15s;
                }
                .w-btn-dark:hover {
                    background: var(--v-black);
                    transform: translateY(-2px);
                }

                /* ── Features list (checklist) ── */
                .w-checks {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 0.5rem 2rem;
                    margin-top: 1rem;
                }

                .w-check-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: rgba(61,61,61,0.75);
                }

                .w-check-icon {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--v-lime);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--v-dark);
                    flex-shrink: 0;
                }

                /* ── Footer ── */
                .w-footer {
                    background: var(--v-black);
                    padding: 2rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .w-footer-left {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    color: #666;
                    font-size: 0.82rem;
                }

                .w-footer-tagline {
                    font-size: 0.75rem;
                    color: #444;
                    font-style: italic;
                }

                /* ── Animations ── */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .w-anim { animation: fadeUp 0.6s ease both; }
                .w-anim-1 { animation-delay: 0ms; }
                .w-anim-2 { animation-delay: 80ms; }
                .w-anim-3 { animation-delay: 160ms; }
                .w-anim-4 { animation-delay: 240ms; }
                `}</style>
            </Head>

            <body className="welcome-page">

                {/* ── Navbar ── */}
                <nav className="w-nav">
                    <a href="#" className="w-nav-logo">
                        <div className="w-nav-icon">
                            <WarehouseIcon size={18} />
                        </div>
                        <div className="w-nav-brand">
                            <div className="w-nav-valeo">Valeo</div>
                            <div className="w-nav-sys">Warehouse Management</div>
                        </div>
                    </a>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {auth.user ? (
                            <Link href={dashboard()} className="w-btn-lime" id="nav-dashboard-btn">
                                Dashboard <ArrowRightIcon />
                            </Link>
                        ) : (
                            <Link href={login()} className="w-btn-lime" id="nav-login-btn">
                                Log In <ArrowRightIcon />
                            </Link>
                        )}
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section className="w-hero">
                    <div className="w-hero-badge">
                        <span className="w-hero-badge-dot" />
                        Spare Parts WMS · Production Line Ready
                    </div>

                    <h1 className="w-hero-title">
                        Smart Warehouse,<br />
                        <span className="w-hero-accent">Smarter Control</span>
                    </h1>

                    <p className="w-hero-sub">
                        Real-time spare parts inventory for Valeo production lines.
                        Scan QR bins, track stock instantly, and get alerted before a stop-line occurs.
                    </p>

                    <div className="w-hero-ctas">
                        {auth.user ? (
                            <Link href={dashboard()} className="w-btn-hero-lime" id="hero-dashboard-btn">
                                Go to Dashboard <ArrowRightIcon />
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="w-btn-hero-lime" id="hero-login-btn">
                                    Access System <ArrowRightIcon />
                                </Link>
                                <a href="#features" className="w-btn-hero-ghost" id="hero-learn-btn">
                                    Learn More
                                </a>
                            </>
                        )}
                    </div>
                </section>

                {/* ── Stats Bar ── */}
                <div className="w-stats" ref={statsRef}>
                    <div className="w-stat">
                        <div className="w-stat-value">{binsCount.toLocaleString()}+</div>
                        <div className="w-stat-label">QR-Enabled Bins</div>
                    </div>
                    <div className="w-stat">
                        <div className="w-stat-value">{itemsCount.toLocaleString()}+</div>
                        <div className="w-stat-label">Spare Parts Tracked</div>
                    </div>
                    <div className="w-stat">
                        <div className="w-stat-value">{logsCount.toLocaleString()}+</div>
                        <div className="w-stat-label">Activity Logs</div>
                    </div>
                </div>

                {/* ── Features ── */}
                <section id="features" className="w-section">
                    <span className="w-section-eyebrow">Capabilities</span>
                    <h2 className="w-section-title">Everything the floor team needs</h2>
                    <p className="w-section-sub">
                        Designed for Valeo warehouse teams — fast, mobile-first, and built around your real daily workflows.
                    </p>

                    <div className="w-features">
                        <div className="w-feature-card w-anim w-anim-1">
                            <div className="w-feature-icon" style={{ background: '#F0FFF0', color: '#3D3D3D' }}>
                                <QrIcon />
                            </div>
                            <h3 className="w-feature-title">Mobile QR Scanner</h3>
                            <p className="w-feature-desc">
                                Scan any bin QR code with your smartphone. Instantly see Material Number, Brand, Spec, and live stock — no manual lookup needed.
                            </p>
                        </div>

                        <div className="w-feature-card w-anim w-anim-2">
                            <div className="w-feature-icon" style={{ background: '#FFFBEB', color: '#d97706' }}>
                                <AlertIcon />
                            </div>
                            <h3 className="w-feature-title">Automated Stock Alerts</h3>
                            <p className="w-feature-desc">
                                Real-time status calculation. When stock falls below the safety level, the part is flagged immediately with a visual indicator.
                            </p>
                            <div className="w-badges">
                                <span className="w-badge w-badge-ok">✓ OK</span>
                                <span className="w-badge w-badge-attention">😮 ATTENTION</span>
                                <span className="w-badge w-badge-ng">😡 NG</span>
                            </div>
                        </div>

                        <div className="w-feature-card w-anim w-anim-3">
                            <div className="w-feature-icon" style={{ background: '#EFF6FF', color: '#2563eb' }}>
                                <LogIcon />
                            </div>
                            <h3 className="w-feature-title">Activity Log</h3>
                            <p className="w-feature-desc">
                                Every IN/OUT transaction is permanently recorded with timestamp, PIC name, quantity, and remarks. Full traceability for audits.
                            </p>
                        </div>

                        <div className="w-feature-card w-anim w-anim-4">
                            <div className="w-feature-icon" style={{ background: '#F5F3FF', color: '#7c3aed' }}>
                                <PdfIcon />
                            </div>
                            <h3 className="w-feature-title">PDF Report Export</h3>
                            <p className="w-feature-desc">
                                Export stock history as a structured PDF using your Word template. Filter by date range or document ID for clean, audit-ready reports.
                            </p>
                        </div>
                    </div>

                    {/* Checklist */}
                    <div className="w-checks" style={{ marginTop: '3rem' }}>
                        {[
                            'Real-time stock updates',
                            'No approval needed to update stock',
                            'QR label generation (Material, Location, Brand, Spec)',
                            'Admin & field team roles',
                            'PDF report with Word template',
                            'Safety stock threshold alerts',
                        ].map((item) => (
                            <div key={item} className="w-check-item">
                                <span className="w-check-icon"><CheckIcon /></span>
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── How It Works ── */}
                <div className="w-how-strip">
                    <div className="w-how-inner">
                        <span className="w-section-eyebrow" style={{ color: 'rgba(204,255,0,0.6)' }}>
                            Workflow
                        </span>
                        <h2 className="w-how-title">Three steps. Zero friction.</h2>
                        <p className="w-how-sub">
                            From bin to log in seconds — built so field teams stay productive, not tied to a desk.
                        </p>

                        <div className="w-steps">
                            <div className="w-step">
                                <div className="w-step-num">STEP 01</div>
                                <div className="w-step-icon"><QrIcon /></div>
                                <h3 className="w-step-title">Scan the Bin</h3>
                                <p className="w-step-desc">
                                    Open the app on your phone and scan the QR Code on the bin. The system identifies the part and shows live stock data instantly.
                                </p>
                            </div>

                            <div className="w-step">
                                <div className="w-step-num">STEP 02</div>
                                <div className="w-step-icon"><LogIcon /></div>
                                <h3 className="w-step-title">Update Stock</h3>
                                <p className="w-step-desc">
                                    Enter the quantity taken or received, add a PIC name and remarks. Confirm — stock updates in real-time. No approval required.
                                </p>
                            </div>

                            <div className="w-step">
                                <div className="w-step-num">STEP 03</div>
                                <div className="w-step-icon"><PdfIcon /></div>
                                <h3 className="w-step-title">Report & Review</h3>
                                <p className="w-step-desc">
                                    Monitor stock health from the dashboard. Export PDF reports for any date range. Get automatic alerts when parts reach critical levels.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CTA Band ── */}
                <div className="w-cta-band">
                    <h2 className="w-cta-title">Ready to take control of your warehouse?</h2>
                    <p className="w-cta-sub">Log in with your Valeo credentials to get started.</p>
                    {auth.user ? (
                        <Link href={dashboard()} className="w-btn-dark" id="cta-dashboard-btn">
                            Open Dashboard <ArrowRightIcon />
                        </Link>
                    ) : (
                        <Link href={login()} className="w-btn-dark" id="cta-login-btn">
                            Access System <ArrowRightIcon />
                        </Link>
                    )}
                </div>

                {/* ── Footer ── */}
                <footer className="w-footer">
                    <div className="w-footer-left">
                        <div style={{ width: 26, height: 26, background: '#CCFF00', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D3D3D' }}>
                            <WarehouseIcon size={14} />
                        </div>
                        <span>Valeo WMS · Internal Use Only</span>
                    </div>
                    <div className="w-footer-tagline">
                        Smart Technology For Smarter Mobility · © {new Date().getFullYear()} Valeo Group
                    </div>
                </footer>

            </body>
        </>
    );
}
