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
} from "./CompanyData/knowyouraicompanydata";
import WafflerCompanyData, {
  fetchWafflerCompanyData,
} from "./CompanyData/wafflerdata";
import GaitCompanyData, {
  fetchGaitCompanyData,
} from "./CompanyData/GaitCompanyData";
import ColiveCompanyData, {
  fetchColiveCompanyData,
} from "./CompanyData/ColiveCompanyData";

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
        // Audit data
        const auditData = await fetchAuditData(decodedCompanyName, BASE_URL);
        if (auditData) {
          setData(auditData);
          setSource("audit");
          setLoading(false);
          return;
        }

        //Smallcap data
        const smallcapData = await fetchSmallcapData(decodedCompanyName);
        if (smallcapData) {
          setData(smallcapData);
          setSource("smallcap");
          setLoading(false);
          return;
        }

        const knowyourAIData = await fetchKnowYourAIData(decodedCompanyName);
        if (knowyourAIData) {
          setData(knowyourAIData);
          setSource("knowyourai");
          setLoading(false);
          return;
        }

        const WafflerCompanyData = await fetchWafflerCompanyData(
          decodedCompanyName
        );
        if (WafflerCompanyData) {
          setData(WafflerCompanyData);
          setSource("waffler");
          setLoading(false);
          return;
        }

        const GaitCompanyData = await fetchGaitCompanyData(decodedCompanyName);
        if (GaitCompanyData) {
          setData(GaitCompanyData);
          setSource("gait");
          setLoading(false);
          return;
        }

        const ColiveCompanyData = await fetchColiveCompanyData(
          decodedCompanyName
        );
        if (ColiveCompanyData) {
          setData(ColiveCompanyData);
          setSource("colive");
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
      {source === "waffler" && <WafflerCompanyData WafflerCompanyData={data} />}
      {source === "gait" && <GaitCompanyData GaitCompanyData={data} />}
      {source === "colive" && <ColiveCompanyData GaitCompanyData={data} />}
    </>
  );
};

export default CompanyData;
