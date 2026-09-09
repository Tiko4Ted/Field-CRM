import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import SchoolsLayout from './pages/SchoolsLayout';
import SchoolsCreate from './pages/SchoolsCreate';
import SchoolsList from './pages/SchoolsList';
import SchoolsSearch from './pages/SchoolsSearch';
import SchoolDetails from './pages/SchoolDetails';

import IntelligenceLayout from './pages/IntelligenceLayout';
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
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
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
