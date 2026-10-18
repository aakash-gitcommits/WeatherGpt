# WeatherGPT 🌦️

**WeatherGPT** is a conversational weather assistant designed to make
weather information easier to understand and act on. It combines a
weather-focused interface with AI-powered responses and **TinyFish
Search + Fetch** to retrieve relevant live web information when a
question needs up-to-date research.

> **Project status:** Prototype / hackathon project. Verify current
> weather conditions and safety-critical advisories with the relevant
> official authority before acting on them.

## ✨ Features

-   **Conversational weather assistant** for asking weather-related
    questions in natural language.
-   **AI-generated explanations and guidance** powered by Gemini.
-   **Live web research with TinyFish**: Search discovers relevant web
    results and Fetch retrieves webpage content for context.
-   **Source cards** displayed below researched answers, including
    source titles and snippets.
-   **Weather-focused experience** intended to help users understand
    conditions, forecasts, and advisories.
-   **Responsive web interface** built with React and TypeScript.

Only describe additional features---such as voice interaction,
multilingual support, maps, AQI, or alerts---as available if they are
implemented and working in the submitted build.

## 🧰 Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Backend:** Node.js, Express (`server.ts`)
-   **AI:** Google Gemini
-   **Web research:** TinyFish Search API and Fetch API
-   **Database:** MongoDB, where configured by the project

## 🔎 How TinyFish Works

1.  A user submits a question in the WeatherGPT chat.
2.  The backend determines whether live web research is useful for the
    question.
3.  When research is needed, TinyFish Search finds relevant web results.
4.  TinyFish Fetch retrieves webpage content for selected results.
5.  The retrieved context is supplied to the AI to help formulate an
    answer.
6.  WeatherGPT returns the answer and displays the available source
    cards.

Search results and retrieved pages can vary. A source appearing in the
interface does not by itself prove that every statement in an AI
response is correct. For severe weather and safety-related questions,
prefer official meteorological and government sources.

## 🏗️ High-Level Architecture

``` text
User
 |
 v
React + TypeScript frontend
 |
 v
Express backend (server.ts)
 |
 +----> TinyFish Search ----> TinyFish Fetch
 |                               |
 |                               v
 |                        Retrieved web context
 |                               |
 +-------------------------------+
 |
 v
Gemini generates an answer using the available context
 |
 v
Answer + source cards shown in WeatherGPT
```

## 🚀 Getting Started

### Prerequisites

-   Node.js and npm installed
-   A Google Gemini API key
-   A TinyFish API key for live web research
-   MongoDB connection details only if the current project configuration
    requires MongoDB

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your repository URL and the directory
created by Git.

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root, following the variable names
expected by your current backend. For example:

``` env
GEMINI_API_KEY=your_gemini_api_key
TINYFISH_API_KEY=your_tinyfish_api_key
MONGODB_URI=your_mongodb_connection_string
```

Use only the variables that the project actually reads. If the code uses
a different Gemini variable name, keep that existing name. MongoDB
configuration is required only if enabled in the current build.

**Security notes** - Never commit `.env` or real API keys to GitHub. -
Keep API keys on the server; do not expose them in frontend code. -
Commit a `.env.example` containing placeholder values, not secrets. - If
a key has been exposed publicly, revoke it and generate a replacement.

### 4. Run the project

Use the scripts defined in `package.json`. In a typical Vite/Node
development setup, the commands may be:

``` bash
npm run dev
```

If the frontend and backend use separate scripts or terminals in your
repository, follow the exact scripts documented in `package.json`. Do
not assume a single command starts both services unless that is how the
project is configured.

### 5. Test TinyFish integration

If these routes are present in your current backend, test them while the
server is running:

-   `GET /api/tinyfish/health` --- checks the TinyFish Search
    integration.
-   `POST /api/tinyfish/fetch` --- tests fetching webpage content.
-   `POST /api/ask` --- asks WeatherGPT a question and may return
    research metadata such as `sources` and `researchUsed`.

For a research test, try a question such as:

> What are the latest official weather advisories for Delhi?

Confirm that the response includes relevant sources. Verify the
underlying advisory directly with the official meteorological authority
before relying on it.

## 📁 Project Structure

The project includes the following key files/components (exact folders
may vary):

``` text
.
├── server.ts                       # Express backend and API routes
├── src/
│   ├── components/
│   │   └── AIChat/
│   │       └── AIChat.tsx          # Chat interface and source cards
│   ├── services/
│   │   └── aiService.ts            # Frontend AI API service
│   └── types/
│       └── weather.ts              # Shared TypeScript types
├── .env.example                    # Placeholder environment configuration
├── .gitignore
├── package.json
└── README.md
```

Update this tree if your actual repository has a different structure.

## 🛡️ Reliability and Safety

-   Prefer official meteorological sources for warnings and advisories.
-   Treat retrieved webpage content as external information that may be
    incomplete, outdated, or inaccurate.
-   Display sources so users can inspect the underlying pages.
-   Avoid presenting an absence of warnings as certain unless it is
    supported by a current, reliable source.
-   Do not commit credentials, user data, or private configuration
    files.

## 🧪 Demo Checklist

Before recording a demo or submitting the project:

-   [ ] Frontend and backend start successfully.
-   [ ] A normal weather question receives an answer.
-   [ ] A live-research question triggers TinyFish when expected.
-   [ ] Source cards display relevant titles and open valid HTTPS/HTTP
    URLs.
-   [ ] Missing API keys or an upstream API failure do not crash the
    app.
-   [ ] No API keys or secrets are present in the public repository.
-   [ ] README setup instructions match the actual `package.json`
    scripts and environment variable names.

## 🌱 Future Scope

-   Improve prioritisation of official meteorological sources.
-   Display source timestamps and clearer freshness indicators.
-   Add stronger validation and fallback behaviour for failed or
    irrelevant research.
-   Expand accessibility and multilingual support where appropriate.
-   Evaluate answer accuracy against a set of real weather questions.

## 👥 Team and Links

-   **Project:** WeatherGPT
-   **Hackathon:** AZINHACK 2026
-   **Repository:** `<YOUR_GITHUB_REPOSITORY_URL>`{=html}
-   **Demo video:** `<ADD_DEMO_VIDEO_URL>`{=html}
-   **Public project post:** `<ADD_SOCIAL_POST_URL>`{=html}

Replace the placeholders before submitting.

## 📄 License

Add the license selected by your team before presenting this project as
open source. If no license is included, do not assume others have
permission to reuse the code.

