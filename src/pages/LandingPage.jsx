import React, { useState } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    registration_number: "",
    website: "",
    linkedin: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/"; // Simulate routing to /report page
    }, 2000); // Simulate loader for 2 seconds
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Header Section */}
      <header className="relative w-full h-96 bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden">

        {/* Main Content */}
        <div className="absolute top-20 inset-0 z-10 flex flex-col items-center justify-center text-center text-white">
          <img src="/fba.png" alt="Logo" className="h-65 w-auto" />
          <p className="text-xl md:text-2xl font-medium mb-8 drop-shadow-md">
            Full Business Audit - AI-Powered Insights for Your Company
          </p>
        </div>

        {/* Background Layers */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-opacity-50 bg-black"></div>
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="relative z-20 px-6 py-12 md:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Transform Your Business with FBA.AI
            </h2>
            <p className="text-lg text-gray-700">
              Our AI engine analyzes your business data and generates a detailed
              audit report tailored to your needs.
            </p>
          </section>

          {/* Form Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Side: Form */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Free FBA Full Business Audit
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    id="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="registration_number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 mx-auto text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Generate Audit Report"
                  )}
                </button>
              </form>
            </div>

            {/* Right Side: Cooler Component */}
            <div className="relative w-full h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg transform rotate-45 animate-pulse"></div>
                <div className="absolute w-32 h-32 bg-white rounded-full shadow-lg transform -rotate-45 animate-bounce"></div>
                <div className="absolute w-16 h-16 bg-indigo-600 rounded-full shadow-lg animate-spin-slow"></div>
                <svg
                  className="absolute w-24 h-24 text-white opacity-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mt-24">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Choose FBA.AI?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-indigo-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-700">
                  Our advanced AI engine ensures accurate and actionable
                  insights.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-indigo-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Comprehensive Reports
                </h3>
                <p className="text-gray-700">
                  Detailed reports covering all aspects of your business.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-indigo-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  User-Friendly Interface
                </h3>
                <p className="text-gray-700">
                  Simple and intuitive design for seamless user experience.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-50 py-12 text-center text-gray-600">
        &copy; 2025 FBA.AI. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
