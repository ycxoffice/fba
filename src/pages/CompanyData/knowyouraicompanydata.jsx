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

function Knowyouraicompanydata() {
  const { companyName } = useParams();
  const [companyData, setCompanyData] = useState(null);
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

        // Parse the JSON-like response from Google Sheets
        const jsonData = JSON.parse(text.substring(47).slice(0, -2));

        // Extract column headers and company data
        const headers = jsonData.table.cols.map((col) => col.label);
        const rows = jsonData.table.rows.map((row) => {
          const compData = {};
          row.c.forEach((cell, i) => {
            if (headers[i]) {
              compData[headers[i]] = cell ? cell.v : "";
            }
          });
          return compData;
        });

        // Find the specific company - maintaining same logic
        const foundCompany = rows.find(
          (comp) => decodeURIComponent(companyName) === comp["Company Name"]
        );

        if (foundCompany) {
          setCompanyData(foundCompany);
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
              to="/CompanyList"
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

  if (!companyData) return null;

  // Define attribute groups
  const generalInfoGroup = [
    "Industry",
    "Headquarters",
    "Founding Year",
    "No.Employees",
  ];
  const financialInfoGroup = ["Funding Raised", "Revenue", "Valuation"];
  const aiInfoGroup = [
    "AI Model Used",
    "Primary AI Use Case",
    "AI Frameworks Used",
    "AI Products/Services Offered",
    "Patent Details",
    "AI Research Papers Published",
    "Partnerships",
  ];
  const peopleInfoGroup = [
    "Founders & LinkedIn URLs",
    "Key Contacts",
    "Social Media Links",
  ];
  // New group for additional market & recognition attributes
  const marketRecognitionInfo = [
    "Technology Stack",
    "Customer Base",
    "Case Studies",
    "Awards and Recognitions",
    "Compliance and Regulatory Adherence",
    "Market Presence",
    "Community Engagement",
    "AI Ethics Policies",
    "Competitor Analysis",
    "Media Mentions",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      <div className="fixed top-1/4 left-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link
          to="/CompanyList"
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
                    {companyData["Company Name"]}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {companyData["Industry"] && (
                      <span className="bg-black/30 text-white px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium border border-white/10">
                        {companyData["Industry"]}
                      </span>
                    )}
                  </div>
                </div>
                {companyData["Website"] && (
                  <a
                    href={companyData["Website"]}
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
            {companyData["Company Description"] && (
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
                  {companyData["Company Description"]}
                </p>
              </div>
            )}

            {/* Information Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                      />
                    </svg>
                  </div>
                  General Information
                </h2>
                <div className="space-y-5">
                  {generalInfoGroup.map(
                    (key) =>
                      companyData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-emerald-400/80 text-sm font-medium mb-1">{key}</span>
                          <span className="text-white font-medium text-lg">{companyData[key]}</span>
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  Financial Information
                </h2>
                <div className="space-y-5">
                  {financialInfoGroup.map(
                    (key) =>
                      companyData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-blue-400/80 text-sm font-medium mb-1">{key}</span>
                          <span className="text-white font-medium text-lg">
                            {typeof companyData[key] === "string" && companyData[key].includes("$")
                              ? companyData[key]
                              : `$${companyData[key]}`}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI Capabilities */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-800/20 group">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center group-hover:text-indigo-300 transition-colors">
                  <div className="bg-gray-800/70 p-2 rounded-lg mr-3 group-hover:bg-gray-700/70">
                    <svg
                      className="w-5 h-5 text-indigo-400"
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
                  </div>
                  AI Capabilities
                </h2>
                <div className="space-y-5">
                  {aiInfoGroup.map(
                    (key) =>
                      companyData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-purple-400/80 text-sm font-medium mb-1">{key}</span>
                          <span className="text-white font-medium text-lg">
                            {companyData[key]
                              .split(/(https?:\/\/[^\s]+)/g)
                              .map((part, i) =>
                                part.match(/^https?:\/\/.+/) ? (
                                  <a
                                    key={i}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300 underline ml-1"
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
              {/* People & Contacts */}
              <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-800/20 group">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center group-hover:text-teal-300 transition-colors">
                  <div className="bg-gray-800/70 p-2 rounded-lg mr-3 group-hover:bg-gray-700/70">
                    <svg
                      className="w-5 h-5 text-teal-400"
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
                  </div>
                  People & Contacts
                </h2>
                <div className="space-y-5">
                  {peopleInfoGroup.map(
                    (key) =>
                      companyData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-indigo-400/80 text-sm font-medium mb-2">{key}</span>
                          <span className="text-white">
                            {key === "Founders & LinkedIn URLs" &&
                            companyData[key].includes("linkedin.com")
                              ? companyData[key]
                                  .split(/(https:\/\/[^\s]+)/g)
                                  .map((part, i) =>
                                    part.match(/^https:\/\/[^\s]+/) ? (
                                      <a
                                        key={i}
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-400 hover:text-emerald-300 underline ml-1"
                                      >
                                        LinkedIn
                                      </a>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )
                              : key === "Social Media Links"
                              ? companyData[key]
                                  .split(/(https?:\/\/[^\s]+)/g)
                                  .map((part, i) =>
                                    part.match(/^https?:\/\/[^\s]+/) ? (
                                      <a
                                        key={i}
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-400 hover:text-emerald-300 underline ml-1"
                                      >
                                        {new URL(part).hostname}
                                      </a>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )
                              : companyData[key]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
            {/* New Market & Recognition Group */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-700/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-gray-700/20 group">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center group-hover:text-gray-300 transition-colors">
                  <div className="bg-gray-800/70 p-2 rounded-lg mr-3 group-hover:bg-gray-700/70">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 8c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z" />
                    </svg>
                  </div>
                  Market & Recognition
                </h2>
                <div className="space-y-5">
                  {marketRecognitionInfo.map(
                    (key) =>
                      companyData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400 text-sm font-medium mb-1">{key}</span>
                          <span className="text-white font-medium text-lg">{companyData[key]}</span>
                        </div>
                      )
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

export default Knowyouraicompanydata;
