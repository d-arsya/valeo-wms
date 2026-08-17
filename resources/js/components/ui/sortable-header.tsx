import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortDir = 'asc' | 'desc';

interface SortableHeaderProps {
    /** Nama kolom yang dikirim ke server sebagai query param ?sort= */
    column: string;
    /** Kolom yang sedang aktif di-sort (dari props halaman) */
    currentSort: string;
    /** Arah sort saat ini */
    currentDir: SortDir;
    /** Callback saat header diklik */
    onSort: (column: string, dir: SortDir) => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * Header kolom tabel yang bisa diklik untuk sort.
 * - Klik pertama  → asc
 * - Klik kedua    → desc
 * - Klik ketiga   → kembali ke asc (toggle)
 *
 * Ikon: ↕ (tidak aktif) | ↑ (asc aktif) | ↓ (desc aktif)
 */
export function SortableHeader({
    column,
    currentSort,
    currentDir,
    onSort,
    children,
    className,
}: SortableHeaderProps) {
    const isActive = currentSort === column;

    const handleClick = () => {
        if (!isActive) {
            // Kolom baru → mulai dari asc
            onSort(column, 'asc');
        } else {
            // Toggle asc ↔ desc
            onSort(column, currentDir === 'asc' ? 'desc' : 'asc');
        }
    };

    return (
        <th
            className={cn(
                'px-5 py-3.5 text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap',
                'cursor-pointer select-none',
                'hover:text-foreground transition-colors',
                isActive ? 'text-foreground' : 'text-muted-foreground',
                className,
            )}
            onClick={handleClick}
            aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <span className="inline-flex items-center gap-1">
                {children}
                {isActive ? (
                    currentDir === 'asc' ? (
                        <ArrowUp className="size-3 shrink-0 text-primary" />
                    ) : (
                        <ArrowDown className="size-3 shrink-0 text-primary" />
                    )
                ) : (
                    <ArrowUpDown className="size-3 shrink-0 opacity-40" />
                )}
            </span>
        </th>
    );
}
