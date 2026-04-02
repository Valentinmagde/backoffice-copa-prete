import { metaObject } from '@/config/site.config';
import ExecutiveDashboard from '../shared/executive';

export const metadata = {
  ...metaObject(),
};

export default function FileDashboardPage() {
  // return <>Hello</>;
  return <ExecutiveDashboard />;
}
