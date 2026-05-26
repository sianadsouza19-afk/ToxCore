<<<<<<< HEAD
import { useState, useEffect, useRef } from "react";
=======
import { useState, useRef, useEffect } from "react";
>>>>>>> 5e6fcd0 (Updated backend and frontend)
import axios from "axios";
import "./App.css";

// ── Pie Chart ──────────────────────────────────────────────
function PieChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return (
    <div className="chart-container">
      <h3>Toxicity Breakdown</h3>
      <p style={{ color: "#4ade80", padding: "12px" }}>
        ✅ No toxic comments detected!
      </p>
    </div>
  );

  const colors = {
    "General Toxicity": "#f87171",
    "Severe Toxicity":  "#ef4444",
    "Obscene":          "#fb923c",
    "Threat":           "#f59e0b",
    "Insult":           "#a78bfa",
    "Hate Speech":      "#60a5fa",
  };

  let cumulative = 0;
  const slices = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([label, value]) => {
      const pct   = value / total;
      const start = cumulative;
      cumulative += pct;
      return { label, value, pct, start };
    });

  const makeSlice = (start, end, r = 80) => {
    if (end - start >= 1) end = 0.9999;
    const angle = (p) => 2 * Math.PI * p - Math.PI / 2;
    const sx = Math.cos(angle(start)) * r;
    const sy = Math.sin(angle(start)) * r;
    const ex = Math.cos(angle(end)) * r;
    const ey = Math.sin(angle(end)) * r;
    const large = end - start > 0.5 ? 1 : 0;
    return `M 0 0 L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
  };

  return (
    <div className="chart-container">
      <h3>Toxicity Breakdown</h3>
      <div className="chart-inner">
        <svg viewBox="-100 -100 200 200" width="200" height="200">
          {slices.map((s, i) => (
            <path key={i}
              d={makeSlice(s.start, s.start + s.pct)}
              fill={colors[s.label] || "#888"}
              stroke="#0a1223" strokeWidth="2"
            />
          ))}
        </svg>
        <div className="legend">
          {slices.map((s, i) => (
            <div key={i} className="legend-item">
              <span className="legend-dot"
                style={{ background: colors[s.label] || "#888" }} />
              <span className="legend-label">{s.label}</span>
              <span className="legend-count">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Gemini Chatbot ─────────────────────────────────────────
function Chatbot() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm ToxCore Assistant 👋\n\nI'm here to:\n• 💙 Support you if you've experienced cyberbullying\n• 📋 Help you file a report\n• 🛡️ Answer questions about online safety\n\nHow can I help you today?"
    }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role:    m.role === "assistant" ? "model" : "user",
        content: m.content
      }));
      const res = await axios.post("http://localhost:8000/chat", {
        message: userMsg,
        history
      });
      setMessages(prev => [...prev, {
        role: "assistant", content: res.data.reply
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again!"
      }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button className="chat-fab" onClick={() => setOpen(o => !o)}>
        {open ? "✕" : "💬"}
        {!open && <span className="chat-fab-label">Need Help?</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div>
                <p className="chat-title">ToxCore Assistant</p>
                <p className="chat-subtitle">Powered by Gemini AI</p>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i}
                className={`chat-bubble ${m.role === "user" ? "user" : "bot"}`}>
                {m.content.split("\n").map((line, j) => (
                  <span key={j}>{line}<br /></span>
                ))}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot">
                <span className="typing-dots">
                  <span /><span /><span />
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="quick-replies">
            {[
              "I was cyberbullied 😢",
              "How do I file a report?",
              "I need someone to talk to",
              "How to block someone?",
            ].map((q, i) => (
              <button key={i} className="quick-btn"
                onClick={() => { setInput(q); }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <button className="chat-send" onClick={send} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${color || ""}`}>{value}</p>
      <p className="stat-sub">{sub}</p>
    </div>
  );
}

