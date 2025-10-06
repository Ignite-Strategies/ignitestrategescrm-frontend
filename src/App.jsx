import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Welcome from "./pages/Welcome.jsx";
import OrgCreate from "./pages/OrgCreate.jsx";
import OrgSuccess from "./pages/OrgSuccess.jsx";
import Supporters from "./pages/Supporters.jsx";
import UploadSupportersCSV from "./pages/UploadSupportersCSV.jsx";
import UploadPreview from "./pages/UploadPreview.jsx";
import ContactValidation from "./pages/ContactValidation.jsx";
import ResolveErrors from "./pages/ResolveErrors.jsx";
import SupporterManual from "./pages/SupporterManual.jsx";
import ContactDetail from "./pages/ContactDetail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EventCreate from "./pages/EventCreate.jsx";
import EventSuccess from "./pages/EventSuccess.jsx";
import EventPipelines from "./pages/EventPipelines.jsx";
import EventPipelineConfig from "./pages/EventPipelineConfig.jsx";
import EventAudiences from "./pages/EventAudiences.jsx";
import EventEngagementAdvisory from "./pages/EventEngagementAdvisory.jsx";
import EventPipelineSuccess from "./pages/EventPipelineSuccess.jsx";
import EventEdit from "./pages/EventEdit.jsx";
import EngageEmail from "./pages/EngageEmail.jsx";
import MarketingAnalytics from "./pages/MarketingAnalytics.jsx";
import ComposeMessage from "./pages/ComposeMessage.jsx";
import ListManagement from "./pages/ListManagement.jsx";
import TestAuth from "./pages/TestAuth.jsx";
import Authenticate from "./pages/Authenticate.jsx";
import ContactList from "./pages/ContactList.jsx";
import EmailCampaigns from "./pages/EmailCampaigns.jsx";
import CreateListOptions from "./pages/CreateListOptions.jsx";
import Templates from "./pages/Templates.jsx";
import SendEmail from "./pages/SendEmail.jsx";
import Events from "./pages/Events.jsx";
import Tasks from "./pages/Tasks.jsx";

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
          <ProtectedRoute><Supporters /></ProtectedRoute>
        } />
        <Route path="/supporters/upload" element={
          <ProtectedRoute><UploadSupportersCSV /></ProtectedRoute>
        } />
        <Route path="/supporters/upload/preview" element={
          <ProtectedRoute><UploadPreview /></ProtectedRoute>
        } />
        <Route path="/supporters/upload/validation" element={
          <ProtectedRoute><ContactValidation /></ProtectedRoute>
        } />
        <Route path="/supporters/upload/resolve" element={
          <ProtectedRoute><ResolveErrors /></ProtectedRoute>
        } />
        <Route path="/supporters/manual" element={
          <ProtectedRoute><SupporterManual /></ProtectedRoute>
        } />
        <Route path="/contact/:contactId" element={
          <ProtectedRoute><ContactDetail /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute><Events /></ProtectedRoute>
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
        <Route path="/event/:eventId/engagement-advisory" element={
          <ProtectedRoute><EventEngagementAdvisory /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/pipeline-success" element={
          <ProtectedRoute><EventPipelineSuccess /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/edit" element={
          <ProtectedRoute><EventEdit /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/tasks" element={
          <ProtectedRoute><Tasks /></ProtectedRoute>
        } />
        <Route path="/email" element={
          <ProtectedRoute><EngageEmail /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><MarketingAnalytics /></ProtectedRoute>
        } />
        <Route path="/compose" element={
          <ProtectedRoute><ComposeMessage /></ProtectedRoute>
        } />
        <Route path="/lists" element={
          <ProtectedRoute><ListManagement /></ProtectedRoute>
        } />
        <Route path="/test-auth" element={
          <TestAuth />
        } />
        <Route path="/authenticate" element={
          <ProtectedRoute><Authenticate /></ProtectedRoute>
        } />
        <Route path="/contact-lists" element={
          <ProtectedRoute><ContactList /></ProtectedRoute>
        } />
        <Route path="/campaigns" element={
          <ProtectedRoute><EmailCampaigns /></ProtectedRoute>
        } />
        <Route path="/create-list" element={
          <ProtectedRoute><CreateListOptions /></ProtectedRoute>
        } />
        <Route path="/templates" element={
          <ProtectedRoute><Templates /></ProtectedRoute>
        } />
        <Route path="/send-email" element={
          <ProtectedRoute><SendEmail /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

