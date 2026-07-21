# GovernAIs 🛡️

> **Enterprise AI Governance & Compliance Platform**

GovernAIs is a comprehensive platform designed to tackle a critical enterprise challenge: **Shadow AI**. As employees rapidly adopt diverse AI tools for productivity, organizations often lose visibility over sensitive data flows, security compliance, and licensing costs. 

GovernAIs provides a unified, transparent portal to bring AI usage back under the organization's governance umbrella, ensuring innovation doesn't compromise security.

---

## ✨ Key Features

- **🏢 Centralized AI Registry**: A curated catalog of approved AI tools. Employees can request new tools, and compliance teams can review, approve, and manage them.
- **📊 Usage Monitoring & Analytics**: Real-time dashboards tracking which departments are using which tools, alongside simulated cost and usage metrics.
- **🚨 Risk Detection & Flagging**: A simulated compliance engine that analyzes AI interactions for sensitive data (PII, financial records, credentials) and flags potential violations for admin review.
- **👥 Role-Based Access Control (RBAC)**: Distinct experiences for standard Employees (tool discovery, requests) and Compliance Admins (approvals, risk management, analytics).

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS v4 + custom CSS animations (Glassmorphism & modern UI)
- **Charts**: Recharts for interactive data visualization
- **State Management**: React Context API (`AppDataContext`) 
- **Routing**: React Router DOM
- **Data Layer**: Local, in-memory mock data (Zero backend dependencies for easy demoing)

## 🚀 Local Setup

The application is fully contained and requires no external database or backend to run.

```bash
# Clone the repository
git clone <your-repo-url>
cd governAIs/governais

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will run locally at `http://localhost:5173` (or the port specified by Vite in your terminal).

## 🎬 Demo Walkthrough

The application is pre-populated with mock data (`src/data/mockData.js`) to showcase its capabilities immediately. You can use the **profile dropdown in the top-right corner** to switch between user roles.

Here is the recommended 3-minute end-to-end demo path:

### 1. Request a Tool (Employee)
- Start on the **Dashboard** as *Alex Chen (Engineering)*.
- Navigate to the **Registry** via the sidebar and click **Request a Tool**.
- Fill out the request form for a new AI tool (e.g., a new coding assistant).
- Observe the success confirmation toast.

### 2. Approve the Tool (Compliance Admin)
- Use the top-right profile dropdown to switch your user to *Priya Sharma (Compliance)*.
- Notice how the sidebar automatically updates to reveal admin-only pages (Approvals, Flags).
- Navigate to **Approvals**, review Alex's request, and click **Approve**.
- The newly approved tool will now be visible in the public **Registry**.

### 3. Simulate Risky Usage (Employee)
- Switch back to *Alex Chen (Engineering)*.
- On the **Dashboard**, click the **Simulate Usage Event** button (the "Play" icon) in the header.
- The app will deterministically simulate a mock event. Continue clicking to trigger an event involving sensitive data (e.g., PII in a customer email).

### 4. Resolve the Flag (Compliance Admin)
- Switch back to *Priya Sharma (Compliance)*.
- You will notice a red notification badge on the **Flags** sidebar item.
- Navigate to **Flags** to see the triggered compliance violation.
- Click on the flag to review the context of the prompt and mark it as a **Policy Violation** or **Dismiss** it.

---

*Built with ❤️ for the 2026 AI Governance Hackathon.*
