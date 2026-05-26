# ToxCore

## Project Overview
**ToxCore** is an AI-powered online toxicity detection and support platform. It analyzes user-submitted text comments for harmful content and provides an intelligent chatbot assistant to help users understand toxicity and stay safe online.

---

## Key Features

###  Toxicity Analysis Engine
* Classifies comments across 6 categories: *toxicity, severe toxicity, obscene, threat, insult, and identity attack*.
* Returns per-category confidence scores with a `0.5` threshold for flagging.
* Provides human-readable reasons explaining why content was flagged.

###  ToxCore AI Chatbot
* Floating chat widget embedded in the UI.
* Conversational assistant powered by an LLM, with full message history context.
* Helps users understand toxicity concepts and online safety.

###  Real-time Results
* Instant feedback with toxicity scores, top category, and a clean/harmful verdict.
* Smooth, responsive UI with loading animations and auto-scroll.

---

##  Tech Stack

* **ML Model:** `unitary/toxic-bert` (BERT fine-tuned on Jigsaw dataset)
* **ML Framework:** PyTorch + HuggingFace Transformers
* **LLM (Chatbot):** Google Gemini 2.5 Flash via `google-generativeai` SDK
* **Backend:** Python (FastAPI)
* **Frontend:** React (with Hooks), Tailwind CSS
* **Config:** `python-dotenv` for API key management
* **Compute:** CUDA GPU / CPU fallback
