import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import LoadingBoundary from '../shared/LoadingBoundary';
import { useUI } from '../../../hooks';

const AdminLayout = () => {
  const { sidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminSidebar /> */}
      
      <div className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        <AdminHeader />
        
        <main className="p-6">
          <Suspense fallback={<LoadingBoundary />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;