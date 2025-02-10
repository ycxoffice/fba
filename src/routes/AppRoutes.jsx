// App.jsx (updated)
import { Routes, Route } from "react-router-dom";
import FBALandingPage from "../pages/LandingPage";
import CompanyData from "../pages/CompanyData";
import CompanyList from "../pages/CompanyList";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FBALandingPage />} />
      <Route path="/:companyName" element={<CompanyData />} />
      <Route path="/companies" element={<CompanyList />} />
    </Routes>
  );
};
export default AppRoutes;
