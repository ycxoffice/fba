import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export const fetchColiveCompanyData = async (companyName) => {
  try {
    const sheetId = "1WMdcbZzOkGdgcinUut4lbZ7GVmQk_wQRlzrFlFy-Sy0";
    const tabId = "869590810";
    const response = await fetch(
      `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${tabId}`
    );
    const text = await response.text();
    const jsonData = JSON.parse(text.substring(47).slice(0, -2));

    const rows = jsonData.table.rows.map((row) => {
      return jsonData.table.cols.reduce((acc, col, index) => {
        acc[col.label] = row.c[index]?.v || "";
        return acc;
      }, {});
    });

    return (
      rows.find(
        (comp) => decodeURIComponent(companyName) === comp["Company Name"]
      ) || null
    );
  } catch (error) {
    console.error("Colive fetch error:", error);
    return null;
  }
};

function ColiveCompanyData() {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const companyData = {};
          row.c.forEach((cell, i) => {
            if (headers[i]) companyData[headers[i]] = cell ? cell.v : "";
          });
          return companyData;
        });
        const foundCompany = rows.find(
          (comp) => decodeURIComponent(companyName) === comp["Company Name"]
        );
        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          setError("Company not found");
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [companyName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-4 left-4 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-6">
        <div className="p-8 bg-gray-800 rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-xl font-bold text-red-400 mb-2">{error}</p>
            <p className="text-gray-400 mb-6">
              We couldn't find the company you're looking for.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-800 text-white hover:from-purple-500 hover:to-pink-700 transition-all duration-300 shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!company) return null;

  const generalInfo = [
    "Industry",
    "Core Offerings",
    "Target Market",
    "Smart Features",
    "Property Listings",
    "Year Founded",
    "Headquarters",
    "Number Of Employees",
  ];
  const financialInfo = ["Revenue", "Company Valuation", "Funding Raised"];
  const peopleTechInfo = [
    "Key Founders & LinkedIn Profiles",
    "Tech Stack",
    "Major Clients & Partners",
  ];
  const sustainabilityInfo = [
    "Sustainability Initiatives",
    "Social Media Presence",
    "Competitors",
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="fixed top-1/4 left-0 w-80 h-80 bg-pink-500/10 rounded-full filter blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-all duration-300 group"
        >
          <div className="bg-gray-800/80 p-2 rounded-full mr-3 group-hover:bg-gray-700/80 transition-all">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </div>
          <span className="text-lg">Back to company directory</span>
        </Link>

        <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50">
          <div className="bg-gradient-to-r from-purple-800 to-pink-800 p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 bg-white/10 w-60 h-60 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -left-10 -bottom-10 bg-purple-400/20 w-40 h-40 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {company["Company Name"]}
                  </h1>
                  {company["Industry"] && (
                    <span className="bg-black/30 text-white px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium border border-white/10">
                      {company["Industry"]}
                    </span>
                  )}
                </div>
                {company["Website"] && (
                  <a
                    href={company["Website"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white inline-flex items-center mt-4 md:mt-0 bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group border border-white/10"
                  >
                    <span>Visit Website</span>
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {company["Company Description"] && (
              <div className="mb-10 bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {company["Company Description"]}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  General Information
                </h2>
                <div className="space-y-5">
                  {generalInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-purple-400/80 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {company[key]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Financial Information
                </h2>
                <div className="space-y-5">
                  {financialInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-purple-400/80 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {company[key]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  People & Tech
                </h2>
                <div className="space-y-5">
                  {peopleTechInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-purple-400/80 text-sm font-medium mb-2">
                            {key}
                          </span>
                          <span className="text-white">
                            {key === "Key Founders & LinkedIn Profiles" ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: company[key].replace(
                                    /(https:\/\/www\.linkedin\.com\/[^\s,]+)/g,
                                    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline">LinkedIn</a>'
                                  ),
                                }}
                              />
                            ) : (
                              company[key]
                            )}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Sustainability & Connect
                </h2>
                <div className="space-y-5">
                  {sustainabilityInfo.map((key) =>
                    company[key] ? (
                      <div key={key} className="flex flex-col">
                        <span className="text-purple-400/80 text-sm font-medium mb-2">
                          {key}
                        </span>
                        {key === "Social Media Presence" &&
                        company[key].startsWith("http") ? (
                          <a
                            href={company[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 font-medium text-lg hover:underline"
                          >
                            {company[key]}
                          </a>
                        ) : (
                          <span className="text-white font-medium text-lg">
                            {company[key]}
                          </span>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColiveCompanyData;
