// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobMatch from "./pages/JobMatch";
import MatchScore from "./pages/MatchScore";
import CareerChat from "./pages/CareerChat";
import PageTransition from "./components/PageTransition";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="pt-16 min-h-screen bg-[#020617] text-white">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/job"
          element={
            <PageTransition>
              <JobMatch />
            </PageTransition>
          }
        />
        <Route
          path="/score"
          element={
            <PageTransition>
              <MatchScore />
            </PageTransition>
          }
        />
        <Route
          path="/chat"
          element={
            <PageTransition>
              <CareerChat />
            </PageTransition>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
    </Router>
  );
}
