import { routes } from '@/config/routes';
import { DUMMY_ID } from '@/config/constants';

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
  // label start
  {
    name: 'Accueil',
  },
  // label end
  {
    name: 'Tableau de bord',
    href: routes.executive.dashboard,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  {
    name: 'Pages',
  },
  {
    name: 'MPME & Coopératives',
    href: routes.settings.rolesPermissions,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Gestion des cohortes',
    href: routes.cohorts.list,
     allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  // label start
  {
    name: 'Paramètres',
  },
  // label end
  {
    name: 'Rôles & permissions',
    href: routes.settings.rolesPermissions,
     allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Profil',
    href: routes.settings.profile,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  {
    name: 'Paramètres du profil',
    href: routes.settings.profileSettings,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  // {
  //   name: 'Préférences de notification',
  //   href: routes.settings.notificationPreference,
  // },
  // {
  //   name: 'Informations personnelles',
  //   href: routes.settings.personalInformation,
  // },
  // {
  //   name: 'Newsletter',
  //   href: routes.settings.newsletter,
  // },
  // {
  //   name: 'Multi Step',
  //   href: routes.forms.multiStep,
  // },
  // label start
  // {
  //   name: 'Pages',
  // },
  // {
  //   name: 'Access Denied',
  //   href: routes.accessDenied,
  // },
  // {
  //   name: 'Not Found',
  //   href: routes.notFound,
  // },
  // {
  //   name: 'Maintenance',
  //   href: routes.maintenance,
  // },
  // {
  //   name: 'Blank',
  //   href: routes.blank,
  // },
  // // label start
  // {
  //   name: 'Authentication',
  // },
];
