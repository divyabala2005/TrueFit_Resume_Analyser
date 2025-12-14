import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const features = [
  {
    title: "Fast Resume Analysis",
    desc: "Upload a resume and get instant ATS score, strengths and weak spots.",
    icon: "📄",
  },
  {
    title: "Smart Job Matching",
    desc: "Compare any job description with your resume — see a match % and gaps.",
    icon: "🎯",
  },
  {
    title: "AI Career Chat",
    desc: "Ask the assistant what to learn and how to improve your profile.",
    icon: "🤖",
  },
];

const defaultActivity = [
  {
    id: "welcome-1",
    type: "welcome",
    tag: "Welcome",
    route: "/",
    timestamp: new Date().toISOString(),
    title: "Welcome to TrueFit",
    detail: "This represents your very first activity!",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [activity, setActivity] = useState([]);
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get("/api/activity/");
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setActivity(res.data);
        return;
      }
    } catch (err) {
    }
    setActivity(defaultActivity);
  };

 
  const [demoScore, setDemoScore] = useState(null);
  const [animatingDemo, setAnimatingDemo] = useState(false);

  const startDemo = () => {
    if (animatingDemo) return;
    setAnimatingDemo(true);
    setDemoScore(null);
    setTimeout(() => setDemoScore(5.6), 350);
    setTimeout(() => setDemoScore(7.1), 900);
    setTimeout(() => {
      setDemoScore(7.8);
      setAnimatingDemo(false);
    }, 1500);
  };

  const onUploadClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    navigate("/resume");
  };

  const radius = 52;
  const normalized = (score) => Math.max(0, Math.min(10, score));

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");
      const time = d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return `${time} · ${date}`;
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      <div className="pointer-events-none absolute -left-40 -top-20 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-fuchsia-700/30 to-indigo-900/10 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute right-[-120px] top-40 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-purple-600/20 to-black/20 blur-2xl opacity-60" />

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-12">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            
            <div className="flex items-center gap-3">
              <img src="/home_icon.png" alt="logo" className="w-7 h-7 object-contain" />
              <span className="text-sm uppercase tracking-widest text-purple-300/80 font-semibold">
                TrueFit
              </span>
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-400">
              A smarter way to prepare, match & get hired.
            </h1>

            <p className="mt-4 text-zinc-400">
              Upload your resume, paste a job description, or chat with our AI assistant.
              Get an ATS score, skill gaps, and a simple action plan — fast.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/score")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:scale-[1.02] transition-transform"
              >
                Upload Resume
              </button>

              <button
                onClick={() => navigate("/job")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-zinc-700 text-zinc-200 hover:bg-white/2 transition"
              >
                Analyze Job Description
              </button>

              <button
                onClick={startDemo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-black/30 border border-purple-600 text-purple-200 hover:brightness-110 transition"
              >
                Try Demo Match
              </button>
            </div>
          </div>

          
          <div className="w-full lg:w-[420px] space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#06050b]/60 to-[#04040a]/80 border border-zinc-800 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-zinc-400">Smart Match Preview</div>
                  <div className="text-sm font-semibold mt-1">Junior Frontend Developer</div>
                </div>

                <div className="flex items-center gap-4">
                
                  <div className="relative w-28 h-28">
                    <svg width="120" height="120" viewBox="0 0 120 120" className="rotate-[-90deg]">
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="#111218"
                        strokeWidth="10"
                        fill="none"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="url(#g1)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        animate={{
                          pathLength: demoScore ? normalized(demoScore) / 10 : 0,
                        }}
                        transition={{ ease: "easeOut", duration: 0.9 }}
                      />
                      <defs>
                        <linearGradient id="g1" x1="0" x2="1">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl font-bold">
                          {demoScore ? demoScore.toFixed(1) : "—"}
                        </div>
                        <div className="text-xs text-zinc-400">/10</div>
                      </div>
                    </div>
                  </div>

                 
                  <div className="w-[120px]">
                    <div className="text-[11px] text-zinc-400">Skill fit</div>
                    <div className="mt-2 space-y-2">
                      {[
                        { k: "React", v: demoScore ? Math.min(100, demoScore * 11) : 65 },
                        { k: "JS", v: demoScore ? Math.min(100, demoScore * 10) : 72 },
                        { k: "APIs", v: demoScore ? Math.min(100, demoScore * 9.5) : 60 },
                      ].map((s) => (
                        <div key={s.k} className="text-[11px]">
                          <div className="flex justify-between">
                            <span>{s.k}</span>
                            <span className="text-zinc-400">{Math.round(s.v)}%</span>
                          </div>
                          <div className="mt-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.v}%` }}
                              transition={{ duration: 0.9 }}
                              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-zinc-400">
                This preview is a mock demo — upload a real resume for accurate results.
              </div>
            </div>
          </div>
        </div>

     
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}
              className="rounded-2xl bg-[#050816] border border-zinc-800 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-700 to-indigo-700 flex items-center justify-center text-xl">
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-zinc-400 mt-1">{f.desc}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div><br></br>

      
<section className="max-w-6xl mx-auto px-4 md:px-10 pb-14">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg md:text-xl font-semibold">Recent Activity</h2>
      <span className="text-[11px] text-zinc-400">Click any item to jump to that section.</span>
    </div>

    <div className="relative pl-4 md:pl-6">
    
      <div className="absolute left-[11px] md:left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-fuchsia-500/70 via-purple-500/40 to-transparent" />

      <div className="space-y-4">
        {activity.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            whileHover={{ translateY: -3, scale: 1.01 }}
            className="relative flex gap-3 md:gap-4 cursor-pointer"
            onClick={() => item.route && navigate(item.route)}
          >
          
            <div className="flex-none mt-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.9)]" />
            </div>

          
            <div className="flex-1 rounded-2xl bg-[#050816] border border-purple-500/12 px-4 py-3 shadow-[0_0_30px_-15px_rgba(15,23,42,1)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-purple-400/40 bg-purple-500/10 text-purple-200/90">
                    {item.tag}
                  </span>
                  <p className="text-xs text-zinc-400">{formatTime(item.timestamp)}</p>
                </div>
              </div>

              <h3 className="mt-1 text-sm font-medium text-white">{item.title}</h3>
              <p className="mt-1 text-xs text-zinc-300 leading-relaxed">{item.detail}</p>
            </div>
          </motion.div>
        ))}

   
        {(!activity || activity.length === 0) && (
          <div className="col-span-1 md:col-span-2 rounded-2xl bg-[#050816] border border-zinc-700 p-5 text-zinc-400">
            No activity yet — upload a resume or analyze a job to see recent events here.
          </div>
        )}
      </div>
    </div>
  </motion.div>
</section>

      </div>
    </div>
  );
}
