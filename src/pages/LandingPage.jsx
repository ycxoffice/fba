import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  Globe,
  Star,
  Sparkles,
  Layers,
  ChevronDown,
  Linkedin,
} from "lucide-react";
import SmallcapCompanies from "./CompanyList/smallcapList";
import DirectoryCompanies from "./CompanyList/DirectoryList";
import AuditCompanies from "./CompanyList/AuditList";

const CompanyList = () => {
  const [search, setSearch] = useState("");
  const [selectedExchange, setSelectedExchange] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedValuation, setSelectedValuation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [allExchanges, setAllExchanges] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [topLocations, setTopLocations] = useState([]);

  const filters = {
    selectedExchange,
    selectedSector,
    selectedValuation,
    selectedLocation,
  };

  const handleFilterOptionsUpdate = ({
    allExchanges,
    allSectors,
    topLocations,
  }) => {
    setAllExchanges(allExchanges);
    setAllSectors(allSectors);
    setTopLocations(topLocations);
  };

  const NavBar = () => (
    <nav className="fixed w-full top-0 left-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 transform hover:scale-105 transition-transform"
          >
            <img src="/fba.png" alt="Logo" className="w-25 h-25" />
          </Link>
          <Link
            to="/companies"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:scale-105 transform transition-all shadow-lg hover:shadow-xl"
          >
            <div className="w-2 h-4 mr-2" />
            Request Your Business Audit
          </Link>
        </div>
      </div>
    </nav>
  );

  const renderDomainComponent = () => {
    switch (activeTab) {
      case "all":
        return (
          <div>
            <AuditCompanies search={search} />
            <SmallcapCompanies
              search={search}
              filters={filters}
              onFilterOptionsUpdate={handleFilterOptionsUpdate}
            />
            <DirectoryCompanies search={search} />
          </div>
        );
      case "audit":
        return <AuditCompanies search={search} />;

      case "smallcap":
        return (
          <SmallcapCompanies
            search={search}
            filters={filters}
            onFilterOptionsUpdate={handleFilterOptionsUpdate}
          />
        );
      case "directory":
        return <DirectoryCompanies search={search} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <NavBar />
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
              Search FBA Global Business Directory
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-20">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none shadow-sm"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {topLocations.map((location, idx) => (
                    <option key={idx} value={location}>
                      {location}
                    </option>
                  ))}
                  <option value="Other">Other Locations</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
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
                  <option value="1-10">1-10M</option>
                  <option value="10-30">10-30M</option>
                  <option value="30-50">30-50M</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
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
                Audit
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
                SmallCap
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
                Directory
              </button>
            </div>
          </div>
        </div>
        {renderDomainComponent()}
      </div>
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
