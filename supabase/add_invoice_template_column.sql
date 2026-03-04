-- Ajout de la colonne invoice_template à la table agencies
-- Valeurs possibles: 'classic', 'modern', 'elite'
-- Par défaut: 'classic' (l'ordinaire)

ALTER TABLE agencies ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'classic';

-- Index pour la performance (optionnel ici vu la taille de la table)
CREATE INDEX IF NOT EXISTS idx_agencies_invoice_template ON agencies(invoice_template);
