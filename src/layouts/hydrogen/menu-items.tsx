import React from 'react';
import { routes } from '@/config/routes';
import {
  PiBriefcaseDuotone,
  PiCalendar,
  PiChatCenteredDotsDuotone,
  PiEnvelopeSimpleDuotone,
  PiFolderLockDuotone,
  PiHouseLineDuotone,
  PiUserCircleDuotone,
  PiWarningDuotone,
} from 'react-icons/pi';

export type MenuItem = {
  name: string;
  href?: string;
  icon?: React.ReactElement;
  badge?: string;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  dropdownItems?: MenuItem[];
};

// Note: do not add href in the label object, it is rendering as label
export const menuItems: MenuItem[] = [
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
        allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      },
    ],
  },
  {
    name: 'Plaintes',
    href: routes.complaints.list,
    icon: <PiWarningDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
  },
  {
    name: 'Messages de contact',
    href: routes.mpme.contacts.list,
    icon: <PiEnvelopeSimpleDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
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
