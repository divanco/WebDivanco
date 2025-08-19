import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';

const RelatedProjects = ({ currentProject, limit = 3 }) => {
  // Obtener proyectos similares basados en tags o tipo
  const { data: projectsData } = useGetProjectsQuery({
    limit: limit + 1, // +1 para excluir el actual
    tags: currentProject.tags?.[0], // Usar el primer tag
    projectType: currentProject.projectType,
    publicOnly: true,
  });

  // Filtrar proyecto actual y limitar resultados
  const relatedProjects = projectsData?.data
    ?.filter(project => project.id !== currentProject.id)
    ?.slice(0, limit) || [];

  if (relatedProjects.length === 0) return null;

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">
          Proyectos Relacionados
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProjects.map((project) => {
            // Encontrar imagen principal
            const mainImage = project.media?.find(file => 
              (file.type === 'image' || file.type === 'render') && file.isMain
            ) || project.media?.find(file => file.type === 'image' || file.type === 'render');

            return (
              <Link
                key={project.id}
                to={`/proyectos/${project.slug}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                {/* Imagen */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {mainImage ? (
                    <img
                      src={mainImage.urls?.thumbnail || mainImage.urls?.mobile || mainImage.urls?.desktop || mainImage.url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-black/30 group-hover:to-black/10 transition-all duration-300" />
                </div>
                
                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2 group-hover:text-gray-600 transition-colors">
                    {project.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    {project.location && <span>{project.location}</span>}
                    {project.year && <span>{project.year}</span>}
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded capitalize"
                        >
                          {tag.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Ver más proyectos */}
        <div className="text-center mt-12">
          <Link
            to="/proyectos"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
          >
            Ver Todos los Proyectos
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RelatedProjects;
