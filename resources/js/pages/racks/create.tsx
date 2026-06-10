import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import racks from '@/routes/racks';

export default function Create() {
    const form = useForm({
        code: '',
        bins: [] as { code: string }[],
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(racks.store().url, {
            preserveScroll: true,
        });
    }

    const addBin = () => {
        form.setData('bins', [...form.data.bins, { code: '' }]);
    };

    const removeBin = (index: number) => {
        const updated = form.data.bins.filter((_, i) => i !== index);
        form.setData('bins', updated);
    };

    const handleBinChange = (index: number, value: string) => {
        const updated = [...form.data.bins];
        updated[index] = { ...updated[index], code: value };
        form.setData('bins', updated);
    };

    return (
        <>
            <Head title="Create Rack" />

            <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-lg">Create New Rack</CardTitle>
                            <CardDescription>Add a new storage rack and configure its individual bins/locations.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            {/* Rack Code */}
                            <div className="space-y-2">
                                <Label htmlFor="code">Rack Code</Label>
                                <Input
                                    id="code"
                                    value={form.data.code}
                                    onChange={(event) => form.setData('code', event.target.value)}
                                    placeholder="Enter rack code (e.g. Rack-A, Row-01)"
                                    autoComplete="off"
                                />
                                <InputError message={form.errors.code} />
                            </div>

                            {/* Bins Management */}
                            <div className="space-y-4 border-t border-border/60 pt-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-semibold">Bins / Locations</Label>
                                        <p className="text-xs text-muted-foreground">Add specific bins belonging to this rack.</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addBin} className="gap-1">
                                        <Plus className="size-3.5" />
                                        Add Bin
                                    </Button>
                                </div>

                                <InputError message={form.errors.bins as string} />

                                {form.data.bins.length > 0 ? (
                                    <div className="space-y-3">
                                        {form.data.bins.map((bin, index) => {
                                            const errorKey = `bins.${index}.code` as keyof typeof form.errors;
                                            const errorMsg = form.errors[errorKey];

                                            return (
                                                <div key={index} className="flex items-start gap-2">
                                                    <div className="flex-1 space-y-1">
                                                        <Input
                                                            value={bin.code}
                                                            onChange={(e) => handleBinChange(index, e.target.value)}
                                                            placeholder={`Enter bin code (e.g. ${form.data.code ? form.data.code + '-' : ''}${index + 1})`}
                                                            autoComplete="off"
                                                        />
                                                        {errorMsg && <InputError message={errorMsg} />}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeBin(index)}
                                                        className="text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center">
                                        <p className="text-xs font-medium text-muted-foreground">No bins added yet.</p>
                                        <p className="text-[11px] text-muted-foreground/80 mt-0.5">Click "Add Bin" to specify locations within this rack.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardContent className="flex flex-col gap-3 border-t border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">Creating a rack allows assigning spareparts to its bins.</p>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button variant="outline" asChild>
                                    <Link href={racks.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    Save Rack
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
            title: 'Racks',
            href: racks.index(),
        },
        {
            title: 'Create Rack',
            href: racks.create(),
        },
    ],
};
