import { useState } from 'react';
import axios from 'axios';
import '../styles/AddAsset.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function AddAsset({ onAdd }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('Operational');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/assets`, { name, location, status });
      if (onAdd) {
        onAdd(response.data);
      }
      setName('');
      setLocation('');
      setStatus('Operational');
      setError('');
    } catch (error) {
      setError('Error adding asset: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-asset-form">
      <h3>➕ Add New Asset</h3>
      
      {error && <div className="form-alert alert-danger">{error}</div>}

      <div className="form-group">
        <label className="form-label">Asset Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., CNC Machine A1"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          type="text"
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Building A, Floor 2"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          className="form-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
        >
          <option value="Operational">Operational</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? '⏳ Adding...' : '✓ Add Asset'}
      </button>
    </form>
  );
}

export default AddAsset;