import CandidatureNav from "@/app/shared/mpme/candidatures/candidature-details-nav";

export default async function CandidatureDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <CandidatureNav id={id} />
      <div className="mt-6">{children}</div>
    </>
  );
}