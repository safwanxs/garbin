# Garbin — AI Waste Collection & Predictive Routing Agent

> **AI Agent Builder Series 2026** *(Google Build with AI x AI House)*  
> **Problem Statement:** Waste Collection & Bin Overflow  
> **Repository:** [github.com/safwanxs/garbin](https://github.com/safwanxs/garbin)

---

## 📌 Executive Summary

**Garbin** replaces static, fixed municipal waste-pickup schedules with a live, demand-driven AI system. 

Instead of sanitation trucks driving fixed routes regardless of fill levels, residents upload photos of overflowing bins; **Gemini 3.1 Multimodal Vision** classifies overflow severity in real-time. Garbin's headline differentiator—a **Predictive Overflow Engine**—flags high-risk bins **before they overflow** based on historical report velocity and pickup gaps. An **ADK-orchestrated routing agent** then generates optimized daily itineraries for sanitation trucks, while an interactive **Firebase-backed GIS dashboard** provides municipal staff with real-time visibility across the city.

---

## 🌟 The Headline Differentiator ("How is Garbin Different?")

> **Predictive Overflow Alert Engine**  
> Most waste management tools are purely reactive—they only display a bin's status after someone reports a spill. Garbin flags high-risk bins **in advance** using a heuristic algorithm:  
> **Bins reported more than 2 times in the past 7 days with no logged pickup are auto-flagged as High-Risk before overflow occurs.**

Combining predictive risk scanning with automated multi-agent route optimization transforms a passive reporting tool into an active municipal planning system.

---

## 🏗️ Architecture & Mandatory Google Tech Stack

| Layer | What it does in Garbin | Google Tech Tool |
| :--- | :--- | :--- |
| **Citizen Reporting** | Resident uploads bin photo; multimodal model classifies overflow, severity, waste type, and action recommendation | **Gemini Models (3.1 Flash)** |
| **Fill Prediction** | Evaluates report velocity, pickup gaps, and fill rates to flag pre-overflow risk | **Vertex AI Logic** |
| **Orchestration** | Coordinates Reporting Agent $\rightarrow$ Predictive Agent $\rightarrow$ Routing Agent as one pipeline | **Agent Development Kit (ADK)** |
| **Data & Backend** | Stores bin locations, report logs, truck status, and citizen trust scores in real time | **Firebase (Firestore + Auth)** |
| **External Integration** | Exposes standardized MCP tool schema (`get_bin_status`, `predict_overflow_risk`, `generate_sanitation_route`) | **Model Context Protocol (MCP)** |
| **Hosting & Workflow** | Live container hosting and agent logic iteration | **Cloud Run & Antigravity** |

---

## ✨ Key Features & Capabilities

### 1. Live Municipal GIS Dashboard (`src/components/Dashboard.jsx` & `MapView.jsx`)
- **Interactive City Map**: Leaflet-powered GIS map rendering real-time bins across urban zones (*Indiranagar, Koramangala, MG Road, Whitefield, HSR Layout, Jayanagar*).
- **Color-Coded Status Nodes**:
  - 🟢 **Normal**: $<70\%$ fill level, recent pickup.
  - 🟡 **Predictive High-Risk**: Auto-flagged by predictive engine ($>2$ reports in 7 days w/o pickup).
  - 🔴 **Active Overflow**: Resident-reported & Gemini-confirmed overflow.
- **Truck Route Overlays**: Animated polyline paths displaying optimal transit paths.

### 2. Citizen Photo Reporting (`src/components/ReportBin.jsx`)
- **Gemini Multimodal Vision**: Classifies overflow status, severity level (`low`, `medium`, `high`), waste type (plastic, packaging, organic), and action recommendation.
- **Preset Test Samples**: 1-click preset photos (*Indiranagar Dumpster*, *Koramangala Overflow*, *MG Road Metro Spill*) for instant demo testing without local file uploads.
- **Citizen Trust Score**: Anti-spam scoring ($0-100$) to filter duplicate or low-credibility reports.

### 3. ADK Sanitation Route Agent (`src/components/RoutePlanner.jsx`)
- **Multi-Agent Pipeline**: Automatically prioritizes high-severity overflows first, then groups remaining stops geographically.
- **Impact Metrics**: Displays distance saved (km), estimated duration (mins), and $CO_2$ emission reduction ($kg$) vs static schedules.

### 4. Model Context Protocol (MCP) Live Inspector (`src/components/McpInspector.jsx`)
- **Interactive Console**: Allows hackathon judges to execute raw MCP tool calls (`get_bin_status`, `predict_overflow_risk`, `generate_sanitation_route`, `escalate_unresolved_report`) and view JSON-RPC responses in real-time.

### 5. Submission & Pitch Kit (`src/components/SubmissionKit.jsx`)
- **1-Click Copy**: Form draft texts (Description, Differentiators, Roadblocks) ready for the official submission form.
- **2-Minute Video Outline**: Script breakdown with timestamp callouts.

---

## 🔌 Model Context Protocol (MCP) Tool Schema

Garbin exposes standard MCP endpoints at `/api/mcp/tools` and `/api/mcp/call`:

```json
{
  "protocolVersion": "1.0",
  "serverName": "Garbin-Municipal-MCP",
  "tools": [
    {
      "name": "get_bin_status",
      "description": "Retrieves status, fill metrics, and predictive risk score for a bin."
    },
    {
      "name": "predict_overflow_risk",
      "description": "Runs predictive heuristics on active bins in a zone."
    },
    {
      "name": "generate_sanitation_route",
      "description": "Triggers ADK routing agent to calculate an optimized pickup sequence."
    },
    {
      "name": "escalate_unresolved_report",
      "description": "Auto-escalates unserviced reports >24h to municipal supervisor."
    }
  ]
}
```

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- **Node.js** v18+ and `npm`
- **Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone Repository
```bash
git clone https://github.com/safwanxs/garbin.git
cd garbin
```

### 2. Backend Setup & Configuration
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PORT=8080
```

Start the backend API server:
```bash
node index.js
```
*Backend runs on `http://localhost:8080`*

### 3. Frontend Web App Setup
Open a new terminal window in the root `garbin` directory:
```bash
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` or `http://localhost:5174`*

---

## 🎯 2-Minute Demo Video Script Outline

| Timestamp | What to Show / Say |
| :--- | :--- |
| **0:00–0:10** | **Problem Statement**: Fixed pickup schedules leading to overflowing municipal bins and zero resident visibility. |
| **0:10–0:35** | **Resident Reporting**: Snap/select bin photo $\rightarrow$ Gemini 3.1 Multimodal classifies overflow severity in real-time. |
| **0:35–1:05** | **Predictive Dashboard**: Show live GIS map updating with pulsing **Predictive High-Risk** alerts before overflow occurs. |
| **1:05–1:35** | **ADK Routing Agent**: Trigger route optimization $\rightarrow$ view turn-by-turn truck itinerary and $CO_2$ savings. |
| **1:35–1:50** | **Google Stack Callout**: Explicitly state: *"Powered by Gemini, Vertex AI, ADK, Firebase, MCP, and Cloud Run."* |
| **1:50–2:00** | **Conclusion**: Reinforce headline differentiator—predictive alerts replacing static schedules. |

---

## 📄 License & Program Context

Prepared as an official entry for the **AI Agent Builder Series 2026** (*Google Build with AI x AI House*).  
Built with ❤️ by Garbin Team.
