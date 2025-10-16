import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
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
import OrgDashboard from "./pages/OrgDashboard.jsx";
import OrgMembers from "./pages/OrgMembers.jsx";
import OrgMembersCSVUpload from "./pages/OrgMembersCSVUpload.jsx";
import ContactUploadSelector from "./pages/ContactUploadSelector.jsx";
import OrgMembersUploadPreview from "./pages/OrgMembersUploadPreview.jsx";
import OrgMemberUploadSuccess from "./pages/OrgMemberUploadSuccess.jsx";
import ResolveErrors from "./pages/ResolveErrors.jsx";
import OrgMemberManual from "./pages/OrgMemberManual.jsx";
import ReadTheError from "./pages/ReadTheError.jsx";
import ContactListView from "./pages/ContactListView.jsx";
import AdminMaker from "./pages/AdminMaker.jsx";
import ContactDetail from "./pages/ContactDetail.jsx";
import EventCreate from "./pages/EventCreate.jsx";
import EventSuccess from "./pages/EventSuccess.jsx";
import EventPipelines from "./pages/EventPipelines.jsx";
import EventEngagementAdvisory from "./pages/EventEngagementAdvisory.jsx";
import EventPipelineSuccess from "./pages/EventPipelineSuccess.jsx";
// import EventPipelineSetup from "./pages/EventPipelineSetup.jsx"; // REMOVED - deprecated
// import StagePipelineReview from "./pages/StagePipelineReview.jsx"; // REMOVED - deprecated
import EventEdit from "./pages/EventEdit.jsx";
import EngageEmail from "./pages/EngageEmail.jsx";
import MarketingAnalytics from "./pages/MarketingAnalytics.jsx";
import ComposeMessage from "./pages/ComposeMessage.jsx";
import TestAuth from "./pages/TestAuth.jsx";
import Authenticate from "./pages/Authenticate.jsx";
import ContactListManager from "./pages/ContactListManager.jsx";
import ContactListBuilder from "./pages/ContactListBuilder.jsx";
import ContactListDetail from "./pages/ContactListDetail.jsx";
import ContactManageHome from "./pages/ContactManageHome.jsx";
import ContactManageSelector from "./pages/ContactManageSelector.jsx";
import FormUserUpdate from "./pages/FormUserUpdate.jsx";
import ContactEventUpload from "./pages/ContactEventUpload.jsx";
import ContactEventUploadPreview from "./pages/ContactEventUploadPreview.jsx";
import ContactEventUploadValidation from "./pages/ContactEventUploadValidation.jsx";
import CampaignHome from "./pages/CampaignHome.jsx";
import ActiveCampaignDashboard from "./pages/ActiveCampaignDashboard.jsx";
import CampaignSuccess from "./pages/CampaignSuccess.jsx";
import Outreach from "./pages/Outreach.jsx";
import Templates from "./pages/Templates.jsx";
import SendEmail from "./pages/SendEmail.jsx";
import EventDashboard from "./pages/EventDashboard.jsx";
import EventAttendeeList from "./pages/EventAttendeeList.jsx";
import FormSubmissionView from "./pages/FormSubmissionView.jsx";
import Tasks from "./pages/Tasks.jsx";
import SetupEvent from "./pages/SetupEvent.jsx";
import EventTaskSuggestions from "./pages/EventTaskSuggestions.jsx";
import Forms from "./pages/Forms.jsx";
import FormBuilder from "./pages/FormBuilder.jsx";
import FormSuccess from "./pages/FormSuccess.jsx";
import PostOrgCreate from "./pages/PostOrgCreate.jsx";
import AdsDashboard from "./pages/AdsDashboard.jsx";
import TestEnterpriseEmail from "./pages/TestEnterpriseEmail.jsx";
import ContactListDebug from "./pages/ContactListDebug.jsx";
import SmartLists from "./pages/SmartLists.jsx";
import CampaignCreator from "./pages/CampaignCreator.jsx";
import CampaignChooserOrStarter from "./pages/CampaignChooserOrStarter.jsx";
import CampaignPreview from "./pages/CampaignPreview.jsx";
import PreviewPageTest from "./pages/PreviewPageTest.jsx";
import Sequence from "./pages/Sequence.jsx";

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
      <Navigation />
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
        <Route path="/org-dashboard" element={
          <ProtectedRoute><OrgDashboard /></ProtectedRoute>
        } />
        <Route path="/org-members" element={
          <ProtectedRoute><OrgMembers /></ProtectedRoute>
        } />
        <Route path="/org-members/upload" element={
          <ProtectedRoute><OrgMembersCSVUpload /></ProtectedRoute>
        } />
        <Route path="/contact-upload-selector" element={
          <ProtectedRoute><ContactUploadSelector /></ProtectedRoute>
        } />
        <Route path="/contacts/event/upload" element={
          <ProtectedRoute><ContactEventUpload /></ProtectedRoute>
        } />
        <Route path="/contacts/event/upload/preview" element={
          <ProtectedRoute><ContactEventUploadPreview /></ProtectedRoute>
        } />
        <Route path="/contacts/event/upload/validation" element={
          <ProtectedRoute><ContactEventUploadValidation /></ProtectedRoute>
        } />
        <Route path="/org-members/upload/preview" element={
          <ProtectedRoute><OrgMembersUploadPreview /></ProtectedRoute>
        } />
        <Route path="/org-members/upload/success" element={
          <ProtectedRoute><OrgMemberUploadSuccess /></ProtectedRoute>
        } />
        <Route path="/org-members/upload/resolve" element={
          <ProtectedRoute><ResolveErrors /></ProtectedRoute>
        } />
        <Route path="/org-members/manual" element={
          <ProtectedRoute><OrgMemberManual /></ProtectedRoute>
        } />
        <Route path="/orgmembermanual" element={
          <ProtectedRoute><OrgMemberManual /></ProtectedRoute>
        } />
        <Route path="/read-the-error" element={
          <ProtectedRoute><ReadTheError /></ProtectedRoute>
        } />
        <Route path="/contact-list-view" element={
          <ProtectedRoute><ContactListView /></ProtectedRoute>
        } />
        <Route path="/admin-maker" element={
          <ProtectedRoute><AdminMaker /></ProtectedRoute>
        } />
        <Route path="/contact/:contactId" element={
          <ProtectedRoute><ContactDetail /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute><EventDashboard /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/attendees" element={
          <ProtectedRoute><EventAttendeeList /></ProtectedRoute>
        } />
        <Route path="/event/:eventId/form-submissions" element={
          <ProtectedRoute><FormSubmissionView /></ProtectedRoute>
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
        <Route path="/analytics" element={
          <ProtectedRoute><MarketingAnalytics /></ProtectedRoute>
        } />
        <Route path="/compose" element={
          <ProtectedRoute><ComposeMessage /></ProtectedRoute>
        } />
        <Route path="/test-auth" element={
          <TestAuth />
        } />
        <Route path="/authenticate" element={
          <ProtectedRoute><Authenticate /></ProtectedRoute>
        } />
        <Route path="/contact-list-manager" element={
          <ProtectedRoute><ContactListManager /></ProtectedRoute>
        } />
        <Route path="/contact-list-builder" element={
          <ProtectedRoute><ContactListBuilder /></ProtectedRoute>
        } />
        <Route path="/contact-list/:listId" element={
          <ProtectedRoute><ContactListDetail /></ProtectedRoute>
        } />
        <Route path="/contacts" element={
          <ProtectedRoute><ContactManageHome /></ProtectedRoute>
        } />
        <Route path="/contactmanage" element={
          <ProtectedRoute><ContactManageHome /></ProtectedRoute>
        } />
        <Route path="/contact-manage-chooser" element={
          <ProtectedRoute><ContactManageSelector /></ProtectedRoute>
        } />
        <Route path="/form-user-update" element={
          <ProtectedRoute><FormUserUpdate /></ProtectedRoute>
        } />
        
        {/* Campaign System - NEW 3-STEP FLOW */}
        <Route path="/campaign-chooser" element={
          <ProtectedRoute><CampaignChooserOrStarter /></ProtectedRoute>
        } />
        <Route path="/campaign-creator" element={
          <ProtectedRoute><CampaignCreator /></ProtectedRoute>
        } />
        <Route path="/campaign-preview" element={
          <ProtectedRoute><CampaignPreview /></ProtectedRoute>
        } />
        <Route path="/preview-test" element={
          <ProtectedRoute><PreviewPageTest /></ProtectedRoute>
        } />
        <Route path="/sequence" element={
          <ProtectedRoute><Sequence /></ProtectedRoute>
        } />
        
        {/* Campaign System - Legacy routes */}
        <Route path="/campaigns" element={
          <ProtectedRoute><ActiveCampaignDashboard /></ProtectedRoute>
        } />
        <Route path="/campaignhome" element={
          <ProtectedRoute><CampaignHome /></ProtectedRoute>
        } />
        <Route path="/campaign-dashboard" element={
          <ProtectedRoute><ActiveCampaignDashboard /></ProtectedRoute>
        } />
        <Route path="/campaign-success" element={
          <ProtectedRoute><CampaignSuccess /></ProtectedRoute>
        } />
        <Route path="/outreach" element={
          <ProtectedRoute><Outreach /></ProtectedRoute>
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
        <Route path="/ads" element={
          <ProtectedRoute><AdsDashboard /></ProtectedRoute>
        } />
        <Route path="/test-enterprise-email" element={
          <ProtectedRoute><TestEnterpriseEmail /></ProtectedRoute>
        } />
        <Route path="/smart-lists" element={
          <ProtectedRoute><SmartLists /></ProtectedRoute>
        } />
        <Route path="/contact-list-debug" element={
          <ProtectedRoute><ContactListDebug /></ProtectedRoute>
        } />
        <Route path="/contact-list-view" element={
          <ProtectedRoute><ContactListView /></ProtectedRoute>
        } />
        
      </Routes>
    </BrowserRouter>
  );
}


