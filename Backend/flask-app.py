# flask_app.py
from flask import Flask, render_template, request, redirect
import requests
import os
from dotenv import load_dotenv
from google import genai


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
    stock_code = form_data.get("stock_code")
    stock_name = form_data.get("stock_name")
    if not stock_code and not stock_name:
        return None  # No trade data to post

    payload = {
        "pasttrade": {
            "profileId": profile_id,
            "date": form_data.get("date", ""),
            "stockCode": stock_code or "",
            "stockName": stock_name or "",
            "action": form_data.get("action", ""),
            "units": form_data.get("units", ""),
            "price": form_data.get("price", ""),
            "intraday": form_data.get("intraday", "")
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
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt,
    )

    return response.text

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


@app.route("/", methods=["GET", "POST"])
def index():
    education = None
    if request.method == "POST":
        form = request.form
        try:
            profile_id, profile_resp = create_profile(form)
            trade_resp = post_trade(form, profile_id)

            raw_education = generate_personalized_education(form)

            # Format before sending to template
            education = format_education_plain(raw_education)

        except Exception as e:
            return str(e)

    return render_template("index.html", education=education)


# @app.route("/", methods=["GET", "POST"])
# def index():
#     if request.method == "POST":
#         form = request.form
#         try:
#             profile_id, profile_resp = create_profile(form)
#             print("Profile created:", profile_resp)

#             trade_resp = post_trade(form, profile_id)
#             if trade_resp:
#                 print("Trade posted:", trade_resp)
#         except Exception as e:
#             return str(e)

#         return redirect("/")

#     return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
