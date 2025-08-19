import React from 'react';
import { Link } from 'react-router-dom';
import { useGetProjectsQuery } from '../../features/projects/projectsApi';

const ProjectNavigation = ({ currentProject }) => {
  const { data: projectsData } = useGetProjectsQuery({
    limit: 100, // Obtener suficientes para encontrar anterior/siguiente
    publicOnly: true,
    sortBy: 'updatedAt',
    sortOrder: 'DESC'
  });

  const projects = projectsData?.data || [];
  const currentIndex = projects.findIndex(p => p.id === currentProject.id);
  
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  if (!prevProject && !nextProject) return null;

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-8">
        <div className="flex items-center justify-between">
          {/* Proyecto anterior */}
          <div className="flex-1">
            {prevProject ? (
              <Link
                to={`/proyectos/${prevProject.slug}`}
                className="group flex items-center space-x-4 text-left hover:text-gray-600 transition-colors"
              >
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Anterior</div>
                  <div className="font-medium truncate">{prevProject.title}</div>
                </div>
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          {/* Botón volver a proyectos */}
          <div className="flex-shrink-0 mx-8">
            <Link
              to="/proyectos"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Todos los Proyectos
            </Link>
          </div>

          {/* Proyecto siguiente */}
          <div className="flex-1 flex justify-end">
            {nextProject ? (
              <Link
                to={`/proyectos/${nextProject.slug}`}
                className="group flex items-center space-x-4 text-right hover:text-gray-600 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Siguiente</div>
                  <div className="font-medium truncate">{nextProject.title}</div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectNavigation;
