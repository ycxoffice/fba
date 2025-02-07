// App.jsx (updated)
import { Routes, Route } from "react-router-dom";
import FBALandingPage from "../pages/LandingPage";
import ReportPage from "../pages/ReportPage";
import CompanyData from "../pages/CompanyData";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FBALandingPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/fba/:companyName" element={<CompanyData />} />
    </Routes>
  );
};
export default AppRoutes;
