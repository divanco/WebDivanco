import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import FilterProjects from './FilterProjects';
import { useGetSliderProjectsQuery } from '../../features/projects/projectsApi';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ USAR DATOS REALES DEL BACKEND
  const { 
    data: sliderResponse, 
    isLoading: isLoadingSlider,
    error: sliderError 
  } = useGetSliderProjectsQuery(5);

  // ✅ EXTRAER PROYECTOS DE LA RESPUESTA
  const projects = sliderResponse?.data || [];

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-play del slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, projects.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projects.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // ✅ MANEJAR ESTADOS DE CARGA
  if (isLoadingSlider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naranjaDivanco"></div>
          <p className="mt-4 text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (sliderError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error cargando proyectos</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-naranjaDivanco text-white rounded"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No hay proyectos en el slider</p>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-white">
      {/* Multi-slide Carousel estilo Minotti - Ajustado para header */}
      <section className="relative overflow-hidden bg-gray-50" style={{ 
        height: isMobile ? 'calc(100vh - 80px)' : 'calc(100vh - 100px)',
        paddingTop: isMobile ? '80px' : '100px'
      }}>
        {/* Container principal con padding lateral */}
        <div className="relative h-full flex items-center mt-10 mb-4 px-4 md:px-8 lg:px-16">

          {/* Slides Container - Responsive */}
          <div 
            className="flex transition-transform duration-1000 ease-out"
            style={isMobile ? {
              // Móvil: Una imagen a la vez, centrada
              transform: `translateX(-${currentSlide * 100}%)`,
              gap: '1rem',
              width: `${projects.length * 100}%`
            } : {
              // Desktop: Múltiples imágenes visibles - ✅ Ajustado para empezar desde la segunda imagen
              transform: `translateX(calc(22.5% - ${currentSlide * 57}%))`,
              gap: '2rem',
              width: `${projects.length * 57}%`
            }}
          >
            {projects.map((project, index) => {
              const isActive = index === currentSlide;
              
              return (
                <div 
                  key={project.id}
                  className={`relative flex-shrink-0 transition-all duration-1000 cursor-pointer ${
                    isMobile 
                      ? 'opacity-100 scale-100 z-10' // Móvil: siempre visible
                      : isActive 
                        ? 'opacity-100 scale-100 z-10' 
                        : 'opacity-70 scale-95 z-5'
                  }`}
                  style={isMobile ? {
                    // Móvil: Una imagen por vez, altura reducida
                    width: '90%',
                    height: '65vh',
                    marginRight: '1rem',
                    marginLeft: '5%' // Para centrar
                  } : {
                    // Desktop: Múltiples imágenes, altura reducida
                    width: '55%',
                    height: '70vh',
                    marginRight: '2rem'
                  }}
                  onClick={() => navigate(`/proyectos/${project.slug}`)}
                >
                  {/* ✅ USAR IMAGEN DEL SLIDER */}
                  {project.sliderImage ? (
                    (() => {
                      const imageUrl = project.sliderImage.urls?.desktop || project.sliderImage.urls?.mobile;
                      
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gray-300 flex items-center justify-center rounded-lg">
                          <span className="text-gray-500">Sin imagen</span>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gray-300 flex items-center justify-center rounded-lg">
                      <span className="text-gray-500">Sin imagen</span>
                    </div>
                  )}
                  
                  {/* Overlay gradient sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-lg" />
                  
                  {/* ✅ BOTÓN KUULA SI EXISTE */}
                  {project.kuulaUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.kuulaUrl, '_blank');
                      }}
                      className="absolute top-4 right-4 bg-naranjaDivanco hover:bg-naranjaDivanco/80 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 z-20"
                    >
                      Ver en 360°
                    </button>
                  )}
                  
                  {/* Contenido del slide */}
                  <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white transition-all duration-700 ${
                    (isMobile || isActive) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="max-w-md mb-16">
                      <h3 className={`font-light tracking-wide ${
                        isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'
                      }`}>
                        {project.title}
                      </h3>
                      <p className={`font-light opacity-90 mb-2 leading-relaxed ${
                        isMobile ? 'text-xs' : 'text-sm lg:text-base'
                      }`}>
                        {project.projectType} • {project.year}
                      </p>
                      {project.location && (
                        <p className={`font-light opacity-80 mb-2 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          {project.location}
                        </p>
                      )}
                      {project.description && (
                        <p className={`font-light opacity-90 mb-4 line-clamp-2 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                          {project.description}
                        </p>
                      )}
                      
                      <button className={`inline-flex items-center border border-white text-white font-light uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 group ${
                        isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-2 text-xs'
                      }`}>
                        Ver proyecto
                        <svg className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Número del slide */}
                  <div className={`absolute top-4 md:top-6 left-4 md:left-6 text-white font-light transition-opacity duration-500 ${
                    (isMobile || isActive) ? 'opacity-100' : 'opacity-60'
                  } ${isMobile ? 'text-base' : 'text-xl'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de navegación - Responsive */}
          <button
            onClick={prevSlide}
            className={`absolute top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 rounded-full border border-white/20 ${
              isMobile ? 'left-4 p-2' : 'left-8 p-3' // ✅ Reducido padding
            }`}
          >
            <ChevronLeftIcon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1} /> {/* ✅ Reducido tamaño */}
          </button>

          <button
            onClick={nextSlide}
            className={`absolute top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 rounded-full border border-white/20 ${
              isMobile ? 'right-4 p-2' : 'right-8 p-3' // ✅ Reducido padding
            }`}
          >
            <ChevronRightIcon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1} /> {/* ✅ Reducido tamaño */}
          </button>
        </div>

        {/* Indicadores inferiores - Responsive */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 z-30 flex ${
          isMobile ? 'bottom-6 space-x-2' : 'bottom-8 space-x-3' // ✅ Subido posición
        }`}>
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? isMobile 
                    ? 'bg-white w-6' // ✅ Reducido ancho
                    : 'bg-white w-10' // ✅ Reducido ancho
                  : isMobile
                    ? 'bg-white/40 hover:bg-white/60 w-3' // ✅ Reducido ancho
                    : 'bg-white/40 hover:bg-white/60 w-5' // ✅ Reducido ancho
              }`}
            />
          ))}
        </div>

        {/* Contador elegante - Responsive */}
        <div className={`absolute z-30 text-white font-light ${
          isMobile ? 'top-6 right-4 text-base' : 'top-8 right-8 text-lg' // ✅ Reducido tamaño y bajado posición
        }`}>
          <span>{(currentSlide + 1).toString().padStart(2, '0')}</span>
          <span className="text-white/60 mx-2">—</span>
          <span className="text-white/60">{projects.length.toString().padStart(2, '0')}</span>
        </div>

        {/* Control de auto-play - Responsive */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`absolute z-30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 rounded-full border border-white/20 ${
            isMobile ? 'bottom-6 right-4 p-2' : 'bottom-8 right-8 p-2' // ✅ Subido posición y reducido padding
          }`}
        >
          {isAutoPlaying ? (
            <svg className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20"> {/* ✅ Reducido tamaño */}
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          ) : (
            <svg className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20"> {/* ✅ Reducido tamaño */}
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>
      </section>

      {/* Sección adicional */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8"> {/* ✅ Reducido padding */}
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-light mb-4 uppercase tracking-wider text-gray-900"> {/* ✅ Reducido tamaño */}
            Explora Nuestros Proyectos
          </h2>
          <p className="text-sm md:text-base text-gray-600 font-light max-w-2xl mx-auto"> {/* ✅ Reducido tamaño */}
            Cada proyecto refleja nuestra pasión por el diseño excepcional y la atención al detalle.
          </p>
        </div>

        <FilterProjects />
      </section>
    </div>
  );
};

export default ProjectsPage;