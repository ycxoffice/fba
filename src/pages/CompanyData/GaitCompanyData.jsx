import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export const fetchGaitCompanyData = async (companyName) => {
  try {
    const sheetId = "1Oiw0iGyWCYnvHU-yRFzVjqdLbXHm_BQaIckrkzCmmSI";
    const tabId = "0";
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
    console.error("Gait fetch error:", error);
    return null;
  }
};

function GaitCompanyData() {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheetId = "1Oiw0iGyWCYnvHU-yRFzVjqdLbXHm_BQaIckrkzCmmSI";
        const tabId = "0";
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
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-4 left-4 w-16 h-16 border-4 border-orange-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="p-8 bg-gray-800 rounded-2xl shadow-2xl border border-orange-500/30 max-w-md w-full">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-orange-500 mx-auto mb-4"
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
            <p className="text-xl font-bold text-orange-400 mb-2">{error}</p>
            <p className="text-gray-400 mb-6">
              We couldn't find the company you're looking for.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-800 text-white hover:from-orange-500 hover:to-red-700 transition-all duration-300 shadow-lg shadow-orange-700/30"
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
    "Primary Offering",
    "Target Audience",
    "AI Features",
    "Wearable Integrations",
  ];
  const corporateInfo = [
    "Year Founded",
    "Headquarters",
    "Number of Employees",
    "Revenue",
    "Company Valuation",
    "Funding Raised",
  ];
  const peopleInfo = [
    "Key Founders and Linkedin profiles",
    "Research and Patents",
  ];
  const connectInfo = ["Social Media Presence", "Competitors"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <div className="container mx-auto px-4 py-8 relative">
        <Link
          to="/"
          className="inline-flex items-center text-orange-400 hover:text-orange-300 mb-8 transition-all duration-300 group"
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
          <div className="bg-gradient-to-r from-orange-600 to-red-700 p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 bg-white/10 w-60 h-60 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -left-10 -bottom-10 bg-orange-400/20 w-40 h-40 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
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
                {company["Website URL"] && (
                  <a
                    href={company["Website URL"]}
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
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <p className="text-gray-300 leading-relaxed">
                  {company["Company Description"]}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-5">
                  General Information
                </h2>
                <div className="space-y-5">
                  {generalInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-orange-400/80 text-sm font-medium mb-1">
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
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-5">
                  Corporate Information
                </h2>
                <div className="space-y-5">
                  {corporateInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-orange-400/80 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {typeof company[key] === "string" &&
                            company[key].includes("$")
                              ? company[key]
                              : `${company[key]}`}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-5">
                  People & Research
                </h2>
                <div className="space-y-5">
                  {peopleInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-orange-400/80 text-sm font-medium mb-2">
                            {key}
                          </span>
                          <span className="text-white">
                            {key === "Key Founders and Linkedin profiles"
                              ? company[key]
                                  .split(
                                    /(https:\/\/www\.linkedin\.com\/[^\s,]+)/g
                                  )
                                  .map((part, i) =>
                                    part.match(
                                      /^https:\/\/www\.linkedin\.com/
                                    ) ? (
                                      <a
                                        key={i}
                                        href={part}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-orange-400 hover:text-orange-300 underline mr-2"
                                      >
                                        LinkedIn
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

              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-5">
                  Connect
                </h2>
                <div className="space-y-5">
                  {connectInfo.map(
                    (key) =>
                      company[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-orange-400/80 text-sm font-medium mb-2">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {key === "Social Media Presence" ? (
                              company[key].startsWith("http") ? (
                                <a
                                  href={company[key]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-400 hover:text-orange-300 underline transition-colors"
                                >
                                  {company[key]}
                                </a>
                              ) : (
                                company[key]
                              )
                            ) : (
                              company[key]
                            )}
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
    </div>
  );
}

export default GaitCompanyData;
