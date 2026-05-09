import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
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
        control_id: filters.control_id || '',
    });

    const hasFilters = Boolean(
        data.from || data.to || data.type !== 'all' || data.search || data.control_id
    );

    const handleFilter = () => {
        const params = {
            from: data.from,
            to: data.to,
            type: data.type,
            search: data.search,
            control_id: data.control_id,
        };

        router.get(reports.index().url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['logs', 'filters'],
        });
    };

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

            <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto">
                <ReportHeader />

                <div className="grid gap-8 lg:grid-cols-4 items-start">
                    <ReportFilters 
                        data={data} 
                        setData={setData} 
                        onApply={handleFilter} 
                        onReset={handleClearFilters}
                        hasFilters={hasFilters}
                        processing={processing} 
                    />

                    <div className="lg:col-span-3 space-y-6">
                        <ReportPreviewTable 
                            logs={logs} 
                            onReset={handleClearFilters} 
                        />
                        
                        <Pagination meta={logs} />
                    </div>
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
