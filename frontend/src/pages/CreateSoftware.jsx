import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createSoftware.css';
function CreateSoftware({ user }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accessLevels, setAccessLevels] = useState({
    read: true,
    write: true,
    admin: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const API_URL = 'https://leucine-tech-internship.onrender.com/api';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name) {
      setError('Software name is required');
      return;
    }
    
    // Convert access levels to array format
    const accessLevelsArray = [];
    if (accessLevels.read) accessLevelsArray.push('Read');
    if (accessLevels.write) accessLevelsArray.push('Write');
    if (accessLevels.admin) accessLevelsArray.push('Admin');
    
    if (accessLevelsArray.length === 0) {
      setError('At least one access level must be selected');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/software`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name,
          description,
          accessLevels: accessLevelsArray
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create software');
      }
      
      alert('Software added successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError('Error creating software: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccessLevelChange = (level) => {
    setAccessLevels({
      ...accessLevels,
      [level]: !accessLevels[level]
    });
  };
  
  return (
    <div className="page-container">
      <h1>Add New Software</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Software Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter software name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter software description"
            />
          </div>
          
          <div className="form-group">
            <label>Available Access Levels:</label>
            <div className="checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={accessLevels.read}
                  onChange={() => handleAccessLevelChange('read')}
                />
                Read
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={accessLevels.write}
                  onChange={() => handleAccessLevelChange('write')}
                />
                Write
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={accessLevels.admin}
                  onChange={() => handleAccessLevelChange('admin')}
                />
                Admin
              </label>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Software'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSoftware;
