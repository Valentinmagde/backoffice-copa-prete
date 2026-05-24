import { routes } from '@/config/routes';
import { UserRole } from '@/lib/api/types/roles.types';

export interface PageLink {
  name: string;
  href?: string;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
}

// Note: do not add href in the label object, it is rendering as label
export const pageLinks: PageLink[] = [
  // ── Aperçu ──────────────────────────────────────────────────────
  {
    name: 'Aperçu',
  },
  {
    name: 'Tableau de bord',
    href: routes.executive.dashboard,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },

  // ── Gestion ─────────────────────────────────────────────────────
  {
    name: 'Gestion',
  },
  {
    name: 'Inscrits MPME & Coopératives',
    href: routes.mpme.inscrits.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  {
    name: 'Dossiers de candidature',
    href: routes.mpme.candidatures.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  {
    name: 'Notifications',
    href: routes.mpme.notifications.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Formations',
    href: routes.formations.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'TRAINER'],
  },
  {
    name: 'Subventions',
    href: routes.subventions.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
  },
  {
    name: "Plans d'affaires",
    href: routes.businessPlans.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR'],
  },
  {
    name: 'Cohortes',
    href: routes.cohorts.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },

  // ── Communication ────────────────────────────────────────────────
  {
    name: 'Communication',
  },
  {
    name: 'Plaintes',
    href: routes.complaints.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
  },
  {
    name: 'Messages de contact',
    href: routes.mpme.contacts.list,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
  },

  // ── Paramètres ──────────────────────────────────────────────────
  {
    name: 'Paramètres',
  },
  {
    name: 'Rôles & permissions',
    href: routes.settings.rolesPermissions,
    allowedRoles: ['SUPER_ADMIN'],
  },
  {
    name: 'Profil',
    href: routes.settings.profile,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  {
    name: 'Paramètres du compte',
    href: routes.settings.profileSettings,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
];
