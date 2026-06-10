import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import brands from '@/routes/brands';
import type { Brand } from '@/types';

interface Props {
    brand: Brand;
}

export default function Edit({ brand }: Props) {
    const form = useForm({
        name: brand.name,
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.put(brands.update(brand.id).url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Edit Brand" />

            <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-lg">Edit Brand</CardTitle>
                            <CardDescription>Update the name and properties of this brand.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Brand Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="Enter brand name"
                                    autoComplete="off"
                                />
                                <InputError message={form.errors.name} />
                            </div>
                        </CardContent>

                        <CardContent className="flex flex-col gap-3 border-t border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">Updating a brand will reflect across all spareparts that are associated with it.</p>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button variant="outline" asChild>
                                    <Link href={brands.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: brands.index(),
        },
        {
            title: 'Edit Brand',
            href: '#', // Active page doesn't strictly need unique routing, or can just be placeholders/hashes
        },
    ],
};
