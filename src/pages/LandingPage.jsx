import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  Globe,
  Calendar,
  Briefcase,
  Users,
  MapPin,
  Linkedin,
  ChevronDown,
  Star,
  Sparkles,
  Layers,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";
const COMPANY_LIST_API = "https://api.companylist.fba.ai";

const CompanyList = () => {
  const [auditCompanies, setAuditCompanies] = useState([]);
  const [smallcapCompanies, setSmallcapCompanies] = useState([]);
  const [directoryCompanies, setDirectoryCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedValuation, setSelectedValuation] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Navigation Component
  const NavBar = () => (
    <nav className="fixed w-full top-0 left-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with 3D effect */}
          <Link
            to="/"
            className="flex items-center space-x-2 transform hover:scale-105 transition-transform"
          >
            <img src="/fba.png" alt="Logo" className="w-25 h-25" />
          </Link>

          {/* Report Request Button */}
          <Link
            to="/companies"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:scale-105 transform transition-all shadow-lg hover:shadow-xl"
          >
            <Star className="w-4 h-4 mr-2" />
            Request Report
          </Link>
        </div>
      </div>
    </nav>
  );

  // Fetch Smallcap data from Google Sheets
  useEffect(() => {
    const fetchSmallcap = async () => {
      try {
        const sheetId = "10n9xmV01j3_6pDU7QiR5DIbanIfAyYcd8rVavXT17oE";
        const tabId = "336036379";
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${tabId}`;
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(47).slice(0, -2));
        const headers = jsonData.table.cols.map((col) => col.label);
        const rows = jsonData.table.rows.map((row) => {
          const company = {};
          row.c.forEach((cell, i) => {
            if (headers[i]) company[headers[i]] = cell ? cell.v : "";
          });
          return {
            name: company["Company Name"],
            industry: company["Industry"],
            location: company["Headquarters"],
            website: company["Website URL"],
            exchange: company["Exchange"],
            sector: company["Sector"],
            valuation: company["Company Valuation"],
            source: "smallcap",
          };
        });
        setSmallcapCompanies(rows);
      } catch (error) {
        console.error("Error fetching Smallcap data:", error);
      }
    };
    fetchSmallcap();
  }, []);

  // Fetch audit and directory data when search changes
  useEffect(() => {
    const fetchAuditAndDirectory = async () => {
      setLoading(true);
      try {
        // Fetch audit data
        const auditUrl = search.trim()
          ? `${BASE_URL}/api/audit?search=${search}&limit=10`
          : `${BASE_URL}/api/audit?limit=10`;

        const auditRes = await fetch(auditUrl);
        const auditData = await auditRes.json();

        const reversedAudit = [...auditData.companies]
          .reverse()
          .map((company) => ({
            name: company.company_name,
            industry: company.industry,
            location: company.location,
            website: company.domain,
            source: "audit",
            id: `audit-${company.company_name}`,
          }));

        setAuditCompanies(reversedAudit);

        // Directory data (limit to 100)
        const directoryUrl = search.trim()
          ? `${COMPANY_LIST_API}/search?query=${search}&limit=100`
          : `${COMPANY_LIST_API}/companies?limit=100`;
        const directoryRes = await fetch(directoryUrl);
        const directoryData = await directoryRes.json();
        setDirectoryCompanies(
          directoryData.companies.map((company) => ({
            name: company.name,
            industry: company.industry,
            location: company.locality || company.country,
            website: company.domain,
            year_founded: company.year_founded,
            size_range: company.size_range,
            linkedin_url: company.linkedin_url,
            source: "directory",
          }))
        );
      } catch (error) {
        console.error("Error fetching audit or directory data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditAndDirectory();
  }, [search]);

  // Filter Smallcap companies with valuation filter
  const filteredSmallcapCompanies = smallcapCompanies
    .filter((company) => {
      const matchesSearch =
        search.trim() === "" ||
        company.name?.toLowerCase().includes(search.toLowerCase()) ||
        company.industry?.toLowerCase().includes(search.toLowerCase()) ||
        company.location?.toLowerCase().includes(search.toLowerCase());
      const matchesExchange =
        selectedExchange === "" || company.exchange === selectedExchange;
      const matchesSector =
        selectedSector === "" || company.sector === selectedSector;
      const matchesValuation =
        selectedValuation === "" || company.valuation === selectedValuation;
      return (
        matchesSearch && matchesExchange && matchesSector && matchesValuation
      );
    })
    .slice(0, 50);

  // Get all available exchanges, sectors and valuations
  const allExchanges = [
    ...new Set(smallcapCompanies.map((c) => c.exchange).filter(Boolean)),
  ];
  const allSectors = [
    ...new Set(smallcapCompanies.map((c) => c.sector).filter(Boolean)),
  ];
  const allValuations = [
    ...new Set(smallcapCompanies.map((c) => c.valuation).filter(Boolean)),
  ];

  // Format URL for clickable links
  const getFormattedUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  // Get companies based on tab
  const getCompaniesForDisplay = () => {
    if (activeTab === "audit") return auditCompanies;
    if (activeTab === "smallcap") return filteredSmallcapCompanies;
    if (activeTab === "directory") return directoryCompanies;
    return filteredCompanies;
  };

  const filteredCompanies =
    selectedExchange !== "" || selectedSector !== "" || selectedValuation !== ""
      ? [...filteredSmallcapCompanies, ...directoryCompanies].filter(
          (company) =>
            search.trim() === "" ||
            company.name?.toLowerCase().includes(search.toLowerCase()) ||
            company.industry?.toLowerCase().includes(search.toLowerCase()) ||
            company.location?.toLowerCase().includes(search.toLowerCase())
        )
      : [
          ...auditCompanies,
          ...filteredSmallcapCompanies,
          ...directoryCompanies,
        ].filter(
          (company) =>
            search.trim() === "" ||
            company.name?.toLowerCase().includes(search.toLowerCase()) ||
            company.industry?.toLowerCase().includes(search.toLowerCase()) ||
            company.location?.toLowerCase().includes(search.toLowerCase())
        );

  // Render company card with enhanced 3D effect
  const renderCompanyCard = (company, index) => {
    const sourceColors = {
      audit: {
        bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
        text: "text-blue-700",
        light: "bg-blue-100",
        highlight: "from-blue-300 to-indigo-300",
      },
      smallcap: {
        bg: "bg-gradient-to-br from-emerald-600 to-teal-700",
        text: "text-emerald-700",
        light: "bg-emerald-100",
        highlight: "from-emerald-300 to-teal-300",
      },
      directory: {
        bg: "bg-gradient-to-br from-violet-600 to-purple-700",
        text: "text-violet-700",
        light: "bg-violet-100",
        highlight: "from-violet-300 to-purple-300",
      },
    };

    const colorSet = sourceColors[company.source];

    return (
      <Link
        to={`/${encodeURIComponent(company.name)}`}
        key={company.id || index}
        className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-2xl transform hover:-translate-y-1 flex flex-col h-full"
      >
        {/* Card header with 3D effect */}
        <div className={`h-20 ${colorSet.bg} overflow-hidden relative`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-4 -top-12 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute right-20 -bottom-12 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute left-10 -bottom-16 w-40 h-40 bg-white/10 rounded-full"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Company Logo/Initial */}
        <div className="flex justify-center -mt-10 mb-3">
          <div
            className={`w-20 h-20 rounded-xl ${colorSet.bg} flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 flex-shrink-0 border-4 border-white`}
          >
            <span className="text-white font-bold text-2xl">
              {company.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Company Info */}
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
            {company.source === "smallcap" && (
              <>
                {company.exchange && (
                  <div className="flex items-center text-gray-700">
                    <Building2 size={16} className="mr-3 text-gray-500" />
                    <span className="text-sm">
                      Exchange: {company.exchange}
                    </span>
                  </div>
                )}
                {company.valuation && (
                  <div className="flex items-center text-gray-700">
                    <Star size={16} className="mr-3 text-gray-500" />
                    <span className="text-sm">
                      Valuation: {company.valuation}
                    </span>
                  </div>
                )}
              </>
            )}
            {company.year_founded && (
              <div className="flex items-center text-gray-700">
                <Calendar size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">Founded: {company.year_founded}</span>
              </div>
            )}
            {company.size_range && (
              <div className="flex items-center text-gray-700">
                <Users size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">{company.size_range}</span>
              </div>
            )}
            {company.linkedin_url && (
              <div className="flex items-center text-gray-700">
                <Linkedin size={16} className="mr-3 text-gray-500" />
                <a
                  href={getFormattedUrl(company.linkedin_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline truncate max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Source Tag */}
        <div className="absolute top-4 right-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${colorSet.light} ${colorSet.text} shadow-sm`}
          >
            {company.source.charAt(0).toUpperCase() + company.source.slice(1)}
          </span>
        </div>

        {/* 3D hover effect elements */}
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl ${colorSet.highlight} opacity-0 group-hover:opacity-10 rounded-full -mb-20 -mr-20 transition-opacity duration-300 pointer-events-none"></div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavBar />

      {/* Enhanced Header with 3D effects */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-0 w-[500px] h-[500px] bg-white/10 rounded-full animate-pulse-slow blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-1/4 bottom-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full animate-spin-slow blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-2xl">
              <span className="inline-block relative">
                <Sparkles
                  size={24}
                  className="absolute -top-6 -right-8 text-yellow-300 animate-pulse"
                />
                FBA Company Explorer
              </span>
            </h1>
            <p className="text-blue-100/90 text-xl max-w-3xl mx-auto font-medium">
              Discover and explore our extensive network of companies from
              multiple sources
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-20">
        {/* Search Bar with enhanced 3D effect */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 transform transition-all duration-300 hover:shadow-3xl">
          <form onSubmit={(e) => e.preventDefault()} className="mb-6">
            <div className="relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies by name, industry, location..."
                className="w-full pl-14 pr-6 py-5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg shadow-sm group-hover:border-blue-300"
              />
              <Search
                className="absolute left-5 top-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                size={24}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
            </div>
          </form>

          {/* Enhanced Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exchange Filter */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exchange
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none shadow-sm"
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                >
                  <option value="">All Exchanges</option>
                  {allExchanges.map((exchange, idx) => (
                    <option key={idx} value={exchange}>
                      {exchange}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
            </div>

            {/* Sector Filter */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none shadow-sm"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <option value="">All Sectors</option>
                  {allSectors.map((sector, idx) => (
                    <option key={idx} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
            </div>

            {/* Valuation Filter */}
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuation
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none shadow-sm"
                  value={selectedValuation}
                  onChange={(e) => setSelectedValuation(e.target.value)}
                >
                  <option value="">All Valuations</option>
                  {allValuations.map((valuation, idx) => (
                    <option key={idx} value={valuation}>
                      {valuation}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Companies
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center ${
                  activeTab === "audit"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Building2 size={14} className="mr-1" />
                Audit ({auditCompanies.length})
              </button>
              <button
                onClick={() => setActiveTab("smallcap")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center ${
                  activeTab === "smallcap"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Star size={14} className="mr-1" />
                SmallCap ({filteredSmallcapCompanies.length})
              </button>
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center ${
                  activeTab === "directory"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Globe size={14} className="mr-1" />
                Directory ({directoryCompanies.length})
              </button>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Showing {getCompaniesForDisplay().length} results
            </div>
          </div>
        </div>

        {/* Company List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-3 left-3"></div>
              <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin absolute top-6 left-6"></div>
            </div>
          </div>
        ) : (
          <>
            {getCompaniesForDisplay().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCompaniesForDisplay().map((company, index) =>
                  renderCompanyCard(company, index)
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No companies found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try adjusting your search criteria or filters to find the
                  companies you're looking for
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedExchange("");
                    setSelectedSector("");
                    setSelectedValuation("");
                  }}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <Layers className="mr-2 text-blue-400" />
                <span className="font-bold text-xl">FBA Company Explorer</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                The most comprehensive company database worldwide
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Globe size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Building2 size={20} />
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} FBA Company Explorer. All rights
            reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyList;
