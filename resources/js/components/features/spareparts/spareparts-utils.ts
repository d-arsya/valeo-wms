import type { Sparepart } from '@/types';

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

export function getBinLabel(sparepart: Sparepart) {
    const rackCode = sparepart.bin?.rack?.code ?? 'No rack';
    const binCode = sparepart.bin?.code ?? 'No bin';

    return `${rackCode} / ${binCode}`;
}
