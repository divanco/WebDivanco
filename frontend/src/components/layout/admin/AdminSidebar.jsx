import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useUI } from '../../../hooks/useUI';
import Button from '../../ui/Button';
import { 
  HomeIcon, 
  UsersIcon, 
  CogIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    ...(isAdmin ? [
      { name: 'Usuarios', href: '/users', icon: UsersIcon, current: location.pathname === '/users' },
      { name: 'Configuración', href: '/settings', icon: CogIcon, current: location.pathname === '/settings' },
    ] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="relative flex flex-col w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="ml-1 h-10 w-10 rounded-full text-white hover:bg-white hover:bg-opacity-20"
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
            <SidebarContent 
              navigation={navigation} 
              user={user} 
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200 z-30">
        <SidebarContent 
          navigation={navigation} 
          user={user} 
          onLogout={handleLogout}
        />
      </div>
    </>
  );
};

const SidebarContent = ({ navigation, user, onLogout }) => {
  return (
    <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center flex-shrink-0 px-4 mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Boilerplate App</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
              item.current
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.username || 'Usuario'}
            </p>
            <p className="text-xs font-medium text-gray-500 capitalize">
              {user?.role || 'user'}
            </p>
          </div>
        </div>
        
        {/* Logout button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;