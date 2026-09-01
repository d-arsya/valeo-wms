import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function FlashToaster() {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
            error?: string | null;
            warning?: string | null;
            info?: string | null;
        };
    };

    const lastFlash = useRef<string | null>(null);

    useEffect(() => {
        if (!flash) return;

        if (flash.success && lastFlash.current !== `success:${flash.success}`) {
            toast.success(flash.success);
            lastFlash.current = `success:${flash.success}`;
        } else if (flash.error && lastFlash.current !== `error:${flash.error}`) {
            toast.error(flash.error);
            lastFlash.current = `error:${flash.error}`;
        } else if (flash.warning && lastFlash.current !== `warning:${flash.warning}`) {
            toast.warning(flash.warning);
            lastFlash.current = `warning:${flash.warning}`;
        } else if (flash.info && lastFlash.current !== `info:${flash.info}`) {
            toast.info(flash.info);
            lastFlash.current = `info:${flash.info}`;
        }
    }, [flash]);

    return null;
}
