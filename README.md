
# ToxCore 🛡️

**ToxCore** is an AI-powered cyberbullying and toxicity detection platform built for Indian users. It analyzes YouTube comments in real time, flags harmful content, and provides a compassionate support chatbot to help victims report abuse through the right channels.

---

## 📖 Description

ToxCore scans YouTube videos for toxic, harmful, or abusive comments using a fine-tuned NLP classifier. It gives creators and viewers a clear picture of the toxicity level in any video's comment section — and connects affected users with mental health resources and cybercrime reporting guidance through an integrated AI chat assistant.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A YouTube Data API v3 key
- A Groq API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/toxcore.git
cd toxcore

# 2. Set up the backend
cd backend
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your keys:
#   GROQ_API_KEY=your_groq_key_here
#   YOUTUBE_API_KEY=your_youtube_key_here

# 4. Start the FastAPI server
uvicorn main:app --reload

# 5. Set up the frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:8000`.

---

## ✨ Key Features

- **YouTube Comment Analysis** — Paste any YouTube URL and instantly scan up to 100 comments for toxic content using a RoBERTa-based classifier.
- **Toxicity Scoring** — Each comment receives a toxicity score and classification (Safe / General Toxicity), with an overall intensity percentage for the video.
- **Breakdown by Type** — Aggregated counts across toxicity categories including threats, insults, hate speech, and obscene language.
- **Support Chatbot** — An empathetic AI assistant (powered by LLaMA 3.3 via Groq) that consoles victims and walks them through filing a cybercrime report step by step.
- **Indian Legal Resources** — Built-in guidance for the National Cybercrime Portal (`cybercrime.gov.in`), helpline 1930, CHILDLINE 1098, and iCall 9152987821.
- **Evidence Guidance** — Instructions on how to screenshot, block, and report abusive content on YouTube.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Axios |
| Backend | FastAPI, Python |
| NLP Classifier | `s-nlp/roberta_toxicity_classifier` via HuggingFace Transformers |
| Chat LLM | LLaMA 3.3 70B via Groq API |
| YouTube Data | YouTube Data API v3 |
| Config | python-dotenv |

---

## 🌐 API Endpoints

**`POST /analyze`**
Accepts a YouTube URL and returns comment-level toxicity results plus aggregate stats.

```json
{ "url": "https://www.youtube.com/watch?v=example" }
```

**`POST /chat`**
Accepts a user message and conversation history, returns a support-focused AI reply.

```json
{ "message": "I was cyberbullied. What do I do?", "history": [] }
```

---

## 🆘 Crisis Resources (India)

| Resource | Contact |
|---|---|
| National Cybercrime Portal | cybercrime.gov.in |
| Cybercrime Helpline | 1930 |
| CHILDLINE (minors) | 1098 |
| iCall Mental Health | 9152987821 |

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.
