
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const Hero = ({ 
  backgroundImage = '/images/prueba/hero.png',
}) => {
  // Solo estados para el pan en mobile
  const [isPanning, setIsPanning] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 50, y: 50 });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    const touch = e.touches[0];
    setIsPanning(true);
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startPan.current = { ...panPosition };
  };

  const handleTouchMove = (e) => {
    if (!isPanning || !isMobile) return;
    const touch = e.touches[0];
    const deltaX = (touch.clientX - startPos.current.x) / window.innerWidth * 30;
    const deltaY = (touch.clientY - startPos.current.y) / window.innerHeight * 30;

    setPanPosition({
      x: Math.max(20, Math.min(80, startPan.current.x - deltaX)),
      y: Math.max(20, Math.min(80, startPan.current.y - deltaY))
    });
    e.preventDefault();
  };

  const handleTouchEnd = () => setIsPanning(false);

  // Event listeners solo para touch
  useEffect(() => {
    if (isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isPanning, isMobile, panPosition]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* ✅ PANTALLAS GRANDES: Imagen con tag img para ocupar toda la pantalla */}
      {!isMobile && (
        <>
          {/* Background de fallback */}
          <div className="absolute inset-0 bg-gray-900 -z-10" />
          
          {/* Imagen principal que SIEMPRE llena la pantalla */}
          <img
            src={backgroundImage}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            onLoad={() => console.log('✅ Imagen cargada!')}
            onError={() => console.log('❌ Error cargando imagen')}
          />
        </>
      )}

      {/* ✅ MOBILE: Background image con pan */}
      {isMobile && (
        <div 
          className="absolute inset-0 z-0 bg-gray-900"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: `${panPosition.x}% ${panPosition.y}%`,
            backgroundRepeat: 'no-repeat',
            transition: isPanning ? 'none' : 'background-position 0.3s ease-out'
          }}
          onTouchStart={handleTouchStart}
        />
      )}

      {/* ✅ Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-px h-16 bg-white/50 mx-auto mb-4"></div>
        <svg 
          className="w-6 h-6 text-white/70 animate-bounce" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M19 14l-7 7m0 0l-7-7m7 7V3" 
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;