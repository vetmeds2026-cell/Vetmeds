import LayoutClient from './LayoutClient';

export const metadata = {
  title: 'User Dashboard',
};

export default function DashboardLayout({ children }) {
  return <LayoutClient>{children}</LayoutClient>;
}
