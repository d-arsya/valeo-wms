import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types';

const statusStyles: Record<
    StockStatus,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        className?: string;
    }
> = {
    OK: {
        label: '✅ OK',
        variant: 'outline',
    },
    ATTENTION: {
        label: '😮 ATTENTION',
        variant: 'secondary',
        className: 'text-amber-900 dark:text-amber-100',
    },
    NG: {
        label: '😡 NG',
        variant: 'destructive',
    },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
    const config = statusStyles[status];

    return (
        <Badge
            variant={config.variant}
            className={cn('rounded-full px-3 py-1', config.className)}
        >
            {config.label}
        </Badge>
    );
}
