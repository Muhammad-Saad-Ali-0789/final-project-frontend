import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/Authcontext';
import '../styles/Admin.css';
const API_URL = import.meta.env.VITE_API_URL || '/api';

function Admin() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [reports, setReports] = useState({});
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Technician' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Admin useEffect triggered, user:', user);
    const fetchData = async () => {
      if (authLoading) {
        setLoading(true);
        return;
      }
      if (!user || user.role !== 'Admin') {
        console.log('User not admin or not logged in');
        setLoading(false);
        return;
      }
      try {
        console.log('Fetching admin data from:', API_URL);
        setLoading(true);
        const [reportsRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/reports`),
          axios.get(`${API_URL}/users`)
        ]);
        console.log('Reports:', reportsRes.data);
        console.log('Users:', usersRes.data);
        setReports(reportsRes.data || {});
        setUsers(usersRes.data || []);
        setError('');
      } catch (err) {
        console.error('Admin data fetch error:', err);
        setError('Failed to load admin data: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users/register`, newUser);
      setNewUser({ name: '', email: '', password: '', role: 'Technician' });
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to add user: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!user) {
    return (
      <div className="access-denied">
        <h1>🔐 Login Required</h1>
        <p>Please log in with an Admin account to access the Admin Panel.</p>
        <p style={{ fontSize: '0.9em', marginTop: '10px' }}>Demo: admin@example.com / password123</p>
      </div>
    );
  }

  if (user.role !== 'Admin') {
    return (
      <div className="access-denied">
        <h1>🚫 Access Denied</h1>
        <p>You must be an Admin to access the Admin Panel.</p>
        <p>Your current role: <strong>{user.role}</strong></p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="page-header">
        <h1>👨‍💼 Admin Panel</h1>
        <p>System administration and user management</p>
      </div>

      <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
        <p><strong>Current User:</strong> {user.name} ({user.role})</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">⏳ Loading admin data...</div>
      ) : (
        <>
          <div className="stats-section">
            <h2>📊 System Reports</h2>
            {!reports || Object.keys(reports).length === 0 ? (
              <div className="empty-state">
                <p>📭 No reports available yet</p>
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-icon">🏭</div>
                  <div className="stat-content">
                    <p className="stat-label">Total Assets</p>
                    <p className="stat-value">{reports.totalAssets || 0}</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <p className="stat-label">Total Tasks</p>
                    <p className="stat-value">{reports.totalTasks || 0}</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <p className="stat-label">Pending Tasks</p>
                    <p className="stat-value">{reports.pendingTasks || 0}</p>
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-icon">✓</div>
                  <div className="stat-content">
                    <p className="stat-label">Completed Tasks</p>
                    <p className="stat-value">{reports.completedTasks || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="management-section">
            <div className="form-column">
              <h2>➕ Add New User</h2>
              <form onSubmit={addUser} className="user-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="Technician">Technician</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn-submit">Add User</button>
              </form>
            </div>

            <div className="users-column">
              <h2>👥 All Users</h2>
              <div className="users-list">
                {users.length === 0 ? (
                  <div className="empty-state">
                    <p>📭 No users available</p>
                  </div>
                ) : (
                  users.map(u => (
                    <div key={u._id} className="user-item">
                      <div className="user-info">
                        <p className="user-name">{u.name}</p>
                        <p className="user-email">{u.email}</p>
                      </div>
                      <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;