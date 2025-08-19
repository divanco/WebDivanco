import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useGetProjectBySlugQuery } from '../../features/projects/projectsApi';
import RelatedProjects from '../../components/ui/RelatedProjects';
import ProjectNavigation from '../../components/ui/ProjectNavigation';
import ImageLightbox from '../../components/ui/ImageLightbox';
import { ScrollProgress, ProjectBreadcrumbs, FloatingActions } from '../../components/ui/ProjectExtras';
import ProjectSEO from '../../components/ui/ProjectSEO';

// Componente para imagen hero con información básica
const ProjectHero = ({ project, mainImage }) => {
  return (
  <div className="relative h-screen w-full overflow-hidden">
    {/* Imagen principal */}
    <div className="absolute inset-0">
      {mainImage ? (
        <img
          src={mainImage.urls?.desktop || mainImage.urls?.mobile || mainImage.url}
          alt={project.title}
          className="w-full h-full object-cover scale-105 animate-pulse"
          onLoad={(e) => {
            e.target.classList.remove('animate-pulse', 'scale-105');
            e.target.classList.add('scale-100', 'transition-transform', 'duration-700');
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-xl font-light">Sin imagen</span>
        </div>
      )}
      {/* Overlay gradiente mejorado */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </div>

    {/* Información superpuesta con animación */}
    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
          {/* Info principal */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extralight mb-4 tracking-tight leading-tight">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed font-light">
                {project.description}
              </p>
            )}
          </div>

          {/* Datos del proyecto con mejor diseño */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            {project.location && (
              <div className="group">
                <div className="text-gray-300 uppercase tracking-wider text-xs mb-1">Ubicación</div>
                <div className="text-lg font-medium group-hover:text-gray-200 transition-colors">
                  {project.location}
                </div>
              </div>
            )}
            {project.year && (
              <div className="group">
                <div className="text-gray-300 uppercase tracking-wider text-xs mb-1">Año</div>
                <div className="text-lg font-medium group-hover:text-gray-200 transition-colors">
                  {project.year}
                </div>
              </div>
            )}
            {project.client && (
              <div className="group">
                <div className="text-gray-300 uppercase tracking-wider text-xs mb-1">Cliente</div>
                <div className="text-lg font-medium group-hover:text-gray-200 transition-colors">
                  {project.client}
                </div>
              </div>
            )}
            {project.area && (
              <div className="group">
                <div className="text-gray-300 uppercase tracking-wider text-xs mb-1">Área</div>
                <div className="text-lg font-medium group-hover:text-gray-200 transition-colors">
                  {project.area}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// Componente para información del proyecto
const ProjectInfo = ({ project }) => (
  <div className="bg-white py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-8 md:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Descripción principal */}
        <div className="lg:col-span-2">
          {project.content && (
            <div className="prose prose-lg prose-gray max-w-none">
              <div 
                className="text-gray-700 leading-relaxed text-lg font-light tracking-wide"
                dangerouslySetInnerHTML={{ __html: project.content.replace(/\n/g, '<br/>') }}
              />
            </div>
          )}
        </div>

        {/* Información técnica */}
        <div className="space-y-8">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Detalles del Proyecto</h3>
            <div className="space-y-4">
              {project.projectType && (
                <div>
                  <dt className="text-sm text-gray-500">Tipo de Participación</dt>
                  <dd className="mt-1 text-gray-900">{project.projectType}</dd>
                </div>
              )}
              {project.etapa && (
                <div>
                  <dt className="text-sm text-gray-500">Estado</dt>
                  <dd className="mt-1 text-gray-900 capitalize">{project.etapa}</dd>
                </div>
              )}
              {project.architect && (
                <div>
                  <dt className="text-sm text-gray-500">Arquitecto</dt>
                  <dd className="mt-1 text-gray-900">{project.architect}</dd>
                </div>
              )}
              {project.startDate && (
                <div>
                  <dt className="text-sm text-gray-500">Fecha de Inicio</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(project.startDate).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-4">Categorías</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize"
                  >
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Componente para galería de imágenes
const ProjectGallery = ({ mediaFiles, onImageClick }) => {
  const images = mediaFiles?.filter(file => file.type === 'image' || file.type === 'render') || [];
  
  if (images.length === 0) return null;

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">Galería</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`
                group cursor-pointer overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
                ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
              `}
              onClick={() => onImageClick(index)}
            >
              <div className={`relative ${index === 0 ? 'aspect-[4/3]' : 'aspect-square'} overflow-hidden`}>
                <img
                  src={image.urls?.desktop || image.urls?.mobile || image.urls?.thumbnail || image.url}
                  alt={image.description || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {image.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm">{image.description}</p>
                  </div>
                )}
                {/* Indicador de zoom */}
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para tour virtual
const VirtualTour = ({ kuulaUrl }) => {
  if (!kuulaUrl) return null;

  return (
    <div className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light mb-4 text-white">Tour Virtual 360°</h2>
          <p className="text-gray-300 text-lg">Explora el proyecto en una experiencia inmersiva</p>
        </div>
        
        <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <iframe
            src={kuulaUrl}
            title="Tour Virtual 360°"
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
          />
          
          {/* Indicador de carga */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white space-y-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-white mx-auto"></div>
              <p className="text-gray-300">Cargando tour virtual...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const ProjectDetailPage = () => {
  const { slug } = useParams();
  const { data: projectResponse, error, isLoading } = useGetProjectBySlugQuery(slug);
  const project = projectResponse?.data;
  const [mainImage, setMainImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Seleccionar imagen principal
  useEffect(() => {
    if (project?.media) {
      const images = project.media.filter(file => {
        const isImage = file.type === 'image' || file.type === 'render';
        return isImage;
      });

      const featured = images.find(img => img.isMain);
      const selectedImage = featured || images[0] || null;
      
      setMainImage(selectedImage);
    }
  }, [project]);

  // Manejar clicks en galería
  const handleImageClick = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleNextImage = (index) => {
    setLightboxIndex(index);
  };

  const handlePrevImage = (index) => {
    setLightboxIndex(index);
  };

  const handleShareClick = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  // Actualizar el título de la página
  useEffect(() => {
    if (project) {
      document.title = `${project.title} | Divanco`;
    }
    return () => {
      document.title = 'Divanco';
    };
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-naranjaDivanco mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-naranjaDivanco/20 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">Cargando proyecto...</p>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-naranjaDivanco rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/404" replace />;
  }

  if (!project) {
    return <Navigate to="/proyectos" replace />;
  }

  const images = project.media?.filter(file => file.type === 'image' || file.type === 'render') || [];

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <ProjectSEO 
        project={project} 
        mainImage={mainImage} 
        currentUrl={window.location.href} 
      />
      
      {/* Scroll Progress */}
      <ScrollProgress />
      
      {/* Breadcrumbs */}
      <ProjectBreadcrumbs project={project} />
      
      {/* Hero Section */}
      <ProjectHero project={project} mainImage={mainImage} />
      
      {/* Project Information */}
      <ProjectInfo project={project} />
      
      {/* Gallery */}
      <ProjectGallery mediaFiles={project.media} onImageClick={handleImageClick} />
      
      {/* Virtual Tour */}
      <VirtualTour kuulaUrl={project.kuulaUrl} />
      
      {/* Related Projects */}
      <RelatedProjects currentProject={project} />
      
      {/* Navigation */}
      <ProjectNavigation currentProject={project} />
      
      {/* Floating Actions */}
      <FloatingActions project={project} onShareClick={handleShareClick} />
      
      {/* Share Success Notification */}
      {shareSuccess && (
        <div className="fixed bottom-20 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up border border-green-400">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">¡Enlace copiado al portapapeles!</span>
          </div>
        </div>
      )}
      
      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        onClose={handleCloseLightbox}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
};

export default ProjectDetailPage;