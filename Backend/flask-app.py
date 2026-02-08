from flask import Flask, render_template, request, redirect
import requests
import os
from dotenv import load_dotenv
from google import genai
import chromadb
from sentence_transformers import SentenceTransformer
import time

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
embedding_model.encode("Warm-up embedding")  # forces model download and load

# create a Chroma client
chroma_client = chromadb.Client()
# create a collection
education_collection = chroma_client.get_or_create_collection(
    name="education_memory"
)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)

PROFILES_ENDPOINT = os.getenv("PROFILES_SHEETY_ENDPOINT")
TRADES_ENDPOINT = os.getenv("PAST_TRADES_SHEETY_ENDPOINT")
SHEETY_TOKEN = os.getenv("SHEETY_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {SHEETY_TOKEN}",
    "Content-Type": "application/json"
}

def create_profile(form_data):
    payload = {
        "profiling": {
            "name": form_data.get("name", ""),
            "tradingLevel": form_data.get("tradingLevel", ""),
            "learningStyle": form_data.get("learningStyle", ""),
            "riskTolerance": form_data.get("riskTolerance", ""),
            "preferredMarkets": form_data.get("preferredMarkets", ""),
            "tradingFrequency": form_data.get("tradingFrequency", "")
        }
    }
    response = requests.post(PROFILES_ENDPOINT, json=payload, headers=HEADERS)
    if response.status_code not in [200, 201]:
        raise Exception(f"Failed to create profile: {response.text}")
    profile_id = response.json().get("profiling", {}).get("id")
    if not profile_id:
        raise Exception(f"Profile ID not found in response: {response.json()}")
    return profile_id, response.json()

def post_trade(form_data, profile_id):
    # Extract all past trade fields
    stock_code = form_data.get("stock_code")
    stock_name = form_data.get("stock_name")
    action = form_data.get("action")
    units = form_data.get("units")
    price = form_data.get("price")
    intraday = form_data.get("intraday")
    date = form_data.get("date")

    # Check if all fields are empty → skip posting
    if not any([stock_code, stock_name, action, units, price, intraday, date]):
        print("No past trade data submitted; skipping trade post.")
        return None

    payload = {
        "pasttrade": {
            "profileId": profile_id,
            "date": date or "",
            "stockCode": stock_code or "",
            "stockName": stock_name or "",
            "action": action or "",
            "units": units or "",
            "price": price or "",
            "intraday": intraday or ""
        }
    }
    print("Posting trade:", payload["pasttrade"])  # Debug
    response = requests.post(TRADES_ENDPOINT, json=payload, headers=HEADERS)
    if response.status_code not in [200, 201]:
        print("Failed to post trade:", response.text)
        return None
    return response.json()

def generate_personalized_education(profile_data):
    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = (
        f"User Profile:\n"
        f"- Name: {profile_data.get('name')}\n"
        f"- Trading Level: {profile_data.get('tradingLevel')}\n"
        f"- Learning Style: {profile_data.get('learningStyle')}\n"
        f"- Risk Tolerance: {profile_data.get('riskTolerance')}\n"
        f"- Preferred Markets: {profile_data.get('preferredMarkets')}\n"
        f"- Trading Frequency: {profile_data.get('tradingFrequency')}\n\n"
        "Task: Create a short personalized trading education module for this user. "
        "Focus on lessons, exercises, or concepts that match their profile. "
        "Structure it clearly and make it actionable. Do not give generic trading tips."
    ) # lessons, exercise, content, etc

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text
        except Exception as e:
            print("LLM request failed, retrying...", e)
            time.sleep(2)
    return "Sorry, the education content is temporarily unavailable. Try again later."

def format_education_plain(raw_text):
    """
    Converts Gemini output into simple HTML:
    - Headers, bold, italic
    - Lists
    - Exercises highlighted
    - Everything expanded, no collapsible sections
    """
    import re

    html = raw_text

    # Exercises
    html = re.sub(r'### Exercise \d+: (.+)', r'<div class="exercise"><strong>Exercise:</strong> \1</div>', html)

    # Headings
    html = re.sub(r'### (.+)', r'<h3>\1</h3>', html)
    html = re.sub(r'## (.+)', r'<h2>\1</h2>', html)
    html = re.sub(r'# (.+)', r'<h1>\1</h1>', html)

    # Bold / italic
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

    # Unordered lists
    html = re.sub(r'^\* (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.+</li>)', r'<ul>\1</ul>', html, flags=re.DOTALL)
    html = re.sub(r'</ul>\s*<ul>', '', html)

    # Line breaks
    html = html.replace('\n', '<br>')

    return html

def store_education_memory(profile_id, profile_data, education_text):
    embedding = embedding_model.encode(education_text).tolist()

    metadata = {
        "profile_id": profile_id,
        "tradingLevel": profile_data.get("tradingLevel"),
        "riskTolerance": profile_data.get("riskTolerance"),
        "preferredMarkets": profile_data.get("preferredMarkets"),
    }

    education_collection.add(
        documents=[education_text],
        embeddings=[embedding],
        metadatas=[metadata],
        ids=[f"{profile_id}_{abs(hash(education_text))}"]
    )

def retrieve_user_memory(profile_id, current_trading_level=None, n_results=3):
    """
    Retrieve past lessons from ChromaDB for this user.
    Optionally filter by tradingLevel in Python (after query).
    """
    results = education_collection.query(
        query_texts=[""],  # empty query; just retrieve by metadata
        n_results=n_results,
        where={"profile_id": profile_id}
    )

    # SAFE access to documents & metadatas
    docs = results.get("documents") or [[]]
    metadatas = results.get("metadatas") or [[]]

    docs = docs[0] if docs else []
    metadatas = metadatas[0] if metadatas else []

    if current_trading_level:
        filtered_docs = [
            doc for doc, meta in zip(docs, metadatas)
            if meta.get("tradingLevel") == current_trading_level
        ]
        return filtered_docs[:n_results]

    return docs

def trigger_n8n(profile_id, profile_data, education_text):
    N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
    if not N8N_WEBHOOK_URL:
        print("No N8N_WEBHOOK_URL set")
        return

    payload = {
        "profile_id": profile_id,
        "tradingLevel": profile_data.get("tradingLevel"),
        "riskTolerance": profile_data.get("riskTolerance"),
        "education_summary": education_text[:500]
    }

    print("Triggering n8n with payload:", payload)
    print("Webhook URL:", N8N_WEBHOOK_URL)

    try:
        r = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=3)
        print("n8n response:", r.status_code, r.text)
    except Exception as e:
        print("n8n trigger failed:", e)


@app.route("/", methods=["GET", "POST"])
def index():
    education = None

    if request.method == "POST":
        form = request.form

        try:
            # Use name as temporary user ID (hackathon MVP)
            profile_id = f"name_{form.get('name', '').strip().lower().replace(' ', '_')}"

            # Still create profile in Google Sheet for system of record
            profile_id_sheet, profile_resp = create_profile(form)

            trade_resp = post_trade(form, profile_id_sheet)  # keep system of record using Google Sheet ID

            raw_education = generate_personalized_education(form)

            # Store education memory
            store_education_memory(profile_id, form, raw_education)  # memory keyed to normalized name

            # Trigger n8n webhook
            trigger_n8n(profile_id, form, raw_education)

            # TEST: retrieve past memory for this user
            past_memory = retrieve_user_memory(profile_id, form.get("tradingLevel"))
            print("Past memory for user:", past_memory)

            # Format for display
            education = format_education_plain(raw_education)

        except Exception as e:
            return str(e)

    return render_template("index.html", education=education)

if __name__ == "__main__":
    app.run(debug=True)
