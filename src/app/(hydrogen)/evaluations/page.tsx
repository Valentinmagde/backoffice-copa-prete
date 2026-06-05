import { Metadata } from 'next';
import AllEvaluationsPage from '@/app/shared/evaluation/all-evaluations-page';

export const metadata: Metadata = { title: 'Toutes les évaluations' };

export default function Page() {
  return <AllEvaluationsPage />;
}
