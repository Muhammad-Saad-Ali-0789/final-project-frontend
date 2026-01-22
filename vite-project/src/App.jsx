import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Assets from './components/Assets';
import WorkOrders from './components/Workorders';
import Admin from './components/Admin';
import Manager from './components/Manager';
import Technician from './components/Technician';
import TaskHistory from './components/TaskHistory';
import AddAsset from './components/AddAsset';

function App() {
  return (
    <AuthProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <div className="container mt-4" style={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/create-product" element={<AddAsset />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/technician" element={<Technician />} />
            <Route path="/work-orders/:id/history" element={<TaskHistory />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
export default App;