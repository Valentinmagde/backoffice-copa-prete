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
  },
  {
    name: 'Pages',
  },
  // label start
  {
    name: 'Paramètres',
  },
  // label end
  {
    name: 'Rôles & permissions',
    href: routes.settings.rolesPermissions,
  },
  {
    name: 'Profil',
    href: routes.settings.profile,
  },
  {
    name: 'Paramètres du profil',
    href: routes.settings.profileSettings,
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
