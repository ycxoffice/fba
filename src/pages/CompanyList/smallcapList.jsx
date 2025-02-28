import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Building2, Briefcase, MapPin, Globe, Star } from "lucide-react";
import { getFormattedUrl } from "../utils";

const useSmallcapCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setCompanies(rows);
      } catch (error) {
        console.error("Error fetching Smallcap data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSmallcap();
  }, []);

  const allExchanges = useMemo(() => {
    return [...new Set(companies.map((c) => c.exchange).filter(Boolean))];
  }, [companies]);

  const allSectors = useMemo(() => {
    return [...new Set(companies.map((c) => c.sector).filter(Boolean))];
  }, [companies]);

  const topLocations = useMemo(() => {
    const locationCounts = companies.reduce((acc, company) => {
      const loc = company.location;
      if (loc) {
        acc[loc] = (acc[loc] || 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([loc]) => loc);
  }, [companies]);

  return { companies, loading, allExchanges, allSectors, topLocations };
};

const SmallcapCompanies = ({ search, filters, onFilterOptionsUpdate }) => {
  const { companies, loading, allExchanges, allSectors, topLocations } =
    useSmallcapCompanies();
  const {
    selectedExchange,
    selectedSector,
    selectedValuation,
    selectedLocation,
  } = filters;

  useEffect(() => {
    if (!loading && onFilterOptionsUpdate) {
      onFilterOptionsUpdate({ allExchanges, allSectors, topLocations });
    }
  }, [loading, allExchanges, allSectors, topLocations, onFilterOptionsUpdate]);

  const getValuationRange = (valuation) => {
    if (!valuation) return "";
    const num = parseInt(valuation.replace(/[^0-9]/g, ""), 10);
    if (num <= 10) return "1-10";
    if (num <= 30) return "10-30";
    if (num <= 50) return "30-50";
    return "";
  };

  const filteredCompanies = useMemo(() => {
    return companies
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
          selectedValuation === "" ||
          getValuationRange(company.valuation) === selectedValuation;
        const matchesLocation =
          selectedLocation === "" ||
          (selectedLocation === "Other"
            ? !topLocations.includes(company.location)
            : company.location === selectedLocation);
        return (
          matchesSearch &&
          matchesExchange &&
          matchesSector &&
          matchesValuation &&
          matchesLocation
        );
      })
      .slice(0, 50);
  }, [
    companies,
    search,
    selectedExchange,
    selectedSector,
    selectedValuation,
    selectedLocation,
    topLocations,
  ]);

  const renderCompanyCard = (company, index) => {
    const colorSet = {
      bg: "bg-gradient-to-br from-emerald-600 to-teal-700",
      text: "text-emerald-700",
      light: "bg-emerald-100",
      highlight: "from-emerald-300 to-teal-300",
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
            {company.exchange && (
              <div className="flex items-center text-gray-700">
                <Building2 size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">Exchange: {company.exchange}</span>
              </div>
            )}
            {company.valuation && (
              <div className="flex items-center text-gray-700">
                <Star size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">Valuation: {company.valuation}</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${colorSet.light} ${colorSet.text} shadow-sm`}
          >
            Smallcap
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

  if (filteredCompanies.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Star size={48} className="text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          No smallcap companies found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search criteria or filters to find smallcap
          companies
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCompanies.map((company, index) =>
        renderCompanyCard(company, index)
      )}
    </div>
  );
};

export default SmallcapCompanies;