// ── Comment Card ───────────────────────────────────────────
function CommentCard({ comment }) {
  const toxic    = comment.is_toxic;
  const tagColor = "#f87171";

  return (
    <div className={`comment-card ${toxic ? "toxic" : ""}`}>
      <div className="comment-header">
        <div className="comment-user">
          <div className="avatar" />
          <div>
            <p className="username">{comment.author}</p>
            <p className="likes">👍 {comment.likes} likes</p>
          </div>
        </div>
        <span className="badge-tag"
          style={toxic
            ? { background: tagColor + "33", color: tagColor,
                border: `1px solid ${tagColor}` }
            : { background: "#14532d", color: "#4ade80",
                border: "1px solid #4ade80" }}>
          {toxic ? `⚠️ TOXIC ${comment.score}%` : `✅ SAFE`}
        </span>
      </div>
      <p className="comment-text">{comment.text}</p>
      {toxic && comment.reason && (
        <p className="reason"><strong>Reason: </strong>{comment.reason}</p>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────
export default function App() {
  const [url,     setUrl]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error,   setError]   = useState("");
>>>>>>> 5e6fcd0 (Updated backend and frontend)

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await axios.post("http://localhost:8000/analyze", { url });
      setResults(res.data);
    } catch {
      setError("Something went wrong. Make sure the backend is running!");
    }
    setLoading(false);
  };

  const handleOpenChat = (commentText) => {
    setActiveComment(commentText);
    setChatOpen(true);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <span className="badge">CYBERBULLYING DETECTION AI</span>
        <h1 className="title">ToxCore</h1>
        <p className="subtitle">
          Protect your community. Analyze YouTube comments in
          real-time with state-of-the-art machine learning.
        </p>
      </div>

      {/* Input */}
      <div className="input-row">
        <input className="url-input"
          placeholder="Paste YouTube Video URL..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && analyze()}
        />
        <button className="detect-btn" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Detect Toxicity"}
        </button>
      </div>

      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <p>AI is analyzing comments... please wait ⏳</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">

=======
          <p className="results-label">ANALYSIS RESULTS FOR:</p>
          <h2 className="results-title">{results.video_title}</h2>

>>>>>>> 5e6fcd0 (Updated backend and frontend)
          <div className="stats-row">
            <StatCard label="ANALYZED"
              value={results.total}           sub="Total Comments" />
            <StatCard label="HARMFUL"
              value={results.harmful}         sub="Detected Threats" color="red" />
            <StatCard label="INTENSITY"
              value={results.intensity + "%"} sub="Toxicity Ratio"   color="red" />
          </div>


=======
          {results.type_counts && <PieChart data={results.type_counts} />}

>>>>>>> 5e6fcd0 (Updated backend and frontend)
          <div className="main-grid">
            <div className="comments-section">
              <h3>Detailed Analysis</h3>
              {results.comments.map((c, i) => (
                <CommentCard key={i} comment={c} onOpenChat={handleOpenChat} />
              ))}
            </div>

            <div className="resources-section">
              <h3>🇮🇳 Indian Resources</h3>
              {[
                { name: "Cybercrime.gov.in",
                  desc: "Report cyberbullying to Indian government portal.",
                  url:  "https://cybercrime.gov.in" },
                { name: "iCall — TISS Helpline",
                  desc: "Free counselling. Call 9152987821.",
                  url:  "https://icallhelpline.org" },
                { name: "Vandrevala Foundation",
                  desc: "24/7 mental health support. Call 1860-2662-345.",
                  url:  "https://www.vandrevalafoundation.com" },
                { name: "CHILDLINE — 1098",
                  desc: "Free 24/7 helpline for children in distress.",
                  url:  "https://www.childlineindia.org" },
                { name: "iDream Cyber Safety",
                  desc: "Digital safety resources for Indian students.",
                  url:  "https://idream.org.in" },
              ].map((r, i) => (
                <a key={i} href={r.url} target="_blank"
                  rel="noreferrer" className="resource-card">
                  <div>
                    <p className="resource-name">{r.name}</p>
                    <p className="resource-desc">{r.desc}</p>
                  </div>
                  <span>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Your Part: The AI First Aid Chat Sidebar Widget */}
      {chatOpen && (
        <AIChatWidget 
          commentText={activeComment} 
          onClose={() => setChatOpen(false)} 
        />
      )}

      <footer>© 2026 ToxCore • Built with ❤️ for a safer internet</footer>

      {/* Gemini Chatbot */}
      <Chatbot />
    </div>
  );

=======
>>>>>>> 5e6fcd0 (Updated backend and frontend)
}