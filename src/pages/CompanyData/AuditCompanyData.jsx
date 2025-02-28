import React, { useState } from "react";
import { ChevronDown, ExternalLink, Building2 } from "lucide-react";

export const fetchAuditData = async (companyName, BASE_URL) => {
  try {
    const response = await fetch(`${BASE_URL}/api/audit/${companyName}`);
    if (!response.ok) return null;
    const data = await response.json();
    return Object.keys(data).length > 0 ? data : null;
  } catch (error) {
    console.error("Audit fetch error:", error);
    return null;
  }
};

const renderValue = (value, depth = 0) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return (
      <span className="text-gray-700 font-medium">
        {new Date(value).toLocaleDateString()}
      </span>
    );
  }

  if (
    typeof value === "object" &&
    value.value &&
    typeof value.value === "string" &&
    value.value.match(/^https?:\/\//)
  ) {
    return (
      <a
        href={value.value}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors group"
      >
        <ExternalLink
          className="group-hover:translate-x-1 transition-transform"
          size={16}
        />
        <span className="underline underline-offset-4">
          {value.label || "View Link"}
        </span>
      </a>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {renderValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div
        className={`rounded-lg border border-gray-200 overflow-hidden ${
          depth > 0 ? "bg-white" : "bg-gray-50"
        }`}
      >
        {Object.entries(value).map(([k, v], idx) => (
          <div
            key={k}
            className={`flex flex-col lg:flex-row ${
              idx !== 0 ? "border-t border-gray-200" : ""
            }`}
          >
            <div className="p-4 lg:w-1/3 bg-gray-50 font-medium text-gray-700 break-words">
              {k.replace(/_/g, " ")}
            </div>
            <div className="p-4 lg:w-2/3 bg-white break-words overflow-auto">
              {renderValue(v, depth + 1)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          value
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-red-100 text-red-800 hover:bg-red-200"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  return <span className="text-gray-700 break-words">{value.toString()}</span>;
};

const AuditCompanyData = ({ auditData }) => {
  const [expandedSections, setExpandedSections] = useState(() => {
    const sections = {};
    Object.keys(auditData.data).forEach((key) => {
      sections[key] = true;
    });
    if (auditData.data.info?.key_employee_change_list) {
      sections["employee_changes"] = true;
    }
    return sections;
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sectionOrder = [
    "audit",
    "executives",
    "financial",
    "Employee_&_Hr",
    "competitors",
    "legalRisk",
  ];

  const sortedData = sectionOrder
    .filter((key) => key in auditData.data)
    .map((key) => [key, auditData.data[key]]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {auditData.data.properties?.title}
            </h1>
            <p className="text-gray-600 text-base lg:text-lg">
              {auditData.data.properties?.short_description}
            </p>
          </div>
          <Building2
            className="absolute right-0 top-0 text-gray-100 opacity-20 transform translate-x-1/4 -translate-y-1/4"
            size={200}
          />
        </div>

        <div className="space-y-6">
          {sortedData.map(([sectionKey, sectionValue]) => (
            <div
              key={sectionKey}
              className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-colors duration-300"
              >
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 capitalize">
                  {sectionKey.replace(/_/g, " ")}
                </h2>
                <ChevronDown
                  size={24}
                  className={`text-gray-400 transition-transform duration-300 ${
                    expandedSections[sectionKey] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSections[sectionKey] && (
                <div className="p-4 lg:p-6 border-t border-gray-100 transition-all duration-300">
                  {renderValue(sectionValue)}
                </div>
              )}
            </div>
          ))}

          {auditData.data.info?.key_employee_change_list && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <button
                onClick={() => toggleSection("employee_changes")}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-colors duration-300"
              >
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                  Key Employee Changes
                </h2>
                <ChevronDown
                  size={24}
                  className={`text-gray-400 transition-transform duration-300 ${
                    expandedSections["employee_changes"] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSections["employee_changes"] && (
                <div className="p-4 lg:p-6 border-t border-gray-100">
                  <div className="space-y-4">
                    {auditData.data.info.key_employee_change_list.map(
                      (change, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-300"
                        >
                          {renderValue(change)}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditCompanyData;
