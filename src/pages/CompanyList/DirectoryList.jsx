import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Calendar,
  Users,
  MapPin,
  Linkedin,
  Briefcase,
} from "lucide-react";
import { getFormattedUrl } from "../utils";

const COMPANY_LIST_API = "https://api.companylist.fba.ai";

const DirectoryCompanies = ({ search }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDirectory = async () => {
      setLoading(true);
      try {
        const directoryUrl = search.trim()
          ? `${COMPANY_LIST_API}/search?query=${search}&limit=100`
          : `${COMPANY_LIST_API}/companies?limit=100`;
        const directoryRes = await fetch(directoryUrl);
        const directoryData = await directoryRes.json();
        const formattedCompanies = directoryData.companies.map((company) => ({
          name: company.name,
          industry: company.industry,
          location: company.locality || company.country,
          website: company.domain,
          year_founded: company.year_founded,
          size_range: company.size_range,
          linkedin_url: company.linkedin_url,
          source: "directory",
        }));
        setCompanies(formattedCompanies);
      } catch (error) {
        console.error("Error fetching Directory data:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectory();
  }, [search]);

  const renderCompanyCard = (company, index) => {
    const colorSet = {
      bg: "bg-gradient-to-br from-violet-600 to-purple-700",
      text: "text-violet-700",
      light: "bg-violet-100",
      highlight: "from-violet-300 to-purple-300",
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
        <div className="absolute top-4 right-4">
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${colorSet.light} ${colorSet.text} shadow-sm`}
          >
            Directory
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company, index) => renderCompanyCard(company, index))}
    </div>
  );
};

export default DirectoryCompanies;
