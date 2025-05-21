import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RequestAccess({ user }) {
  const [software, setSoftware] = useState([]);
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [accessType, setAccessType] = useState('Read');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5002/api';
  
  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/software`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch software list');
        }
        
        const data = await response.json();
        setSoftware(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSoftware();
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSoftware || !reason) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          softwareId: selectedSoftware,
          accessType,
          reason
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }
      
      alert('Access request submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const getAccessTypes = (software) => {
    if (!software) return ['Read', 'Write', 'Admin'];
    
    try {
      if (software.accessLevels) {
        if (Array.isArray(software.accessLevels)) {
          return software.accessLevels;
        } else if (typeof software.accessLevels === 'string') {
          return JSON.parse(software.accessLevels);
        }
      }
    } catch (e) {
      console.error('Error parsing access levels:', e);
    }
    
    return ['Read', 'Write', 'Admin'];
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading software list...
    </div>;
  }
  
  const selectedSoftwareObj = software.find(s => s.id.toString() === selectedSoftware);
  const availableAccessTypes = getAccessTypes(selectedSoftwareObj);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Request Software Access</h1>
        
        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded shadow-sm">
          <p>{error}</p>
        </div>}
        
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          {software.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <p className="mt-2 text-gray-600">No software is available to request access to.</p>
              <p className="text-gray-500 mb-6">Please contact an administrator.</p>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="software" className="block text-sm font-medium text-gray-700 mb-1">Software:</label>
                <select
                  id="software"
                  value={selectedSoftware}
                  onChange={(e) => {
                    setSelectedSoftware(e.target.value);
                    // Reset access type when software changes
                    if (e.target.value) {
                      const sw = software.find(s => s.id.toString() === e.target.value);
                      const types = getAccessTypes(sw);
                      setAccessType(types[0] || 'Read');
                    }
                  }}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="">Select Software</option>
                  {software.map(sw => (
                    <option key={sw.id} value={sw.id}>{sw.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="accessType" className="block text-sm font-medium text-gray-700 mb-1">Access Type:</label>
                <select
                  id="accessType"
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value)}
                  required
                  disabled={!selectedSoftware}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md shadow-sm ${
                    !selectedSoftware ? 'bg-gray-100 cursor-not-allowed' : 'focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                  }`}
                >
                  {availableAccessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Access:</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={5}
                  placeholder="Explain why you need access to this software..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  type="button" 
                  onClick={() => navigate('/dashboard')} 
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                    submitting 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors duration-200`}
                >
                  {submitting ? 
                    <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>Submitting...</> : 
                    'Submit Request'
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default RequestAccess;
