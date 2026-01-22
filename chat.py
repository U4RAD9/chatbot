import json, re

# -------------------------------
# Load Knowledge Base
# -------------------------------
KB = json.load(open("data/knowledge_base.json"))

# -------------------------------
# Helpers
# -------------------------------
def normalize(text):
    return re.sub(r"[^a-z0-9 ]", "", text.lower())

def safe_text(value):
    if isinstance(value, dict):
        return value.get("text", "")
    return str(value)

def callback_button():
    return "<br><span class='btn btn-response'>Request a call-back</span>"

def fallback_response():
    return (
        "❓ I don't understand your question.<br>"
        "<span class='btn btn-response'>Go Back</span>"
    )

# -------------------------------
# Intents
# -------------------------------
INTENTS = {
    "greeting": ["hi", "hello", "hey", "good morning", "good evening", "koi hai"],
    "safety": ["safe", "safety", "pregnant", "pregnancy", "radiation", "harmful"],
    "price": ["price", "cost", "charges", "fee", "how much"],
    "report": ["report", "result", "when", "how long", "time"],
    "process": ["how does", "how is", "procedure", "process"],
    "services": ["services", "tests", "do you provide"],
    "booking": ["book", "appointment", "schedule"],
    "payment": ["payment", "pay", "upi", "card", "cash"],
    "about": ["about you", "who are you", "company"],
    "info": ["what is", "explain", "tell me about"]
}

def detect_intent(text):
    for intent, keywords in INTENTS.items():
        for k in keywords:
            if k in text:
                return intent
    return "default"

def detect_service(text):
    for service, data in KB["services"].items():
        for k in data["keywords"]:
            if k in text:
                return service
    return None

# -------------------------------
# Main Chat Logic
# -------------------------------
def get_response(msg):
    text = normalize(msg)
    intent = detect_intent(text)
    service = detect_service(text)

    # 1️⃣ Greeting
    if intent == "greeting":
        return (
            "Hello! 👋 How can I help you today?<br>"
            "You can ask about X-Ray, ECG, PFT, Holter, price, report or booking."
            + callback_button()
        )

    # 2️⃣ General intents (no service needed)
    if intent in ["services", "payment", "booking", "about"]:
        value = KB["general"].get(intent)
        return safe_text(value) if value else fallback_response()

    # 3️⃣ Service-based handling
    if service:
        data = KB["services"][service]

        if intent == "safety":
            return safe_text(KB["general"].get("pregnancy_safety"))

        if intent == "price":
            return safe_text(data.get("price")) + callback_button()

        if intent == "report":
            return safe_text(data.get("report")) + callback_button()

        if intent in ["process", "info"]:
            return safe_text(data.get("info")) + callback_button()

        # ✅ VERY IMPORTANT FIX:
        # Plain service name like "ecg", "xray", "pft"
        return safe_text(data.get("info")) + callback_button()

    # 4️⃣ Final strict fallback
    return fallback_response()


# import json, os, re

# KB = json.load(open("data/knowledge_base.json"))

# def normalize(text):
#     return re.sub(r"[^a-z0-9 ]", "", text.lower())
# INTENTS = {
#     "safety": [
#         "safe", "safety", "pregnant", "pregnancy",
#         "radiation", "harmful", "danger"
#     ],
#     "greeting": [
#         "hi", "hello", "hey", "good morning", "good evening", "koi hai"
#     ],
#     "about": [
#         "about you", "who are you", "company"
#     ],
#     "price": [
#         "price", "cost", "charges", "fee"
#     ],
#     "report": [
#         "report", "result", "when", "how long", "time"
#     ],
#     "process": [
#         "how does", "how is", "procedure", "process"
#     ],
#     "services": [
#         "services", "tests", "do you provide"
#     ],
#     "booking": [
#         "book", "appointment", "schedule"
#     ],
#     "payment": [
#         "payment", "pay", "upi", "card", "cash"
#     ],
#     "about": [
#         "about you", "who are you", "company"
#     ],
#     "info": [
#         "what is", "explain", "tell me about"
#     ]
# }


# # def get_response(msg):
# #     text = normalize(msg)

# #     for service, data in KB["services"].items():
# #         if any(k in text for k in data["keywords"]):

# #             if any(w in text for w in ["price", "cost", "charge"]):
# #                 return data["price"]

# #             if any(w in text for w in ["report", "result", "time"]):
# #                 return data["report"]

# #             return (
# #                 f"{data['info']}<br>"
# #                 f"<b>Price:</b> {data['price']}<br>"
# #                 f"<b>Report:</b> {data['report']}<br>"
# #                 "<span class='btn btn-response'>Request a call-back</span>"
# #             )

# #     return (
# #         "Please select a service:<br>"
# #         "<span class='btn btn-response'>X-Ray</span> "
# #         "<span class='btn btn-response'>ECG</span> "
# #         "<span class='btn btn-response'>PFT</span> "
# #         "<span class='btn btn-response'>Holter</span>"
# #     )
# def get_response(msg):
#     text = normalize(msg)
#     intent = detect_intent(text)

#     # -------------------------------
#     # 1️⃣ GREETING
#     # -------------------------------
#     if intent == "greeting":
#         return (
#             "Hello! 👋 How can I help you today?<br>"
#             "You can ask about X-Ray, ECG, PFT, Holter, pricing, reports, or booking."
#             + callback_button()
#         )

#     # -------------------------------
#     # 2️⃣ GENERAL (NO SERVICE NEEDED)
#     # -------------------------------
#     if intent == "services":
#         return KB["general"]["services_at_home"] + callback_button()

#     if intent == "payment":
#         return KB["general"]["payment_modes"] + callback_button()

#     if intent == "booking":
#         return KB["general"]["booking"] + callback_button()

#     if intent == "about":
#         return KB["general"]["about"] + callback_button()

#     # -------------------------------
#     # 3️⃣ SERVICE-BASED QUESTIONS
#     # -------------------------------
#     for service, data in KB["services"].items():
#         if any(k in text for k in data["keywords"]):

#             if intent == "safety":
#                 return KB["general"]["pregnancy_safety"]

#             if intent == "price":
#                 return data["price"] + callback_button()

#             if intent == "report":
#                 return data["report"] + callback_button()

#             if intent == "process":
#                 return data["info"] + callback_button()

#             if intent == "info":
#                 return data["info"] + callback_button()

#             # Known service but unclear intent
#             return (
#                 data["info"]
#                 + "<br><b>Price:</b> " + data["price"]
#                 + "<br><b>Report:</b> " + data["report"]
#                 + callback_button()
#             )

#     # -------------------------------
#     # 4️⃣ FINAL FALLBACK
#     # -------------------------------
#     return (
#         KB["general"]["fallback"]
#         + "<br>"
#         "<span class='btn btn-response'>X-Ray</span> "
#         "<span class='btn btn-response'>ECG</span> "
#         "<span class='btn btn-response'>PFT</span> "
#         "<span class='btn btn-response'>Holter</span>"
#     )

# def callback_button():
#     return "<br><span class='btn btn-response'>Request a call-back</span>"

# def detect_intent(text):
#     for intent, keywords in INTENTS.items():
#         if any(k in text for k in keywords):
#             return intent
#     return "default"
