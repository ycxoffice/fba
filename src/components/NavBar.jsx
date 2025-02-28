import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => (
  <nav className="fixed w-full top-0 left-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 transform hover:scale-105 transition-transform"
        >
          <img src="/fba.png" alt="Logo" className="w-25 h-25" />
        </Link>
        {/* Request Audit Button */}
        <Link
          to="/companies"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
        >
          <div className="w-2 h-4 mr-2" />
          Request Your Business Audit
        </Link>
      </div>
    </div>
  </nav>
);

export default NavBar;
