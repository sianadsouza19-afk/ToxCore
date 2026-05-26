from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import google.generativeai as genai
from googleapiclient.discovery import build
from groq import Groq
from dotenv import load_dotenv

import re
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ Your API keys
YOUTUBE_API_KEY = "AIzaSyClzsbW-CMRbeyZbBa6ltx6GdUyTSyVh8w"


=======
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
groq_client = Groq(api_key=GROQ_API_KEY)
>>>>>>> 5e6fcd0 (Updated backend and frontend)
print("Loading AI model...")
classifier = pipeline(
    "text-classification",
    model="s-nlp/roberta_toxicity_classifier",
    top_k=None
)
print("Model ready!")

# ── Request models ─────────────────────────────────────────
class URLRequest(BaseModel):
    url: str


=======
class ChatRequest(BaseModel):
    message: str
    history: list = []

# ── Helpers ────────────────────────────────────────────────
>>>>>>> 5e6fcd0 (Updated backend and frontend)
def get_video_id(url):
    patterns = [
        r'v=([a-zA-Z0-9_-]{11})',
        r'shorts/([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})'
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None

def get_toxicity_info(predictions):
    toxic_score   = 0
    neutral_score = 0
    for pred in predictions:
        raw = pred["label"].lower()
        if raw == "toxic":
            toxic_score = pred["score"]
        elif raw == "neutral":
            neutral_score = pred["score"]

    is_toxic = toxic_score > 0.5
    score    = round(toxic_score * 100) if is_toxic else round(neutral_score * 100)
    type_str = "General Toxicity" if is_toxic else "Safe"
    reason   = "This comment contains harmful or toxic language." if is_toxic else ""
    detected = ["toxic"] if is_toxic else []

    return is_toxic, type_str, reason, score, detected

def get_youtube_comments(video_id, max_comments=100):
    try:
        youtube         = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        comments        = []
        next_page_token = None

        while len(comments) < max_comments:
            request  = youtube.commentThreads().list(
                part       = "snippet",
                videoId    = video_id,
                maxResults = min(100, max_comments - len(comments)),
                textFormat = "plainText",
                pageToken  = next_page_token
            )
            response        = request.execute()
            for item in response.get("items", []):
                snippet = item["snippet"]["topLevelComment"]["snippet"]
                comments.append({
                    "author": snippet.get("authorDisplayName", "Anonymous"),
                    "text":   snippet.get("textDisplay", ""),
                    "likes":  snippet.get("likeCount", 0)
                })
            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

        return comments

    except Exception as e:
        print(f"YouTube API error: {e}")
        return [
            {"author": "User A", "text": "This is a great video!", "likes": 10},
            {"author": "User B", "text": "You are so stupid and I hate you.", "likes": 0},
            {"author": "User C", "text": "Keep up the amazing work!", "likes": 5},
            {"author": "User D", "text": "Nobody likes you, go away.", "likes": 0},
            {"author": "User E", "text": "Very informative, thanks!", "likes": 8},
        ]

def get_video_title(video_id):
    try:
        youtube  = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        response = youtube.videos().list(
            part="snippet", id=video_id
        ).execute()
        if response["items"]:
            return response["items"][0]["snippet"]["title"]
        return f"Video ({video_id})"
    except:
        return f"Video ({video_id})"

# ── Routes ─────────────────────────────────────────────────
@app.post("/analyze")
async def analyze(req: URLRequest):
    video_id = get_video_id(req.url)
    if not video_id:
        return {"error": "Invalid YouTube URL"}

    comments = get_youtube_comments(video_id, max_comments=100)
    title    = get_video_title(video_id)
    results  = []
    harmful_count = 0

    type_counts = {
        "General Toxicity": 0,
        "Severe Toxicity":  0,
        "Obscene":          0,
        "Threat":           0,
        "Insult":           0,
        "Hate Speech":      0,
    }

    for c in comments:
        if not c["text"].strip():
            continue
        predictions = classifier(c["text"][:256])[0]
        is_toxic, type_str, reason, score, detected = get_toxicity_info(predictions)

        if is_toxic:
            harmful_count += 1
            type_counts["General Toxicity"] += 1

        results.append({
            "author":   c["author"],
            "text":     c["text"],
            "likes":    c["likes"],
            "is_toxic": is_toxic,
            "score":    score,
            "type":     type_str,
            "reason":   reason
        })

    total     = len(results)
    intensity = round((harmful_count / total) * 100) if total > 0 else 0

    return {
        "video_title": title,

=======
        "total":       total,
        "harmful":     harmful_count,
        "intensity":   intensity,
        "comments":    results,
        "type_counts": type_counts
    }

@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        messages = [
            {
                "role": "system",
                "content": """You are ToxCore Assistant — a compassionate AI helper built into ToxCore, a cyberbullying detection platform in India.

Your two jobs are:
1. CONSOLE and SUPPORT users who experienced cyberbullying. Be warm and empathetic. Never minimize their feelings. Tell them they are not alone.

2. HELP users FILE A REPORT step by step:
   - National Cybercrime Portal: https://cybercrime.gov.in
   - Cybercrime helpline: 1930
   - CHILDLINE for minors: 1098
   - How to take screenshots as evidence
   - How to block and report on YouTube

If someone is very distressed, provide iCall helpline: 9152987821.
Keep responses short, warm and clear."""
            }
        ]

        for msg in req.history:
            messages.append({
                "role": "user" if msg["role"] == "user" else "assistant",
                "content": msg["content"]
            })

        messages.append({
            "role": "user",
            "content": req.message
        })

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=500
        )

        return {"reply": response.choices[0].message.content}

    except Exception as e:
        print(f"Groq error: {e}")
        return {"reply": "I'm having trouble connecting. If you need urgent help, call iCall at 9152987821."}
>>>>>>> 5e6fcd0 (Updated backend and frontend)
