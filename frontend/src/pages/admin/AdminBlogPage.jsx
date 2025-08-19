import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { useGetBlogPostsQuery } from '../../features/blog/blogApi';
import { useSelector } from 'react-redux';
import BlogPostForm from '../../components/ui/BlogPostForm';

const AdminBlogPage = () => {
  const { user } = useSelector(state => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const { 
    data: postsData, 
    isLoading, 
    error,
    refetch 
  } = useGetBlogPostsQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined
  });

  // 🐛 Console.log para debug
  useEffect(() => {
    console.log('🔍 AdminBlogPage Debug:', {
      postsData,
      isLoading,
      error,
      hasData: !!postsData,
      dataKeys: postsData ? Object.keys(postsData) : null,
      posts: postsData?.data || postsData?.posts,
      postsLength: postsData?.data?.length || postsData?.posts?.length || 0
    });
  }, [postsData, isLoading, error]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      published: 'Publicado',
      draft: 'Borrador', 
      archived: 'Archivado'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || badges.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (!user || (user.role !== 'admin' && user.role !== 'author')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // 🔍 Determinar la estructura correcta de los posts
  const posts = postsData?.data || postsData?.posts || [];
  console.log('📋 Posts to display:', posts);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Blog</h1>
              <p className="mt-2 text-gray-600">Administra los posts del blog</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Post
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar posts
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por título..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
                <option value="archived">Archivados</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando posts...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error al cargar los posts</p>
              <p className="text-sm text-gray-500 mt-2">{JSON.stringify(error)}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No hay posts disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Galería
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Videos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => {
                    return (
                      <tr key={post.id} className="hover:bg-gray-50">
                        {/* Post info + imagen destacada */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {post.featuredImage && post.featuredImage.desktop && (
                              <img
                                className="h-12 w-12 rounded-lg object-cover mr-2"
                                src={post.featuredImage.desktop.url}
                                alt={post.title}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {post.title}
                              </div>
                              {post.excerpt && (
                                <div className="text-sm text-gray-500">
                                  {post.excerpt.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Miniaturas galería */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(post.images || []).slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.thumbnail?.url || img.url || img.desktop?.url || '/images/blog/default-blog.jpg'}
                                alt={`Miniatura galería ${idx + 1}`}
                                className="h-10 w-10 object-cover rounded border"
                              />
                            ))}
                            {post.images && post.images.length > 3 && (
                              <span className="text-xs text-gray-400 ml-1">+{post.images.length - 3}</span>
                            )}
                          </div>
                        </td>
                        {/* Videos */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {(post.videos || []).slice(0, 2).map((video, idx) => (
                              <span key={idx} title={video.url} className="inline-block">
                                <svg className="h-7 w-7 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm3 2v6l5-3-5-3z" /></svg>
                              </span>
                            ))}
                            {post.videos && post.videos.length > 2 && (
                              <span className="text-xs text-gray-400 ml-1">+{post.videos.length - 2}</span>
                            )}
                          </div>
                        </td>
                        {/* Estado */}
                        <td className="px-6 py-4">
                          {getStatusBadge(post.status)}
                        </td>
                        {/* Fecha */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </td>
                        {/* Acciones */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver post"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setShowForm(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Blog Post Form Modal */}
      {showForm && (
        <BlogPostForm
          post={selectedPost}
          onClose={() => {
            setShowForm(false);
            setSelectedPost(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedPost(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default AdminBlogPage;