import { RbacService } from '@/services/rbacService'
import { redirect } from 'next/navigation'
import SuperAdminNav from './SuperAdminNav'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await RbacService.requireRole(['super_admin'])

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <SuperAdminNav />
            {children}
        </div>
    )
}
