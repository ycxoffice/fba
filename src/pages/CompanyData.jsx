import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AuditCompanyData, {
  fetchAuditData,
} from "./CompanyData/AuditCompanyData";
import SmallcapCompanyData, {
  fetchSmallcapData,
} from "./CompanyData/SmallcapCompanyData";
import KnowYourAICompanyData, {
  fetchKnowYourAIData,
} from "./CompanyData/KnowYourAICompanyData";

const CompanyData = () => {
  const { companyName } = useParams();
  const decodedCompanyName = decodeURIComponent(companyName);
  const [source, setSource] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL =
    import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try Audit data first
        const auditData = await fetchAuditData(decodedCompanyName, BASE_URL);
        if (auditData) {
          setData(auditData);
          setSource("audit");
          setLoading(false);
          return;
        }

        // Try Smallcap data second
        const smallcapData = await fetchSmallcapData(decodedCompanyName);
        if (smallcapData) {
          setData(smallcapData);
          setSource("smallcap");
          setLoading(false);
          return;
        }

        // Try KnowYourAI data last
        const knowyourAIData = await fetchKnowYourAIData(decodedCompanyName);
        if (knowyourAIData) {
          setData(knowyourAIData);
          setSource("knowyourai");
          setLoading(false);
          return;
        }

        setError("Company not found");
      } catch (err) {
        setError("Failed to fetch company data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [decodedCompanyName, BASE_URL]);

  // ... (keep the existing loading and error JSX)

  return (
    <>
      {source === "audit" && <AuditCompanyData auditData={data} />}
      {source === "smallcap" && <SmallcapCompanyData smallcapData={data} />}
      {source === "knowyourai" && (
        <KnowYourAICompanyData knowyourAIData={data} />
      )}
    </>
  );
};

export default CompanyData;
