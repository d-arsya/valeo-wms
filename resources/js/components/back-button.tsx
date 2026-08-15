import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type * as React from 'react';

import { Button } from '@/components/ui/button';

interface BackButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick' | 'asChild' | 'children'> {
    fallback: string;
    label?: string;
    showIcon?: boolean;
}

export function BackButton({
    fallback,
    label = 'Kembali',
    showIcon = true,
    variant = 'ghost',
    ...buttonProps
}: BackButtonProps) {
    return (
        <Button asChild variant={variant} {...buttonProps}>
            <Link href={fallback} preserveScroll={true}>
                {showIcon && <ChevronLeft className="size-4 shrink-0 pointer-events-none" />}
                <span className="pointer-events-none select-none">{label}</span>
            </Link>
        </Button>
    );
}
