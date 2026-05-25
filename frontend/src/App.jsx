import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [url, setUrl]         = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await axios.post("http://localhost:8000/analyze", { url });
      setResults(res.data);
    } catch (e) {
      setError("Something went wrong. Make sure the backend is running!");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <span className="badge">CYBERBULLYING DETECTION AI</span>
        <h1 className="title">ToxCore</h1>
        <p className="subtitle">
          Protect your community. Analyze YouTube comments in real-time
          with state-of-the-art machine learning.
        </p>
      </div>

      {/* Input */}
      <div className="input-row">
        <input
          className="url-input"
          placeholder="Paste YouTube Video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
        />
        <button className="detect-btn" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Detect Toxicity"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Results */}
      {results && (
        <div className="results">
          {/* Stats Row */}
          <h2 className="results-title">
            ANALYSIS RESULTS FOR: <span>{results.video_title}</span>
          </h2>
          <div className="stats-row">
            <StatCard label="ANALYZED"  value={results.total}   sub="Total Comments"   />
            <StatCard label="HARMFUL"   value={results.harmful} sub="Detected Threats"  color="red" />
            <StatCard label="INTENSITY" value={results.intensity + "%"} sub="Toxicity Ratio" color="red" />
          </div>

          {/* Main content */}
          <div className="main-grid">
            {/* Comments */}
            <div className="comments-section">
              <h3>Detailed Analysis</h3>
              {results.comments.map((c, i) => (
                <CommentCard key={i} comment={c} />
              ))}
            </div>

            {/* Resources */}
            <div className="resources-section">
              <h3>Resources</h3>
              {[
                { name: "StopBullying.gov",       desc: "Recognize, prevent, and respond to bullying.", url: "https://www.stopbullying.gov" },
                { name: "Cybersmile Foundation",  desc: "Cyberbullying help and support.",              url: "https://www.cybersmile.org" },
                { name: "Crisis Text Line",        desc: "Text HOME to 741741 for free support.",        url: "https://www.crisistextline.org" },
              ].map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" className="resource-card">
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

      <footer>© 2026 ToxCore • Built with ❤️ for a safer internet</footer>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${color || ""}`}>{value}</p>
      <p className="stat-sub">{sub}</p>
    </div>
  );
}

function CommentCard({ comment }) {
  const toxic = comment.is_toxic;
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
        <span className={`badge-tag ${toxic ? "toxicity" : "safe"}`}>
          {toxic ? `TOXICITY ${comment.score}%` : `SAFE ${comment.score}%`}
        </span>
      </div>
      <p className="comment-text">{comment.text}</p>
      {toxic && <p className="reason"><strong>Reason: </strong>{comment.reason}</p>}
    </div>
  );
}
