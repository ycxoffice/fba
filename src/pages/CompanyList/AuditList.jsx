import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Briefcase, MapPin, Globe } from "lucide-react";
import { getFormattedUrl } from "../utils";

const BASE_URL =
  import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";

const AuditCompanies = ({ search }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const auditUrl = search.trim()
          ? `${BASE_URL}/api/audit?search=${search}&limit=10`
          : `${BASE_URL}/api/audit?limit=10`;
        const auditRes = await fetch(auditUrl);
        const auditData = await auditRes.json();
        const formattedCompanies = [...auditData.companies]
          .reverse()
          .map((company) => ({
            name: company.company_name,
            industry: company.industry,
            location: company.location,
            website: company.domain,
            source: "audit",
            id: `audit-${company.company_name}`,
          }));
        setCompanies(formattedCompanies);
      } catch (error) {
        console.error("Error fetching Audit data:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [search]);

  const renderCompanyCard = (company, index) => {
    const colorSet = {
      bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
      text: "text-blue-700",
      light: "bg-blue-100",
      highlight: "from-blue-300 to-indigo-300",
    };

    return (
      <Link
        to={`/${encodeURIComponent(company.name)}`}
        key={company.id || index}
        className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-2xl transform hover:-translate-y-1 flex flex-col h-full"
      >
        <div className={`h-20 ${colorSet.bg} overflow-hidden relative`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-4 -top-12 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute right-20 -bottom-12 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute left-10 -bottom-16 w-40 h-40 bg-white/10 rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        <div className="flex justify-center -mt-10 mb-3">
          <div
            className={`w-20 h-20 rounded-xl ${colorSet.bg} flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 flex-shrink-0 border-4 border-white`}
          >
            <span className="text-white font-bold text-2xl">
              {company.name.charAt(0)}
            </span>
          </div>
        </div>
        <div className="px-6 pt-2 pb-6 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-4 group-hover:text-blue-600 transition-colors">
            {company.name}
          </h3>
          <div className="space-y-2.5">
            {company.industry && (
              <div className="flex items-center text-gray-700">
                <Briefcase size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">{company.industry}</span>
              </div>
            )}
            {company.location && (
              <div className="flex items-center text-gray-700">
                <MapPin size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">{company.location}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center text-gray-700">
                <Globe size={16} className="mr-3 text-gray-500" />
                <a
                  href={getFormattedUrl(company.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline truncate max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {company.website.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${colorSet.light} ${colorSet.text} shadow-sm`}
          >
            Audit
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl ${colorSet.highlight} opacity-0 group-hover:opacity-10 rounded-full -mb-20 -mr-20 transition-opacity duration-300 pointer-events-none"></div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-3 left-3"></div>
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin absolute top-6 left-6"></div>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Building2 size={48} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          No audit companies found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search criteria to find audit companies
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company, index) => renderCompanyCard(company, index))}
    </div>
  );
};

export default AuditCompanies;
