# GovernAIs

> **Enterprise AI Governance Platform**

GovernAIs is a hackathon project built to solve a critical enterprise problem: Shadow AI. As employees increasingly use disparate AI tools for productivity, organizations lose visibility over sensitive data flows, security compliance, and licensing costs.

GovernAIs provides a unified portal to:
- **Register & Approve**: Employees request tools; Compliance reviews and curates an approved registry.
- **Monitor Usage**: Track which departments are using which tools.
- **Flag Risks**: A lightweight simulated classifier detects potential PII, financial data, or credentials in AI interactions and flags them for admin review.

## Tech Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS v4 + custom CSS animations
- **Charts**: Recharts
- **State**: React Context API (`AppDataContext`) with local, in-memory mock data
- **Routing**: React Router DOM

## Local Setup

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will run at `http://localhost:5173` (or the port specified by Vite in your terminal).

## Demo Walkthrough

The application is populated with mock data (found in `src/data/mockData.js`) and runs entirely in the browser without a backend. It includes a role-switcher in the navigation bar to simulate different users.

Here is the recommended 3-minute end-to-end demo path:

1. **Request a Tool (Employee)**
   - Start on the **Dashboard** as *Alex Chen (Engineering)*.
   - Navigate to the **Registry** and click **Request a Tool**.
   - Fill out the form (e.g., requesting a new coding assistant).
   - See the success toast.

2. **Approve the Tool (Admin)**
   - Use the top-right profile dropdown to switch user to *Priya Sharma (Compliance)*.
   - The sidebar updates to reveal admin-only pages.
   - Go to **Approvals**, review Alex's request, and click **Approve**.
   - See the tool appear in the Registry.

3. **Simulate Risky Usage (Employee)**
   - Switch back to *Alex Chen (Engineering)*.
   - On the **Dashboard**, click the "Simulate usage event" button (the play icon) in the header.
   - A mock event involving PII (e.g., a customer email) is dispatched to an approved tool.

4. **Resolve the Flag (Admin)**
   - Switch to *Priya Sharma (Compliance)*.
   - Notice the red badge on the **Flags** sidebar item.
   - Navigate to **Flags**, review the triggered event.
   - Click the flag, review the context, and mark it as a policy violation.

---
*Built for the 2026 AI Governance Hackathon.*
