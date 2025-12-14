import { useState, useEffect } from "react";
import api from "../api/client";
import { addActivity } from "../utils/activity";


export default function JobMatch() {
  const [jobDesc, setJobDesc] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score when it changes
  useEffect(() => {
    if (result && result.match_score !== undefined) {
      let start = 0;
      const end = result.match_score;
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
  }, [result]);

  const cardClass =
    "rounded-3xl bg-[#050816]/90 border border-zinc-800/80 shadow-[0_0_50px_-12px_rgba(99,38,196,0.45)] p-6";

  const handleMatch = async () => {
    if (!resumeFile || !jobDesc) {
      alert("Please provide both a job description and a resume.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDesc);
      formData.append("resume_file", resumeFile);

      const res = await api.post("/api/job/match-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      addActivity({
        type: "job",
        tag: "Job Match",
        route: "/job",
        title: "Job compared",
        detail: "You compared your resume with a job role.",
      });


      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the AI analysis.");
    }

    setLoading(false);
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

  const CircularProgress = ({ score }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = getProgressColor(score);

    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-20 transition-colors duration-200"
          style={{ backgroundColor: color }}
        />

        <svg className="transform -rotate-90 w-full h-full">
          {/* Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-zinc-800"
          />
          {/* Progress */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-zinc-400 mt-1">/ 100</span>
        </div>
      </div>
    );
  };

  const getSkillStats = () => {
    if (!result) return { matchedPct: 0, missingPct: 0 };
    const matchedCount = result.matched_skills ? result.matched_skills.length : 0;
    const missingCount = result.missing_skills ? result.missing_skills.length : 0;
    const total = matchedCount + missingCount;

    if (total === 0) return { matchedPct: 0, missingPct: 0 };

    return {
      matchedPct: Math.round((matchedCount / total) * 100),
      missingPct: Math.round((missingCount / total) * 100)
    };
  };

  const { matchedPct, missingPct } = getSkillStats();

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-[14px] uppercase tracking-[0.25em] text-purple-400/80 mb-1">
          TrueFit
        </p>
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-400 mb-4">
          TrueFit Job Analysis
        </h1>
        <p className="text-zinc-400 mb-8 max-w-2xl">
          Find out how closely you align with your dream job!
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Job Description */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-2 text-white">Job Description</h2>
            <textarea
              className="w-full h-48 bg-transparent border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 focus:outline-none placeholder:text-zinc-600"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here..."
            />
          </div>

          {/* Resume Upload */}
          <div className={cardClass}>
            <h2 className="text-lg font-semibold mb-2 text-white">Upload Resume</h2>
            <div className="h-48 flex flex-col items-center justify-center border border-dashed border-zinc-700 rounded-xl hover:bg-white/5 transition-colors group">
              <label className="cursor-pointer flex flex-col items-center text-center p-6 w-full h-full justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <span className="text-xl">📄</span>
                </div>
                {resumeFile ? (
                  <span className="text-purple-300 font-medium">{resumeFile.name}</span>
                ) : (
                  <span className="text-sm text-zinc-400">
                    Click to upload (PDF/DOCX)
                  </span>
                )}
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Match Button */}
        <button
          onClick={handleMatch}
          disabled={loading}
          className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 font-semibold text-white disabled:opacity-50 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Match...
            </span>
          ) : "Calculate Match Score"}
        </button>

        {/* Result Section */}
        {result && (
          <div className="mt-12 animate-slide-up">

            {/* 1. Overall Score */}
            <div className="flex flex-col items-center mb-10">
              <CircularProgress score={animatedScore} />
              <p className="mt-4 text-lg text-white font-medium">
                You match <span className={`${getScoreColor(result.match_score)} font-bold`}>{result.match_score}%</span> with the job description you provided
              </p>
              <div className="mt-4 flex gap-6 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span>Too Low (0-49)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  <span>Low (50-69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <span>Average (70-84)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span>Good (85-100)</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">

              {/* 2. Missing Skills */}
              <div className="bg-[#050816] rounded-3xl border border-red-500/20 p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-red-400 font-semibold text-lg flex items-center gap-2">
                    <span className="text-xl">⚠️</span> Missing Skills
                  </h3>
                  <span className="text-red-400 font-bold">{missingPct}% Missed</span>
                </div>
                {/* Horizontal Bar */}
                <div className="h-2 w-full bg-zinc-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${missingPct}%` }}
                  />
                </div>
                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills && result.missing_skills.length > 0 ? (
                    result.missing_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 border border-red-500/40 text-red-300"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic text-sm">No missing skills detected!</span>
                  )}
                </div>
              </div>

              {/* 3. Matched Skills */}
              <div className="bg-[#050816] rounded-3xl border border-emerald-500/20 p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-emerald-400 font-semibold text-lg flex items-center gap-2">
                    <span className="text-xl">✅</span> Matched Skills
                  </h3>
                  <span className="text-emerald-400 font-bold">{matchedPct}% Matched</span>
                </div>
                {/* Horizontal Bar */}
                <div className="h-2 w-full bg-zinc-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${matchedPct}%` }}
                  />
                </div>
                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills && result.matched_skills.length > 0 ? (
                    result.matched_skills.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic text-sm">No matched skills found.</span>
                  )}
                </div>
              </div>

              {/* 4. Recommendations */}
              <div className={`${cardClass}`}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-400 text-xl">⚡</span>
                  Recommendations to Match
                </h3>
                <ul className="space-y-3">
                  {result.recommendations && result.recommendations.length > 0 ? (
                    result.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 transition hover:border-purple-500/30">
                        <span className="text-purple-400 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-zinc-500 italic">No specific recommendations.</li>
                  )}
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
