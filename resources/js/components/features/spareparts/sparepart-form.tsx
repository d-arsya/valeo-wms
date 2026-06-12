import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { BackButton } from '@/components/back-button';
import { getBinLocationLabel } from '@/components/features/spareparts/spareparts-utils';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComboboxCreatable } from '@/components/ui/combobox-creatable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import brandsRoute from '@/routes/brands';
import categoriesRoute from '@/routes/categories';
import type { Bin, Brand, Category } from '@/types';


export type SparepartFormValues = {
    material_number: string;
    part_name: string;
    specification: string;
    rank: string;
    brand_id: string;
    category_id: string;
    bin_id: string;
    safety_stock: string;
    actual_stock: string;
    last_po_number: string;
    last_supplier: string;
    last_gr_date: string;
    price_per_unit: string;
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
    onBrandCreated?: (newBrand: any) => void;
    onCategoryCreated?: (newCategory: any) => void;
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
    onBrandCreated,
    onCategoryCreated,
}: Props) {
    const currentBrand = brands.find((b) => String(b.id) === values.brand_id) || null;
    const currentCategory = categories.find((c) => String(c.id) === values.category_id) || null;

    // Tampilkan notifikasi toast jika ada error pada field yang disembunyikan
    useEffect(() => {
        if (errors.brand_id) {
            toast.error(`Brand: ${errors.brand_id}`);
        }

        if (errors.category_id) {
            toast.error(`Category: ${errors.category_id}`);
        }

        if (errors.bin_id) {
            toast.error(`Location / Bin: ${errors.bin_id}`);
        }
    }, [errors.brand_id, errors.category_id, errors.bin_id]);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                <CardHeader className="border-b border-border/60">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Section 1: Identitas Utama */}
                    <section className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Identitas Sparepart</p>
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
                            <div className="space-y-2">
                                <Label htmlFor="rank">Rank</Label>
                                <Input
                                    id="rank"
                                    value={values.rank}
                                    onChange={(event) => onChange('rank', event.target.value)}
                                    placeholder="Pilih rank"
                                    autoComplete="off"
                                />
                                <InputError message={errors.rank} />
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

                    {/* Section 2: Klasifikasi & Lokasi */}
                    <section className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Klasifikasi & Lokasi</p>
                        <div className="grid gap-4 md:grid-cols-3">
                            <ComboboxCreatable
                                label="Brand"
                                options={brands}
                                value={currentBrand}
                                onChange={(brand) => onChange('brand_id', brand ? String(brand.id) : '')}
                                createEndpoint={brandsRoute.store().url}
                                onItemCreated={onBrandCreated}
                            />
                            <ComboboxCreatable
                                label="Category"
                                options={categories}
                                value={currentCategory}
                                onChange={(category) => onChange('category_id', category ? String(category.id) : '')}
                                createEndpoint={categoriesRoute.store().url}
                                onItemCreated={onCategoryCreated}
                            />
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
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Data Lainnya */}
                    <section className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">Data Lainnya</p>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="last_po_number">Last PO Number</Label>
                                <Input
                                    id="last_po_number"
                                    value={values.last_po_number}
                                    onChange={(event) => onChange('last_po_number', event.target.value)}
                                    placeholder="Nomor PO terakhir"
                                    autoComplete="off"
                                />
                                <InputError message={errors.last_po_number} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_supplier">Last Supplier</Label>
                                <Input
                                    id="last_supplier"
                                    value={values.last_supplier}
                                    onChange={(event) => onChange('last_supplier', event.target.value)}
                                    placeholder="Nama supplier terakhir"
                                    autoComplete="off"
                                />
                                <InputError message={errors.last_supplier} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price_per_unit">Price Per Unit</Label>
                                <Input
                                    id="price_per_unit"
                                    value={values.price_per_unit}
                                    onChange={(event) => onChange('price_per_unit', event.target.value)}
                                    placeholder="Harga per unituan"
                                    autoComplete="off"
                                    type="number"
                                />
                                <InputError message={errors.price_per_unit} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gr_date">GR Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !values.last_gr_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                            {values.last_gr_date ? format(parseISO(values.last_gr_date), "dd MMM yyyy", { locale: id }) : <span>Pilih tanggal GR</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            locale={id}
                                            selected={values.last_gr_date ? parseISO(values.last_gr_date) : undefined}
                                            onSelect={(date) => {
                                                const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                                                onChange('last_gr_date', formattedDate);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.last_gr_date} />
                            </div>
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
                        <BackButton fallback={cancelHref} label="Batal" />
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
