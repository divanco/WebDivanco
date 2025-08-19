import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

import Newsletter from './Newsletter'; 


const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">Divanco</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Estudio de arquitectura especializado en diseño contemporáneo y 
              showroom de materiales de construcción de alta calidad.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-300">
                  Carrera 43A #18-95, El Poblado, Medellín
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-300">+57 4 444 4444</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-300">contacto@divanco.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/showroom" className="text-gray-300 hover:text-white transition-colors">
                  Showroom
                </Link>
              </li>
              <li>
                <Link to="/proyectos" className="text-gray-300 hover:text-white transition-colors">
                  Proyectos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <Newsletter />
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Divanco Arquitectura. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;