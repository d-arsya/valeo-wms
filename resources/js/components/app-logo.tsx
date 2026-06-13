export default function AppLogo() {
    return (
        <>
            {/* Valeo Logo Container */}
            <div className="flex items-center justify-center shrink-0">
                <img
                    src="/logo.png"
                    alt="Valeo Logo"
                    className="h-8 w-auto object-contain"
                />
            </div>

            <div className="ml-2 flex flex-col justify-center leading-tight">
                <span className="text-sm font-black tracking-tighter text-foreground">
                    WMS
                </span>
            </div>
        </>
    );
}
