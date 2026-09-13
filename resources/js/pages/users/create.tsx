import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import users from '@/routes/users';

interface Props {
    roles: { value: string; label: string }[];
}

export default function Create({ roles }: Props) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'technician',
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(users.store().url, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Create User" />

            <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="gap-0 overflow-hidden border-border/60 shadow-sm">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-lg">Tambah User Baru</CardTitle>
                            <CardDescription>Tambahkan pengguna baru ke sistem.</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="Nama lengkap"
                                    autoComplete="name"
                                    required
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    placeholder="Alamat email"
                                    autoComplete="email"
                                    required
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    value={form.data.password}
                                    onChange={(event) => form.setData('password', event.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                    required
                                />
                                <InputError message={form.errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={form.data.password_confirmation}
                                    onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                    placeholder="Ulangi password"
                                    autoComplete="new-password"
                                    required
                                />
                                <InputError message={form.errors.password_confirmation} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={form.data.role} onValueChange={(value) => form.setData('role', value)}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.role} />
                            </div>
                        </CardContent>

                        <CardContent className="flex flex-col gap-3 border-t border-border/60 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:ml-auto">
                                <Button variant="outline" asChild>
                                    <Link href={users.index().url}>Batal</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? 'Menyimpan...' : 'Simpan User'}
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
            title: 'Users',
            href: users.index(),
        },
        {
            title: 'Create User',
            href: users.create(),
        },
    ],
};
