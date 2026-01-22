import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/Authcontext';
import { API_URL } from '../constants';
import '../styles/WorkOrders.css';

function WorkOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (user.role === 'Manager' || user.role === 'Admin') {
        axios.get(`${API_URL}/users`).then(res => setUsers(res.data.filter(u => u.role === 'Technician')));
      }
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/work-orders`);
      setOrders(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  const assignTask = async (id, technicianId) => {
    if (user?.role === 'Manager' || user?.role === 'Admin') {
      try {
        await axios.put(`${API_URL}/work-orders/${id}/assign`, { technicianId });
        fetchOrders();
        setError('');
      } catch (err) {
        setError('Failed to assign task');
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/work-orders/${id}/status`, { status });
      fetchOrders();
      setError('');
    } catch (err) {
      setError('Failed to update status');
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

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'primary';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="workorders-container">
      <div className="page-header">
        <h1>📋 Work Orders Management</h1>
        <p>Track and manage all maintenance tasks</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading work orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>📭 No work orders available</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                {(user?.role === 'Manager' || user?.role === 'Admin') && <th>Actions</th>}
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="asset-name">{order.asset}</td>
                  <td className="description">{order.description}</td>
                  <td>
                    <span className={`badge badge-${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={user?.role === 'Technician' && order.assignedTo?._id?.toString() !== user._id}
                      className={`status-select badge-${getStatusColor(order.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="assigned-to">
                    {order.assignedTo ? order.assignedTo.name : <span className="unassigned">Unassigned</span>}
                  </td>
                  {(user?.role === 'Manager' || user?.role === 'Admin') && (
                    <td>
                      <select
                        onChange={(e) => assignTask(order._id, e.target.value)}
                        defaultValue=""
                        className="assign-select"
                      >
                        <option value="" disabled>Assign</option>
                        {users.map(tech => (
                          <option key={tech._id} value={tech._id}>{tech.name}</option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td>
                    <Link to={`/work-orders/${order._id}/history`} className="history-link">
                      📖 View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default WorkOrders;