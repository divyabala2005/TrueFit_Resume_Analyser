import { useState } from "react";
import api from "../api/client";
import { addActivity } from "../utils/activity";


export default function CareerChat() {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text:
        "Hello! I'm TrueFit AI, your personal career strategist. 🚀\n\n" +
        "I can analyze your resume and guide your career path. To get started:\n" +
        "1. **Upload your resume** on the right.\n" +
        "2. **Ask me anything**, for example:\n" +
        "   * 'Rate my resume for a Senior React Developer role.'\n" +
        "   * 'What skills do I need for AI Engineering?'\n" +
        "   * 'Mock interview me for a Product Manager position.'\n\n" +
        "How can I help you advance today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null); // { skills, summary }
  const [resumeContext, setResumeContext] = useState(""); // text sent to AI backend

  const card =
    "rounded-3xl bg-[#050816]/90 border border-zinc-800/80 shadow-[0_0_45px_-12px_rgba(75,31,174,0.55)]";

  // --------- Resume upload + analyze using /api/resume/analyze ----------
  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    setResumeFile(file || null);
    setResumeAnalysis(null);
    setResumeContext("");

    if (!file) return;

    try {
      setAnalyzingResume(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // res.data now contains { overall_score, sections, extracted_data: { skills, summary, projects } }
      const data = res.data.extracted_data || {};
      setResumeAnalysis(data);

      // Build context string for AI
      const ctxParts = [];
      if (data.skills?.length) {
        ctxParts.push(`Skills: ${data.skills.join(", ")}`);
      }
      if (data.summary) {
        ctxParts.push(`Summary: ${data.summary}`);
      }
      if (data.projects) {
        ctxParts.push(`Projects: ${data.projects}`);
      }
      setResumeContext(ctxParts.join(" | "));

    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzingResume(false);
    }
  };

  // ------------------------ Chat send handler ---------------------------
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user message to chat
    const userMsg = { from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    //  Add activity for sending a chat message
    addActivity({
      type: "chat",
      tag: "AI Chat",
      route: "/chat",
      title: "AI Chat",
      detail: `Asked: “${trimmed.slice(0, 80)}${trimmed.length > 80 ? "..." : ""}”`,
    });

    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/ai/chat", {
        message: trimmed,
        resume_text: resumeContext, // may be empty
      });

      const aiReply =
        res.data?.reply ||
        "I couldn't generate a response right now.";

      const aiMsg = { from: "ai", text: aiReply };

      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      console.error(err);
      const aiMsg = {
        from: "ai",
        text:
          "Something went wrong while contacting the AI backend. Please check if the server is running.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[14px] uppercase tracking-[0.25em] text-purple-400/80">
            TrueFit
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-400 mt-1">
            Career Assistant Chat
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
            Upload your resume once, then ask questions about specific roles, missing
            skills and what to learn next. The assistant will use your resume context
            plus job-role knowledge to answer.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT: Chat area */}
          <div className="lg:col-span-2">
            <div className={`${card} p-4 md:p-6 flex flex-col h-[70vh]`}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-line ${msg.from === "user"
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-bl-sm"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                      🤖
                    </div>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse delay-150" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse delay-300" />
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      AI is thinking…
                    </span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-3">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    resumeContext
                      ? "Ask about a role, missing skills, roadmap..."
                      : "You can start by asking about roles or upload a resume on the right..."
                  }
                  className="flex-1 rounded-2xl bg-zinc-950 border border-zinc-700 px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-sm font-semibold hover:brightness-110 shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>

              <p className="mt-2 text-[11px] text-zinc-500 text-right">
                The backend uses your resume context + predefined role skill maps + AI
                to answer.
              </p>
            </div>
          </div>

          {/* RIGHT: Resume upload + context preview */}
          <div className="space-y-4">
            {/* Resume upload */}
            <div className={`${card} p-5`}>
              <h2 className="text-sm font-semibold text-white mb-2">
                Resume Context
              </h2>
              <p className="text-xs text-zinc-400 mb-3">
                Upload your resume so the AI can evaluate your readiness for different
                roles and identify missing skills.
              </p>

              <label className="flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-700 rounded-2xl py-6 cursor-pointer hover:border-purple-400 hover:bg-black/40 transition">
                <div className="w-10 h-10 rounded-2xl bg-black/60 flex items-center justify-center text-xl">
                  📄
                </div>
                <span className="text-sm text-zinc-100">
                  {resumeFile ? (
                    <>
                      Selected:{" "}
                      <span className="text-purple-300">{resumeFile.name}</span>
                    </>
                  ) : (
                    <>
                      Drop your resume here or{" "}
                      <span className="text-purple-300 underline underline-offset-2">
                        browse files
                      </span>
                    </>
                  )}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Supported: PDF / DOCX · Max 5 MB
                </span>
                <input type="file" className="hidden" onChange={handleResumeChange} />
              </label>

              <button
                type="button"
                disabled
                className="mt-3 w-full py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-400"
              >
                Resume is analyzed automatically when you select a file
              </button>

              {analyzingResume && (
                <p className="mt-2 text-[11px] text-purple-300">
                  Analyzing resume…
                </p>
              )}
            </div>

            {/* Extracted Data Sidebar */}
            <div className={`${card} p-5 space-y-6`}>
              <h2 className="text-sm font-semibold text-white mb-2">
                Resume Overview
              </h2>
              {resumeAnalysis ? (
                <>
                  <p className="text-[11px] text-zinc-400 mb-4 border-b border-zinc-800 pb-2">
                    Extracted insights to power your chat analysis.
                  </p>

                  {/* Summary removed as per request */}

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-[11px] text-purple-300 uppercase tracking-wider font-semibold mb-2">Detected Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {resumeAnalysis.skills && resumeAnalysis.skills.length > 0 ? (
                        resumeAnalysis.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg text-[10px] bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500">No specific skills detected.</p>
                      )}
                    </div>
                  </div>

                  {/* Projects removed as per request */}

                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-zinc-500">
                    Upload a resume to unlock detailed insights here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
