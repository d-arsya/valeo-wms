import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { PaginatedResponse } from '@/types';

type Props = {
    meta: PaginatedResponse<any>;
};

function normalizePaginationLabel(label: string) {
    return label
        .replace(/&laquo;|&raquo;|&hellip;/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function Pagination({ meta }: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                {meta.links.map((link) => {
                    const label = normalizePaginationLabel(link.label);

                    if (!link.url) {
                        return (
                            <Button
                                key={link.label}
                                variant="outline"
                                size="sm"
                                className="min-w-10"
                                disabled
                            >
                                {label}
                            </Button>
                        );
                    }

                    return (
                        <Button
                            key={link.label}
                            asChild
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            className="min-w-10"
                        >
                            <Link href={link.url} preserveScroll>
                                {label}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
