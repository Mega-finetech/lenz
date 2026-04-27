import { useState, useEffect, useRef } from "react";

// ── Styles injected globally ──────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
    :root {
      --bg: #0d0d0f;
      --card-bg: #161618;
      --border: #2a2a2e;
      --text: #f0ede8;
      --muted: #6b6870;
      --accent: #fbbf24;
      --green: #22c55e;
      --red: #ef4444;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --safe-top: env(safe-area-inset-top, 0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); }
    body { overscroll-behavior: none; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    textarea, input { caret-color: var(--accent); }
    textarea:focus, input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(251,191,36,0.1); }
    ::-webkit-scrollbar { width: 0; }
    button { -webkit-tap-highlight-color: transparent; user-select: none; }
  `}</style>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const QUOTES = [
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { quote: "Learning is not attained by chance; it must be sought with ardor.", author: "Abigail Adams" },
  { quote: "Education is the passport to the future.", author: "Malcolm X" },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { quote: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
];

// ── API Helper ────────────────────────────────────────────────────────────────
const CLAUDE_KEY = process.env.REACT_APP_ANTHROPIC_KEY || "";

async function callClaude(systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }
  const data = await response.json();
  return data.content?.map((b) => b.text || "").join("") || "";
}

function parseJSON(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const HomeIcon = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const QuizIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ResultsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, color = "accent", full = true, style: s = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: full ? "100%" : "auto",
    padding: "15px 20px", border: "none", borderRadius: 14,
    background: disabled ? "var(--border)" : color === "accent" ? "var(--accent)" : color === "green" ? "var(--green)" : color,
    color: disabled ? "var(--muted)" : color === "accent" ? "#0a0a0a" : "#fff",
    fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)",
    cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s",
    opacity: disabled ? 0.7 : 1, ...s,
  }}>{children}</button>
);

const Card = ({ children, style: s = {} }) => (
  <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 18, padding: "20px 18px", ...s }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
    {children}
  </div>
);

// ── API Key Screen (removed — key is now in .env) ────────────────────────────
function _ApiKeyScreen_UNUSED({ onSave }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    if (!key.trim().startsWith("sk-")) { setError("Key must start with sk-"); return; }
    setTesting(true); setError("");
    try {
      await callClaude(key.trim(), "You are a test.", "Say OK");
      localStorage.setItem("lenz_api_key", key.trim());
      onSave(key.trim());
    } catch (e) {
      setError("Invalid key or network error. Please check and try again.");
    }
    setTesting(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px", animation: "fadeUp 0.4s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
        <div style={{ fontSize: 30, fontWeight: 900, fontFamily: "var(--font-display)", color: "var(--text)" }}>Welcome to Lenz</div>
        <div style={{ fontSize: 14, color: "var(--muted)", fontFamily: "var(--font-body)", marginTop: 8, lineHeight: 1.6 }}>
          Enter your Anthropic API key to power<br />AI summaries, quizzes, and marking.
        </div>
      </div>

      <Card>
        <Label>✦ Anthropic API Key</Label>
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)", borderRadius: 12,
              padding: "13px 48px 13px 14px", color: "var(--text)",
              fontFamily: "var(--font-mono)", fontSize: 13, outline: "none",
            }}
          />
          <button onClick={() => setShow(!show)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16,
          }}>{show ? "🙈" : "👁️"}</button>
        </div>
        {error && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8, fontFamily: "var(--font-body)" }}>⚠️ {error}</div>}

        <Btn onClick={handleSave} disabled={testing || !key.trim()} style={{ marginTop: 16 }}>
          {testing ? "⚙️ Testing key..." : "Save & Continue →"}
        </Btn>
      </Card>

      <div style={{ marginTop: 20, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>🔒 Privacy</div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-body)", lineHeight: 1.65 }}>
          Your API key is stored only on <strong style={{ color: "var(--text)" }}>your device</strong> (localStorage). It is never sent to any server except Anthropic's API directly.
        </div>
      </div>

      <div style={{ marginTop: 14, textAlign: "center" }}>
        <a href="https://console.anthropic.com/account/keys" target="_blank" rel="noreferrer"
          style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-mono)", textDecoration: "none" }}>
          Get your free API key →
        </a>
      </div>
    </div>
  );
}

// ── Install Prompt Banner ─────────────────────────────────────────────────────
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  const install = async () => {
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: "var(--accent)", color: "#0a0a0a",
      padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
      fontFamily: "var(--font-body)", fontSize: 13,
    }}>
      <span>📲 <strong>Install Lenz</strong> on your home screen</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={install} style={{ background: "#0a0a0a", color: "var(--accent)", border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Install</button>
        <button onClick={() => setVisible(false)} style={{ background: "rgba(0,0,0,0.2)", color: "#0a0a0a", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
      </div>
    </div>
  );
}

// ── HOME SCREEN ───────────────────────────────────────────────────────────────
function HomeScreen({ onNavigate }) {
  const today = new Date();
  const { quote, author } = QUOTES[today.getDate() % QUOTES.length];

  return (
    <div style={{ padding: "0 20px 110px", overflowY: "auto", height: "100%", animation: "fadeUp 0.35s ease" }}>
      <div style={{ paddingTop: "calc(56px + var(--safe-top))", paddingBottom: 8 }}>
        <div>
            <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              {today.toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", marginTop: 6, fontFamily: "var(--font-display)", lineHeight: 1.2 }}>
              Good to see you,<br /><span style={{ color: "var(--accent)" }}>Learner 🌱</span>
            </div>
        </div>
      </div>

      {/* Quote */}
      <Card style={{ margin: "24px 0 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -16, right: -10, fontSize: 100, opacity: 0.05, fontFamily: "Georgia", lineHeight: 1 }}>"</div>
        <Label>✦ Daily Spark</Label>
        <div style={{ fontSize: 16, lineHeight: 1.7, color: "var(--text)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>"{quote}"</div>
        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>— {author}</div>
      </Card>

      {/* Quick Actions */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { emoji: "📄", label: "Upload Material", desc: "PDF or text file", tab: 1 },
            { emoji: "🧠", label: "Take a Quiz", desc: "Test your knowledge", tab: 2 },
            { emoji: "📊", label: "My Results", desc: "Track your progress", tab: 3 },
            { emoji: "✨", label: "AI Summarize", desc: "Summarize notes fast", tab: 1 },
          ].map(item => (
            <button key={item.label} onClick={() => onNavigate(item.tab)} style={{
              background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 16,
              padding: "18px 14px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s",
            }}
              onTouchStart={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onTouchEnd={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "var(--font-body)" }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* iOS Install Tip */}
      <div style={{ marginTop: 24, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>📲 Install on iPhone</div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-body)", lineHeight: 1.65 }}>
          Tap the <strong style={{ color: "var(--text)" }}>Share</strong> button in Safari, then <strong style={{ color: "var(--text)" }}>"Add to Home Screen"</strong> to install Lenz as an app.
        </div>
      </div>
    </div>
  );
}

// ── UPLOAD SCREEN ─────────────────────────────────────────────────────────────
function UploadScreen({ onMaterialReady }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [qType, setQType] = useState("mixed");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => { setText(ev.target.result); setSummary(""); setStep("upload"); };
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    setLoading(true); setError("");
    try {
      const result = await callClaude(
        "You are an expert academic summarizer. Give a clear, structured summary: first 3–5 bullet points of key concepts, then a 2-sentence overview.",
        `Summarize this material:\n\n${text.slice(0, 6000)}`
      );
      setSummary(result);
      setStep("config");
    } catch (e) {
      setError("Could not summarize: " + e.message);
    }
    setLoading(false);
  };

  const handleGenerate = () => {
    if (!text.trim()) return;
    onMaterialReady({ text, numQ, qType, summary });
  };

  return (
    <div style={{ padding: "0 20px 110px", overflowY: "auto", height: "100%", animation: "fadeUp 0.35s ease" }}>
      <div style={{ paddingTop: "calc(56px + var(--safe-top))", paddingBottom: 20 }}>
        <Label>Step 1 of 2</Label>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>Upload Material</div>
        <div style={{ fontSize: 14, color: "var(--muted)", fontFamily: "var(--font-body)", marginTop: 4 }}>Add your study content to get started</div>
      </div>

      {/* Drop zone */}
      <div onClick={() => fileRef.current.click()} style={{
        border: `2px dashed ${fileName ? "var(--accent)" : "var(--border)"}`, borderRadius: 18,
        padding: "28px 20px", textAlign: "center", cursor: "pointer",
        background: fileName ? "rgba(251,191,36,0.04)" : "transparent", transition: "all 0.2s",
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" }}>{fileName || "Tap to upload a file"}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, fontFamily: "var(--font-body)" }}>{fileName ? "✓ File ready" : ".txt, .md, or any readable text file"}</div>
        <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json" onChange={handleFile} style={{ display: "none" }} />
      </div>

      <div style={{ margin: "14px 0 6px", textAlign: "center", color: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>— or paste below —</div>
      <textarea value={text} onChange={e => { setText(e.target.value); setFileName(""); setSummary(""); setStep("upload"); }}
        placeholder="Paste your notes, textbook content, or any study material..." rows={6}
        style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none" }}
      />
      {error && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 6, fontFamily: "var(--font-body)" }}>⚠️ {error}</div>}

      {text.trim() && step === "upload" && (
        <Btn onClick={handleSummarize} disabled={loading} style={{ marginTop: 14 }}>
          {loading ? "✨ Summarizing with AI..." : "✨ Summarize with AI"}
        </Btn>
      )}

      {summary && (
        <Card style={{ marginTop: 18 }}>
          <Label>AI Summary</Label>
          <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-body)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{summary}</div>
        </Card>
      )}

      {step === "config" && (
        <div style={{ marginTop: 24 }}>
          <Label>Step 2 · Configure Your Quiz</Label>

          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10, fontFamily: "var(--font-body)" }}>
              Number of Questions: <strong style={{ color: "var(--accent)" }}>{numQ}</strong>
            </div>
            <input type="range" min={3} max={30} value={numQ} onChange={e => setNumQ(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
              <span>3 min</span><span>30 max</span>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, fontFamily: "var(--font-body)" }}>Question Type</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { val: "objective", label: "Objective", icon: "🎯" },
                { val: "theory", label: "Theory", icon: "📝" },
                { val: "mixed", label: "Mixed", icon: "⚡" },
              ].map(opt => (
                <button key={opt.val} onClick={() => setQType(opt.val)} style={{
                  padding: "14px 8px", borderRadius: 12,
                  border: `2px solid ${qType === opt.val ? "var(--accent)" : "var(--border)"}`,
                  background: qType === opt.val ? "rgba(251,191,36,0.08)" : "transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 22 }}>{opt.icon}</div>
                  <div style={{ fontSize: 11, color: qType === opt.val ? "var(--accent)" : "var(--text)", fontFamily: "var(--font-mono)", marginTop: 6 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </Card>

          <Btn color="green" onClick={handleGenerate} style={{ marginTop: 16 }}>🧠 Generate Quiz →</Btn>
        </div>
      )}
    </div>
  );
}

// ── QUIZ SCREEN ───────────────────────────────────────────────────────────────
function QuizScreen({ material, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (material) generate(); }, [material]);

  const generate = async () => {
    setLoading(true); setError(""); setQuestions([]); setAnswers({}); setCurrent(0); setSubmitted(false);
    try {
      const typeInstruction =
        material.qType === "objective" ? "Generate ONLY multiple-choice questions (4 options, one correct answer)." :
          material.qType === "theory" ? "Generate ONLY open-ended theory questions requiring written answers." :
            "Mix multiple-choice and short-answer theory questions equally.";

      const raw = await callClaude(
        "You are a professional quiz maker. Return ONLY a valid JSON array. No markdown, no preamble.",
        `${typeInstruction}
Generate exactly ${material.numQ} questions from the material.

For MCQ: {"type":"mcq","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A"}
For theory: {"type":"theory","question":"...","modelAnswer":"..."}

Material:
${material.text.slice(0, 5000)}`
      );
      const parsed = parseJSON(raw);
      if (!parsed || !parsed.length) throw new Error("Parse failed");
      setQuestions(parsed);
    } catch (e) {
      setError("Could not generate questions: " + e.message);
    }
    setLoading(false);
  };

  const answer = (val) => { if (!submitted) setAnswers(prev => ({ ...prev, [current]: val })); };

  const submit = () => { setSubmitted(true); onFinish(questions, answers); };

  const q = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  if (!material) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
      <div style={{ fontSize: 18, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 8 }}>No material loaded</div>
      <div style={{ fontSize: 14, color: "var(--muted)", fontFamily: "var(--font-body)" }}>Upload your study material first.</div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: 32 }}>
      <div style={{ fontSize: 48, animation: "spin 1.2s linear infinite", display: "inline-block", marginBottom: 20 }}>⚙️</div>
      <div style={{ fontSize: 18, fontFamily: "var(--font-display)", color: "var(--text)" }}>Generating Quiz…</div>
      <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-body)", marginTop: 8 }}>AI is crafting {material.numQ} {material.qType} questions</div>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "var(--font-body)", marginBottom: 20 }}>{error}</div>
      <Btn onClick={generate} full={false} style={{ padding: "12px 32px" }}>Try Again</Btn>
    </div>
  );

  return (
    <div style={{ padding: "0 20px 110px", overflowY: "auto", height: "100%", animation: "fadeUp 0.3s ease" }}>
      <div style={{ paddingTop: "calc(56px + var(--safe-top))", paddingBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Label>Quiz Mode</Label>
          <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>{current + 1}/{questions.length}</span>
        </div>
        <div style={{ height: 5, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", transition: "width 0.4s ease", borderRadius: 99 }} />
        </div>
      </div>

      {q && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
            {q.type === "mcq" ? "🎯 Multiple Choice" : "📝 Theory"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--text)", lineHeight: 1.55 }}>{q.question}</div>

          {q.type === "mcq" && q.options && (
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map((opt, i) => {
                const letter = ["A", "B", "C", "D"][i];
                const sel = answers[current] === letter;
                return (
                  <button key={i} onClick={() => answer(letter)} style={{
                    padding: "13px 14px", borderRadius: 12, textAlign: "left",
                    border: `2px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                    background: sel ? "rgba(251,191,36,0.08)" : "transparent",
                    cursor: submitted ? "default" : "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sel ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-mono)", minWidth: 16 }}>{letter}</span>
                    <span style={{ fontSize: 14, color: "var(--text)", fontFamily: "var(--font-body)" }}>{opt.replace(/^[A-D][.)]\s*/, "")}</span>
                  </button>
                );
              })}
            </div>
          )}

          {q.type === "theory" && (
            <textarea value={answers[current] || ""} onChange={e => answer(e.target.value)}
              placeholder="Write your answer here..." rows={5} disabled={submitted}
              style={{ width: "100%", marginTop: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none" }}
            />
          )}
        </Card>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{
          flex: 1, padding: "14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card-bg)",
          color: current === 0 ? "var(--muted)" : "var(--text)", fontSize: 14, fontFamily: "var(--font-display)", cursor: current === 0 ? "not-allowed" : "pointer",
        }}>← Prev</button>
        {current < questions.length - 1
          ? <button onClick={() => setCurrent(current + 1)} style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: "var(--accent)", color: "#0a0a0a", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>Next →</button>
          : <button onClick={submit} disabled={submitted} style={{ flex: 2, padding: "14px", borderRadius: 12, border: "none", background: submitted ? "var(--border)" : "var(--green)", color: submitted ? "var(--muted)" : "#fff", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", cursor: submitted ? "default" : "pointer" }}>
            {submitted ? "✓ Submitted" : "Submit Quiz ✓"}
          </button>
        }
      </div>

      {/* Question nav dots */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>All Questions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: 34, height: 34, borderRadius: 8,
              border: `2px solid ${i === current ? "var(--accent)" : answers[i] !== undefined ? "rgba(34,197,94,0.5)" : "var(--border)"}`,
              background: i === current ? "rgba(251,191,36,0.1)" : answers[i] !== undefined ? "rgba(34,197,94,0.08)" : "transparent",
              color: i === current ? "var(--accent)" : answers[i] !== undefined ? "var(--green)" : "var(--muted)",
              fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, cursor: "pointer",
            }}>{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── RESULTS SCREEN ────────────────────────────────────────────────────────────
function ResultsScreen({ questions, answers }) {
  const [marking, setMarking] = useState(false);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState("");

  const mark = async () => {
    setMarking(true); setError("");
    try {
      const mcqCorrect = questions.filter((q, i) => q.type === "mcq" && answers[i] === q.answer).length;
      const mcqTotal = questions.filter(q => q.type === "mcq").length;
      const theoryQs = questions.map((q, i) => ({ ...q, idx: i })).filter(q => q.type === "theory");
      let theoryResults = [];

      if (theoryQs.length > 0) {
        const raw = await callClaude(
          "You are a strict but fair academic marker. Return ONLY a valid JSON array.",
          `Mark each theory answer out of 10. Return: [{"idx":0,"score":7,"feedback":"One sentence feedback."}]

${theoryQs.map(q => `Q${q.idx}: ${q.question}\nModel Answer: ${q.modelAnswer}\nStudent Answer: ${answers[q.idx] || "(no answer)"}`).join("\n\n")}`
        );
        theoryResults = parseJSON(raw) || [];
      }

      const theoryEarned = theoryResults.reduce((s, r) => s + (r.score || 0), 0);
      const theoryTotal = theoryQs.length * 10;
      const total = mcqTotal + theoryTotal;
      const earned = mcqCorrect + theoryEarned;
      const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
      setScores({ mcqCorrect, mcqTotal, theoryEarned, theoryTotal, earned, total, pct, theoryResults });
    } catch (e) {
      setError("Marking failed: " + e.message);
    }
    setMarking(false);
  };

  const hasData = questions && questions.length > 0;
  const grade = scores ? (scores.pct >= 90 ? "A+" : scores.pct >= 80 ? "A" : scores.pct >= 70 ? "B" : scores.pct >= 60 ? "C" : scores.pct >= 50 ? "D" : "F") : null;
  const gradeColor = scores ? (scores.pct >= 70 ? "var(--green)" : scores.pct >= 50 ? "var(--accent)" : "var(--red)") : null;

  if (!hasData) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
      <div style={{ fontSize: 18, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 8 }}>No results yet</div>
      <div style={{ fontSize: 14, color: "var(--muted)", fontFamily: "var(--font-body)" }}>Complete a quiz to see your performance here.</div>
    </div>
  );

  return (
    <div style={{ padding: "0 20px 110px", overflowY: "auto", height: "100%", animation: "fadeUp 0.35s ease" }}>
      <div style={{ paddingTop: "calc(56px + var(--safe-top))", paddingBottom: 20 }}>
        <Label>Performance Report</Label>
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>Your Results</div>
      </div>

      {!scores && !marking && (
        <Btn onClick={mark} style={{ marginBottom: 20 }}>🎓 Mark My Quiz with AI</Btn>
      )}
      {marking && (
        <div style={{ textAlign: "center", padding: "36px 0", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
          <div style={{ fontSize: 40, animation: "spin 1.2s linear infinite", display: "inline-block" }}>⚙️</div>
          <div style={{ marginTop: 14, fontSize: 14 }}>AI is grading your answers…</div>
        </div>
      )}
      {error && <div style={{ fontSize: 13, color: "var(--red)", fontFamily: "var(--font-body)", marginBottom: 16 }}>⚠️ {error} <button onClick={mark} style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12 }}>Retry</button></div>}

      {scores && (
        <>
          <Card style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 80, fontWeight: 900, fontFamily: "var(--font-display)", color: gradeColor, lineHeight: 1 }}>{grade}</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginTop: 4 }}>{scores.pct}%</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-body)", marginTop: 4 }}>{scores.earned} / {scores.total} points</div>
            <div style={{ marginTop: 18, height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${scores.pct}%`, background: gradeColor, transition: "width 1s ease", borderRadius: 99 }} />
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Card>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>🎯 Objective</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-display)", marginTop: 8 }}>{scores.mcqCorrect}/{scores.mcqTotal}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-body)" }}>correct</div>
            </Card>
            <Card>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>📝 Theory</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-display)", marginTop: 8 }}>{scores.theoryEarned}/{scores.theoryTotal}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-body)" }}>points</div>
            </Card>
          </div>

          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Question Review</div>
          {questions.map((q, i) => {
            const ua = answers[i];
            const correct = q.type === "mcq" ? ua === q.answer : null;
            const tr = scores.theoryResults?.find(r => r.idx === i);
            return (
              <Card key={i} style={{
                marginBottom: 10,
                borderColor: correct === true ? "rgba(34,197,94,0.3)" : correct === false ? "rgba(239,68,68,0.3)" : "var(--border)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-body)", lineHeight: 1.55, flex: 1 }}>
                    <span style={{ color: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}>Q{i + 1} · </span>{q.question}
                  </div>
                  {q.type === "mcq" && <span style={{ fontSize: 18, flexShrink: 0 }}>{correct ? "✅" : "❌"}</span>}
                  {tr && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{tr.score}/10</span>}
                </div>
                {q.type === "mcq" && ua && <div style={{ marginTop: 6, fontSize: 12, color: correct ? "var(--green)" : "var(--red)", fontFamily: "var(--font-body)" }}>Your answer: {ua}</div>}
                {q.type === "mcq" && !correct && <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-body)", marginTop: 2 }}>✓ Correct: {q.answer}</div>}
                {tr?.feedback && <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-body)", lineHeight: 1.6, fontStyle: "italic" }}>💬 {tr.feedback}</div>}
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [material, setMaterial] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const onMaterialReady = (mat) => { setMaterial(mat); setQuestions([]); setAnswers({}); setTab(2); };
  const onFinish = (qs, ans) => { setQuestions(qs); setAnswers(ans); setTab(3); };

  const TABS = [
    { label: "Home", Icon: HomeIcon },
    { label: "Upload", Icon: UploadIcon },
    { label: "Quiz", Icon: QuizIcon },
    { label: "Results", Icon: ResultsIcon },
  ];

  return (
    <>
      <GlobalStyles />
      <InstallBanner />
      <div style={{ maxWidth: 430, margin: "0 auto", height: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {tab === 0 && <HomeScreen onNavigate={setTab} />}
          {tab === 1 && <UploadScreen onMaterialReady={onMaterialReady} />}
          {tab === 2 && <QuizScreen material={material} onFinish={onFinish} />}
          {tab === 3 && <ResultsScreen questions={questions} answers={answers} />}
        </div>

        {/* Bottom Nav */}
        <div style={{
          borderTop: "1px solid var(--border)", background: "rgba(13,13,15,0.97)", backdropFilter: "blur(20px)",
          display: "flex", justifyContent: "space-around",
          paddingTop: 10, paddingBottom: "calc(14px + var(--safe-bottom))",
        }}>
          {TABS.map(({ label, Icon: Ic }, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "none", border: "none", cursor: "pointer",
              color: tab === i ? "var(--accent)" : "var(--muted)", transition: "color 0.15s", padding: "2px 20px",
            }}>
              <Ic />
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
