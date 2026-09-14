import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RepositoriesPage } from "./pages/RepositoriesPage";
import { DeploymentsPage } from "./pages/DeploymentsPage";
import { DomainsPage } from "./pages/DomainsPage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/deployments" element={<DeploymentsPage />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
