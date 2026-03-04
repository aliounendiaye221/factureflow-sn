'use server'

import { InvoiceService } from '@/services/invoiceService'
import { QuoteService } from '@/services/quoteService'

function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(cols: (string | number | null | undefined)[]) {
  return cols.map(escapeCSV).join(',')
}

export async function exportInvoicesCSVAction(): Promise<string> {
  const invoices = await InvoiceService.getInvoices()

  const header = row(['N° Facture', 'Client', 'Date échéance', 'Statut', 'HT', 'TVA', 'Total TTC', 'Notes'])
  const lines = invoices.map(inv => {
    const ht = inv.total_amount / 1.18
    const tva = inv.total_amount - ht
    return row([
      inv.invoice_number,
      inv.client?.name ?? '',
      inv.due_date ?? '',
      inv.status,
      Math.round(ht),
      Math.round(tva),
      inv.total_amount,
      (inv as unknown as { notes?: string }).notes ?? '',
    ])
  })

  return [header, ...lines].join('\n')
}

export async function exportQuotesCSVAction(): Promise<string> {
  const quotes = await QuoteService.getQuotes()

  const header = row(['N° Devis', 'Client', 'Date', 'Statut', 'HT', 'TVA', 'Total TTC', 'Notes'])
  const lines = quotes.map(q => {
    const ht = q.total_amount / 1.18
    const tva = q.total_amount - ht
    return row([
      q.quote_number,
      q.client?.name ?? '',
      q.created_at?.slice(0, 10) ?? '',
      q.status,
      Math.round(ht),
      Math.round(tva),
      q.total_amount,
      (q as unknown as { notes?: string }).notes ?? '',
    ])
  })

  return [header, ...lines].join('\n')
}
