import type { ReactElement } from "react";
import Header from "../component/layoutComponents/Header";
import Footer from "../component/layoutComponents/Footer";

interface DashboardLayoutProps {
  children: ReactElement;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
       {children}
      <Footer />
    </>
  );
};

export default DashboardLayout;
