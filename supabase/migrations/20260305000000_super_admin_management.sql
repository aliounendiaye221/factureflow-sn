-- ============================================================
-- Migration: Super Admin Management Features
-- Adds: is_suspended column on agencies, support_tickets table
-- ============================================================

-- Ajout de la colonne de suspension sur agencies
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

-- Table tickets de support
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    admin_notes TEXT
);

-- Index pour support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_agency ON support_tickets(agency_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);

-- RLS pour support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent créer des tickets
CREATE POLICY "users_create_support_tickets" ON support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Les utilisateurs ne voient que leurs propres tickets
CREATE POLICY "users_read_own_tickets" ON support_tickets
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'super_admin'
        )
    );

-- Super admin peut tout modifier
CREATE POLICY "super_admin_manage_tickets" ON support_tickets
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'super_admin'
        )
    );
