import PageHeader from '@/app/shared/page-header';
import PublicDocumentsTable from '@/app/shared/public-documents/public-documents-table';

const pageHeader = {
  title: 'Documents téléchargeables',
  breadcrumb: [
    {
      href: '/',
      name: 'Tableau de bord',
    },
    {
      name: 'Documents téléchargeables',
    },
  ],
};

export default function PublicDocumentsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <PublicDocumentsTable />
    </>
  );
}
