// App.jsx (updated)
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import FBALandingPage from "../pages/LandingPage";
import ReportPage from "../pages/ReportPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FBALandingPage />} />
      <Route path="/report" element={<ReportPage />} />
    </Routes>
  );
};
export default AppRoutes;
