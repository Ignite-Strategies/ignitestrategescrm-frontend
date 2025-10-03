import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Welcome from "./pages/Welcome.jsx";
import OrgCreate from "./pages/OrgCreate.jsx";
import OrgSuccess from "./pages/OrgSuccess.jsx";
import OrgUsers from "./pages/OrgUsers.jsx";
import UploadSupportersCSV from "./pages/UploadSupportersCSV.jsx";
import SupporterManual from "./pages/SupporterManual.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EventCreate from "./pages/EventCreate.jsx";
import EventSuccess from "./pages/EventSuccess.jsx";
import EventPipelines from "./pages/EventPipelines.jsx";
import EventPipelineConfig from "./pages/EventPipelineConfig.jsx";
import EventAudiences from "./pages/EventAudiences.jsx";
import EngageEmail from "./pages/EngageEmail.jsx";
import MarketingAnalytics from "./pages/MarketingAnalytics.jsx";

// Protected Route - simple localStorage check
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const orgId = localStorage.getItem("orgId");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isAuthenticated && orgId ? <Navigate to="/welcome" replace /> : 
          isAuthenticated && !orgId ? <Navigate to="/org/create" replace /> :
          <Home />
        } />
        
        <Route path="/welcome" element={
          <ProtectedRoute><Welcome /></ProtectedRoute>
        } />
        
        <Route path="/org/create" element={
          <ProtectedRoute><OrgCreate /></ProtectedRoute>
        } />
        <Route path="/org/success" element={
          <ProtectedRoute><OrgSuccess /></ProtectedRoute>
        } />
        <Route path="/supporters" element={
          <ProtectedRoute><OrgUsers /></ProtectedRoute>
        } />
        <Route path="/supporters/upload" element={
          <ProtectedRoute><UploadSupportersCSV /></ProtectedRoute>
        } />
        <Route path="/supporters/manual" element={
          <ProtectedRoute><SupporterManual /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/event/create" element={
          <ProtectedRoute><EventCreate /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/success" element={
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
        <Route path="/email" element={
          <ProtectedRoute><EngageEmail /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><MarketingAnalytics /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

