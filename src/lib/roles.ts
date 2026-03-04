// ============================================================
// Définition centralisée des rôles — FactureFlow SN
// ============================================================
// 4 rôles dans l'ordre croissant de privilèges :
//   viewer < user < admin < super_admin
// ============================================================

export type AppRole = 'super_admin' | 'admin' | 'user' | 'viewer'

/** Hiérarchie numérique : plus le chiffre est grand, plus le rôle est puissant */
export const ROLE_HIERARCHY: Record<AppRole, number> = {
  viewer:      0,
  user:        1,
  admin:       2,
  super_admin: 3,
}

export type RoleDefinition = {
  /** Nom affiché en français dans l'UI */
  label:       string
  /** Libellé court pour les badges (≤ 10 caractères) */
  badge:       string
  /** Description courte du rôle */
  description: string
  /** Classes Tailwind pour le badge (couleur de fond + texte) */
  color:       string
  /** Liste des permissions en langage naturel */
  permissions: string[]
}

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  // ----------------------------------------------------------
  // VISITEUR — lecture seule, aucune modification possible
  // ----------------------------------------------------------
  viewer: {
    label:       'Visiteur',
    badge:       'Visiteur',
    description: 'Accès en lecture seule. Peut consulter toutes les données de l\'agence mais ne peut rien créer, modifier ni supprimer.',
    color:       'bg-gray-100 text-gray-600',
    permissions: [
      'Voir le tableau de bord',
      'Consulter la liste des clients',
      'Consulter les devis (lecture)',
      'Consulter les factures (lecture)',
    ],
  },

  // ----------------------------------------------------------
  // UTILISATEUR — membre actif de l'agence (ex. : collaborateur)
  // ----------------------------------------------------------
  user: {
    label:       'Utilisateur',
    badge:       'Utilisateur',
    description: 'Membre actif de l\'agence. Peut créer et modifier des documents, mais ne peut pas supprimer ni accéder aux paramètres.',
    color:       'bg-blue-100 text-blue-700',
    permissions: [
      'Toutes les permissions du Visiteur',
      'Créer et modifier des clients',
      'Créer et modifier des devis',
      'Accepter / refuser un devis',
      'Créer et modifier des factures',
      'Marquer une facture comme payée',
    ],
  },

  // ----------------------------------------------------------
  // ADMINISTRATEUR — propriétaire / responsable de l'agence
  // ----------------------------------------------------------
  admin: {
    label:       'Administrateur',
    badge:       'Admin',
    description: 'Propriétaire de l\'agence. Accès complet à toutes les fonctionnalités de son agence, y compris la suppression et les paramètres.',
    color:       'bg-purple-100 text-purple-700',
    permissions: [
      'Toutes les permissions de l\'Utilisateur',
      'Supprimer des clients',
      'Supprimer des devis',
      'Supprimer des factures',
      'Gérer les paramètres de l\'agence (nom, email, adresse)',
      'Gérer l\'abonnement (plan & facturation)',
      'Inviter des collaborateurs dans l\'agence',
    ],
  },

  // ----------------------------------------------------------
  // SUPER ADMINISTRATEUR — exploitant de la plateforme FactureFlow
  // ----------------------------------------------------------
  super_admin: {
    label:       'Super Administrateur',
    badge:       'Super Admin',
    description: 'Administrateur de la plateforme FactureFlow SN. Accès global à toutes les agences, aux KPIs de la plateforme et aux logs système.',
    color:       'bg-red-100 text-red-700',
    permissions: [
      'Toutes les permissions de l\'Administrateur (sur toutes les agences)',
      'Accéder au panneau Super Administration',
      'Voir les KPIs globaux (CA total, nombre d\'agences, inscriptions)',
      'Consulter les statistiques de chaque agence',
      'Consulter les logs d\'événements de la plateforme',
      'Gérer les abonnements de toutes les agences',
    ],
  },
}

// ============================================================
// Helpers
// ============================================================

/** Retourne le libellé français d'un rôle (ex. "Administrateur") */
export function getRoleLabel(role: string): string {
  return ROLE_DEFINITIONS[role as AppRole]?.label ?? role
}

/** Retourne le libellé court pour les badges (ex. "Admin") */
export function getRoleBadge(role: string): string {
  return ROLE_DEFINITIONS[role as AppRole]?.badge ?? role
}

/** Retourne les classes Tailwind du badge de couleur (ex. "bg-purple-100 text-purple-700") */
export function getRoleColor(role: string): string {
  return ROLE_DEFINITIONS[role as AppRole]?.color ?? 'bg-gray-100 text-gray-600'
}

/** Retourne la définition complète d'un rôle, ou undefined si inconnu */
export function getRoleDefinition(role: string): RoleDefinition | undefined {
  return ROLE_DEFINITIONS[role as AppRole]
}

/**
 * Retourne true si l'utilisateur a au moins le niveau de privilège `minRole`.
 * Ex. : hasMinRole('admin', 'user') === true
 */
export function hasMinRole(userRole: string, minRole: AppRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as AppRole] ?? -1
  const minLevel  = ROLE_HIERARCHY[minRole]
  return userLevel >= minLevel
}
