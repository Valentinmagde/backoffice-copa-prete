import { Metadata } from 'next';
import logoImg from '@public/logo.png';
import { LAYOUT_OPTIONS } from '@/config/enums';
import logoIconImg from '@public/logo-short.png';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'Copa Prête — Backoffice',
  description: `Plateforme de gestion des candidatures, évaluations et plans d'affaires Copa Prête.`,
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.LIGHT,
  layout: LAYOUT_OPTIONS.HYDROGEN,
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} — Copa Prête` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} — Copa Prête` : siteConfig.title,
      description,
      locale: 'fr_FR',
      type: 'website',
    },
  };
};
