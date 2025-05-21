import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavLink from './NavLink';
import UserBadge from './UserBadge';
import MobileMenu from './MobileMenu';

function Navbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Icons as components
  const LayoutDashboardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
  
  const KeyIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
  
  const ClipboardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h1" />
    </svg>
  );
  
  const PlusCircleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
  
  const LogOutIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
  
  const MenuIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
  
  const XIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
  
  return (
    <header>
      <nav 
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-gradient-to-r from-teal-600 to-blue-600
          transition-all duration-300 ease-in-out
          ${scrolled ? 'shadow-lg shadow-teal-900/20' : ''}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link 
                to="/dashboard" 
                className="text-white font-bold text-xl flex items-center gap-2
                  hover:text-teal-100 transition-all duration-300 transform hover:scale-105"
              >
                <LayoutDashboardIcon />
                <span className="hidden sm:inline">Software Access Management</span>
                <span className="sm:hidden">SAM</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <div className="flex items-center space-x-1 mr-4">
                {user.role === 'Employee' && (
                  <NavLink 
                    to="/request-access" 
                    isActive={isActive('/request-access')}
                    icon={KeyIcon}
                  >
                    Request Access
                  </NavLink>
                )}
                
                {(user.role === 'Manager' || user.role === 'Admin') && (
                  <NavLink 
                    to="/pending-requests" 
                    isActive={isActive('/pending-requests')}
                    icon={ClipboardIcon}
                  >
                    Manage Requests
                  </NavLink>
                )}
                
                {user.role === 'Admin' && (
                  <NavLink 
                    to="/create-software" 
                    isActive={isActive('/create-software')}
                    icon={PlusCircleIcon}
                  >
                    Add Software
                  </NavLink>
                )}
              </div>
              
              <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                <UserBadge user={user} />
                
                <button 
                  onClick={onLogout} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600
                    text-white px-4 py-1.5 rounded-md text-sm font-medium
                    transition-all duration-300 transform hover:scale-105 hover:shadow-md
                    flex items-center gap-2"
                  aria-label="Logout"
                >
                  <LogOutIcon />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-white hover:text-teal-100 focus:outline-none transition-all duration-300"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <XIcon className="transition-all duration-300" />
                ) : (
                  <MenuIcon className="transition-all duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        <MobileMenu isOpen={isMenuOpen} user={user} onLogout={onLogout} />
      </nav>
      
      <div className="h-16"></div>
    </header>
  );
}

export default Navbar;
