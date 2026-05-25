import { Head, useForm } from '@inertiajs/react';
import { SparepartForm } from '@/components/features/spareparts/sparepart-form';
import type { SparepartFormValues } from '@/components/features/spareparts/sparepart-form';
import spareparts from '@/routes/spareparts';
import type { Bin, Brand, Category } from '@/types';

interface Props {
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    bins: Bin[];
}

const initialValues: SparepartFormValues = {
    material_number: '',
    part_name: '',
    rank: '',
    specification: '',
    brand_id: '',
    category_id: '',
    bin_id: '',
    safety_stock: '',
    actual_stock: '',
};

export default function Create({ brands, categories, bins }: Props) {
    const form = useForm(initialValues);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Angka dikonversi saat submit supaya input tetap nyaman dipakai sebagai string.
        form.transform((data) => ({
            ...data,
            brand_id: Number(data.brand_id),
            category_id: Number(data.category_id),
            bin_id: Number(data.bin_id),
            safety_stock: Number(data.safety_stock),
            actual_stock: Number(data.actual_stock),
        }));

        form.post(spareparts.store().url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Tambah Sparepart" />

            <div className="space-y-6 p-4 md:p-6">

                <SparepartForm
                    title="Tambah sparepart baru"
                    description="Isi data master supaya QR code, lokasi, dan stok dasar langsung tersimpan rapi."
                    values={form.data}
                    errors={form.errors as Partial<Record<keyof SparepartFormValues, string>>}
                    brands={brands}
                    categories={categories}
                    bins={bins}
                    processing={form.processing}
                    onSubmit={handleSubmit}
                    onChange={form.setData}
                    submitLabel="Simpan sparepart"
                    cancelHref={spareparts.index().url}
                />
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index(),
        },
        {
            title: 'Tambah sparepart',
            href: spareparts.create(),
        },
    ],
};
