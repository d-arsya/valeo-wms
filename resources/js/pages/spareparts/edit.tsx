import { Head, useForm } from '@inertiajs/react';
import { SparepartForm } from '@/components/features/spareparts/sparepart-form';
import type { SparepartFormValues } from '@/components/features/spareparts/sparepart-form';
import spareparts from '@/routes/spareparts';
import type { Bin, Brand, Category, Sparepart } from '@/types';

interface Props {
    sparepart: Sparepart;
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    bins: Bin[];
}

function mapSparepartToValues(sparepart: Sparepart): SparepartFormValues {
    return {
        material_number: sparepart.material_number ?? '',
        part_name: sparepart.part_name ?? '',
        specification: sparepart.specification ?? '',
        rank: sparepart.rank ?? '',
        brand_id: sparepart.brand_id ? String(sparepart.brand_id) : '',
        category_id: sparepart.category_id ? String(sparepart.category_id) : '',
        bin_id: sparepart.bin_id ? String(sparepart.bin_id) : '',
        safety_stock: String(sparepart.safety_stock ?? 0),
        actual_stock: String(sparepart.actual_stock ?? 0),
    };
}

export default function Edit({ sparepart, brands, categories, bins }: Props) {
    const form = useForm(mapSparepartToValues(sparepart));

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Payload dikirim dengan casting angka agar sesuai dengan form request di backend.
        form.transform((data) => ({
            ...data,
            brand_id: Number(data.brand_id),
            category_id: Number(data.category_id),
            bin_id: Number(data.bin_id),
            safety_stock: Number(data.safety_stock),
            actual_stock: Number(data.actual_stock),
        }));

        form.put(spareparts.update(sparepart.id).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Edit ${sparepart.material_number}`} />

            <div className="space-y-6 p-4 md:p-6">

                <SparepartForm
                    title={`Edit sparepart ${sparepart.material_number}`}
                    description="Perbarui data master tanpa mengubah pola validasi dan relasi yang sudah ada."
                    values={form.data}
                    errors={form.errors as Partial<Record<keyof SparepartFormValues, string>>}
                    brands={brands}
                    categories={categories}
                    bins={bins}
                    processing={form.processing}
                    onSubmit={handleSubmit}
                    onChange={form.setData}
                    submitLabel="Update sparepart"
                    cancelHref={spareparts.show(sparepart.id).url}
                />
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index(),
        },
        {
            title: 'Edit sparepart',
            href: spareparts.index(),
        },
    ],
};
