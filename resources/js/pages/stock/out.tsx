import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { StockTransactionForm } from '@/components/features/stock/stock-transaction-form';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import spareparts from '@/routes/spareparts';
import { form as stockOutForm } from '@/routes/stock/out';
import type { Sparepart } from '@/types';
import type { User } from '@/types/auth';

interface Props {
    sparepart: Sparepart;
    picOptions: Pick<User, 'id' | 'name'>[];
    returnTo?: string | null;
}

interface StockOutFormValues {
    user_id: string;
    quantity: string;
    remarks: string;
}

const initialValues: StockOutFormValues = {
    user_id: '',
    quantity: '',
    remarks: '',
};

export default function Out({ sparepart, picOptions, returnTo }: Props) {
    const form = useForm(initialValues);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            user_id: Number(data.user_id),
            quantity: Number(data.quantity),
        }));

        form.post(stockOutForm(sparepart.id).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Stock OUT ${sparepart.material_number}`} />

            <StockTransactionForm
                title={`Stock OUT - ${sparepart.material_number}`}
                description="Catat pengambilan barang secara akurat dan biarkan sistem menghitung stok aktual secara otomatis."
                sparepart={sparepart}
                cancelHref={returnTo ?? spareparts.show(sparepart.id).url}
                submitLabel="Konfirmasi OUT"
                processing={form.processing}
                onSubmit={handleSubmit}
                activityLogs={sparepart.activityLogs ?? []}
                footerNote="Pastikan jumlah pengambilan sesuai dengan barang yang benar-benar keluar dari bin."
            >
                <section className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Data Pengambilan</p>
                        <p className="text-sm text-muted-foreground">Masukkan jumlah barang dan keterangan singkat bila perlu.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user_id">PIC Name</Label>
                            <Select value={form.data.user_id} onValueChange={(value) => form.setData('user_id', value)}>
                                <SelectTrigger id="user_id">
                                    <SelectValue placeholder="Pilih PIC" />
                                </SelectTrigger>
                                <SelectContent>
                                    {picOptions.map((pic) => (
                                        <SelectItem key={pic.id} value={String(pic.id)}>
                                            {pic.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.user_id} />
                        </div>

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

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(event) => form.setData('remarks', event.target.value)}
                                placeholder="Contoh: Ambil untuk line maintenance"
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </div>
                </section>
            </StockTransactionForm>
        </>
    );
}

Out.layout = {
    breadcrumbs: [
        {
            title: 'Spareparts',
            href: spareparts.index(),
        },
        {
            title: 'Stock OUT',
                    href: spareparts.index(),
        },
    ],
};
