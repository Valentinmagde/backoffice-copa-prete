import BusinessPlanNav from '@/app/shared/business-plans/business-plan-nav';

export default async function BusinessPlanDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <BusinessPlanNav id={id} />
      <div className="mt-6">{children}</div>
    </>
  );
}
