

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetBlogPostsQuery, useGetFeaturedBlogPostsQuery } from '../../features/blog';
import { Helmet } from 'react-helmet-async';

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    featured: undefined,
    author: undefined
  });

  // Obtener posts con paginación
  const { 
    data: postsResponse, 
    isLoading: postsLoading, 
    error: postsError 
  } = useGetBlogPostsQuery({
    page: currentPage,
    limit: 9,
    ...filters
  });

  // Obtener posts destacados para el hero
  const { 
    data: featuredPosts, 
    isLoading: featuredLoading 
  } = useGetFeaturedBlogPostsQuery(3);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${months[date.getMonth()]}. ${date.getFullYear()}`;
  };

  const getImageUrl = (post) => {
    return post.featuredImage?.desktop?.url ||
           post.featuredImage?.mobile?.url ||
           post.featuredImage?.thumbnail?.url ||
           '/images/blog/default-blog.jpg';
  };

  if (postsLoading && !postsResponse) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/3] bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Blog - Divanco</title>
        <meta name="description" content="Descubre las últimas novedades, tendencias y proyectos en nuestro blog de arquitectura y diseño." />
      </Helmet>

      {/* Hero Section con Posts Destacados */}
      {featuredPosts && featuredPosts.data && featuredPosts.data.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h1 className="text-4xl lg:text-6xl font-light text-gray-900 mb-4">
                Blog
                <span className="block text-sm font-normal text-gray-500 mt-2 tracking-wider uppercase">
                  — NOVEDADES Y TENDENCIAS
                </span>
              </h1>
            </div>

            {/* Post Destacado Principal */}
            {featuredPosts.data[0] && (
              <div className="mb-16">
                <Link 
                  to={`/blog/${featuredPosts.data[0].slug}`}
                  className="group block"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <div className="order-2 lg:order-1 space-y-6">
                      <div className="space-y-4">
                        <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                          {formatDate(featuredPosts.data[0].publishedAt)}
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                          {featuredPosts.data[0].title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {featuredPosts.data[0].excerpt}
                        </p>
                      </div>
                      <div className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 group/link">
                        <span className="border-b border-gray-300 group-hover/link:border-gray-900 transition-colors duration-200">
                          Leer más
                        </span>
                        <svg className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <div className="aspect-[4/3] lg:aspect-[3/4] overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(featuredPosts.data[0])}
                          alt={featuredPosts.data[0].title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/images/blog/default-blog.jpg';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Lista de Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={() => setFilters({ ...filters, featured: undefined })}
              className={`px-4 py-2 text-sm transition-colors duration-200 ${
                filters.featured === undefined
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilters({ ...filters, featured: true })}
              className={`px-4 py-2 text-sm transition-colors duration-200 ${
                filters.featured === true
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Destacados
            </button>
          </div>

          {/* Grid de Posts */}
          {postsError ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Error cargando los posts del blog</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {postsResponse?.data?.map((post) => (
                  <article key={post.id} className="group">
                    <Link to={`/blog/${post.slug}`} className="block">
                      {/* Imagen */}
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-6">
                        <img
                          src={getImageUrl(post)}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/images/blog/default-blog.jpg';
                          }}
                        />
                      </div>

                      {/* Contenido */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                            {formatDate(post.publishedAt)}
                          </span>
                          <h3 className="text-xl font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                            {post.title}
                          </h3>
                        </div>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="pt-2">
                          <span className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 group/link">
                            <span className="border-b border-gray-300 group-hover/link:border-gray-900 transition-colors duration-200">
                              Leer más
                            </span>
                            <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Paginación */}
              {postsResponse?.pagination && postsResponse.pagination.total_pages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex gap-2">
                    {/* Página anterior */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    {[...Array(postsResponse.pagination.total_pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 text-sm border transition-colors duration-200 ${
                          currentPage === i + 1
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    {/* Página siguiente */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(postsResponse.pagination.total_pages, prev + 1))}
                      disabled={currentPage === postsResponse.pagination.total_pages}
                      className="px-4 py-2 text-sm border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
