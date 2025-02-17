import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LandingPage = () => {
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    linkedin: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const BASE_URL =
      import.meta.env.VITE_FBA_BACKEND_URL || "http://localhost:5001";

    try {
      const response = await axios.post(`${BASE_URL}/api/audit`, formData);

      setIsLoading(false);
      if (response.data.error) {
        alert(`Error: ${response.data.error}`); // Show error if any
      } else {
        alert("Audit saved successfully. ");
        console.log(response.data);
        window.location.href = "/companies"; // Redirect after success
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error during the request:", error);

      // Check if it's a network error
      if (error.code === "ERR_NETWORK") {
        alert(
          "Network error: Unable to reach the server. Please check your connection or the server status."
        );
      } else {
        alert(
          `An error occurred: ${
            error.response ? error.response.data.error : error.message
          }`
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/30 rounded-full blur-xl animate-float"
              style={{
                width: Math.random() * 300 + 100 + "px",
                height: Math.random() * 300 + 100 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-lg shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <img src="/fba.png" alt="Logo" className="h-30" />
            <div className="flex items-center space-x-8">
              <button
                onClick={() => navigate("/companies")}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Audit List
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative pt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-5rem)]">
            {/* Left Column */}
            <div className="relative z-10">
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-20 h-20 bg-blue-200 rounded-full blur-2xl opacity-60 animate-pulse" />
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-200 rounded-full blur-2xl opacity-60 animate-pulse delay-700" />
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  Future of
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient bg-300">
                    Business Analytics
                  </span>
                </h1>
              </div>

              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Transform your business with AI-powered insights and real-time
                analytics
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                {[
                  { label: "Accuracy", value: "99.9%" },
                  { label: "Analysis", value: "24/7" },
                  { label: "Reports", value: "500+" },
                ].map((stat, i) => (
                  <StatCard key={i} {...stat} />
                ))}
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3">
                {["AI Analytics", "Real-time Data", "Smart Insights"].map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-6 py-2 bg-white/50 backdrop-blur-md rounded-full text-gray-700 border border-gray-200 hover:border-blue-400 transition-all duration-300 cursor-default"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl transform rotate-6 scale-105" />
              <div className="absolute inset-0 bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500">
                <h2 className="text-2xl font-bold mb-6">
                  Start Your Free Analysis
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <FormInput
                      key={key}
                      label={key
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                      name={key}
                      value={value}
                      onChange={handleChange}
                    />
                  ))}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      "Generate Free Audit Report"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 6s linear infinite;
        }
        .bg-300 {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  );
};

const NavLink = ({ children }) => (
  <a className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
    {children}
  </a>
);

const StatCard = ({ label, value }) => (
  <div className="group bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-gray-200 hover:border-blue-400 transition-all duration-300">
    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {value}
    </div>
    <div className="text-gray-600 group-hover:text-gray-900 transition-colors">
      {label}
    </div>
  </div>
);

const FormInput = ({ label, ...props }) => (
  <div className="relative">
    <input
      {...props}
      placeholder={label}
      className="w-full px-4 py-3 bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-gray-400"
    />
  </div>
);

const LoadingSpinner = () => (
  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
);

export default LandingPage;
