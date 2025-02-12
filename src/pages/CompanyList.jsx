import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Building2, ArrowRight } from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 40;

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/audit?search=${search}&page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        // Create a reversed copy of the companies array
        const reversedCompanies = [...data.companies].reverse();

        setCompanies(reversedCompanies);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        setLoading(false);
      });
  }, [search, page]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Audits
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Discover and explore our extensive network of companies
          </p>
        </div>

        <div className="relative mb-8 transform hover:scale-102 transition-all duration-300">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-14 pr-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg shadow-lg"
          />
          <Search className="absolute left-5 top-5 text-gray-400" size={24} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin absolute top-2 left-2"></div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company, index) => (
              <Link
                key={index}
                to={`/${encodeURIComponent(company.company_name)}`}
                className="block group"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientColor(
                        index
                      )} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white font-bold text-lg">
                        {company.company_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {company.company_name}
                      </h3>
                    </div>
                    <ArrowRight className="text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-2 transition-all" />
                  </div>
                  <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Building2 size={120} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default CompanyList;
