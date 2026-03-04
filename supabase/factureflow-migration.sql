-- Migration for FactureFlow SN

-- 1. Create the `licenses` table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    plan_id VARCHAR(50) NOT NULL, -- e.g., 'free', 'pro', 'agency'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'revoked', 'expired'
    device_fingerprint TEXT, -- to bind to a specific device
    activation_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for licenses
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Super admin policies for licenses
CREATE POLICY "Super admins can manage licenses"
    ON public.licenses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- 2. Update `agencies` table (targeting PMEs/TPEs)
-- Add columns for the license trial and active license ID
ALTER TABLE public.agencies
ADD COLUMN IF NOT EXISTS license_trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS license_trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL;

-- 3. Create `products` table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 18, -- TVA per default (e.g., 18% in Senegal)
    type VARCHAR(50) DEFAULT 'product', -- 'product' or 'service'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products policies (View and Edit their own agency's products)
CREATE POLICY "Users can view their agency products"
    ON public.products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.agency_id = products.agency_id
        )
    );

CREATE POLICY "Admins can manage their agency products"
    ON public.products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.agency_id = products.agency_id 
            AND ur.role IN ('admin', 'owner', 'super_admin')
        )
    );
