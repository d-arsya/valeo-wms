import * as React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';

// Tipe generik untuk opsi (harus punya `id` dan `name`)
export type CreatableOption = { id: number | string; name: string };

type ComboboxCreatableProps<T extends CreatableOption> = {
  label: string;
  options: T[];
  value?: T | null;
  onChange: (value: T | null) => void;
  createEndpoint: string; // URL endpoint untuk POST data baru (misal route('brands.store')
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onItemCreated?: (item: T) => void;
};

export function ComboboxCreatable<T extends CreatableOption>({
  label,
  options,
  value,
  onChange,
  createEndpoint,
  placeholder = 'Cari atau tambah...',
  error,
  disabled = false,
  onItemCreated,
}: ComboboxCreatableProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState(value?.name || '');
  const [isCreating, setIsCreating] = React.useState(false);

  // Update search text when value changes from parent
  React.useEffect(() => {
    setSearch(value?.name || '');
  }, [value]);

  // Filter opsi berdasarkan pencarian, limit ke 10 hasil saja
  // HANYA filter jika search tidak kosong untuk menghindari flash semua item
  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return [];
    return options
      .filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 10);
  }, [options, search]);

  // Cek apakah hasil pencarian sama persis dengan input
  const hasExactMatch = React.useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase();
    if (!trimmedSearch) return true;
    return options.some((opt) => opt.name.toLowerCase() === trimmedSearch);
  }, [options, search]);

  // Syarat Popover terbuka: Harus ada teks dan (ada hasil filter ATAU tidak ada exact match untuk tambah baru)
  const isPopoverOpen = React.useMemo(() => {
    const hasSearchText = search.trim().length > 0;
    return open && hasSearchText && (filteredOptions.length > 0 || !hasExactMatch);
  }, [open, search, filteredOptions, hasExactMatch]);

  // Handle ketika ingin menambah item baru
  const handleCreateNew = async () => {
    if (!search.trim()) return;
    setIsCreating(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await fetch(createEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({ name: search }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menambah item');
      }

      const newItem = (await response.json()) as T;
      if (onItemCreated) {
        onItemCreated(newItem);
      }
      onChange(newItem);
      setOpen(false);
      toast.success(`${label} "${search}" berhasil ditambahkan`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || `Gagal menambah ${label.toLowerCase()}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover
        open={isPopoverOpen}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e) => {
                const newValue = e.target.value;
                setSearch(newValue);

                if (newValue.trim() === '') {
                  setOpen(false);
                  onChange(null);
                } else {
                  setOpen(true);
                }
              }}
              onFocus={(e) => {
                e.target.select();
                // Jangan setOpen(true) di sini agar tidak muncul saat klik awal
              }}
              disabled={disabled}
              className="w-full pr-10"
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-1 w-[var(--radix-popover-trigger-width)]"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  className="w-full justify-start text-left font-normal h-9 px-2"
                  onClick={() => {
                    onChange(option);
                    setSearch(option.name);
                    setOpen(false);
                  }}
                >
                  {option.name}
                </Button>
              ))
            ) : !hasExactMatch && search.trim() !== '' ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground italic">
                Tidak ada hasil yang cocok...
              </div>
            ) : null}

            {/* Tombol tambah item baru */}
            {search.trim().length > 0 && !hasExactMatch && (
              <div className="pt-1 border-t mt-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-blue-600 hover:text-blue-700 font-normal h-9 px-2"
                  disabled={isCreating}
                  onClick={handleCreateNew}
                >
                  {isCreating ? 'Menambah...' : `Tambah "${search}"`}
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
