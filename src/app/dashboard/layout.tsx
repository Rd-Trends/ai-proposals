import { DashboardLayout } from "@/components/dashboard/layout";

const Layout = ({ children }: React.PropsWithChildren) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default Layout;
