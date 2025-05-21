import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PendingRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5002/api';
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/requests`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRequests();
  }, [user]);
  
  const handleUpdateStatus = async (requestId, status) => {
    try {
      setActionLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${status.toLowerCase()} request`);
      }
      
      // Refresh the requests list
      fetchRequests();
      alert(`Request ${status.toLowerCase()} successfully`);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-600">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading requests...
      </div>
    );
  }
  
  const pendingRequests = requests.filter(req => req.status === 'Pending');
  const otherRequests = requests.filter(req => req.status !== 'Pending');
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Manage Access Requests</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded shadow-sm">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Pending Requests</h2>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <p className="mt-2 text-gray-600">No pending requests to review.</p>
              <button 
                onClick={() => navigate('/dashboard')} 
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map(request => (
                <div key={request.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">Request #{request.id}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Software</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.software?.name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">User</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.user?.username}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Access Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.accessType}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Requested</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(request.createdAt).toLocaleString()}</dd>
                      </div>
                      <div className="sm:col-span-2 mt-1">
                        <dt className="text-sm font-medium text-gray-500">Reason</dt>
                        <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{request.reason}</dd>
                      </div>
                    </dl>
                    
                    <div className="mt-4 flex justify-end space-x-3">
                      <button 
                        onClick={() => handleUpdateStatus(request.id, 'Rejected')}
                        className={`
                          inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md 
                          text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                          ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''} transition-colors duration-200
                        `}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(request.id, 'Approved')}
                        className={`
                          inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md
                          text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                          ${actionLoading ? 'opacity-60 cursor-not-allowed' : ''} transition-colors duration-200
                        `}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          : null
                        }
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Previous Requests</h2>
          
          {otherRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No processed requests found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherRequests.map(request => (
                <div key={request.id} className={`
                  border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white
                  ${request.status === 'Approved' ? 'border-green-200' : 'border-red-200'}
                `}>
                  <div className={`
                    px-4 py-3 border-b flex justify-between items-center
                    ${request.status === 'Approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}
                  `}>
                    <h3 className="text-lg font-medium text-gray-800">Request #{request.id}</h3>
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${request.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}
                    `}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Software</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.software?.name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">User</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.user?.username}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Access Type</dt>
                        <dd className="mt-1 text-sm text-gray-900">{request.accessType}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Requested</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(request.createdAt).toLocaleString()}</dd>
                      </div>
                      <div className="sm:col-span-2 mt-1">
                        <dt className="text-sm font-medium text-gray-500">Reason</dt>
                        <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded">{request.reason}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PendingRequests;
