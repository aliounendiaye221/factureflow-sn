import type { LucideProps } from 'lucide-react'

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
    description: string;
    quantity: number;
    unit_price: number;
}

export interface InvoiceData {
    id: string;
    invoice_number: string;
    status: InvoiceStatus;
    created_at: string;
    due_date?: string | null;
    paid_at?: string | null;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    items: InvoiceItem[];
    client: {
        id?: string;
        name: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        tax_id?: string | null;
    } | null;
}

export interface AgencyData {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    ninea?: string | null;
    rccm?: string | null;
    logo_url?: string | null;
}

export interface InvoiceTemplateProps {
    invoice: InvoiceData;
    agency: AgencyData | null;
    statusConfig: {
        label: string;
        color: string;
        bg: string;
        icon: React.ComponentType<LucideProps>;
    };
    document_type?: 'invoice' | 'quote';
    actions?: React.ReactNode;
}
