import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

import { Link } from 'react-router-dom';
import { useGetFeaturedBlogPostsQuery } from '../../../features/blog';

const BlogSection = () => {
  const { data: blogResponse, isLoading, error } = useGetFeaturedBlogPostsQuery(3);

  const blogPosts = blogResponse?.data || [];
  console.log("📝 blogPosts:", blogPosts); // <-- Ahora siempre se ejecuta

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${months[date.getMonth()]}. ${date.getFullYear()}`;
  };

  const getImageUrl = (post) => {
    // Debug: ver la estructura real de featuredImage
    console.log('🖼️ post.featuredImage:', post.featuredImage);
    return post.featuredImage?.desktop?.url ||
           post.featuredImage?.mobile?.url ||
           post.featuredImage?.thumbnail?.url ||
           '/images/blog/default-blog.jpg';
  };

  // Si no hay posts o está cargando, no mostrar la sección
  if (isLoading || error || !blogPosts.length) {
    return null;
  }

  return (
    <>
      {/* Modal Galería */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
            <h3 className="text-lg font-semibold mb-4">{modalTitle}</h3>
            {modalImages && modalImages.length > 0 ? (
              <>
                {/* Imagen grande seleccionada */}
                <div className="w-full flex items-center justify-center mb-4">
                  <img
                    src={modalImages[selectedImageIdx]?.desktop?.url || modalImages[selectedImageIdx]?.mobile?.url || modalImages[selectedImageIdx]?.thumbnail?.url}
                    alt={modalTitle}
                    className="w-full max-h-80 object-contain rounded select-none"
                    style={{ cursor: 'default', maxWidth: '100%' }}
                    draggable={false}
                    tabIndex={-1}
                    onPointerDown={e => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                  />
                </div>
                {/* Carrusel de miniaturas */}
                <Swiper
                  slidesPerView={Math.min(5, modalImages.length)}
                  spaceBetween={10}
                  navigation
                  modules={[Navigation]}
                  className="w-full h-24"
                >
                  {modalImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <img
                        src={img.thumbnail?.url || img.desktop?.url || img.mobile?.url}
                        alt={modalTitle + ' miniatura ' + (idx + 1)}
                        className={`h-20 w-28 object-cover rounded cursor-pointer border-2 ${selectedImageIdx === idx ? 'border-blue-600' : 'border-transparent'}`}
                        style={{ maxWidth: '100%' }}
                        draggable={false}
                        tabIndex={-1}
                        onPointerDown={e => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={e => { e.preventDefault(); e.stopPropagation(); setSelectedImageIdx(idx); }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </>
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-gray-400">No hay imágenes para mostrar.</div>
            )}
          </div>
        </div>
      )}

      <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16">
          <div>
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
              News
              <span className="block text-sm font-normal text-gray-500 mt-2 tracking-wider uppercase">
                — MIRA LAS NOVEDADES
              </span>
            </h2>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              Ver todas las novedades
              <svg 
                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-12 lg:space-y-16">
          {blogPosts.map((post, index) => (
            <article key={post.id} className="group">
              
              {/* ✅ MOBILE: Layout vertical (columnas) */}
              <div className="block lg:hidden">
                {/* Date */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                {/* Image */}
                <div className="relative mb-6 overflow-hidden bg-gray-100">
                  <div className="aspect-[4/3] bg-gray-200">
                    <img
                      src={getImageUrl(post)}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/images/blog/default-blog.jpg';
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                    <Link to={`/blog/${post.slug}`} className="block">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 group/link"
                    >
                      <span className="border-b border-gray-300 group-hover/link:border-gray-900 transition-colors duration-200">
                        Leer más
                      </span>
                      <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ✅ DESKTOP: Layout horizontal (fecha | texto | imagen) */}
              <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
                
                {/* Date Column - 2 columnas */}
                <div className="col-span-2">
                  <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                {/* Content Column - 6 columnas */}
                <div className="col-span-6 space-y-4">
                  <h3 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                    <Link to={`/blog/${post.slug}`} className="block">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 group/link"
                    >
                      <span className="border-b border-gray-300 group-hover/link:border-gray-900 transition-colors duration-200">
                        Leer más
                      </span>
                      <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Image Column - 4 columnas + Botón Ver más */}
                <div className="col-span-4 flex flex-col items-center justify-center gap-4">
                  <div className="relative overflow-hidden bg-gray-100 w-full">
                    <div className="aspect-[4/3] bg-gray-200">
                      <img
                        src={getImageUrl(post)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/images/blog/default-blog.jpg';
                        }}
                      />
                    </div>
                  </div>
                  {post.images && post.images.length > 0 && (
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        setModalImages(post.images);
                        setModalTitle(post.title);
                        setSelectedImageIdx(0);
                        setModalOpen(true);
                      }}
                    >
                      Ver galería
                    </button>
                  )}
                </div>

              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 lg:mt-20 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-8 py-3 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Explorar todo el blog
          </Link>
        </div>
      </div>
      </section>
    </>
  );
};

export default BlogSection;
