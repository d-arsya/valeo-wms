export default function AppLogo() {
    return (
        <>
            {/* Valeo Lime Green icon mark */}
            <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg flex-shrink-0"
                style={{ background: '#CCFF00' }}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3D3D3D"
                    strokeWidth={2.2}
                    style={{ width: 16, height: 16 }}
                >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>

            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-[10px] font-semibold uppercase tracking-widest opacity-60">
                    Valeo
                </span>
                <span className="truncate font-semibold leading-tight">
                    WMS
                </span>
            </div>
        </>
    );
}
