import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tags from './pages/Tags';
import Equipment from './pages/Equipment';
import Alarms from './pages/Alarms';
import Documents from './pages/Documents';
import TechnicalQueries from './pages/TechnicalQueries';
import Punchlist from './pages/Punchlist';
import Baselines from './pages/Baselines';
import Tests from './pages/Tests';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Import from './pages/Import';
import Export from './pages/Export';
import { Duplicates } from './pages/Duplicates';
import Jobs from './pages/Jobs';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tags" element={<Tags />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="alarms" element={<Alarms />} />
        <Route path="documents" element={<Documents />} />
        <Route path="tqs" element={<TechnicalQueries />} />
        <Route path="punchlist" element={<Punchlist />} />
        <Route path="baselines" element={<Baselines />} />
        <Route path="tests" element={<Tests />} />
        <Route path="import" element={<Import />} />
        <Route path="export" element={<Export />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="duplicates/:projectId" element={<Duplicates />} />
        <Route path="search" element={<Search />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
