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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow-md py-6 px-4 md:px-12">
        <h1 className="text-3xl font-bold text-center text-indigo-600">
          Full Business Audit Report
        </h1>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-12">
        <div ref={reportRef} id="report-content" className="space-y-12">
          {/* General Business Profile */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. General Business Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Company Details
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Legal Name:</strong>{" "}
                    {dummyData.generalBusinessProfile.companyDetails.legalName}
                  </li>
                  <li>
                    <strong>Registration Number:</strong>{" "}
                    {
                      dummyData.generalBusinessProfile.companyDetails
                        .registrationNumber
                    }
                  </li>
                  <li>
                    <strong>Year Founded:</strong>{" "}
                    {
                      dummyData.generalBusinessProfile.companyDetails
                        .yearFounded
                    }
                  </li>
                  <li>
                    <strong>Country of Incorporation:</strong>{" "}
                    {
                      dummyData.generalBusinessProfile.companyDetails
                        .countryOfIncorporation
                    }
                  </li>
                  <li>
                    <strong>Entity Type:</strong>{" "}
                    {dummyData.generalBusinessProfile.companyDetails.entityType}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Ownership Structure
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Parent Company:</strong>{" "}
                    {
                      dummyData.generalBusinessProfile.ownershipStructure
                        .parentCompany
                    }
                  </li>
                  <li>
                    <strong>Subsidiaries:</strong>{" "}
                    {dummyData.generalBusinessProfile.ownershipStructure.subsidiaries.join(
                      ", "
                    )}
                  </li>
                  <li>
                    <strong>Top Shareholders:</strong>{" "}
                    {dummyData.generalBusinessProfile.ownershipStructure.shareholders
                      .map((s) => `${s.name} (${s.equity})`)
                      .join(", ")}
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Business Model
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Industry Classification:</strong>{" "}
                  {
                    dummyData.generalBusinessProfile.businessModel
                      .industryClassification
                  }
                </li>
                <li>
                  <strong>Revenue Model:</strong>{" "}
                  {dummyData.generalBusinessProfile.businessModel.revenueModel}
                </li>
                <li>
                  <strong>Core Offerings:</strong>{" "}
                  {dummyData.generalBusinessProfile.businessModel.coreOfferings.join(
                    ", "
                  )}
                </li>
                <li>
                  <strong>Target Customers:</strong>{" "}
                  {
                    dummyData.generalBusinessProfile.businessModel
                      .targetCustomers
                  }
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Website & Digital Footprint
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Official Website:</strong>{" "}
                  {
                    dummyData.generalBusinessProfile.websiteAndDigitalFootprint
                      .officialWebsite
                  }
                </li>
                <li>
                  <strong>Domain Age:</strong>{" "}
                  {
                    dummyData.generalBusinessProfile.websiteAndDigitalFootprint
                      .domainAge
                  }
                </li>
                <li>
                  <strong>Web Traffic:</strong>{" "}
                  {
                    dummyData.generalBusinessProfile.websiteAndDigitalFootprint
                      .webTraffic
                  }
                </li>
                <li>
                  <strong>Social Media Presence:</strong>{" "}
                  {dummyData.generalBusinessProfile.websiteAndDigitalFootprint.socialMediaPresence.join(
                    ", "
                  )}
                </li>
              </ul>
            </div>
          </section>

          {/* Financial Health */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Financial Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Financial Statements (Last 5 Years)
                </h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Year</th>
                      <th className="border border-gray-300 p-2">Revenue</th>
                      <th className="border border-gray-300 p-2">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyData.financialHealth.financialStatements.map(
                      (fs, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">
                            {fs.year}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {fs.revenue}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {fs.netProfitLoss}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Cash Flow & Liquidity
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    <strong>Free Cash Flow:</strong>{" "}
                    {
                      dummyData.financialHealth.cashFlowAndLiquidity
                        .freeCashFlow
                    }
                  </li>
                  <li>
                    <strong>Working Capital:</strong>{" "}
                    {
                      dummyData.financialHealth.cashFlowAndLiquidity
                        .workingCapital
                    }
                  </li>
                  <li>
                    <strong>Quick Ratio:</strong>{" "}
                    {dummyData.financialHealth.cashFlowAndLiquidity.quickRatio}
                  </li>
                  <li>
                    <strong>Current Ratio:</strong>{" "}
                    {
                      dummyData.financialHealth.cashFlowAndLiquidity
                        .currentRatio
                    }
                  </li>
                  <li>
                    <strong>Debt-to-Equity Ratio:</strong>{" "}
                    {
                      dummyData.financialHealth.cashFlowAndLiquidity
                        .debtToEquityRatio
                    }
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Executive & Management Assessment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Executive & Management Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Leadership Team
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {dummyData.executiveAndManagementAssessment.leadershipTeam.map(
                    (exec, index) => (
                      <li key={index}>
                        <strong>{exec.role}:</strong> {exec.name} (
                        <a
                          href={exec.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                        )
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Board of Directors
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {dummyData.executiveAndManagementAssessment.boardOfDirectors.map(
                    (director, index) => (
                      <li key={index}>
                        <strong>{director.role}:</strong> {director.name} (
                        <a
                          href={director.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                        )
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </section>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-300"
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
