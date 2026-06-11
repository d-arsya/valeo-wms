import { router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
    fallback: string;
    className?: string;
    variant?: 'outline' | 'ghost' | 'link' | 'default' | 'destructive' | 'secondary';
    label?: string;
}

/**
 * Komponen tombol kembali yang aman untuk Inertia.js.
 * Menggunakan router.visit ke fallback URL daripada window.history.back()
 * untuk menghindari masalah 404 saat history state tidak valid.
 */
export function BackButton({ 
    fallback, 
    className = '', 
    variant = 'outline',
    label = 'Kembali'
}: BackButtonProps) {
    const handleBack = () => {
        // Menggunakan router.visit ke fallback URL untuk keamanan
        router.visit(fallback);
    };

    return (
        <Button 
            type="button" 
            variant={variant} 
            onClick={handleBack} 
            className={`gap-2 ${className}`}
        >
            <ChevronLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}
