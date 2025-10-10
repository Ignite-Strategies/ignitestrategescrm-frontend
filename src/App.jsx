import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash.jsx";
import Signup from "./pages/Signup.jsx";
import Signin from "./pages/Signin.jsx";
import Welcome from "./pages/Welcome.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";
import OrgChoose from "./pages/OrgChoose.jsx";
import OrgCreate from "./pages/OrgCreate.jsx";
import OrgJoin from "./pages/OrgJoin.jsx";
import OrgSuccess from "./pages/OrgSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrgMembers from "./pages/OrgMembers.jsx";
import OrgMembersCSVUpload from "./pages/OrgMembersCSVUpload.jsx";
import UploadPreview from "./pages/UploadPreview.jsx";
import ContactValidation from "./pages/ContactValidation.jsx";
import ResolveErrors from "./pages/ResolveErrors.jsx";
import ContactManual from "./pages/ContactManual.jsx";
import ContactDetail from "./pages/ContactDetail.jsx";
import EventCreate from "./pages/EventCreate.jsx";
import EventSuccess from "./pages/EventSuccess.jsx";
import EventPipelines from "./pages/EventPipelines.jsx";
import EventPipelineConfig from "./pages/EventPipelineConfig.jsx";
import EventAudiences from "./pages/EventAudiences.jsx";
import EventEngagementAdvisory from "./pages/EventEngagementAdvisory.jsx";
import EventPipelineSuccess from "./pages/EventPipelineSuccess.jsx";
// import EventPipelineSetup from "./pages/EventPipelineSetup.jsx"; // REMOVED - deprecated
// import StagePipelineReview from "./pages/StagePipelineReview.jsx"; // REMOVED - deprecated
import EventEdit from "./pages/EventEdit.jsx";
import EngageEmail from "./pages/EngageEmail.jsx";
import MarketingAnalytics from "./pages/MarketingAnalytics.jsx";
import ComposeMessage from "./pages/ComposeMessage.jsx";
import ListManagement from "./pages/ListManagement.jsx";
import TestAuth from "./pages/TestAuth.jsx";
import Authenticate from "./pages/Authenticate.jsx";
import ContactList from "./pages/ContactList.jsx";
import EmailCampaigns from "./pages/EmailCampaigns.jsx";
import EmailDashboard from "./pages/EmailDashboard.jsx";
import Outreach from "./pages/Outreach.jsx";
import CreateListOptions from "./pages/CreateListOptions.jsx";
import Templates from "./pages/Templates.jsx";
import SendEmail from "./pages/SendEmail.jsx";
import CreateCampaign from "./pages/CreateCampaign.jsx";
import CampaignSequences from "./pages/CampaignSequences.jsx";
import CampaignList from "./pages/CampaignList.jsx";
import Events from "./pages/Events.jsx";
import Tasks from "./pages/Tasks.jsx";
import SetupEvent from "./pages/SetupEvent.jsx";
import EventTaskSuggestions from "./pages/EventTaskSuggestions.jsx";
import Forms from "./pages/Forms.jsx";
import FormBuilder from "./pages/FormBuilder.jsx";
import FormSuccess from "./pages/FormSuccess.jsx";
import PostOrgCreate from "./pages/PostOrgCreate.jsx";

// Protected Route - Check for firebaseId
function ProtectedRoute({ children }) {
  const firebaseId = localStorage.getItem("firebaseId");
  if (!firebaseId) {
    return <Navigate to="/signup" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen (checks auth) */}
        <Route path="/" element={<Splash />} />
        
        {/* Auth Pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        
        {/* Universal Hydrator */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Profile/Org Setup */}
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/org/choose" element={<ProtectedRoute><OrgChoose /></ProtectedRoute>} />
        
        {/* Org Management */}
        <Route path="/org/create" element={
          <ProtectedRoute><OrgCreate /></ProtectedRoute>
        } />
        <Route path="/org/success" element={
          <ProtectedRoute><OrgSuccess /></ProtectedRoute>
        } />
        <Route path="/org/post-create" element={
          <ProtectedRoute><PostOrgCreate /></ProtectedRoute>
        } />
        
        {/* Main App */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/org-members" element={
          <ProtectedRoute><OrgMembers /></ProtectedRoute>
        } />
        <Route path="/org-members/upload" element={
          <ProtectedRoute><OrgMembersCSVUpload /></ProtectedRoute>
        } />
        <Route path="/org-members/upload/preview" element={
          <ProtectedRoute><UploadPreview /></ProtectedRoute>
        } />
        <Route path="/org-members/upload/validation" element={
          <ProtectedRoute><ContactValidation /></ProtectedRoute>
        } />
        <Route path="/org-members/upload/resolve" element={
          <ProtectedRoute><ResolveErrors /></ProtectedRoute>
        } />
        <Route path="/org-members/manual" element={
          <ProtectedRoute><ContactManual /></ProtectedRoute>
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
        <Route path="/event/:eventId/setup" element={
          <ProtectedRoute><SetupEvent /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/task-suggestions" element={
          <ProtectedRoute><EventTaskSuggestions /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/forms" element={
          <ProtectedRoute><Forms /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/forms/create" element={
          <ProtectedRoute><FormBuilder /></ProtectedRoute>
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
          <ProtectedRoute><EmailDashboard /></ProtectedRoute>
        } />
        <Route path="/email" element={
          <ProtectedRoute><EmailDashboard /></ProtectedRoute>
        } />
        <Route path="/email/campaigns" element={
          <ProtectedRoute><EmailDashboard /></ProtectedRoute>
        } />
        <Route path="/email/outreach" element={
          <ProtectedRoute><Outreach /></ProtectedRoute>
        } />
        <Route path="/campaigns" element={
          <ProtectedRoute><CampaignList /></ProtectedRoute>
        } />
        <Route path="/create-campaign" element={
          <ProtectedRoute><CreateCampaign /></ProtectedRoute>
        } />
        <Route path="/campaigns/:campaignId/sequences" element={
          <ProtectedRoute><CampaignSequences /></ProtectedRoute>
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
        <Route path="/forms" element={
          <ProtectedRoute><Forms /></ProtectedRoute>
        } />
        <Route path="/forms/create" element={
          <ProtectedRoute><FormBuilder /></ProtectedRoute>
        } />
        <Route path="/forms/success" element={
          <ProtectedRoute><FormSuccess /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

