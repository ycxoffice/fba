import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  ArrowRight,
  Globe,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  Flag,
  Linkedin,
  Filter,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";
const COMPANY_LIST_API = "https://api.companylist.fba.ai";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "audit", "directory"
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const limit = 40;

  useEffect(() => {
    fetchCompanies();
  }, [search, page, activeTab]);

  const fetchCompanies = async () => {
    setLoading(true);

    try {
      let auditCompanies = [];
      let directoryCompanies = [];
      let combinedCompanies = [];

      // Fetch data based on active tab
      if (activeTab === "audit" || activeTab === "all") {
        const auditRes = await fetch(
          `${BASE_URL}/api/audit?search=${search}&page=${page}&limit=${limit}`
        );
        const auditData = await auditRes.json();
        auditCompanies = [...auditData.companies].reverse().map((company) => ({
          ...company,
          source: "audit",
          id: `audit-${company.company_name}`,
          name: company.company_name,
        }));
      }

      if (activeTab === "directory" || activeTab === "all") {
        // If searching, use the search endpoint
        let directoryRes;
        if (search.trim()) {
          directoryRes = await fetch(
            `${COMPANY_LIST_API}/search?query=${search}`
          );
        } else {
          directoryRes = await fetch(`${COMPANY_LIST_API}/companies?limit=100`);
        }

        const directoryData = await directoryRes.json();
        directoryCompanies = directoryData.companies.map((company) => ({
          ...company,
          source: "directory",
          company_name: company.name,
        }));
      }

      // Combine based on active tab
      if (activeTab === "all") {
        // Merge and deduplicate companies by name
        const nameMap = new Map();

        [...auditCompanies, ...directoryCompanies].forEach((company) => {
          const name = company.name || company.company_name;

          if (!nameMap.has(name)) {
            nameMap.set(name, company);
          } else {
            // If company exists in both sources, merge the data
            const existingCompany = nameMap.get(name);
            nameMap.set(name, { ...existingCompany, ...company });
          }
        });

        combinedCompanies = Array.from(nameMap.values());
      } else if (activeTab === "audit") {
        combinedCompanies = auditCompanies;
      } else {
        combinedCompanies = directoryCompanies;
      }

      setCompanies(combinedCompanies);
      setTotal(combinedCompanies.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const getGradientColor = (index) => {
    const gradients = [
      "from-blue-500 to-purple-500",
      "from-emerald-500 to-teal-500",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-orange-500",
      "from-indigo-500 to-violet-500",
    ];
    return gradients[index % gradients.length];
  };

  const getFormattedUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  const renderCompanyCard = (company, index) => {
    const name = company.name || company.company_name;

    if (viewMode === "grid") {
      return (
        <div
          key={company.id || index}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
        >
          <div className="flex items-start">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientColor(
                index
              )} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
            >
              <span className="text-white font-bold text-lg">
                {name.charAt(0)}
              </span>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                {name}
              </h3>

              {company.domain && (
                <div className="flex items-center text-gray-600 mb-1">
                  <Globe size={16} className="mr-2 text-gray-400" />
                  <a
                    href={getFormattedUrl(company.domain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate max-w-xs"
                  >
                    {company.domain}
                  </a>
                </div>
              )}

              {company.year_founded && (
                <div className="flex items-center text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span>Founded: {company.year_founded}</span>
                </div>
              )}

              {company.industry && (
                <div className="flex items-center text-gray-600 mb-1">
                  <Briefcase size={16} className="mr-2 text-gray-400" />
                  <span>{company.industry}</span>
                </div>
              )}

              {company.size_range && (
                <div className="flex items-center text-gray-600 mb-1">
                  <Users size={16} className="mr-2 text-gray-400" />
                  <span>{company.size_range}</span>
                </div>
              )}

              {(company.locality || company.country) && (
                <div className="flex items-center text-gray-600 mb-1">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>
                    {[company.locality, company.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

              {company.linkedin_url && (
                <div className="flex items-center text-gray-600">
                  <Linkedin size={16} className="mr-2 text-gray-400" />
                  <a
                    href={getFormattedUrl(company.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate max-w-xs"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>

            {company.source === "audit" && (
              <Link
                to={`/${encodeURIComponent(name)}`}
                className="absolute right-4 top-4 text-gray-400 hover:text-blue-500 transform hover:translate-x-1 transition-all"
              >
                <ArrowRight />
              </Link>
            )}
          </div>

          <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 size={120} />
          </div>

          {company.source && (
            <div className="absolute bottom-2 right-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  company.source === "audit"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {company.source === "audit" ? "Audit" : "Directory"}
              </span>
            </div>
          )}
        </div>
      );
    } else {
      // List view
      return (
        <div
          key={company.id || index}
          className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
        >
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradientColor(
                index
              )} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
            >
              <span className="text-white font-bold text-sm">
                {name.charAt(0)}
              </span>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors md:col-span-3">
                {name}
              </h3>

              {company.domain && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Globe size={14} className="mr-1 text-gray-400" />
                  <a
                    href={getFormattedUrl(company.domain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate"
                  >
                    {company.domain}
                  </a>
                </div>
              )}

              {company.industry && (
                <div className="flex items-center text-gray-600 text-sm">
                  <Briefcase size={14} className="mr-1 text-gray-400" />
                  <span className="truncate">{company.industry}</span>
                </div>
              )}

              {(company.locality || company.country) && (
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  <span className="truncate">
                    {[company.locality, company.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>

            {company.source === "audit" && (
              <Link
                to={`/${encodeURIComponent(name)}`}
                className="ml-2 text-gray-400 hover:text-blue-500 transform hover:translate-x-1 transition-all"
              >
                <ArrowRight />
              </Link>
            )}

            {company.source && (
              <span
                className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  company.source === "audit"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {company.source === "audit" ? "Audit" : "Directory"}
              </span>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Company Explorer
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Discover and explore our extensive network of companies from
            multiple sources
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md mb-8">
          <form
            onSubmit={handleSearch}
            className="relative mb-4 transform hover:scale-102 transition-all duration-300"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name, industry, location..."
              className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg"
            />
            <Search className="absolute left-5 top-5 text-gray-400" size={24} />
            <button
              type="submit"
              className="absolute right-3 top-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
            <div className="flex mb-4 sm:mb-0 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Sources
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "audit"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Audit Data
              </button>
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "directory"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Directory
              </button>
            </div>

            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-3 h-3 bg-current rounded-sm"></div>
                  <div className="w-3 h-3 bg-current rounded-sm"></div>
                  <div className="w-3 h-3 bg-current rounded-sm"></div>
                  <div className="w-3 h-3 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="flex flex-col space-y-1">
                  <div className="w-8 h-2 bg-current rounded-sm"></div>
                  <div className="w-8 h-2 bg-current rounded-sm"></div>
                  <div className="w-8 h-2 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-2 left-2"></div>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col space-y-3"
            }
          >
            {companies.length > 0 ? (
              companies.map((company, index) =>
                renderCompanyCard(company, index)
              )
            ) : (
              <div className="col-span-full text-center py-20">
                <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">
                  No companies found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "audit" && total > limit && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm">
              {Array.from(
                { length: Math.ceil(total / limit) },
                (_, i) => i + 1
              ).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    page === num
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md scale-105"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyList;
