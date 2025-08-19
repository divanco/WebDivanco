import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Header from './Header'; // ✅ Ahora existe
import Footer from './Footer'; // ✅ Ahora existe
import { LoadingSpinner } from '../shared/LoadingBoundary'; // ✅ Ya verificado
import ScrollToTop from '../shared/ScrollToTop'; // ✅ Ya existe
import WhatsApp from '../../ui/WhatsApp'; // ✅ Ahora existe
const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTop />
      <Header />
      
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
          <Outlet />
        </Suspense>
      </main>
      
      <Footer />
      <WhatsApp 
        phoneNumber="5491134567890" // Tu número de WhatsApp
        message="Hablemos"
      />
    </div>
  );
};

export default PublicLayout;