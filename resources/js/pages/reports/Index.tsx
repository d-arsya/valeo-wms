import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import reports from '@/routes/reports';
import { ReportHeader } from '@/components/features/reports/ReportHeader';
import { ReportFilters } from '@/components/features/reports/ReportFilters';
import { ReportPreviewTable } from '@/components/features/reports/ReportPreviewTable';
import { Pagination } from '@/components/pagination';
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
}

export default function ReportsIndex({ logs, filters }: ReportsProps) {
    const { data, setData, processing, reset } = useForm({
        from: filters.from || '',
        to: filters.to || '',
        type: filters.type || 'all',
        search: filters.search || '',
    });

    const hasFilters = Boolean(
        data.from || data.to || data.type !== 'all' || data.search
    );

    // Real-time filtering effect
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }

        const timeout = setTimeout(() => {
            router.get(reports.index().url, {
                from: data.from,
                to: data.to,
                type: data.type,
                search: data.search,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [data.from, data.to, data.type, data.search]);

    const handleClearFilters = () => {
        reset();
        router.get(reports.index().url, {}, {
            preserveState: false,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Laporan Transaksi" />

            <div className="flex flex-col gap-6 p-6 md:p-10 max-w-7xl mx-auto w-full">
                <ReportHeader />

                <ReportFilters
                    data={data}
                    setData={setData}
                    onReset={handleClearFilters}
                    hasFilters={hasFilters}
                    processing={processing}
                />

                <div className="space-y-6">
                    <ReportPreviewTable
                        logs={logs}
                        onReset={handleClearFilters}
                    />

                    <Pagination meta={logs} />
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Laporan', href: '#' },
    ],
};
