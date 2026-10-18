# WeatherGPT 🌦️

Weather is something we check every day, but getting a clear answer can
mean switching between forecasts, weather websites, and advisory pages.
**WeatherGPT** is a conversational weather project that brings
weather-related questions and AI-assisted explanations into one place.

A key part of the project is its **TinyFish integration**. When a
question needs current information, the backend can search the web,
retrieve relevant page content, and show source cards alongside the AI
response. That gives users a way to inspect the information behind an
answer instead of seeing only a block of generated text.

## What it does

-   Lets users ask weather-related questions through a chat interface.
-   Uses Google Gemini to generate conversational responses.
-   Uses TinyFish Search to discover relevant web pages when live
    research is needed.
-   Uses TinyFish Fetch to retrieve content from selected pages.
-   Shows source cards with titles and snippets for researched answers.
-   Provides a React and TypeScript interface backed by a Node.js and
    Express server.

WeatherGPT is a working prototype and is still being improved. The exact
weather data and other capabilities available depend on the APIs and
features configured in the current build.

## How the TinyFish flow works

1.  A user sends a question in the chat.
2.  The backend checks whether the question should trigger live
    research.
3.  TinyFish Search finds relevant pages.
4.  TinyFish Fetch retrieves content from selected pages.
5.  The backend supplies the retrieved context to Gemini to help prepare
    the response.
6.  WeatherGPT displays the answer and, when research was used, the
    available source cards.

A source card is there to help users check the original page; it is not
a guarantee that every generated statement is correct. For warnings or
other safety-critical weather information, check the latest update from
the relevant official meteorological authority.

## Built with

-   **Frontend:** React, TypeScript, Vite
-   **Backend:** Node.js, Express
-   **AI responses:** Google Gemini
-   **Live web research:** TinyFish Search API and Fetch API
-   **Data storage:** MongoDB, where configured in the application

## Run it locally

### Requirements

-   Node.js and npm
-   A Google Gemini API key
-   A TinyFish API key for the live research feature
-   MongoDB connection details only if your local configuration uses
    MongoDB

### 1. Clone the repository

``` bash
git clone https://github.com/aakash-gitcommits/WeatherGpt.git
cd WeatherGpt
```

### 2. Install packages

``` bash
npm install
```

### 3. Add environment variables

Create a `.env` file in the project root. Use the variable names
expected by the code in your checkout. For example:

``` env
GEMINI_API_KEY=your_gemini_api_key
TINYFISH_API_KEY=your_tinyfish_api_key
MONGODB_URI=your_mongodb_connection_string
```

Only add variables that the project actually uses. If the Gemini or
MongoDB variable has a different name in the code, use that name
instead.

**Keep your real `.env` file private.** Do not commit API keys or
credentials to GitHub. The `.env.example` file should contain
placeholders only, never working keys.

### 4. Start the application

Check the scripts in `package.json` and run the appropriate command. In
a typical setup, the development command is:

``` bash
npm run dev
```

If the frontend and backend run separately in this project, start each
using the scripts defined in `package.json`.

## Try the live research flow

With the server running and `TINYFISH_API_KEY` configured, try a
question such as:

> What are the latest official weather advisories for Delhi?

Check that the answer appears and that the source cards are relevant.
Open the source links and verify important claims against the original
page---especially for active warnings and advisories.

The exact results depend on what is available on the web at the time of
the request.

## Project layout

The main parts of the application include the following files and
folders (your checkout may contain additional files):

``` text
WeatherGpt/
├── server.ts
├── src/
│   ├── components/
│   │   └── AIChat/
│   │       └── AIChat.tsx
│   ├── services/
│   │   └── aiService.ts
│   └── types/
│       └── weather.ts
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Before publishing changes

-   Make sure `.env` and other secret files are ignored by Git.
-   Check that `.env.example` contains placeholder values only.
-   Do not upload `node_modules`.
-   Test a normal chat question and a question that should use live
    research.
-   Check that source links open the intended pages.
-   Keep the README in sync with the features that actually work in the
    current version.

## What's next

Some areas worth improving as the project develops:

-   Give official meteorological sources higher priority for alerts and
    warnings.
-   Show clearer timestamps and freshness information for retrieved
    pages.
-   Handle missing or conflicting research results more gracefully.
-   Test answer quality against a small set of real weather questions.
-   Continue improving accessibility and language support.

## Project links

-   **GitHub repository:**
    https://github.com/aakash-gitcommits/WeatherGpt
-   **LinkedIn project post:** https://lnkd.in/p/g3hw77qF

------------------------------------------------------------------------

WeatherGPT is a project under active development. For urgent weather
decisions, use the latest information from official weather authorities
rather than relying on an AI response alone.
