import { DUMMY_ID } from '@/config/constants';
import { routes } from '@/config/routes';
import {
  PiBriefcaseDuotone,
  PiCalendar,
  PiChatCenteredDotsDuotone,
  PiFolderLockDuotone,
  PiHouseLineDuotone,
  PiUserCircleDuotone,
} from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: 'Aperçu',
  },
  // label end
  {
    name: 'Tableau de bord',
    href: '/',
    icon: <PiHouseLineDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  // label start
  {
    name: 'Pages',
  },
  {
    name: 'MPME & Coopératives',
    href: '#',
    icon: <PiBriefcaseDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
    dropdownItems: [
      {
        name: 'Liste des inscrits',
        href: routes.mpme.inscrits.list,
        badge: '',
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
        allowedRoles: ['SUPER_ADMIN', 'ADMIN']
      }
    ],
  },
  {
    name: 'Gestion des cohortes',
    href: routes.cohorts.list,
    icon: <PiCalendar />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Paramètres',
  },
  {
    name: 'Rôles & permissions',
    href: routes.settings.rolesPermissions,
    icon: <PiFolderLockDuotone />,
    allowedRoles: ['SUPER_ADMIN'],
  },
  {
    name: 'Profil',
    href: routes.settings.profile,
    icon: <PiUserCircleDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  {
    name: 'Paramètres du compte',
    href: routes.settings.profileSettings,
    icon: <PiChatCenteredDotsDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },
  // label end
];
