// src/components/Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const baseBtn =
    "px-4 py-1.5 rounded-full text-sm transition-all duration-200";
  const activeBtn =
    baseBtn +
    " text-white font-semibold bg-gradient-to-r from-fuchsia-500 to-purple-500 shadow-lg shadow-fuchsia-500/40";
  const normalBtn =
    baseBtn +
    " text-zinc-300 hover:text-white hover:bg-white/10";

  const linkClass = ({ isActive }) => (isActive ? activeBtn : normalBtn);

  return (
    <nav className="w-full bg-[#020617]/95 backdrop-blur-lg border-b border-white/5 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* <div className="w-4 h-4 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600" /> */}
          <img src="/home_icon.png" alt="Logo" className="w-6 h-6 object-contain"/>
          <span className="font-semibold text-white tracking-wide">
            TrueFit
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>

          <NavLink to="/job" className={linkClass}>
            Job Match
          </NavLink>

          <NavLink to="/score" className={linkClass}>
            Score
          </NavLink>

          <NavLink to="/chat" className={linkClass}>
            Chat
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
