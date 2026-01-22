import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../constants';
import '../styles/TaskHistory.css';

function TaskHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [taskDetails, setTaskDetails] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/work-orders/${id}`);
        setHistory(res.data.history || []);
        setTaskDetails(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load task history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const getStatusColor = (action) => {
    if (action.includes('Assigned')) return 'info';
    if (action.includes('Completed')) return 'success';
    if (action.includes('Progress')) return 'warning';
    return 'secondary';
  };

  return (
    <div className="taskhistory-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="page-header">
        <h1>📖 Task History</h1>
        <p>Task ID: {id}</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">⏳ Loading task history...</div>
      ) : (
        <>
          {taskDetails && (
            <div className="task-summary">
              <div className="summary-card">
                <h3>📋 Task Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Asset:</label>
                    <span>{taskDetails.asset}</span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{taskDetails.description}</span>
                  </div>
                  <div className="detail-item">
                    <label>Priority:</label>
                    <span className={`badge badge-${taskDetails.priority?.toLowerCase()}`}>
                      {taskDetails.priority}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Current Status:</label>
                    <span className={`badge badge-${taskDetails.status?.toLowerCase().replace(/\\s/g, '-')}`}>
                      {taskDetails.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="history-timeline">
            <h3>📝 Timeline</h3>
            {history.length === 0 ? (
              <div className="empty-history">
                <p>No history entries yet</p>
              </div>
            ) : (
              <div className="timeline-list">
                {history.map((entry, index) => (
                  <div key={index} className={`timeline-item timeline-${getStatusColor(entry.action)}`}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className={`action-badge badge-${getStatusColor(entry.action)}`}>
                          {entry.action}
                        </span>
                        <span className="timestamp">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="timeline-details">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default TaskHistory;