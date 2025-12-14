import React, { useState, useEffect } from "react";
import api from "../api/client";

export default function MatchScore() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score when it changes
  useEffect(() => {
    if (overallScore !== null) {
      let start = 0;
      const end = overallScore;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOutQuart)
        const ease = 1 - Math.pow(1 - progress, 4);

        setAnimatedScore(Math.floor(start + (end - start) * ease));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [overallScore]);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload your resume first");
      return;
    }

    setLoading(true);
    setSections([]);
    setOverallScore(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("ATS RESPONSE:", res.data);

      const sectionsArray = Object.entries(res.data.sections || {}).map(
        ([name, data]) => ({
          name,
          ...data,
        })
      );

      setSections(sectionsArray);
      setOverallScore(res.data.overall_score ?? 0);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-emerald-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getProgressColor = (score) => {
    if (score >= 85) return "#10b981"; // emerald-500
    if (score >= 70) return "#eab308"; // yellow-500
    if (score >= 50) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  const card =
    "rounded-2xl bg-[#050816]/90 border border-purple-500/20 shadow-[0_0_40px_-18px_rgba(168,85,247,0.55)]";

  // Circular Progress Component
  const CircularProgress = ({ score }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = getProgressColor(score);

    return (
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20 transition-colors duration-200"
          style={{ backgroundColor: color }}
        />

        <svg className="transform -rotate-90 w-full h-full">
          
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-zinc-800"
          />
          
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-sm text-zinc-400 mt-1">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 md:px-10 py-12">
      <div className="max-w-5xl mx-auto">

        
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-purple-300">
            TrueFit
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-400">
            Resume ATS Analysis
          </h1>
          <p className="mt-2 text-zinc-400 max-w-2xl">
            This page analyzes your resume structure, clarity, and completeness
            for ATS systems.
          </p>
        </div>

        
        <div className={`${card} p-8 mb-10`}>
          <label className="flex flex-col items-center justify-center border border-dashed border-purple-500/40 rounded-xl py-10 cursor-pointer hover:bg-white/5 transition group">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <span className="text-3xl">📄</span>
            </div>
            <p className="text-lg font-medium">
              {file ? (
                <span className="text-purple-300">{file.name}</span>
              ) : (
                <>
                  Drop your resume here or{" "}
                  <span className="text-purple-400 underline">browse</span>
                </>
              )}
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              PDF / DOCX · Max 5 MB
            </p>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 font-semibold text-white disabled:opacity-50 shadow-lg shadow-purple-500/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : "Analyze Resume"}
          </button>
        </div>

        
        {overallScore !== null && (
          <div className="mb-12 flex flex-col items-center animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-zinc-200">Overall ATS Score</h2>
            <CircularProgress score={animatedScore} />
            <div className="mt-6 flex gap-8 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Needs Work (0-49)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Low (50-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Average (70-84)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Good (85-100)</span>
              </div>
            </div>
          </div>
        )}

        
        {sections.length > 0 && (
          <div className="grid gap-6 animate-slide-up">
            {sections.map((section, idx) => (
              <div
                key={section.name}
                className="rounded-2xl bg-[#050816] border border-zinc-800 p-6 hover:border-purple-500/30 transition duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-xl font-bold capitalize text-white mb-1">
                      {section.name.replace("_", " ")}
                    </h3>
                    <p className="text-sm text-zinc-500">Score based on completeness & relevance</p>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(section.score || 0)}`}>
                    {section.score || 0}<span className="text-sm text-zinc-500 font-normal">/100</span>
                  </div>
                </div>

                
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${section.score || 0}%`,
                      backgroundColor: getProgressColor(section.score || 0)
                    }}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  
                  <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10">
                    <div className="flex items-center gap-2 mb-3 text-red-400">
                      <span className="text-lg">⚠️</span>
                      <h4 className="font-semibold text-sm uppercase tracking-wide">What to Improve</h4>
                    </div>
                    {section.issues?.length > 0 ? (
                      <ul className="space-y-2">
                        {section.issues.map((issue, i) => (
                          <li key={i} className="flex gap-2 text-sm text-zinc-300">
                            <span className="text-red-400 mt-1">•</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No major issues detected.</p>
                    )}
                  </div>

                  
                  <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-3 text-emerald-400">
                      <span className="text-lg">💡</span>
                      <h4 className="font-semibold text-sm uppercase tracking-wide">How to Improve</h4>
                    </div>
                    {section.improvements?.length > 0 ? (
                      <ul className="space-y-2">
                        {section.improvements.map((imp, i) => (
                          <li key={i} className="flex gap-2 text-sm text-zinc-300">
                            <span className="text-emerald-500 mt-1">✓</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">Great job! Keep it up.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

