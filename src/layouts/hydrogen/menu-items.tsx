import React from 'react';
import { routes } from '@/config/routes';
import {
  PiBriefcaseDuotone,
  PiCalendar,
  PiChatCenteredDotsDuotone,
  PiClipboardTextDuotone,
  PiEnvelopeSimpleDuotone,
  PiFilePdf,
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
  // ── Aperçu ──────────────────────────────────────────────────────
  {
    name: 'Aperçu',
  },
  {
    name: 'Tableau de bord',
    href: routes.executive.dashboard,
    icon: <PiHouseLineDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR', 'TRAINER', 'MENTOR', 'PARTNER'],
  },

  // ── Gestion ─────────────────────────────────────────────────────
  {
    name: 'Gestion',
  },
  {
    name: 'MPME & Coopératives',
    href: '#',
    icon: <PiBriefcaseDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'TRAINER', 'MENTOR', 'PARTNER'],
    dropdownItems: [
      {
        name: 'Liste des inscrits',
        href: routes.mpme.inscrits.list,
        allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'TRAINER', 'MENTOR', 'PARTNER'],
      },
      {
        name: 'Dossiers de candidature',
        href: routes.mpme.candidatures.list,
        allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'TRAINER', 'MENTOR', 'PARTNER'],
      },
      {
        name: 'Notifications candidats',
        href: routes.mpme.notifications.list,
        allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      },
    ],
  },
  {
    name: "Plans d'affaires",
    href: '#',
    icon: <PiClipboardTextDuotone />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'EVALUATOR'],
    dropdownItems: [
      {
        name: 'Liste des plans',
        href: routes.businessPlans.list,
        allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
      },
      {
        name: 'Évaluation',
        href: routes.evaluation.search,
        allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'EVALUATOR'],
      },
      {
        name: 'Toutes les notes',
        href: routes.evaluation.all,
        allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
      },
    ],
  },
  {
    name: 'Cohortes',
    href: routes.cohorts.list,
    icon: <PiCalendar />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Documents téléchargeables',
    href: routes.publicDocuments.list,
    icon: <PiFilePdf />,
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
  },
  // {
  //   name: 'Formations',
  //   href: routes.formations.list,
  //   icon: <PiGraduationCapDuotone />,
  //   allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER', 'TRAINER'],
  // },
  // {
  //   name: 'Subventions',
  //   href: routes.subventions.list,
  //   icon: <PiHandCoinsDuotone />,
  //   allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'COPA_MANAGER'],
  // },

  // ── Notifications ───────────────────────────────────────────────
  {
    name: 'Notifications',
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

  // ── Paramètres ──────────────────────────────────────────────────
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
];
