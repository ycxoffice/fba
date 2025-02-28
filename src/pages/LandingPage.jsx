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
  Cpu,
  Menu,
  X,
} from "lucide-react";
import SmallcapCompanies from "./CompanyList/smallcapList";
import DirectoryCompanies from "./CompanyList/DirectoryList";
import AuditCompanies from "./CompanyList/AuditList";
import KnowYourAICompanies from "./companyList/KnowYouraiList.jsx";

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

  const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <nav className="fixed w-full top-0 z-50 bg-gradient-to-b from-white/95 to-transparent backdrop-blur-lg shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <img
              src="/fba.png"
              alt="Logo"
              className="w-12 h-12 md:w-16 md:h-16 transition-transform group-hover:rotate-12 duration-300"
            />
          </Link>

          {/* Tagline (Visible on mobile) */}
          <div className="absolute inset-0 flex justify-center items-center md:static">
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 animate-pulse">
              Future Business Audits
            </h1>
          </div>

          {/* Desktop Button */}
          <Link
            to="/companies"
            className="hidden md:block px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Request Your Business Audit
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Dropdown */}
          <div
            className={`absolute top-20 left-0 w-full bg-white/90 backdrop-blur-md shadow-lg md:hidden transition-all duration-300 ${
              isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
            } origin-top`}
          >
            <Link
              to="/companies"
              className="block py-4 text-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Request Your Business Audit
            </Link>
          </div>
        </div>
      </nav>
    );
  };

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
            <KnowYourAICompanies search={search} />
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
      case "knowyourai":
        return <KnowYourAICompanies search={search} />;
      case "directory":
        return <DirectoryCompanies search={search} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <NavBar />

      {/* Hero Section with 3D-like animations */}
      <div className="relative pt-24 pb-40 md:pb-48 px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating orbs effect */}
          <div className="absolute left-1/4 top-0 w-64 h-64 bg-gradient-to-r from-blue-300/20 to-indigo-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute right-1/3 top-1/4 w-48 h-48 bg-gradient-to-r from-purple-300/20 to-pink-400/20 rounded-full blur-3xl animate-float-delay"></div>
          <div className="absolute left-1/3 bottom-1/4 w-56 h-56 bg-gradient-to-r from-cyan-300/20 to-blue-400/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute right-1/4 bottom-0 w-72 h-72 bg-gradient-to-r from-indigo-300/20 to-purple-400/20 rounded-full blur-3xl animate-float-slower"></div>

          {/* Mesh grid background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYxMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>

        {/* Hero content */}
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                FBA Company Explorer
              </span>
            </h1>
            <p className="text-gray-600 text-xl md:text-2xl max-w-3xl mx-auto font-medium">
              Search FBA Global Business Directory
            </p>
          </div>
        </div>
      </div>

      {/* Search and filters section */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 md:-mt-32 relative z-10 pb-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-8 transform transition-all duration-300 hover:shadow-blue-200/50 backdrop-blur-sm bg-white/90 border border-gray-100">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Exchange filter */}
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

            {/* Sector filter */}
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

            {/* Location filter */}
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

            {/* Valuation filter */}
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

        {/* Tabs section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-3 mb-8 backdrop-blur-sm bg-white/90 border border-gray-100">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 min-w-max pb-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All Companies
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center ${
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
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center ${
                  activeTab === "smallcap"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Star size={14} className="mr-1" />
                SmallCap
              </button>
              <button
                onClick={() => setActiveTab("knowyourai")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center ${
                  activeTab === "knowyourai"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Cpu size={14} className="mr-1" />
                KnowYourAI
              </button>
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center ${
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

        {/* Domain component */}
        {renderDomainComponent()}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-950 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="mr-2 text-blue-400 animate-pulse">
                  <Layers size={24} />
                </div>
                <span className="font-bold text-2xl">FBA Company Explorer</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                The most comprehensive company database worldwide
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-300"
              >
                <Globe size={22} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-300"
              >
                <Linkedin size={22} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-300"
              >
                <Building2 size={22} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} FBA Company Explorer. All rights
            reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyList;
