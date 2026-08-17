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
    quantity: string;
    remarks: string;
}

const initialValues: StockOutFormValues = {
    quantity: '',
    remarks: '',
};

export default function Out({ sparepart, picOptions, returnTo }: Props) {
    const form = useForm(initialValues);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
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
                title={`Stock OUT — ${sparepart.material_number}`}
                sparepart={sparepart}
                cancelHref={returnTo ?? spareparts.show(sparepart.material_number).url}
                submitLabel="Konfirmasi OUT"
                processing={form.processing}
                onSubmit={handleSubmit}
                activityLogs={sparepart.activity_logs ?? []}
            >
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

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={form.data.remarks}
                                onChange={(event) => form.setData('remarks', event.target.value)}
                                placeholder="Catatan pengambilan"
                            />
                            <InputError message={form.errors.remarks} />
                        </div>
                    </div>
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
