import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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
    const isMobile = useIsMobile();
    const hasPrev = Boolean(meta.prev_page_url);
    const hasNext = Boolean(meta.next_page_url);

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm sm:px-4 md:flex-row md:items-center md:justify-between">
            <p className="text-center text-sm font-medium text-muted-foreground md:text-left">
                Page {meta.current_page} of {meta.last_page}
                <span className="hidden text-muted-foreground/80 sm:inline">
                    {' · '}
                    {meta.total} total results
                </span>
            </p>

            {isMobile ? (
                <div className="grid grid-cols-2 gap-2">
                    {hasPrev ? (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-11 w-full gap-2 text-sm"
                        >
                            <Link href={meta.prev_page_url!} preserveScroll>
                                <ChevronLeft className="h-4 w-4 shrink-0" />
                                <span>Previous</span>
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-11 w-full gap-2 text-sm opacity-70"
                            disabled
                        >
                            <ChevronLeft className="h-4 w-4 shrink-0" />
                            <span>Previous</span>
                        </Button>
                    )}

                    {hasNext ? (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-11 w-full gap-2 text-sm"
                        >
                            <Link href={meta.next_page_url!} preserveScroll>
                                <span>Next</span>
                                <ChevronRight className="h-4 w-4 shrink-0" />
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-11 w-full gap-2 text-sm opacity-70"
                            disabled
                        >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {meta.links.map((link) => {
                        const label = normalizePaginationLabel(link.label);

                        if (!link.url) {
                            return (
                                <Button
                                    key={link.label}
                                    variant="outline"
                                    size="sm"
                                    className="h-9 min-w-10"
                                    disabled
                                >
                                    {label ? (
                                        label
                                    ) : (
                                        <span className="px-1">…</span>
                                    )}
                                </Button>
                            );
                        }

                        return (
                            <Button
                                key={link.label}
                                asChild
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="h-9 min-w-10"
                            >
                                <Link href={link.url} preserveScroll>
                                    {label || <span className="px-1">…</span>}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
