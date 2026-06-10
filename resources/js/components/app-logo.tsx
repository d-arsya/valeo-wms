export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                <img src="/logo.png" alt="" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Warehouse Management System
                </span>
            </div>
        </>
    );
}
