import { Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Climate from './pages/Climate';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import Overview from './pages/Overview';
import Profile from './pages/Profile';
import Samples from './pages/Samples';
import Suppliers from './pages/Suppliers';
import Tools from './pages/Tools';
import Traceability from './pages/Traceability';
import UvScan from './pages/UvScan';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/uv" element={<UvScan />} />
        <Route path="analytics" element={<Climate />} />
        <Route path="profile" element={<Profile />} />
        {/* The mill pages built earlier keep their routes. */}
        <Route path="mill" element={<Overview />} />
        <Route path="batches" element={<Batches />} />
        <Route path="batches/:id" element={<BatchDetail />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="samples" element={<Samples />} />
        <Route path="climate" element={<Climate />} />
        <Route path="traceability" element={<Traceability />} />
      </Route>
    </Routes>
  );
}
