import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  const [software, setSoftware] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const [userPermissions, setUserPermissions] = useState({});
  const [editingSoftware, setEditingSoftware] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    accessLevels: []
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  
  const API_URL = 'https://leucine-tech-internship.onrender.com/api';
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch software list
        const softwareResponse = await fetch(`${API_URL}/software`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!softwareResponse.ok) {
          throw new Error('Failed to fetch software list');
        }
        
        const softwareData = await softwareResponse.json();
        setSoftware(softwareData);
        
        // Fetch requests based on user role
        const requestsEndpoint = 
          user.role === 'Employee' ? '/requests/my-requests' : '/requests';
        
        const requestsResponse = await fetch(`${API_URL}${requestsEndpoint}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch requests');
        }
        
        const requestsData = await requestsResponse.json();
        setRequests(requestsData);
        
        // Determine user permissions based on approved requests
        if (user.role === 'Employee') {
          const permissions = {};
          requestsData.forEach(req => {
            if (req.status === 'Approved' && req.software) {
              if (!permissions[req.software.id]) {
                permissions[req.software.id] = [];
              }
              permissions[req.software.id].push(req.accessType);
            }
          });
          setUserPermissions(permissions);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Check if user has specific access to a software
  const hasAccess = (softwareId, accessType) => {
    return userPermissions[softwareId]?.includes(accessType) || false;
  };
  
  // Handle direct request from dashboard
  const handleRequestAccess = async (softwareId, accessType) => {
    try {
      const response = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          softwareId: softwareId,
          accessType: accessType,
          reason: `Requesting ${accessType} access to this software.`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit request');
      }
      
      // Refresh the requests list
      const requestsEndpoint = '/requests/my-requests';
      const requestsResponse = await fetch(`${API_URL}${requestsEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!requestsResponse.ok) {
        throw new Error('Failed to refresh requests');
      }
      
      const requestsData = await requestsResponse.json();
      setRequests(requestsData);
      setRequestStatus('Request submitted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setRequestStatus(''), 3000);
      
    } catch (err) {
      setError(err.message);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  // Replace the handleEditSoftware function
  const handleEditSoftware = (softwareId) => {
    // Find the software to edit
    const softwareToEdit = software.find(sw => sw.id === softwareId);
    
    if (softwareToEdit) {
      // Parse accessLevels if it's a string
      const accessLevels = typeof softwareToEdit.accessLevels === 'string' 
        ? JSON.parse(softwareToEdit.accessLevels)
        : softwareToEdit.accessLevels || ['Read', 'Write', 'Admin'];
        
      // Set up the edit form
      setEditingSoftware(softwareToEdit);
      setEditForm({
        name: softwareToEdit.name,
        description: softwareToEdit.description || '',
        accessLevels: accessLevels
      });
      setIsEditModalOpen(true);
    }
  };
  
  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };
  
  // Handle access levels checkbox changes
  const handleAccessLevelChange = (level) => {
    const currentLevels = [...editForm.accessLevels];
    
    if (currentLevels.includes(level)) {
      // Remove the level if already selected
      setEditForm({
        ...editForm,
        accessLevels: currentLevels.filter(l => l !== level)
      });
    } else {
      // Add the level if not selected
      setEditForm({
        ...editForm,
        accessLevels: [...currentLevels, level]
      });
    }
  };
  
  // Submit the edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingSoftware) return;
    
    try {
      const response = await fetch(`${API_URL}/software/${editingSoftware.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          accessLevels: editForm.accessLevels
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update software');
      }
      
      // Refresh the software list
      const softwareResponse = await fetch(`${API_URL}/software`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!softwareResponse.ok) {
        throw new Error('Failed to refresh software list');
      }
      
      const softwareData = await softwareResponse.json();
      setSoftware(softwareData);
      
      // Close the modal and reset
      setIsEditModalOpen(false);
      setEditingSoftware(null);
      setUpdateStatus('Software updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateStatus(''), 3000);
      
    } catch (err) {
      setError(err.message);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };
  
  // Close the edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingSoftware(null);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-800 pb-3 mb-6 border-b border-gray-200">Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {requestStatus && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
          <p>{requestStatus}</p>
        </div>
      )}
      
      {updateStatus && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
          <p>{updateStatus}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 pb-3 mb-4 border-b border-gray-200">
              Available Software
            </h2>
            
            {software.length === 0 ? (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <p className="text-gray-600 mb-2">No software available in the system.</p>
                {user.role === 'Admin' && (
                  <p className="text-gray-500 text-sm">As an admin, you can add new software using the button below.</p>
                )}
              </div>
            ) : (
              <ul className="space-y-4">
                {software.map(sw => (
                  <li key={sw.id} className="bg-gray-50 rounded-md overflow-hidden border-l-4 border-blue-500">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-800">{sw.name}</h3>
                        {user.role === 'Employee' && hasAccess(sw.id, 'Write') && (
                          <button 
                            onClick={() => handleEditSoftware(sw.id, sw.name)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      {sw.description && (
                        <p className="text-gray-600 text-sm mb-3">{sw.description}</p>
                      )}
                      
                      <p className="text-sm text-gray-700 pt-2 border-t border-gray-200">
                        <span className="font-medium">Available Access:</span> {" "}
                        {Array.isArray(sw.accessLevels) 
                          ? sw.accessLevels.join(', ') 
                          : typeof sw.accessLevels === 'string' 
                            ? JSON.parse(sw.accessLevels).join(', ')
                            : 'Read, Write, Admin'}
                      </p>
                      
                      {user.role === 'User' && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(Array.isArray(sw.accessLevels) 
                            ? sw.accessLevels 
                            : typeof sw.accessLevels === 'string' 
                              ? JSON.parse(sw.accessLevels)
                              : ['Read', 'Write', 'Admin']).map(accessType => {
                                // Check if the user already has a pending or approved request for this access
                                const hasExistingRequest = requests.some(
                                  req => req.software?.id === sw.id && 
                                        req.accessType === accessType && 
                                        (req.status === 'Pending' || req.status === 'Approved')
                                );
                                
                                const existingRequest = requests.find(req => 
                                  req.software?.id === sw.id && 
                                  req.accessType === accessType && 
                                  (req.status === 'Pending' || req.status === 'Approved')
                                );
                                
                                return (
                                  <button 
                                    key={`${sw.id}-${accessType}`}
                                    onClick={() => handleRequestAccess(sw.id, accessType)}
                                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                      hasExistingRequest 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                                    disabled={hasExistingRequest}
                                  >
                                    {hasExistingRequest 
                                      ? `${accessType} (${existingRequest.status})`
                                      : `Request ${accessType}`}
                                  </button>
                                );
                              })}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            {user.role === 'Admin' && (
              <Link 
                to="/create-software" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Software
              </Link>
            )}
            
            {user.role === 'Employee' && software.length > 0 && (
              <Link 
                to="/request-access" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Request Software Access
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 pb-3 mb-4 border-b border-gray-200">
              {user.role === 'Employee' ? 'My Access Requests' : 'Access Requests'}
            </h2>
            
            {requests.length === 0 ? (
              <div className="bg-gray-50 rounded-md p-8 text-center">
                <p className="text-gray-600 mb-2">No requests found.</p>
                {user.role === 'Employee' && (
                  <p className="text-gray-500 text-sm">You can request access to software using the button below.</p>
                )}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-md p-3 text-center">
                    <span className="block text-2xl font-bold text-gray-800">
                      {requests.filter(r => r.status === 'Pending').length}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Pending</span>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 text-center">
                    <span className="block text-2xl font-bold text-gray-800">
                      {requests.filter(r => r.status === 'Approved').length}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Approved</span>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 text-center">
                    <span className="block text-2xl font-bold text-gray-800">
                      {requests.filter(r => r.status === 'Rejected').length}
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Rejected</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-700 mb-3">Recent Requests</h3>
                <ul className="space-y-2">
                  {requests.slice(0, 5).map(req => {
                    let statusColor;
                    switch(req.status) {
                      case 'Pending':
                        statusColor = 'bg-yellow-100 text-yellow-800';
                        break;
                      case 'Approved':
                        statusColor = 'bg-green-100 text-green-800';
                        break;
                      case 'Rejected':
                        statusColor = 'bg-red-100 text-red-800';
                        break;
                      default:
                        statusColor = 'bg-gray-100 text-gray-800';
                    }
                    
                    return (
                      <li 
                        key={req.id} 
                        className={`flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4 ${
                          req.status === 'Pending' ? 'border-yellow-400' : 
                          req.status === 'Approved' ? 'border-green-400' : 'border-red-400'
                        }`}
                      >
                        <div>
                          <span className="font-medium text-gray-800">
                            {req.software?.name}
                          </span>
                          <span className="ml-2 text-sm text-gray-600">
                            {req.accessType} Access
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
                          {req.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            {user.role === 'Employee' && requests.length === 0 && (
              <Link 
                to="/request-access" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Request Access
              </Link>
            )}
            
            {(user.role === 'Manager' || user.role === 'Admin') && (
              <Link 
                to="/pending-requests" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {requests.filter(r => r.status === 'Pending').length > 0 
                  ? `Review Requests (${requests.filter(r => r.status === 'Pending').length})` 
                  : 'Manage Requests'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal with Tailwind CSS */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Software</h2>
              <button 
                type="button"
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Software Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  Access Levels
                </span>
                <div className="flex flex-wrap gap-4">
                  {['Read', 'Write', 'Admin'].map(level => (
                    <div key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`access-${level}`}
                        checked={editForm.accessLevels.includes(level)}
                        onChange={() => handleAccessLevelChange(level)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`access-${level}`} className="ml-2 text-sm text-gray-700">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
