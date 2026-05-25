from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import google.generativeai as genai
from googleapiclient.discovery import build
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ Paste your API key below
YOUTUBE_API_KEY = "AIzaSyClzsbW-CMRbeyZbBa6ltx6GdUyTSyVh8w"

GEMINI_API_KEY = "AIzaSyBLq8GlVTX5GoFWGt2HOgYJP6jWLxqHw40"
genai.configure(api_key=GEMINI_API_KEY)

print("Loading AI model...")
classifier = pipeline("text-classification",
    model="unitary/toxic-bert",
    top_k=None)
print("Model ready!")

class URLRequest(BaseModel):
    url: str

class AIChatRequest(BaseModel):
    message: str

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

def get_youtube_comments(video_id):
    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=20,
            textFormat="plainText"
        )
        response = request.execute()
        comments = []
        for item in response.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            comments.append({
                "author": snippet.get("authorDisplayName", "Anonymous"),
                "text": snippet.get("textDisplay", ""),
                "likes": snippet.get("likeCount", 0)
            })
        return comments
    except Exception as e:
        print(f"YouTube API error: {e}")
        # Fallback to mock if API fails
        return [
            {"author": "User A", "text": "This is a great video!", "likes": 10},
            {"author": "User B", "text": "You are so stupid and I hate you.", "likes": 0},
            {"author": "User C", "text": "Keep up the amazing work!", "likes": 5},
        ]

def get_video_title(video_id):
    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        request = youtube.videos().list(
            part="snippet",
            id=video_id
        )
        response = request.execute()
        if response["items"]:
            return response["items"][0]["snippet"]["title"]
        return f"Video ({video_id})"
    except:
        return f"Video ({video_id})"

@app.post("/analyze")
async def analyze(req: URLRequest):
    video_id = get_video_id(req.url)
    if not video_id:
        return {"error": "Invalid YouTube URL"}

    comments = get_youtube_comments(video_id)
    title = get_video_title(video_id)
    results = []
    harmful_count = 0

    for c in comments:
        if not c["text"].strip():
            continue

        predictions = classifier(c["text"][:512])[0]

        toxic_score = 0
        for pred in predictions:
            if pred["label"] == "toxic":
                toxic_score = pred["score"]
                break

        is_toxic = toxic_score > 0.5
        score = round(toxic_score * 100)

        if is_toxic:
            harmful_count += 1
            reason = "This comment contains language that is rude or disrespectful."
        else:
            reason = ""

        results.append({
            "author": c["author"],
            "text": c["text"],
            "likes": c["likes"],
            "is_toxic": is_toxic,
            "score": score,
            "reason": reason
        })

    total = len(results)
    intensity = round((harmful_count / total) * 100) if total > 0 else 0

    return {
        "video_title": title,
        "total": total,
        "harmful": harmful_count,
        "intensity": intensity,
        "comments": results
    }

@app.post("/ai-chat")
async def ai_chat(req: AIChatRequest):
    try:
        system_instruction = (
            "You are 'CyberShield Support,' an anonymous, highly empathetic emotional first-aid AI companion. "
            "Your sole job is to support a user who has encountered severe digital cyberbullying or threats on YouTube. "
            "RULES: Keep responses concise and validating. Use warm, comforting, jargon-free statements. "
            "Remind them that they are safe and anonymous. Avoid jumping into legal instructions right away; focus on calming their stress."
        )

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=system_instruction
        )

        response = model.generate_content(req.message)
        return {"reply": response.text}

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {"reply": "I'm right here with you. Take a slow, regular breath. Let's try typing that out once more."}
    
    