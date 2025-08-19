import React from 'react';

function SloganPage() {
 return (
  <section className="relative min-h-[50vh] bg-white flex items-center justify-center overflow-hidden py-8 pb-24">
    {/* Container principal */}
    <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 text-center">

      {/* Slogan principal */}
      <div className="space-y-6 md:space-y-8">
        
        {/* Logo + DIVANCO - Todo en una línea horizontal centrado */}
        <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4 lg:gap-6">
          {/* Logo */}
          <img
            src="/images/prueba/logo.svg"
            alt="DIVANCO Logo"
            className="w-18 h-18 md:w-16 md:h-16 lg:w-28 lg:h-28 opacity-90 hover:opacity-100 transition-opacity duration-500"
          />
          
          {/* Separador después del logo */}
          <div className="hidden sm:flex items-center">
            <div className="w-6 md:w-8 h-px bg-gray-300"></div>
          </div>
          
          {/* Diseño */}
          <div className="flex items-center">
            <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 tracking-widest uppercase">
              Diseño
            </p>
          </div>
          
          {/* Separador */}
          <div className="hidden sm:flex items-center">
            <div className="w-6 md:w-8 h-px bg-gray-300"></div>
          </div>
      
          {/* Vanguardia */}
          <div className="flex items-center">
            <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 tracking-widest uppercase">
              Vanguardia
            </p>
          </div>
          
          {/* Separador */}
          <div className="hidden sm:flex items-center">
            <div className="w-6 md:w-8 h-px bg-gray-300"></div>
          </div>

          {/* Construcción */}
          <div className="flex items-center">
            <p className="text-lg md:text-xl lg:text-2xl font-light text-gray-700 tracking-widest uppercase">
              Construcción
            </p>
          </div>
        </div>

        {/* Descripción complementaria */}
        <div className="mt-12 md:mt-16">
        
        </div>
      </div>

      {/* Elementos decorativos sutiles */}
      <div className="hidden md:block absolute top-20 left-10 w-px h-20 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-50"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-px h-20 bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-50"></div>
      
      {/* Círculos decorativos */}
      <div className="hidden lg:block absolute top-40 right-20 w-1 h-1 bg-gray-300 rounded-full opacity-60"></div>
      <div className="hidden lg:block absolute bottom-40 left-20 w-1 h-1 bg-gray-300 rounded-full opacity-60"></div>
    </div>

    {/* Scroll indicator sutil */}
    <div className="absolute bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
      <div className="w-px h-6 md:h-8 bg-gray-300 mx-auto mb-2"></div>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </section>
);
}
export default SloganPage;
