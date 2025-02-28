import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export const fetchKnowYourAIData = async (companyName) => {
  try {
    const sheetId = "1098MT3Wgfzia7dKjxAyr7jxgH5PpdAt3AOaoII2J9xw";
    const tabId = "794818920";
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
    console.error("KnowYourAI fetch error:", error);
    return null;
  }
};

function knowyouraicompanydata() {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Google Sheets API endpoint - keeping the same logic
        const sheetId = "1098MT3Wgfzia7dKjxAyr7jxgH5PpdAt3AOaoII2J9xw";
        const tabId = "794818920";
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${tabId}`;

        const response = await fetch(url);
        const text = await response.text();

        // Parse the JSON-like response from Google Sheets - maintaining same logic
        const jsonData = JSON.parse(text.substring(47).slice(0, -2));

        // Extract column headers and company data - maintaining same logic
        const headers = jsonData.table.cols.map((col) => col.label);
        const rows = jsonData.table.rows.map((row) => {
          const companyData = {};
          row.c.forEach((cell, i) => {
            if (headers[i]) {
              companyData[headers[i]] = cell ? cell.v : "";
            }
          });
          return companyData;
        });

        // Find the specific company - maintaining same logic
        const foundCompany = rows.find(
          (comp) => decodeURIComponent(companyName) === comp["Company Name"]
        );

        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          setError("Company not found");
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [companyName]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-black/90">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-4 left-4 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="p-8 bg-gray-800 rounded-2xl shadow-2xl border border-red-500/30 max-w-md w-full backdrop-blur-md">
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
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-500 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-700/30"
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

  if (!company) return null;

  // Define attribute groups
  const generalInfo = [
    "Industry",
    "Headquarters",
    "Founding Year",
    "No.Employees",
  ];
  const financialInfo = ["Funding Raised", "Revenue", "Valuation"];
  const aiInfo = [
    "AI Model Used",
    "Primary AI Use Case",
    "AI Frameworks Used",
    "AI Products/Services Offered",
    "Patent Details",
    "AI Research Papers Published",
    "Partnerships",
  ];
  const peopleInfo = [
    "Founders & LinkedIn URLs",
    "Key Contacts",
    "Social Media Links",
  ];

  // Helper function to render URLs as Link components
  const renderWithLinks = (text) => {
    if (!text) return "";

    // Simple check if text contains a URL
    if (!text.includes("http")) {
      return text;
    }

    // For LinkedIn profiles - specific handling
    if (text.includes("linkedin.com")) {
      return (
        <span>
          {text
            .split(/(https:\/\/www\.linkedin\.com\/[^\s,]+)/)
            .map((part, i) => {
              if (part.startsWith("https://www.linkedin.com")) {
                return (
                  <a
                    key={i}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors hover:underline ml-1"
                  >
                    LinkedIn Profile
                  </a>
                );
              }
              return part;
            })}
        </span>
      );
    }

    // For other URLs
    return (
      <span>
        {text.split(/(https?:\/\/[^\s,]+)/).map((part, i) => {
          if (part.startsWith("http")) {
            return (
              <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors hover:underline ml-1"
              >
                Link
              </a>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      <div className="fixed top-1/4 left-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-8 transition-all duration-300 group"
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

        <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 relative">
          {/* Header with glowing effect */}
          <div className="bg-gradient-to-r from-emerald-800/90 via-blue-800/90 to-purple-800/90 p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 bg-white/10 w-60 h-60 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -left-10 -bottom-10 bg-emerald-400/20 w-40 h-40 rounded-full blur-xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                    {company["Company Name"]}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {company["Industry"] && (
                      <span className="bg-black/30 text-white px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium border border-white/10">
                        {company["Industry"]}
                      </span>
                    )}
                  </div>
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

          {/* About Section with glass effect */}
          <div className="p-8">
            {company["Company Description"] && (
              <div className="mb-10 bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  About
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {company["Company Description"]}
                </p>
              </div>
            )}

            {/* Information Groups with enhanced cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* General Information */}
              <div className="bg-gradient-to-br from-emerald-900/50 to-blue-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-800/20 group">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center group-hover:text-emerald-300 transition-colors">
                  <div className="bg-gray-800/70 p-2 rounded-lg mr-3 group-hover:bg-gray-700/70">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      ></path>
                    </svg>
                  </div>
                  General Information
                </h2>
                <div className="space-y-5">
                  {generalInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-emerald-400/80 text-sm font-medium mb-1">
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

              {/* Financial Information */}
              <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-800/20 group">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center group-hover:text-blue-300 transition-colors">
                  <div className="bg-gray-800/70 p-2 rounded-lg mr-3 group-hover:bg-gray-700/70">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  Financial Information
                </h2>
                <div className="space-y-5">
                  {financialInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-blue-400/80 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {typeof company[key] === "string" &&
                            company[key].includes("$")
                              ? company[key]
                              : `$${company[key]}`}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="space-y-5">
                {aiInfo.map(
                  (key) =>
                    company[key] && (
                      <div key={key} className="flex flex-col">
                        <span className="text-purple-400/80 text-sm font-medium mb-1">
                          {key}
                        </span>
                        <span className="text-white font-medium text-lg">
                          {company[key]
                            .split(/(https?:\/\/[^\s]+)/g)
                            .map((part, i) =>
                              part.match(/^https?:\/\/.+/) ? (
                                <a
                                  key={i}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 underline"
                                >
                                  {part}
                                </a>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* People & Contacts with enhanced social links */}
              <div className="space-y-5">
                {peopleInfo.map(
                  (key) =>
                    company[key] && (
                      <div key={key} className="flex flex-col">
                        <span className="text-indigo-400/80 text-sm font-medium mb-2">
                          {key}
                        </span>
                        <span className="text-white">
                          {key === "Founders & LinkedIn URLs"
                            ? company[key]
                                .split(/(https:\/\/[^\s]+)/g)
                                .map((part, i) =>
                                  part.match(/^https:\/\/.+/) ? (
                                    <a
                                      key={i}
                                      href={part}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 underline"
                                    >
                                      LinkedIn
                                    </a>
                                  ) : (
                                    <span key={i}>{part}</span>
                                  )
                                )
                            : key === "Social Media Links"
                            ? company[key]
                                .split(/(https?:\/\/[^\s]+)/g)
                                .map((part, i) =>
                                  part.match(/^https?:\/\/.+/) ? (
                                    <a
                                      key={i}
                                      href={part}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 underline"
                                    >
                                      {new URL(part).hostname}
                                    </a>
                                  ) : (
                                    <span key={i}>{part}</span>
                                  )
                                )
                            : company[key]}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default knowyouraicompanydata;
