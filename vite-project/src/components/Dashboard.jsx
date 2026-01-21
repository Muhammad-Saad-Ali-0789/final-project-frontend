import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/Authcontext';
import '../styles/Dashboard.css';
const API_URL = import.meta.env.VITE_API_URL || '/api';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [stats, setStats] = useState({ totalAssets: 0, activeOrders: 0, completedOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [assetsRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/assets`),
          axios.get(`${API_URL}/work-orders`)
        ]);
        
        const assetsData = assetsRes.data || [];
        const ordersData = ordersRes.data || [];
        
        setAssets(assetsData);
        setWorkOrders(ordersData);
        
        // Calculate stats
        const activeOrders = ordersData.filter(o => o.status !== 'Completed').length;
        const completedOrders = ordersData.filter(o => o.status === 'Completed').length;
        setStats({
          totalAssets: assetsData.length,
          activeOrders,
          completedOrders
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        if (err.response?.status === 403) {
          setError('Session expired. Please log in again.');
          navigate('/login');
        } else {
          setError('Failed to load dashboard data. Please ensure the backend server is running on port 5000.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  if (!user) {
    return <div className="alert alert-info">Please log in to access the dashboard.</div>;
  }

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="welcome-text">Welcome, {user.name || user.email}! (Role: {user.role})</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="stats-grid">
        <div className="stat-card">
          <h5>📊 Total Assets</h5>
          <p className="stat-value">{stats.totalAssets}</p>
        </div>
        <div className="stat-card">
          <h5>📋 Active Orders</h5>
          <p className="stat-value">{stats.activeOrders}</p>
        </div>
        <div className="stat-card">
          <h5>✅ Completed Orders</h5>
          <p className="stat-value">{stats.completedOrders}</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h3>Recent Assets</h3>
          {assets.length > 0 ? (
            <ul className="list-group">
              {assets.slice(0, 5).map(asset => (
                <li key={asset._id} className="list-group-item d-flex justify-content-between">
                  <span>{asset.name}</span>
                  <span className={`badge bg-${asset.status === 'Active' ? 'success' : 'warning'}`}>
                    {asset.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No assets available</p>
          )}
        </div>
        
        <div className="col-md-6">
          <h3>Recent Work Orders</h3>
          {workOrders.length > 0 ? (
            <ul className="list-group">
              {workOrders.slice(0, 5).map(order => (
                <li key={order._id} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <span><strong>{order.asset}</strong></span>
                    <span className={`badge bg-${
                      order.status === 'Completed' ? 'success' : 
                      order.status === 'In Progress' ? 'info' : 'warning'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <small className="text-muted">{order.description}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No work orders available</p>
          )}
        </div>
      </div>
    </div>
  );
}
export default Dashboard;