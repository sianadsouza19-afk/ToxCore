import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [url, setUrl]         = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  
  // State to manage your AI First Aid Drawer
  const [chatOpen, setChatOpen] = useState(false);
  const [activeComment, setActiveComment] = useState("");

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
          <h2 className="results-title">
            ANALYSIS RESULTS FOR: <span>{results.video_title}</span>
          </h2>
          <div className="stats-row">
            <StatCard label="ANALYZED"  value={results.total}   sub="Total Comments"   />
            <StatCard label="HARMFUL"   value={results.harmful} sub="Detected Threats"  color="red" />
            <StatCard label="INTENSITY" value={results.intensity + "%"} sub="Toxicity Ratio" color="red" />
          </div>

          <div className="main-grid">
            <div className="comments-section">
              <h3>Detailed Analysis</h3>
              {results.comments.map((c, i) => (
                <CommentCard key={i} comment={c} onOpenChat={handleOpenChat} />
              ))}
            </div>

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

      {/* Your Part: The AI First Aid Chat Sidebar Widget */}
      {chatOpen && (
        <AIChatWidget 
          commentText={activeComment} 
          onClose={() => setChatOpen(false)} 
        />
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

function CommentCard({ comment, onOpenChat }) {
  const toxic = comment.is_toxic;
  const [reveal, setReveal] = useState(false);

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
      
      {/* Blurs comment text automatically if toxic unless clicked to reveal */}
      <p 
        className="comment-text" 
        style={{ 
          filter: (toxic && !reveal) ? "blur(5px)" : "none",
          transition: "filter 0.3s ease",
          cursor: toxic ? "pointer" : "default"
        }}
        onClick={() => toxic && setReveal(!reveal)}
        title={toxic ? "Click to toggle blur" : ""}
      >
        {comment.text}
      </p>

      {toxic && (
        <div className="toxic-actions">
          <p className="reason"><strong>Reason: </strong>{comment.reason}</p>
          <button 
            className="ai-chat-trigger-btn"
            onClick={() => onOpenChat(comment.text)}
          >
            🛡️ Seek First-Aid Support
          </button>
        </div>
      )}
    </div>
  );
}

/* YOUR ASSIGNED INTERFACE SOURCE COMPONENT */
function AIChatWidget({ commentText, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello. Take a deep, slow breath. 💜 I see you selected an aggressive comment. This is a 100% anonymous support chat. No records are kept. Remember: what they typed reflects who they are, not your value. How are you processing this?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/ai-chat", { message: input });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm right here with you, even if the connection dropped. Take a gentle breath." }]);
    }
    setLoading(false);
  };

  return (
    <div className="ai-chat-drawer">
      <div className="chat-drawer-header">
        <div>
          <h4>CyberShield Care</h4>
          <p className="status-indicator">● Anonymous Support Mode</p>
        </div>
        <button className="close-drawer-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="chat-drawer-body">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble-row ${m.sender === 'user' ? 'user' : 'ai'}`}>
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
        {loading && <p className="typing-indicator">CyberShield is writing safely...</p>}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-drawer-footer">
        <input 
          placeholder="Share your thoughts anonymously..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}