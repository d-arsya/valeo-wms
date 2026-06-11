export default function AppLogo() {
    return (
        <>
            {/* Valeo Logo Container */}
            <div className="flex items-center justify-center flex-shrink-0">
                <img 
                    src="/logo.png" 
                    alt="Valeo Logo" 
                    className="h-8 w-auto object-contain"
                />
            </div>

            <div className="ml-2 flex flex-col justify-center leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                    Valeo
                </span>
                <span className="text-sm font-black tracking-tighter text-foreground -mt-1">
                    WMS
                </span>
            </div>
        </>
    );
}
