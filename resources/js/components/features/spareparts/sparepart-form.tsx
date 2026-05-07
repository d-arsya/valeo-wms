import { Link } from '@inertiajs/react';
import type {FormEvent} from 'react';
import { getBinLocationLabel } from '@/components/features/spareparts/spareparts-utils';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Bin, Brand, Category } from '@/types';

export type SparepartFormValues = {
    material_number: string;
    part_name: string;
    specification: string;
    brand_id: string;
    category_id: string;
    bin_id: string;
    safety_stock: string;
    actual_stock: string;
};

interface Props {
    title: string;
    description: string;
    values: SparepartFormValues;
    errors: Partial<Record<keyof SparepartFormValues, string>>;
    brands: Pick<Brand, 'id' | 'name'>[];
    categories: Pick<Category, 'id' | 'name'>[];
    bins: Bin[];
    processing: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onChange: (field: keyof SparepartFormValues, value: string) => void;
    submitLabel: string;
    cancelHref: string;
}

/**
 * Form master sparepart dipakai ulang untuk halaman create dan edit.
 * Dengan cara ini, field dan validasi tetap konsisten di seluruh alur CRUD.
 */
export function SparepartForm({
    title,
    description,
    values,
    errors,
    brands,
    categories,
    bins,
    processing,
    onSubmit,
    onChange,
    submitLabel,
    cancelHref,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/60">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    <section className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Identitas Sparepart</p>
                            <p className="text-sm text-muted-foreground">Isi data inti barang supaya mudah dicari dan dilacak.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="material_number">Material Number</Label>
                                <Input
                                    id="material_number"
                                    value={values.material_number}
                                    onChange={(event) => onChange('material_number', event.target.value)}
                                    placeholder="Contoh: MAT-001-ABC"
                                    autoComplete="off"
                                />
                                <InputError message={errors.material_number} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="part_name">Part Name</Label>
                                <Input
                                    id="part_name"
                                    value={values.part_name}
                                    onChange={(event) => onChange('part_name', event.target.value)}
                                    placeholder="Nama sparepart"
                                    autoComplete="off"
                                />
                                <InputError message={errors.part_name} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specification">Specification</Label>
                            <Textarea
                                id="specification"
                                value={values.specification}
                                onChange={(event) => onChange('specification', event.target.value)}
                                placeholder="Tulis spesifikasi barang secara ringkas dan jelas"
                            />
                            <InputError message={errors.specification} />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Klasifikasi & Lokasi</p>
                            <p className="text-sm text-muted-foreground">Pilih brand, kategori, dan bin supaya label QR konsisten.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="brand_id">Brand</Label>
                                <Select value={values.brand_id} onValueChange={(value) => onChange('brand_id', value)}>
                                    <SelectTrigger id="brand_id">
                                        <SelectValue placeholder="Pilih brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.brand_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select value={values.category_id} onValueChange={(value) => onChange('category_id', value)}>
                                    <SelectTrigger id="category_id">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bin_id">Location / Bin</Label>
                                <Select value={values.bin_id} onValueChange={(value) => onChange('bin_id', value)}>
                                    <SelectTrigger id="bin_id">
                                        <SelectValue placeholder="Pilih lokasi bin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bins.map((bin) => (
                                            <SelectItem key={bin.id} value={String(bin.id)}>
                                                {getBinLocationLabel(bin)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.bin_id} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Stok Awal</p>
                            <p className="text-sm text-muted-foreground">Nilai ini dipakai sebagai stok awal sebelum transaksi IN/OUT berjalan.</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="safety_stock">Safety Stock</Label>
                                <Input
                                    id="safety_stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={values.safety_stock}
                                    onChange={(event) => onChange('safety_stock', event.target.value)}
                                    placeholder="0"
                                />
                                <InputError message={errors.safety_stock} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="actual_stock">Actual Stock</Label>
                                <Input
                                    id="actual_stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={values.actual_stock}
                                    onChange={(event) => onChange('actual_stock', event.target.value)}
                                    placeholder="0"
                                />
                                <InputError message={errors.actual_stock} />
                            </div>
                        </div>
                    </section>
                </CardContent>

                <CardContent className="flex flex-col gap-3 border-t border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">Pastikan data lokasi dan stok sudah benar sebelum menyimpan.</p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" asChild>
                            <Link href={cancelHref}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
