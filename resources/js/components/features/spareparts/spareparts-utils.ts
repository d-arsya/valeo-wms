import type { Bin, Sparepart } from '@/types';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export function formatCurrency(value: string | null) {
    if (!value) {
        return '-';
    }

    const parsedValue = Number(value);

    return Number.isNaN(parsedValue)
        ? value
        : moneyFormatter.format(parsedValue);
}

export function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Mengubah data bin menjadi label lokasi yang mudah dibaca di form maupun tabel.
 */
export function getBinLocationLabel(bin?: Pick<Bin, 'code' | 'rack'> | null) {
    const rackCode = bin?.rack?.code ?? 'No rack';
    const binCode = bin?.code ?? 'No bin';

    return `${rackCode} / ${binCode}`;
}

export function getBinLabel(sparepart: Sparepart) {
    return getBinLocationLabel(sparepart.bin);
}
