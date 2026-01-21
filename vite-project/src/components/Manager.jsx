import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/Authcontext';
import '../styles/Manager.css';
const API_URL = import.meta.env.VITE_API_URL || '/api';

function Manager() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ asset: '', description: '', priority: 'Medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (user?.role === 'Manager' || user?.role === 'Admin') {
      fetchOrders();
      axios.get(`${API_URL}/users`).then(res => setUsers(res.data.filter(u => u.role === 'Technician')));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/work-orders`);
      setOrders(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load work orders');
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/work-orders`, newTask);
      setNewTask({ asset: '', description: '', priority: 'Medium' });
      fetchOrders();
      setError('');
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const assignTask = async (id, technicianId) => {
    try {
      await axios.put(`${API_URL}/work-orders/${id}/assign`, { technicianId });
      fetchOrders();
      setError('');
    } catch (err) {
      setError('Failed to assign task');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/work-orders/${id}`);
      fetchOrders();
      setError('');
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  if (!user) {
    return (
      <div className="access-denied">
        <h1>🔐 Login Required</h1>
        <p>Please log in with a Manager or Admin account to access this page.</p>
        <p style={{ fontSize: '0.9em', marginTop: '10px' }}>Demo: manager@example.com / password123</p>
      </div>
    );
  }

  if (user.role !== 'Manager' && user.role !== 'Admin') {
    return (
      <div className="access-denied">
        <h1>🚫 Access Denied</h1>
        <p>You must be a Manager or Admin to access the Manager Dashboard.</p>
        <p>Your current role: <strong>{user.role}</strong></p>
      </div>
    );
  }

  return (
    <div className="manager-container">
      <div className="page-header">
        <h1>📈 Manager Dashboard</h1>
        <p>Create and manage maintenance tasks</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">⏳ Loading manager dashboard...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="create-task-section">
              <h2>✏️ Create Maintenance Task</h2>
              <form onSubmit={createTask} className="task-form">
                <div className="form-group">
                  <label className="form-label">Asset Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTask.asset}
                    onChange={(e) => setNewTask({ ...newTask, asset: e.target.value })}
                    placeholder="e.g., CNC Machine A1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Describe the maintenance work required..."
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="form-select"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="Low">🟢 Low</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="High">🔴 High</option>
                  </select>
                </div>

                <button type="submit" className="btn-create-task">Create Task</button>
              </form>
            </div>

            <div className="tasks-overview-section">
              <h2>📋 Task Overview</h2>
              {orders.length === 0 ? (
                <div className="empty-state">
                  <p>📭 No tasks created yet</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {orders.map(order => (
                    <div key={order._id} className="task-row">
                      <div className="task-info">
                        <h4>{order.asset}</h4>
                        <p className="task-description">{order.description}</p>
                        <div className="task-meta">
                          <span className={`priority-badge badge-${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                          <span className="status-badge">{order.status}</span>
                        </div>
                      </div>

                      <div className="task-assign">
                        <select
                          onChange={(e) => assignTask(order._id, e.target.value)}
                          defaultValue=""
                          className="assign-select"
                        >
                          <option value="" disabled>
                            {order.assignedTo ? `Assigned to: ${order.assignedTo.name}` : 'Assign Technician'}
                          </option>
                          {users.map(tech => (
                            <option key={tech._id} value={tech._id}>{tech.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => deleteTask(order._id)}
                          className="btn-delete-task"
                          title="Delete this task"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Manager;