import { Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import Batches from './pages/Batches';
import BatchDetail from './pages/BatchDetail';
import Climate from './pages/Climate';
import Overview from './pages/Overview';
import Samples from './pages/Samples';
import Suppliers from './pages/Suppliers';
import Traceability from './pages/Traceability';

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Overview />} />
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
