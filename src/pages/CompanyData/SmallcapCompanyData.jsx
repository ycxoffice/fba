//smallcap companydata
import React from "react";
import { Link } from "react-router-dom";

export const fetchSmallcapData = async (companyName) => {
  try {
    const sheetId = "10n9xmV01j3_6pDU7QiR5DIbanIfAyYcd8rVavXT17oE";
    const tabId = "336036379";
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

    return rows.find((comp) => comp["Company Name"] === companyName) || null;
  } catch (error) {
    console.error("Smallcap fetch error:", error);
    return null;
  }
};

const SmallcapCompanyData = ({ smallcapData }) => {
  const generalInfo = [
    "Industry",
    "Headquarters",
    "Founding Year",
    "Number of Employees",
  ];
  const financialInfo = [
    "Funding Raised",
    "Revenue",
    "Company Valuation",
    "Current Valuation",
  ];
  const marketInfo = [
    "Exchange",
    "Ticker Symbol",
    "Sector",
    "Growth Potential Score",
    "Risk Level",
  ];
  const peopleInfo = ["Founders & LinkedIn URLs", "Key Contacts"];
  const socialInfo = ["Social Media Links"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
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

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>

          <div className="bg-gradient-to-r from-emerald-800/90 to-blue-800/90 p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 bg-white/10 w-60 h-60 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 bg-emerald-400/20 w-40 h-40 rounded-full blur-xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {smallcapData["Company Name"]}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {smallcapData["Industry"] && (
                      <span className="bg-black/30 text-white px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium border border-white/10">
                        {smallcapData["Industry"]}
                      </span>
                    )}
                    {smallcapData["Exchange"] &&
                      smallcapData["Ticker Symbol"] && (
                        <span className="bg-black/30 text-white px-4 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium border border-white/10 flex items-center">
                          <span className="bg-emerald-500/20 p-1 rounded-full mr-2">
                            <svg
                              className="w-3 h-3 text-emerald-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2z" />
                            </svg>
                          </span>
                          {smallcapData["Exchange"]}:{" "}
                          <span className="font-bold ml-1">
                            {smallcapData["Ticker Symbol"]}
                          </span>
                        </span>
                      )}
                  </div>
                </div>

                {smallcapData["Website URL"] && (
                  <a
                    href={smallcapData["Website URL"]}
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
            {smallcapData["Company Description"] && (
              <div className="mb-10 bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3 text-emerald-400"
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
                  {smallcapData["Company Description"]}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <div className="bg-gray-700/50 p-1.5 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-400"
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
                  {generalInfo.map(
                    (key) =>
                      smallcapData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {smallcapData[key]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <div className="bg-gray-700/50 p-1.5 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-400"
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
                  </div>
                  Financial Information
                </h2>
                <div className="space-y-5">
                  {financialInfo.map(
                    (key) =>
                      smallcapData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {typeof smallcapData[key] === "string" &&
                            smallcapData[key].includes("$")
                              ? smallcapData[key]
                              : `$${smallcapData[key]}`}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <div className="bg-gray-700/50 p-1.5 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  Market Information
                </h2>
                <div className="space-y-5">
                  {marketInfo.map(
                    (key) =>
                      smallcapData[key] &&
                      key !== "Growth Potential Score" && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400 text-sm font-medium mb-1">
                            {key}
                          </span>
                          <span className="text-white font-medium text-lg">
                            {smallcapData[key]}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <div className="bg-gray-700/50 p-1.5 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-400"
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
                  Key People
                </h2>
                <div className="space-y-5">
                  {peopleInfo.map(
                    (key) =>
                      smallcapData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400 text-sm font-medium mb-2">
                            {key}
                          </span>
                          <span className="text-white">
                            {smallcapData[key].includes("LinkedIn:") ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: smallcapData[key].replace(
                                    /(https:\/\/www\.linkedin\.com\/[^\s,]+)/g,
                                    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 transition-colors hover:underline">LinkedIn Profile</a>'
                                  ),
                                }}
                              />
                            ) : (
                              smallcapData[key]
                            )}
                          </span>
                        </div>
                      )
                  )}
                </div>
              </div>

              <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors duration-300">
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center">
                  <div className="bg-gray-700/50 p-1.5 rounded-lg mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-400"
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
                  Connect
                </h2>
                <div className="space-y-5">
                  {socialInfo.map(
                    (key) =>
                      smallcapData[key] && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400 text-sm font-medium mb-2">
                            {key}
                          </span>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {smallcapData[key].includes("LinkedIn:") && (
                              <a
                                href={
                                  smallcapData[key].match(
                                    /LinkedIn: (https:\/\/[^\s,]+)/
                                  )?.[1]
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-900/60 text-blue-100 hover:bg-blue-800/80 transition-all border border-blue-700/50 group backdrop-blur-sm shadow-lg shadow-blue-900/20"
                              >
                                <svg
                                  className="w-5 h-5 mr-2 group-hover:text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn
                              </a>
                            )}
                            {smallcapData[key].includes("Twitter:") && (
                              <a
                                href={
                                  smallcapData[key].match(
                                    /Twitter: (https:\/\/[^\s,]+)/
                                  )?.[1]
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-sky-900/60 text-sky-100 hover:bg-sky-800/80 transition-all border border-sky-700/50 group backdrop-blur-sm shadow-lg shadow-sky-900/20"
                              >
                                <svg
                                  className="w-5 h-5 mr-2 group-hover:text-white"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                                Twitter
                              </a>
                            )}
                          </div>
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
};

export default SmallcapCompanyData;
