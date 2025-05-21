function UserBadge({ user, isMobile = false }) {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-orange-500 text-white';
      case 'Manager':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  if (isMobile) {
    return (
      <><div className="flex flex-col space-y-1 p-3 bg-teal-700/50 rounded-lg"></div><div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-200 flex items-center justify-center text-teal-800 font-bold">
                {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="font-medium text-white">{user.username}</p>
                <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                </div>
            </div>
        </div></>

    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-800 font-bold">
        {user.username.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{user.username}</p>
        <div className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center ${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </div>
      </div>
    </div>
  );
}

export default UserBadge;
