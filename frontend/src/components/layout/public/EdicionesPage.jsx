import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function EdicionesPage() {
  const [currentImage, setCurrentImage] = useState(0);

  // Imágenes para el slideshow
  const images = [
    {
      id: 1,
      src: "/images/prueba/edicion1.png",
      alt: "Edición Living 2025"
    },
    {
      id: 2,
      src: "/images/prueba/edicion2.png", 
      alt: "Edición Modelo 2025"
    },
    {
      id: 3,
      src: "/images/prueba/edicion3.png",
      alt: "Edición Piscina 2025"
    },
    {
      id: 4,
      src: "/images/prueba/hero.png",
      alt: "Edición Hero 2025"
    }
  ];

  // Auto-cambio de imágenes cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Container de imágenes */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f5f5f5'/%3E%3Ctext x='600' y='400' text-anchor='middle' fill='%23999' font-size='32' font-family='Arial'%3EEdiciones 2025%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        ))}
        
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Título principal clickeable */}
          <Link 
            to="/ediciones"
            className="group inline-block"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wider text-white mb-4 hover:text-white/90 transition-all duration-500 group-hover:scale-105">
              EDICION 2025
            </h2>
            
          </Link>

          {/* Subtítulo */}
          <p className="mt-8 text-base sm:text-lg text-white/70 font-light max-w-md mx-auto leading-relaxed">
            Descubre nuestra nueva colección de espacios únicos
          </p>

          {/* Indicador de navegación */}
          <div className="mt-12 flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImage 
                    ? 'bg-white w-8' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Call to action sutil */}
          <div className="mt-8">
            <Link 
              to="/ediciones"
              className="inline-flex items-center text-white/80 hover:text-white text-sm font-light uppercase tracking-widest transition-colors duration-300 group"
            >
              Explorar colección
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute top-8 left-8 w-px h-16 bg-white/20"></div>
      <div className="absolute bottom-8 right-8 w-px h-16 bg-white/20"></div>
      <div className="absolute top-16 right-16 w-1 h-1 bg-white/30 rounded-full"></div>
      <div className="absolute bottom-16 left-16 w-1 h-1 bg-white/30 rounded-full"></div>

      {/* Contador elegante */}
      <div className="absolute top-8 right-8 text-white/60 font-light text-lg">
        <span className="text-white">{(currentImage + 1).toString().padStart(2, '0')}</span>
        <span className="mx-2">—</span>
        <span>{images.length.toString().padStart(2, '0')}</span>
      </div>
    </section>
  );
}

export default EdicionesPage;