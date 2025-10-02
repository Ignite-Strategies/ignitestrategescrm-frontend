import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/org/create" replace />} />
        <Route path="/org/create" element={<OrgCreate />} />
        <Route path="/org/success/:orgId" element={<OrgSuccess />} />
        <Route path="/org/:orgId/users" element={<OrgUsers />} />
        <Route path="/dashboard/:orgId" element={<Dashboard />} />
        <Route path="/event/create/:orgId" element={<EventCreate />} />
        <Route path="/event/success/:eventId" element={<EventSuccess />} />
        <Route path="/event/:eventId/pipelines" element={<EventPipelines />} />
        <Route path="/event/:eventId/pipeline-config" element={<EventPipelineConfig />} />
        <Route path="/event/:eventId/audiences" element={<EventAudiences />} />
        <Route path="/engage/email/:orgId" element={<EngageEmail />} />
        <Route path="/marketing/analytics/:orgId" element={<MarketingAnalytics />} />
      </Routes>
    </BrowserRouter>
  );
}

