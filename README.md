# Garbin — AI Waste Collection & Predictive Routing Agent

> **AI Agent Builder Series 2026** *(Google Build with AI x AI House)*  
> **Problem Statement:** Waste Collection & Bin Overflow  
> **Repository:** [github.com/safwanxs/garbin](https://github.com/safwanxs/garbin)

---

## 📌 Executive Summary

**Garbin** replaces static, fixed municipal waste-pickup schedules with a live, demand-driven AI system. 

Instead of sanitation trucks driving fixed routes regardless of fill levels, residents upload photos of overflowing bins; **Gemini 2.5 Multimodal Flash Vision** classifies overflow severity in real-time. Garbin's headline differentiator—a **Predictive Overflow Engine**—flags high-risk bins **before they overflow** based on historical report velocity and pickup gaps. An **ADK-pattern routing agent** then generates optimized daily itineraries for sanitation trucks, while an interactive **civic GIS dashboard** provides municipal staff with real-time visibility across Bengaluru.

---

## 🌟 The Headline Differentiator ("How is Garbin Different?")

> **Predictive Overflow Alert Engine**  
> Most waste management tools are purely reactive—they only display a bin's status after someone reports a spill. Garbin flags high-risk bins **in advance** using a heuristic algorithm:  
> **Bins reported more than 2 times in the past 7 days with no logged pickup are auto-flagged as High-Risk before overflow occurs.**

Combining predictive risk scanning with automated multi-agent route optimization transforms a passive reporting tool into an active municipal planning system.

---

## 🏗️ Architecture & Technical Implementation

| Layer | Implementation in Garbin | Technology / Tool |
| :--- | :--- | :--- |
| **Citizen Reporting** | Resident uploads bin photo; multimodal model classifies overflow, severity, waste type, and action recommendation | **Gemini 2.5 Multimodal Flash Vision** |
| **Fill Prediction** | Heuristic engine evaluating report velocity and pickup gaps (architected for Vertex AI integration) | **Vertex AI Heuristic Logic** |
| **Orchestration** | Multi-step agent pipeline: Reporting Agent $\rightarrow$ Predictive Agent $\rightarrow$ Route Planning Agent | **ADK-Pattern Multi-Step Pipeline** |
| **Data & Backend** | Real-time seed state & report logs with Firestore schema compatibility | **Express Node.js Backend** |
| **External Integration** | Exposes standardized MCP tool schemas (`get_bin_status`, `predict_overflow_risk`, `generate_sanitation_route`, `escalate_unresolved_report`) | **MCP-Schema Compatible Tool Interface** |
| **Single-Service Hosting** | Built Vite SPA bundle served statically directly from Express backend with `/api` fallback | **Cloud Run Ready (Single Service)** |

---

## ✨ Key Features & Redesigned Civic UI

### 1. Persistent 3-Tier Bin Status Spine (`src/components/Dashboard.jsx`)
- **Visual Backbone**: High-visibility status spine anchoring **Normal (🟢)**, **Predictive High-Risk (🟡)**, and **Active Overflow (🔴)** metrics across the entire application.
- **Bengaluru Live GIS Map**: Leaflet map rendering color-coded pins across *Indiranagar, Koramangala, MG Road, Whitefield, HSR Layout, and Jayanagar*.

### 2. Signature Component: Predictive Inspection Citation Slip (`src/components/PredictiveCitationSlip.jsx`)
- Visual ticket metaphor of an official **BBMP Sanitation Inspection Notice**, detailing the exact heuristic evidence ($>2$ reports in 7 days, days without pickup, and risk percentage).

### 3. Mobile-First Citizen Reporting View (`src/components/ReportBin.jsx`)
- Redesigned for residents on mobile devices in high daylight. Includes a prominent camera viewfinder, touch targets, citizen trust score tracking, and 1-click test preset photos (*Indiranagar Dumpster*, *Koramangala Overflow*, *MG Road Spill*).

### 4. ADK Sanitation Route Agent (`src/components/RoutePlanner.jsx`)
- Computes turn-by-turn truck itineraries prioritizing high-severity spills first, calculating transit distance ($km$) and $CO_2$ savings ($kg$).

### 5. MCP Tool Interface & Console (`src/components/McpInspector.jsx`)
- Interactive console for hackathon reviewers to test JSON-RPC MCP tool calls.

---

## ⚡ Quick Start & Deployment Guide

### Environment Configuration
The frontend automatically uses same-origin `/api` in production or uses `VITE_API_URL` if set:
```bash
# src/config.js
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
```

### Local Development Setup
1. **Clone Repo & Install Dependencies**:
   ```bash
   git clone https://github.com/safwanxs/garbin.git
   cd garbin
   npm install
   cd backend && npm install && cd ..
   ```

2. **Configure API Key**:
   Create `backend/.env`:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   PORT=8080
   ```

3. **Build & Run Single-Service Container**:
   ```bash
   npm run build
   node backend/index.js
   ```
   *Open `http://localhost:8080` to view the full application serving both static UI & REST APIs.*

---

## 🎯 2-Minute Demo Video Script Outline

| Timestamp | What to Show / Say |
| :--- | :--- |
| **0:00–0:10** | **Problem Statement**: Fixed pickup schedules leading to overflowing municipal bins and zero resident visibility. |
| **0:10–0:35** | **Resident Reporting**: Snap/select bin photo $\rightarrow$ Gemini 2.5 Multimodal classifies overflow severity in real-time. |
| **0:35–1:05** | **Predictive Dashboard**: Show live GIS map updating with pulsing **Predictive High-Risk** alerts before overflow occurs. |
| **1:05–1:35** | **ADK Routing Agent**: Trigger route optimization $\rightarrow$ view turn-by-turn truck itinerary and $CO_2$ savings. |
| **1:35–1:50** | **Google Stack Callout**: Explicitly state: *"Powered by Gemini, Vertex AI, ADK, Firebase, MCP, and Cloud Run."* |
| **1:50–2:00** | **Conclusion**: Reinforce headline differentiator—predictive alerts replacing static schedules. |

---

## 📄 License & Program Context

Prepared as an official entry for the **AI Agent Builder Series 2026** (*Google Build with AI x AI House*).  
Built with ❤️ by Garbin Team.
