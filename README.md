# CortexFlow: Agentic Workforce Platform

**CortexFlow** is a next-generation AI-powered platform designed to streamline team collaboration, automate task management, and provide intelligent organizational memory. Built for the modern distributed workforce, it leverages the power of **Google Gemini AI** to bridge the gap between meetings and execution.

One of the main and unique feature of this paltform is multi agent system where manager agent AI assigns tasks to employees and on the employee side there will be an another agent called emloyee agent which will tell the employee to do the work and will also help him to do the work (like genrating code..) .After the particular task is over the employee agent and manager agent will speak together and will decide the next course of action.

## 🚀 Key Features

### 🎤 AI-Powered Meeting Extraction
Transform raw meeting transcripts into actionable data. Our agentic pipeline automatically extracts:
- **Tasks**: Title, owner, and smart deadlines.
- **Decisions**: Contextual outcomes and historical tracking.
- **Summaries**: Concise, high-level overviews of discussions.

### 👥 Multi-Role Workspace
Tailored experiences for different organizational needs:
- **Manager Dashboard**: Comprehensive team oversight, task allocation, and progress tracking.
- **Employee Portal**: Personalized task views, AI-assisted code generation, and work history.

### 📚 Intelligent Organizational Memory (RAG)
Query your company's collective knowledge base. Ask questions about past decisions, team roles, or project statuses and get instant, context-aware answers powered by AI.

### 🛡️ Resilience & Synthetic Fallbacks
Built for production reliability. The system includes a "Hackathon Safety Net" with synthetic data fallbacks if the AI link is interrupted or quotas are reached.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4 + PostCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Engine**: Google Generative AI (Gemini 2.0 Flash / Pro)
- **State Management**: Persistent Local Storage Sync

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/)
- A [Google AI Studio](https://aistudio.google.com/) API Key.

### 2. Installation
```bash
git clone https://github.com/adityaarulmanalan/execumind.git
cd execumind
npm install
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Configuration
1. Click on the **Settings** icon in the sidebar.
2. Navigate to **AI Configuration**.
3. Paste your **Gemini API Key**.
4. (Optional) Toggle **Demo Mode** to test the UI without an active API key.

---

## 🌐 Deployment

CortexFlow is optimized for deployment on **Vercel**. 

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a detailed step-by-step guide to deploying this project for free.

---

## 📄 License
MIT License - Copyright (c) 2026 ExecuMind Team.
