# 🏛️ AI Citizen Services Portal  
### Powered by Google Gemini

![AI Citizen Services Portal Demo](assets/demo.png)

An **AI-powered citizen services web platform** that helps users understand government services, forms, and procedures using **conversational AI**.

Inspired by **Estonia’s e-Governance model**, this project demonstrates how **Gemini** can act as an intelligent digital assistant for public services.

---

## 🚀 Project Overview

Citizens often struggle with:
- Complex government forms  
- Unclear documentation requirements  
- Lack of proper guidance  

**AI Citizen Services Portal** simplifies this by using **Gemini AI** to provide:
- Clear explanations  
- Conversational guidance  
- Smart query handling  

**Theme:** Open Innovation – Leverage the Power of AI

---

## ✨ Key Features

### 🤖 AI Citizen Assistant
- Ask questions like:
  > *How can I apply for a scholarship?*
- Gemini responds in **simple, citizen-friendly language**
- No legal or technical jargon

---

### 📝 AI Form & Service Explainer
- Paste text from any government form
- AI explains:
  - Purpose of the form  
  - Required documents  
  - Deadlines  
  - Common mistakes  

---

### 🧠 Smart Query Classification
- Automatically categorizes citizen queries by:
  - Department (Education, Health, Finance, etc.)
  - Priority (Low / Medium / High)

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | Next.js (React) |
| Backend | Node.js + Express |
| AI Model | Google Gemini API |
| Styling | CSS / Inline styles |
| Environment | dotenv |

---

## 🧩 System Architecture

User
↓
Next.js Frontend (localhost:3000)
↓
Express Backend (localhost:5000)
↓
Google Gemini API

---

## ⚙️ Setup Instructions

## 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/ai-citizen-services-portal.git
cd ai-citizen-services-portal
```

2️⃣ Backend Setup
npm install


Create .env inside backend/:

GEMINI_API_KEY=your_gemini_api_key_here


Run backend:

npm start

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Open:

http://localhost:3000

🧪 Example API
POST /chat
{
  "message": "How can I apply for a scholarship?"
}

Response
{
  "reply": "To apply for a scholarship, you need to..."
}

🔐 Responsible AI

No legal advice

AI assists humans, not replaces decisions

API keys secured via .env

🌍 Inspiration

Estonia’s AI-driven digital government

Smart governance & open innovation initiatives

👤 Author

Yashasvi
AI & Full Stack Developer

⭐ If you like this project, give it a star!


---

## ✅ STEP 3: Commit & Push

```bash
git add README.md assets/demo.png
git commit -m "Add README with project image"
git push





