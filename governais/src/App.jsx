import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import DashboardPage from './pages/DashboardPage';
import RegistryPage from './pages/RegistryPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UsagePage from './pages/UsagePage';
import FlagsPage from './pages/FlagsPage';
import LoginPage from './pages/LoginPage';

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-cloud">
      <Sidebar />
      <Navbar />
      <main className="ml-60 pt-14">
        <div className="px-6 py-5 max-w-screen-xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Login has its own full-screen layout */}
              <Route path="/login" element={<LoginPage />} />

              {/* App shell wraps all authenticated routes */}
              <Route
                path="/"
                element={
                  <AppShell>
                    <DashboardPage />
                  </AppShell>
                }
              />
              <Route
                path="/registry"
                element={
                  <AppShell>
                    <RegistryPage />
                  </AppShell>
                }
              />
              <Route
                path="/approvals"
                element={
                  <AppShell>
                    <ApprovalsPage />
                  </AppShell>
                }
              />
              <Route
                path="/usage"
                element={
                  <AppShell>
                    <UsagePage />
                  </AppShell>
                }
              />
              <Route
                path="/flags"
                element={
                  <AppShell>
                    <FlagsPage />
                  </AppShell>
                }
              />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </AppDataProvider>
    </BrowserRouter>
  );
}
