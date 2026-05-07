import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { StockTransactionForm } from '@/components/features/stock/stock-transaction-form';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import spareparts from '@/routes/spareparts';
import { form as stockInForm } from '@/routes/stock/in';
import type { Sparepart } from '@/types';

interface Props {
    sparepart: Sparepart;
    returnTo?: string | null;
}

interface StockInFormValues {
    quantity: string;
    po_number: string;
    supplier: string;
    gr_date: string;
    price_per_unit: string;
    remarks: string;
}

const initialValues: StockInFormValues = {
    quantity: '',
    po_number: '',
    supplier: '',
    gr_date: '',
    price_per_unit: '',
    remarks: '',
};

export default function In({ sparepart, returnTo }: Props) {
    const form = useForm(initialValues);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            quantity: Number(data.quantity),
            price_per_unit: Number(data.price_per_unit),
        }));

        form.post(stockInForm(sparepart.id).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Stock IN ${sparepart.material_number}`} />

            <StockTransactionForm
                title={`Stock IN - ${sparepart.material_number}`}
                description="Tambahkan stok masuk beserta informasi PO, GR date, dan harga satuan untuk audit."
                sparepart={sparepart}
                cancelHref={returnTo ?? spareparts.show(sparepart.id).url}
                submitLabel="Konfirmasi IN"
                processing={form.processing}
                onSubmit={handleSubmit}
                activityLogs={sparepart.activityLogs ?? []}
                footerNote="Pastikan data PO dan GR date sesuai dokumen penerimaan barang."
            >
                <section className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Data Penerimaan</p>
                        <p className="text-sm text-muted-foreground">Lengkapi jumlah, nomor PO, tanggal penerimaan, dan harga satuan.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                step="1"
                                value={form.data.quantity}
                                onChange={(event) => form.setData('quantity', event.target.value)}
                                placeholder="0"
                            />
                            <InputError message={form.errors.quantity} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="po_number">PO Number</Label>
                            <Input
                                id="po_number"
                                value={form.data.po_number}
                                onChange={(event) => form.setData('po_number', event.target.value)}
                                placeholder="Contoh: PO-2026-001"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.po_number} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input
                                id="supplier"
                                value={form.data.supplier}
                                onChange={(event) => form.setData('supplier', event.target.value)}
                                placeholder="Contoh: PT. Maju Jaya"
                                autoComplete="off"
                            />
                            <InputError message={form.errors.supplier} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gr_date">GR Date</Label>
                            <Input
                                id="gr_date"
                                type="date"
                                value={form.data.gr_date}
                                onChange={(event) => form.setData('gr_date', event.target.value)}
                            />
                            <InputError message={form.errors.gr_date} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price_per_unit">Price per Unit</Label>
                            <Input
                                id="price_per_unit"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.price_per_unit}
                                onChange={(event) => form.setData('price_per_unit', event.target.value)}
                                placeholder="0"
                            />
                            <InputError message={form.errors.price_per_unit} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(event) => form.setData('remarks', event.target.value)}
                                placeholder="Contoh: Barang diterima dari vendor"
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </div>
                </section>
            </StockTransactionForm>
        </>
    );
}

In.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index(),
        },
        {
            title: 'Stock IN',
                    href: spareparts.index(),
        },
    ],
};
