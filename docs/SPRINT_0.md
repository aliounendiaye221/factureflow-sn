# SPRINT 0 - Préparation technique (FactureFlow SN)

## Objectifs du Sprint 0
- Mise en place du schéma de base de données ultra-robuste avec RLS stricte sur `agency_id`.
- Scaffolding de l'architecture backend & spécifications d'API.
- Implémentation du système d'idempotence et de l'indexation pour le scaling.
- Mise en place du plan de monitoring (`event_logs`).

## 1. Plan du Sprint
- [x] Initialisation Next.js App Router (déjà fait).
- [x] Setup Supabase (déjà fait).
- [x] Schéma SQL + Index + Triggers `updated_at`.
- [x] Politique Row Level Security (RLS) multi-tenant stricte (`agency_id`).
- [x] Définition API Spec (voir ci-dessous).
- [x] Définition de l'Instrumentation (voir ci-dessous).

## 2. API Spec Initiale

### Authentification & Agences
- **POST** `/auth/v1/signup` (Supabase natif, trigger db -> création de l'agence)
- **POST** `/auth/v1/login`

### Clients
- **GET** `/api/clients` -> `Client[]`
- **POST** `/api/clients` (Payload: `name, email, phone, address, tax_id`) -> `Client`

### Devis (Quotes)
- **POST** `/api/quotes` (Payload: `client_id, items, tax_amount` -> génère `quote_number` auto)
- **POST** `/api/quotes/:id/accept` -> (Change status à `accepted`, génère une `Facture` automatiquement ou le prépare)

### Factures (Invoices)
- **GET** `/api/invoices` -> `Invoice[]`
- **POST** `/api/invoices` (Payload: `client_id, quote_id, items`)
- **GET** `/api/invoices/:id/payment-link` -> Appelle le `paymentService` pour générer le lien de Mobile Money.

### Paiements & Webhook
- **POST** `/api/webhooks/payment` 
    - **Header**: x-signature (HMAC SHA256)
    - **Payload**: `external_reference, status, amount, metadata`
    - **Action**: Cherche `external_reference` dans `payments`, update `status`, update `invoice`. Utilise transaction + store `event_logs`. Idempotent !

## 3. Plan d'instrumentation & Event Logging
L'application possède une table `event_logs` qui remplit un rôle d'Audit Log.
*Événements tracés :*
1. `quote_created`, `quote_accepted`, `quote_rejected`
2. `invoice_created`, `invoice_sent`
3. `payment_initiated`
4. `webhook_received`, `webhook_signature_failed`, `webhook_idempotency_hit`
5. `payment_success`, `payment_failed`

*Payload ex:* `{"provider": "wave", "raw_body": "...", "reason": "invalid_signature"}`

## 4. Scénarios de tests de paiement (MVP / Q&A)
Pour garantir la robustesse absolue des paiements :
1. **Paiement Simple** : Pending -> Webhook reçu -> Success -> Facture mise à 'paid' -> Event log = success.
2. **Duplication Webhook** : Webhook reçu (Success) -> Modifié -> Webhook re-reçu avec même ref / idempotency -> Rejeté/Ignoré en tant que duplicate (Idempotency Hit). Log = ignored.
3. **Échec de paiement** : Pending -> Webhook reçu (Failed) -> Facture toujours pending, Payment passe à Failed. Log = failed.

## 5. Exigences d'acceptation de validation du Sprint 0
- Le schéma SQL s'exécute sans erreur sur Supabase.
- RLS empêche l'agence A depuis Supabase Client ou fetch API d'accéder aux données de l'agence B.
- L'architecture `Service Layer` (prochain sprint) est prête à manipuler ces tables.

---
**Risques identifiés** : Sécurité et double validation de paiement si un webhook timeout et ressaie. 
**Mitigation** : La DB a un `UNIQUE CONSTRAINT` sur la clé d'idempotence et les requêtes backend utiliseront des transactions atomiques.