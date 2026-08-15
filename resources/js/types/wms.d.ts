import type { User } from './auth';

export type StockStatus = 'OK' | 'ATTENTION' | 'NG';

export type StockControlType = 'IN' | 'OUT';

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface Brand {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    spareparts_count?: number;
}

export interface Rack {
    id: number;
    code: string;
    created_at: string;
    updated_at: string;
}

export interface Bin {
    id: number;
    rack_id: number;
    code: string;
    created_at: string;
    updated_at: string;
    rack?: Rack | null;
}

export interface Sparepart {
    id: number;
    material_number: string;
    part_name: string;
    specification: string;
    brand_id: number;
    rank: string;
    category_id: number;
    bin_id: number;
    safety_stock: number;
    actual_stock: number;
    last_po_number: string | null;
    last_supplier: string | null;
    last_gr_date: string | null;
    price_per_unit: string | null;
    status: StockStatus;
    created_at: string;
    updated_at: string;
    brand?: Brand | null;
    category?: Category | null;
    bin?: Bin | null;
    activity_logs?: ActivityLog[];
}

export interface ActivityLog {
    id: number;
    sparepart_id: number;
    user_id: number;
    control_id: string;
    type: StockControlType;
    quantity: number;
    remarks: string | null;
    po_number: string | null;
    gr_date: string | null;
    price_per_unit: string | null;
    performed_at: string;
    created_at: string;
    updated_at: string;
    sparepart?: Sparepart | null;
    user?: User | null;
}
