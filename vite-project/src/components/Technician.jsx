import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/Authcontext';
import '../styles/Technician.css';
const API_URL = import.meta.env.VITE_API_URL || '/api';

function Technician() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (user?.role === 'Technician') {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/work-orders`);
      setTasks(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/work-orders/${id}/status`, { status });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`${API_URL}/work-orders/${id}`);
      fetchTasks();
      setError(null);
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

  const getProgressPercentage = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 0;
      case 'in progress': return 50;
      case 'completed': return 100;
      default: return 0;
    }
  };

  if (!user) {
    return (
      <div className="access-denied">
        <h1>🔐 Login Required</h1>
        <p>Please log in with a Technician account to access your tasks.</p>
        <p style={{ fontSize: '0.9em', marginTop: '10px' }}>Demo: tech@example.com / password123</p>
      </div>
    );
  }

  if (user.role !== 'Technician') {
    return (
      <div className="access-denied">
        <h1>🚫 Access Denied</h1>
        <p>You must be a Technician to access this page.</p>
        <p>Your current role: <strong>{user.role}</strong></p>
      </div>
    );
  }

  return (
    <div className="technician-container">
      <div className="page-header">
        <h1>🔧 My Assigned Tasks</h1>
        <p>View and manage your assigned maintenance work</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">⏳ Loading your tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>✓ No tasks assigned to you yet</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <h3>{task.asset}</h3>
                <span className={`priority-badge badge-${getPriorityColor(task.priority)}`}>
                  {task.priority} Priority
                </span>
              </div>

              <div className="task-content">
                <p><strong>Description:</strong> {task.description}</p>
                <p><strong>Current Status:</strong> <span className={`status-text status-${task.status?.toLowerCase().replace(/\\s/g, '-')}`}>{task.status}</span></p>
              </div>

              <div className="task-progress">
                <div className="progress-label">
                  <span>Progress</span>
                  <span>{getProgressPercentage(task.status)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${getProgressPercentage(task.status)}%` }}></div>
                </div>
              </div>

              <div className="task-actions">
                <label className="action-label">Update Status:</label>
                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task._id, e.target.value)}
                  className="status-dropdown"
                >
                  <option value="Pending">📋 Pending</option>
                  <option value="In Progress">🔄 In Progress</option>
                  <option value="Completed">✓ Completed</option>
                </select>
                <button 
                  onClick={() => deleteTask(task._id)}
                  className="btn-delete-task"
                  title="Delete this task"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="task-footer">
                <small>ID: {task._id.substring(0, 8)}...</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Technician;