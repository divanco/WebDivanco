import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center items-center">
          <BuildingOfficeIcon className="h-12 w-12 text-primary-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">Divanco</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
        
        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;