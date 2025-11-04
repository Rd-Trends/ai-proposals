import { DashboardLayout } from "@/components/dashboard/layout";
import { InstallPWAPrompt } from "@/components/install-pwa";

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <DashboardLayout >
      {children}
      <InstallPWAPrompt />
    </DashboardLayout>
  );
};

export default Layout;
