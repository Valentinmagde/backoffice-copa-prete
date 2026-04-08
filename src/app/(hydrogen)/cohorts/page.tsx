import PageHeader from '@/app/shared/page-header';
import CohortsTable from '@/app/shared/cohorts/cohorts-table';

const pageHeader = {
  title: 'Gestion des cohortes',
  breadcrumb: [
    {
      href: '/',
      name: 'Tableau de bord',
    },
    {
      name: 'Gestion des cohortes',
    },
  ],
};

export default function CohortsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <ModalButton label="Add New Role" view={<CreateRole />} /> */}
      </PageHeader>
      <CohortsTable />
    </>
  );
}
