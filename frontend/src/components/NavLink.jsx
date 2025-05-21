import { Link } from 'react-router-dom';

function NavLink({ to, isActive, icon: Icon, children, isMobile = false }) {
  const desktopClasses = `
    relative text-white group flex items-center gap-2 px-3 py-2 text-sm font-medium
    transition-all duration-300 rounded-md
    ${isActive 
      ? 'bg-white/10 text-white' 
      : 'hover:bg-white/10 hover:text-white text-teal-100'}
  `;
  
  const mobileClasses = `
    text-white w-full flex items-center gap-3 px-4 py-3 text-base font-medium
    transition-all duration-300 rounded-md
    ${isActive 
      ? 'bg-white/10 text-white' 
      : 'hover:bg-white/10 hover:text-white text-teal-100'}
  `;
  
  return (
    <Link
      to={to}
      className={isMobile ? mobileClasses : desktopClasses}
    >
      <span className="relative z-10">
        {Icon && <Icon 
          className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
        />}
      </span>
      <span className="relative z-10">{children}</span>
      
      {!isMobile && isActive && (
        <span className="absolute inset-0 bg-white/10 rounded-md" />
      )}
      
      {!isMobile && !isActive && (
        <span className="absolute inset-0 bg-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </Link>
  );
}

export default NavLink;
