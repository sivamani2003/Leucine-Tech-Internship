import { useLocation } from 'react-router-dom';
import NavLink from './NavLink';
import UserBadge from './UserBadge';

function MobileMenu({ isOpen, user, onLogout }) {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Icons as components
  const KeyIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
  
  const ClipboardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h1" />
    </svg>
  );
  
  const PlusCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
  
  const LogOutIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  return (
    <div 
      className={`
        md:hidden bg-gradient-to-b from-teal-600 to-blue-700
        overflow-hidden transition-all duration-300 ease-in-out
        ${isOpen ? 'max-h-96 shadow-lg' : 'max-h-0'}
      `}
    >
      <div className="space-y-1 p-2">
        <div className="pt-2 pb-4">
          <UserBadge user={user} isMobile={true} />
        </div>
        
        <div className="space-y-1">
          {user.role === 'Employee' && (
            <NavLink 
              to="/request-access" 
              isActive={isActive('/request-access')}
              icon={KeyIcon}
              isMobile={true}
            >
              Request Access
            </NavLink>
          )}
          
          {(user.role === 'Manager' || user.role === 'Admin') && (
            <NavLink 
              to="/pending-requests" 
              isActive={isActive('/pending-requests')}
              icon={ClipboardIcon}
              isMobile={true}
            >
              Manage Requests
            </NavLink>
          )}
          
          {user.role === 'Admin' && (
            <NavLink 
              to="/create-software" 
              isActive={isActive('/create-software')}
              icon={PlusCircleIcon}
              isMobile={true}
            >
              Add Software
            </NavLink>
          )}
        </div>
        
        <div className="pt-4 pb-2">
          <button 
            onClick={onLogout} 
            className="w-full text-left px-4 py-3 text-white bg-gradient-to-r from-orange-500 to-red-500
              hover:from-orange-600 hover:to-red-600 rounded-md transition-all duration-300 
              flex items-center gap-3"
          >
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
