import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/Authcontext';
import AddAsset from './AddAsset';
import '../styles/Assets.css';
const API_URL = import.meta.env.VITE_API_URL || '/api';

function Assets() {
  const { user } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAssets();
  }, [user]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/assets`);
      setAssets(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const addAsset = (newAsset) => {
    if (user?.role === 'Admin') {
      fetchAssets();
      setShowAddForm(false);
      setError('');
    }
  };

  const deleteAsset = async (id) => {
    try {
      await axios.delete(`${API_URL}/assets/${id}`);
      fetchAssets();
      setError('');
    } catch (err) {
      setError('Failed to delete asset');
    }
  };

  return (
    <div className="assets-container">
      <div className="page-header">
        <h1>🏭 Assets Management</h1>
        <p>Manage and track all your industrial assets</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          ⚠️ {error}
        </div>
      )}

      {user?.role === 'Admin' && (
        <div className="action-bar">
          <button
            className={`btn-action ${showAddForm ? 'cancel' : 'add'}`}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add Asset'}
          </button>
        </div>
      )}

      {showAddForm && user?.role === 'Admin' && (
        <div className="add-form-wrapper">
          <AddAsset onAdd={addAsset} />
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="empty-state">
          <p>📭 No assets available</p>
        </div>
      ) : (
        <div className="assets-grid">
          {assets.map(asset => (
            <div key={asset._id} className="asset-card">
              <div className="asset-header">
                <h3>{asset.name}</h3>
                <span className={`status-badge ${asset.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {asset.status}
                </span>
                {user?.role === 'Admin' && (
                  <button
                    className="btn-delete"
                    onClick={() => deleteAsset(asset._id)}
                    title="Delete Asset"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="asset-content">
                <p><strong>Location:</strong> {asset.location}</p>
                <p><strong>Model:</strong> {asset.model || 'N/A'}</p>
                <p><strong>Manufacturer:</strong> {asset.manufacturer || 'N/A'}</p>
              </div>
              <div className="asset-footer">
                <small>ID: {asset._id}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Assets;