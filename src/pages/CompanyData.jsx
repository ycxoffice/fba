import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AuditCompanyData from "./CompanyData/AuditCompanyData"; // We'll create this
import SmallcapCompanyData from "./CompanyData/SmallcapCompanyData"; // We'll create this

const CompanyData = () => {
  const { companyName } = useParams();
  const decodedCompanyName = decodeURIComponent(companyName);
  const [source, setSource] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [smallcapData, setSmallcapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL =
    import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Step 1: Try fetching audit data
        const auditResponse = await fetch(
          `${BASE_URL}/api/audit/${decodedCompanyName}`
        );
        if (auditResponse.ok) {
          const auditJson = await auditResponse.json();
          if (auditJson && Object.keys(auditJson).length > 0) {
            setAuditData(auditJson);
            setSource("audit");
            setLoading(false);
            return;
          }
        }

        // Step 2: If audit fails, fetch Smallcap data
        const sheetId = "10n9xmV01j3_6pDU7QiR5DIbanIfAyYcd8rVavXT17oE";
        const tabId = "336036379";
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${tabId}`;
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(47).slice(0, -2));
        const headers = jsonData.table.cols.map((col) => col.label);
        const rows = jsonData.table.rows.map((row) => {
          const companyData = {};
          row.c.forEach((cell, i) => {
            if (headers[i]) companyData[headers[i]] = cell ? cell.v : "";
          });
          return companyData;
        });
        const foundCompany = rows.find(
          (comp) => comp["Company Name"] === decodedCompanyName
        );

        if (foundCompany) {
          setSmallcapData(foundCompany);
          setSource("smallcap");
        } else {
          setError("Company not found");
        }
      } catch (err) {
        setError("Failed to fetch company data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [decodedCompanyName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-2 left-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 p-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-xl shadow-lg flex items-center gap-4 max-w-md">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (source === "audit") {
    return <AuditCompanyData auditData={auditData} />;
  } else if (source === "smallcap") {
    return <SmallcapCompanyData smallcapData={smallcapData} />;
  } else {
    return <div>Company data not available</div>;
  }
};

export default CompanyData;
