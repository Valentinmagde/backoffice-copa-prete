import PageHeader from '@/app/shared/page-header';
import ModalButton from '@/app/shared/modal-button';
import RolesGrid from '@/app/shared/roles-permissions/roles-grid';
import UsersTable from '@/app/shared/roles-permissions/users-table';
import CreateRole from '@/app/shared/roles-permissions/create-role';

const pageHeader = {
  title: 'Rôles et permissions',
  breadcrumb: [
    {
      href: '/',
      name: 'Tableau de bord',
    },
    {
      name: 'Gestion des accès utilisateurs',
    },
  ],
};

export default function BlankPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {/* <ModalButton label="Add New Role" view={<CreateRole />} /> */}
      </PageHeader>
      {/* <RolesGrid /> */}
      <UsersTable />
    </>
  );
}
