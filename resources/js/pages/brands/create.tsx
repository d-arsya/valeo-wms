import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import brands from '@/routes/brands';

export default function Create() {
    const form = useForm({
        name: '',
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(brands.store().url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Create Brand" />

            <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-lg">Create New Brand</CardTitle>
                            <CardDescription>Add a new sparepart brand to the system.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Brand Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="Enter brand name (e.g. Bosch, Denso)"
                                    autoComplete="off"
                                />
                                <InputError message={form.errors.name} />
                            </div>
                        </CardContent>

                        <CardContent className="flex flex-col gap-3 border-t border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">Brands are used to categorize and specify spareparts.</p>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button variant="outline" asChild>
                                    <Link href={brands.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    Save Brand
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Brands',
            href: brands.index(),
        },
        {
            title: 'Create Brand',
            href: brands.create(),
        },
    ],
};
