import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './lib/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

import SchoolsLayout from './pages/SchoolsLayout';
import SchoolsCreate from './pages/SchoolsCreate';
import SchoolsList from './pages/SchoolsList';
import SchoolsSearch from './pages/SchoolsSearch';
import SchoolDetails from './pages/SchoolDetails';

import CampaignsList from './pages/CampaignsList';
import CampaignsCreate from './pages/CampaignsCreate';
import CampaignDetail from './pages/CampaignDetail';
import AcceptInvitation from './pages/AcceptInvitation';

import IntelligenceLayout from './pages/IntelligenceLayout';
import CampaignIntelligenceLayout from './pages/CampaignIntelligenceLayout';
import CampaignSchoolsLayout from './pages/CampaignSchoolsLayout';
import IntelligenceCreate from './pages/IntelligenceCreate';
import IntelligenceEdit from './pages/IntelligenceEdit';
import IntelligenceList from './pages/IntelligenceList';
import IntelligenceSearch from './pages/IntelligenceSearch';
import IntelligenceSchedule from './pages/IntelligenceSchedule';
import IntelligenceVisited from './pages/IntelligenceVisited';
import IntelligenceBooked from './pages/IntelligenceBooked';
import IntelligenceDetails from './pages/IntelligenceDetails';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/campaigns" replace />} />
              
              <Route path="/campaigns" element={<CampaignsList />} />
              <Route path="/campaigns/new" element={<CampaignsCreate />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/invitations/accept" element={<AcceptInvitation />} />

              <Route path="/schools" element={<SchoolsLayout />}>
                <Route index element={<SchoolsList />} />
                <Route path="new" element={<SchoolsCreate />} />
                <Route path="search" element={<SchoolsSearch />} />
                <Route path=":id" element={<SchoolDetails />} />
              </Route>
              
              <Route path="/intelligence" element={<IntelligenceLayout />}>
                <Route index element={<IntelligenceList />} />
                <Route path="new" element={<IntelligenceCreate />} />
                <Route path="search" element={<IntelligenceSearch />} />
                <Route path="schedule" element={<IntelligenceSchedule />} />
                <Route path="visited" element={<IntelligenceVisited />} />
                <Route path="booked" element={<IntelligenceBooked />} />
                <Route path=":id/edit" element={<IntelligenceEdit />} />
                <Route path=":id" element={<IntelligenceDetails />} />
              </Route>

              {/* Campaign-scoped intelligence routes */}
              <Route path="/campaigns/:campaignId/intelligence" element={<CampaignIntelligenceLayout />}>
                <Route index element={<IntelligenceList />} />
                <Route path="new" element={<IntelligenceCreate />} />
                <Route path="search" element={<IntelligenceSearch />} />
                <Route path="schedule" element={<IntelligenceSchedule />} />
                <Route path="visited" element={<IntelligenceVisited />} />
                <Route path="booked" element={<IntelligenceBooked />} />
                <Route path=":id/edit" element={<IntelligenceEdit />} />
                <Route path=":id" element={<IntelligenceDetails />} />
              </Route>

              {/* Campaign-scoped schools routes */}
              <Route path="/campaigns/:campaignId/schools" element={<CampaignSchoolsLayout />}>
                <Route index element={<SchoolsList />} />
                <Route path="new" element={<SchoolsCreate />} />
                <Route path="search" element={<SchoolsSearch />} />
                <Route path=":id" element={<SchoolDetails />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
