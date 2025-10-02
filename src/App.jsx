import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/home.jsx";
import OrgCreate from "./pages/org.create.jsx";
import OrgSuccess from "./pages/org.success.jsx";
import OrgUsers from "./pages/org.users.jsx";
import Dashboard from "./pages/dashboard.jsx";
import EventCreate from "./pages/event.create.jsx";
import EventSuccess from "./pages/event.success.jsx";
import EventPipelines from "./pages/event.pipelines.jsx";
import EventPipelineConfig from "./pages/event.pipeline-config.jsx";
import EventAudiences from "./pages/event.audiences.jsx";
import EngageEmail from "./pages/engage.email.jsx";
import MarketingAnalytics from "./pages/marketing.analytics.jsx";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/org/create" replace /> : <Home onLogin={handleLogin} />
        } />
        
        <Route path="/org/create" element={
          <ProtectedRoute><OrgCreate /></ProtectedRoute>
        } />
        <Route path="/org/success/:orgId" element={
          <ProtectedRoute><OrgSuccess /></ProtectedRoute>
        } />
        <Route path="/org/:orgId/users" element={
          <ProtectedRoute><OrgUsers /></ProtectedRoute>
        } />
        <Route path="/dashboard/:orgId" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/event/create/:orgId" element={
          <ProtectedRoute><EventCreate /></ProtectedRoute>
        } />
        <Route path="/event/success/:eventId" element={
          <ProtectedRoute><EventSuccess /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/pipelines" element={
          <ProtectedRoute><EventPipelines /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/pipeline-config" element={
          <ProtectedRoute><EventPipelineConfig /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/audiences" element={
          <ProtectedRoute><EventAudiences /></ProtectedRoute>
        } />
        <Route path="/engage/email/:orgId" element={
          <ProtectedRoute><EngageEmail /></ProtectedRoute>
        } />
        <Route path="/marketing/analytics/:orgId" element={
          <ProtectedRoute><MarketingAnalytics /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

