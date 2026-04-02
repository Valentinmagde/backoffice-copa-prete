import CandidatureNav from "@/app/shared/mpme/candidatures/candidature-details-nav";

export default function CandidatureDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <>
      <CandidatureNav id={params.id} />
      <div className="mt-6">{children}</div>
    </>
  );
}