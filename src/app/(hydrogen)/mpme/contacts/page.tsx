'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ContactsTable from '@/app/shared/mpme/contacts/contacts-table';

const pageHeader = {
  title: 'Messages de contact',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Contacts' },
  ],
};

export default function ContactsPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ContactsTable />
    </div>
  );
}
