import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../hooks';
import logoCompleto from '../../../assets/images/DIVANCOHV3.png';
import { useGetRecentProjectsQuery } from '../../../features/projects/projectsApi';
import { useGetRecentBlogPostsQuery } from '../../../features/blog/blogApi';


const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null); // 'proyectos' | 'blog' | null

  // Consultar últimos 5 proyectos y posts
  const { data: recentProjects } = useGetRecentProjectsQuery(5);
  const { data: recentBlogPosts } = useGetRecentBlogPostsQuery(5);
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navegación completa
  const navigation = [
    { name: 'Showrooms', href: '/showrooms' },
    { name: 'About', href: '/about' },
    { name: 'Proyectos', href: '/proyectos' },
    { name: 'Ediciones', href: '/ediciones' },
    { name: 'Blog', href: '/blog' },
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  // Detectar si estamos en la homepage
  const isHomepage = location.pathname === '/';

  // Detectar scroll en homepage
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 100);
    };

    if (isHomepage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setScrolled(false);
    }
  }, [isHomepage]);

  // Función para manejar el triple click en el logo
  const handleLogoClick = (e) => {
    e.preventDefault();
    setClickCount(prev => prev + 1);
    
    setTimeout(() => {
      setClickCount(0);
    }, 2000);

    if (clickCount === 2) {
      navigate('/login');
      setClickCount(0);
    }
  };

  // Lógica para el fondo del header
  const getHeaderBackground = () => {
    if (!isHomepage) {
      return 'bg-gray-800/60 backdrop-blur-md shadow-lg border-b border-white/10 py-8';
    } else {
      return scrolled ? 'bg-gray-800/50 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-transparent';
    }
  };

  return (
     <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${getHeaderBackground()}`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-500 ${
          isHomepage ? 'h-16 py-4' : 'h-14 py-3'
        }`}>
          
          {/* Logo Completo - Siempre visible */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="group relative z-10"
              onClick={handleLogoClick}
            >
              {/* Logo Completo (Logo + Texto DIVANCO) */}
                <img 
                src={logoCompleto} 
                alt="Divanco" 
                className="h-32 md:h-24 lg:h-32 xl:h-60 w-auto transition-all duration-300 group-hover:opacity-80"
              />
              
              {/* Indicador visual para clicks */}
              {/* {clickCount > 0 && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        i < clickCount ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )} */}
            </Link>
          </div>

          {/* Menú Hamburguesa - Siempre visible */}
          <button
            className="p-2 transition-all duration-300 hover:scale-110 text-white/90 hover:text-white z-20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Navegación Desplegable (Desktop y Mobile) */}
        {mobileMenuOpen && (
          <div className={`fixed top-0 right-0 h-full w-1/2 max-w-xs px-6 pt-6 pb-8 space-y-6 border-t transition-all duration-300 z-50
            ${isHomepage 
              ? 'border-white/20 bg-black/80 backdrop-blur-md' 
              : 'border-white/20 bg-gray-800/90 backdrop-blur-md'}
          `}>
            {/* Botón cerrar menú lateral */}
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <XMarkIcon className="h-7 w-7" />
            </button>
            
            {/* Enlaces de navegación */}
            {navigation.map((item) => {
              // Submenú para Proyectos
              if (item.name === 'Proyectos') {
                return (
                  <div key={item.name} className="relative">
                    <button
                      className={`flex items-center w-full text-left text-lg font-light uppercase tracking-wider transition-all duration-300 hover:translate-x-2 ${
                        isActive(item.href)
                          ? 'text-white border-l-2 border-white pl-4'
                          : 'text-white/90 hover:text-white hover:pl-2'
                      }`}
                      onClick={() => setOpenSubmenu(openSubmenu === 'proyectos' ? null : 'proyectos')}
                    >
                      {item.name}
                      {openSubmenu === 'proyectos' ? (
                        <ChevronUpIcon className="ml-2 h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="ml-2 h-5 w-5" />
                      )}
                    </button>
                    {openSubmenu === 'proyectos' && (
                      <div className="ml-6 mt-2 space-y-1 animate-fade-in">
                        {(recentProjects?.data || []).slice(0, 5).map((project) => (
                          <Link
                            key={project.slug || project.id}
                            to={`/proyectos/${project.slug || project.id}`}
                            className="block text-base text-white/80 hover:text-white transition-colors duration-200 py-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {project.title || project.name}
                          </Link>
                        ))}
                        {(!recentProjects?.data || recentProjects.data.length === 0) && (
                          <span className="block text-sm text-white/50">No hay proyectos recientes</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              // Submenú para Blog
              if (item.name === 'Blog') {
                return (
                  <div key={item.name} className="relative">
                    <button
                      className={`flex items-center w-full text-left text-lg font-light uppercase tracking-wider transition-all duration-300 hover:translate-x-2 ${
                        isActive(item.href)
                          ? 'text-white border-l-2 border-white pl-4'
                          : 'text-white/90 hover:text-white hover:pl-2'
                      }`}
                      onClick={() => setOpenSubmenu(openSubmenu === 'blog' ? null : 'blog')}
                    >
                      {item.name}
                      {openSubmenu === 'blog' ? (
                        <ChevronUpIcon className="ml-2 h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="ml-2 h-5 w-5" />
                      )}
                    </button>
                    {openSubmenu === 'blog' && (
                      <div className="ml-6 mt-2 space-y-1 animate-fade-in">
                        {(recentBlogPosts?.data || []).slice(0, 5).map((post) => (
                          <Link
                            key={post.slug || post.id}
                            to={`/blog/${post.slug || post.id}`}
                            className="block text-base text-white/80 hover:text-white transition-colors duration-200 py-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {post.title}
                          </Link>
                        ))}
                        {(!recentBlogPosts?.data || recentBlogPosts.data.length === 0) && (
                          <span className="block text-sm text-white/50">No hay posts recientes</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              // Enlaces normales
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block text-lg font-light uppercase tracking-wider transition-all duration-300 hover:translate-x-2 ${
                    isActive(item.href)
                      ? 'text-white border-l-2 border-white pl-4'
                      : 'text-white/90 hover:text-white hover:pl-2'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Buscar */}
            <Link 
              to="/buscar"
              className="flex items-center space-x-2 text-lg font-light uppercase tracking-wider transition-all duration-300 hover:translate-x-2 text-white/90 hover:text-white hover:pl-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Buscar</span>
            </Link>

            {/* Perfil si está autenticado */}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="block text-lg font-light uppercase tracking-wider transition-all duration-300 hover:translate-x-2 text-white/90 hover:text-white hover:pl-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user?.name || 'Profile'}
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

