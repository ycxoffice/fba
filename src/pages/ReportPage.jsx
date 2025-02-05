import React, { useRef } from "react";
import { dummyData } from "./data";
import html2pdf from "html2pdf.js";

const ReportPage = () => {
  const reportRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: "FBA_Report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow-md py-8 px-6 md:px-12">
        <h1 className="text-4xl font-bold text-center text-indigo-600">
          Full Business Audit Report
        </h1>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-12">
        <div ref={reportRef} id="report-content" className="space-y-12">
          {/* General Business Profile */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              General Business Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-md">
              {/* Company Details */}
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  Company Details
                </h3>
                <ul className="space-y-2 text-lg text-gray-700">
                  <li><strong>Legal Name:</strong> {dummyData.generalBusinessProfile.companyDetails.legalName}</li>
                  <li><strong>Registration Number:</strong> {dummyData.generalBusinessProfile.companyDetails.registrationNumber}</li>
                  <li><strong>Year Founded:</strong> {dummyData.generalBusinessProfile.companyDetails.yearFounded}</li>
                  <li><strong>Country of Incorporation:</strong> {dummyData.generalBusinessProfile.companyDetails.countryOfIncorporation}</li>
                  <li><strong>Entity Type:</strong> {dummyData.generalBusinessProfile.companyDetails.entityType}</li>
                </ul>
              </div>

              {/* Ownership Structure */}
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  Ownership Structure
                </h3>
                <ul className="space-y-2 text-lg text-gray-700">
                  <li><strong>Parent Company:</strong> {dummyData.generalBusinessProfile.ownershipStructure.parentCompany}</li>
                  <li><strong>Subsidiaries:</strong> {dummyData.generalBusinessProfile.ownershipStructure.subsidiaries.join(", ")}</li>
                  <li><strong>Top Shareholders:</strong> {dummyData.generalBusinessProfile.ownershipStructure.shareholders.map(s => `${s.name} (${s.equity})`).join(", ")}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Financial Health */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Financial Health
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                Financial Statements (Last 5 Years)
              </h3>
              <table className="w-full border-separate border-spacing-2 border border-gray-600 rounded-lg shadow-md bg-white">
                <thead>
                  <tr className="bg-gray-200 text-gray-900 text-lg">
                    <th className="border border-gray-600 p-3">Year</th>
                    <th className="border border-gray-600 p-3">Revenue</th>
                    <th className="border border-gray-600 p-3">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyData.financialHealth.financialStatements.map((fs, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border border-gray-600 p-3">{fs.year}</td>
                      <td className="border border-gray-600 p-3">{fs.revenue}</td>
                      <td className="border border-gray-600 p-3">{fs.netProfitLoss}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Leadership Team */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Executive & Management Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow-md">
              {/* Leadership Team */}
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  Leadership Team
                </h3>
                <ul className="space-y-2 text-lg text-gray-700">
                  {dummyData.executiveAndManagementAssessment.leadershipTeam.map((exec, index) => (
                    <li key={index}>
                      <strong>{exec.role}:</strong> {exec.name} (
                      <a href={exec.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        LinkedIn
                      </a>)
                    </li>
                  ))}
                </ul>
              </div>

              {/* Board of Directors */}
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  Board of Directors
                </h3>
                <ul className="space-y-2 text-lg text-gray-700">
                  {dummyData.executiveAndManagementAssessment.boardOfDirectors.map((director, index) => (
                    <li key={index}>
                      <strong>{director.role}:</strong> {director.name} (
                      <a href={director.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        LinkedIn
                      </a>)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
            >
              Download PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
