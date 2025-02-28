import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Briefcase, MapPin, Globe, DollarSign } from "lucide-react";

// Custom hook to fetch Colive company data
const useColiveCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheetId = "1WMdcbZzOkGdgcinUut4lbZ7GVmQk_wQRlzrFlFy-Sy0";
        const tabId = "869590810";
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
            headquarters: company["Headquarters"],
            website: company["Website"],
            valuation: company["Company Valuation"],
          };
        });
        setCompanies(rows);
      } catch (error) {
        console.error("Error fetching Colive data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { companies, loading };
};

const ColiveCompanies = ({ search }) => {
  const { companies, loading } = useColiveCompanies();

  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        !search ||
        company.name?.toLowerCase().includes(search.toLowerCase()) ||
        company.industry?.toLowerCase().includes(search.toLowerCase()) ||
        company.headquarters?.toLowerCase().includes(search.toLowerCase())
    );
  }, [companies, search]);

  const renderCompanyCard = (company, index) => {
    const colorSet = {
      bg: "bg-gradient-to-br from-purple-600 to-pink-700",
      text: "text-purple-700",
      light: "bg-purple-100",
      highlight: "from-purple-300 to-pink-300",
    };

    return (
      <Link
        to={`/${encodeURIComponent(company.name)}`}
        key={index}
        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
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
            className={`w-20 h-20 rounded-xl ${colorSet.bg} flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 border-4 border-white`}
          >
            <span className="text-white font-bold text-2xl">
              {company.name.charAt(0)}
            </span>
          </div>
        </div>
        <div className="px-6 pt-2 pb-6 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-4 group-hover:text-purple-600 transition-colors">
            {company.name}
          </h3>
          <div className="space-y-2.5">
            {company.industry && (
              <div className="flex items-center text-gray-700">
                <Briefcase size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">{company.industry}</span>
              </div>
            )}
            {company.headquarters && (
              <div className="flex items-center text-gray-700">
                <MapPin size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">{company.headquarters}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center text-gray-700">
                <Globe size={16} className="mr-3 text-gray-500" />
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline truncate max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {company.website.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            )}
            {company.valuation && (
              <div className="flex items-center text-gray-700">
                <DollarSign size={16} className="mr-3 text-gray-500" />
                <span className="text-sm">{company.valuation}</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${colorSet.light} ${colorSet.text} shadow-sm`}
          >
            Colive
          </span>
        </div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl ${colorSet.highlight} opacity-0 group-hover:opacity-10 rounded-full -mb-20 -mr-20 transition-opacity duration-300 pointer-events-none"></div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="w-14 h-14 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-3 left-3"></div>
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-6 left-6"></div>
        </div>
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

export default ColiveCompanies;
