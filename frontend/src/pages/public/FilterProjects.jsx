import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useGetProjectsQuery, useGetFilterOptionsQuery } from '../../features/projects/projectsApi';

const FilterProjects = () => {
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Query parameters para la API
  const queryParams = {
    search: searchTerm,
    projectType: selectedType,
    location: selectedLocation,
    sortBy,
    sortOrder,
    page,
    limit,
    publicOnly: true
  };

  // RTK Query hooks
  const { 
    data: projectsData, 
    isLoading: projectsLoading, 
    error: projectsError 
  } = useGetProjectsQuery(queryParams);

  const { 
    data: filterOptions, 
    isLoading: filtersLoading 
  } = useGetFilterOptionsQuery();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedType, selectedLocation, sortBy, sortOrder]);

  const projects = projectsData?.data || [];
  const pagination = projectsData?.pagination || {};
  const totalProjects = pagination.total_items || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title and Counter */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">
              Projects
            </h1>
            <span className="text-lg font-light text-gray-500">
              {totalProjects} Projects
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-8">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 font-light"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Project Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 font-light text-gray-700 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
              >
                <option value="">All project types</option>
                {filterOptions?.projectTypes?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-3 pr-10 font-light text-gray-700 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
              >
                <option value="">All locations</option>
                {filterOptions?.locations?.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  setSortBy('updatedAt');
                  setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
                }}
                className={`px-4 py-3 font-light transition-all duration-200 ${
                  sortBy === 'updatedAt'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Date {sortBy === 'updatedAt' && (sortOrder === 'DESC' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => {
                  setSortBy('title');
                  setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
                }}
                className={`px-4 py-3 font-light transition-all duration-200 ${
                  sortBy === 'title'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Alphabetical {sortBy === 'title' && (sortOrder === 'DESC' ? '↓' : '↑')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {projectsLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : projectsError ? (
          // Error state
          <div className="text-center py-12">
            <p className="text-gray-500">Error loading projects. Please try again.</p>
          </div>
        ) : projects.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <FunnelIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-light">No projects found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          // Projects grid
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-12">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-6 py-2 border border-gray-200 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-2">
              {[...Array(pagination.total_pages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-light transition-colors duration-200 ${
                      page === pageNum
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.total_pages}
              className="px-6 py-2 border border-gray-200 rounded-lg font-light disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ProjectCard Component
const ProjectCard = ({ project }) => {
  // 🔍 DEBUG: Agregar logs para debuggear imágenes
  const mainImage = project.media?.find(m => m.isMain) || project.media?.[0];
  
  return (
    <Link to={`/proyectos/${project.slug}`} className="group cursor-pointer block">
      {/* Image Container */}
      <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
        {mainImage ? (
          (() => {
            const imageUrl = mainImage.urls?.desktop || mainImage.urls?.main || mainImage.cloudinaryData?.desktop?.url || mainImage.url;
            
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Sin imagen</p>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Sin imagen</p>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Project type badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 text-gray-900 text-xs font-medium rounded-full backdrop-blur-sm">
            {project.projectType}
          </span>
        </div>

        {/* Year badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-black/70 text-white text-xs font-light rounded-full backdrop-blur-sm">
            {project.year}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-xl font-light text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
          {project.title}
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {project.location && (
            <span>{project.location}</span>
          )}
          {project.location && project.client && (
            <span>•</span>
          )}
          {project.client && (
            <span>{project.client}</span>
          )}
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm font-light line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default FilterProjects;