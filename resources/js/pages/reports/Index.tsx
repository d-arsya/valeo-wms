import { Head, useForm, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportPreviewTable } from '@/components/features/reports/ReportPreviewTable';
import { FloatingExportButton } from '@/components/features/reports/FloatingExportButton';
import { Pagination } from '@/components/pagination';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import reports from '@/routes/reports';
import type { ActivityLog, PaginatedResponse } from '@/types';

interface ReportsProps {
    logs: PaginatedResponse<ActivityLog>;
    filters: {
        from?: string;
        to?: string;
        type?: string;
        search?: string;
        control_id?: string;
    };
    dir: 'asc' | 'desc';
}

export default function ReportsIndex({ logs, filters, dir }: ReportsProps) {
    const { data, setData, processing, reset } = useForm({
        from: filters.from || '',
        to: filters.to || '',
        type: filters.type || 'all',
        search: filters.search || '',
    });

    const hasFilters = Boolean(
        data.from || data.to || data.type !== 'all' || data.search
    );

    const handleApplyFilters = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        router.get(
            reports.index().url,
            {
                from: data.from,
                to: data.to,
                type: data.type,
                search: data.search,
                ...(dir !== 'desc' ? { dir } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const handleClearFilters = () => {
        reset();
        router.get(reports.index().url, {}, {
            preserveState: false, preserveScroll: true, replace: true,
        });
    };

    const handleDirChange = (newDir: 'asc' | 'desc') => {
        router.get(
            reports.index().url,
            {
                from: data.from,
                to: data.to,
                type: data.type,
                search: data.search,
                ...(newDir !== 'desc' ? { dir: newDir } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Laporan Transaksi" />

            <div className="space-y-6 p-4 md:p-6">
                <Card className="gap-0 overflow-hidden border-border/70 shadow-sm">
                    <CardHeader className="border-b border-border/60 bg-linear-to-b from-muted/35 via-background to-background pb-4">
                        <ReportHeader />
                    </CardHeader>

                    <CardContent className="border-b border-border/60 bg-background p-4 md:p-6">
                        <ReportFilters
                            data={data}
                            setData={setData}
                            onApply={handleApplyFilters}
                            onReset={handleClearFilters}
                            hasFilters={hasFilters}
                            processing={processing}
                            dir={dir}
                            onDirChange={handleDirChange}
                        />
                    </CardContent>

                    <CardContent className="p-0">
                        <ReportPreviewTable
                            logs={logs}
                            onReset={handleClearFilters}
                        />
                    </CardContent>
                </Card>

                <Pagination meta={logs} />
            </div>

            <FloatingExportButton />
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
    ],
};
