import React from 'react';
import { Helmet } from 'react-helmet-async';

const ProjectSEO = ({ project, mainImage, currentUrl }) => {
  if (!project) return null;

  // Asegurar que tenemos valores seguros
  const title = project.title || 'Proyecto sin título';
  const description = project.description || `Descubre este proyecto de arquitectura realizado por Divanco.`;
  const projectType = project.projectType || '';
  const location = project.location || '';
  const tags = project.tags || [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": title,
    "description": description,
    "creator": {
      "@type": "Organization",
      "name": "Divanco"
    },
    "dateCreated": project.startDate,
    "dateModified": project.updatedAt,
    "keywords": tags.join(", "),
    "locationCreated": {
      "@type": "Place",
      "name": location
    },
    "image": mainImage ? [
      mainImage.urls?.desktop || mainImage.url,
      mainImage.urls?.mobile || mainImage.url,
      mainImage.urls?.thumbnail || mainImage.url
    ].filter(Boolean) : [],
    "url": currentUrl,
    "provider": {
      "@type": "Organization",
      "name": "Divanco",
      "url": window.location.origin
    }
  };

  return (
    <Helmet>
      {/* Título */}
      <title>{title} | Divanco - Proyecto de Arquitectura</title>
      
      {/* Meta descripciones */}
      <meta 
        name="description" 
        content={description} 
      />
      <meta 
        name="keywords" 
        content={`arquitectura, ${projectType}, ${location}, ${tags.join(', ')}, divanco`} 
      />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={`${title} | Divanco`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Divanco" />
      {mainImage && (
        <>
          <meta property="og:image" content={mainImage.urls?.desktop || mainImage.url} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={title} />
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | Divanco`} />
      <meta name="twitter:description" content={description} />
      {mainImage && (
        <meta name="twitter:image" content={mainImage.urls?.desktop || mainImage.url} />
      )}
      
      {/* Datos estructurados */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Preconnect para Cloudinary */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      
      {/* Prefetch para imágenes principales */}
      {mainImage && (
        <>
          <link rel="prefetch" href={mainImage.urls?.desktop} />
          <link rel="prefetch" href={mainImage.urls?.mobile} />
        </>
      )}
    </Helmet>
  );
};

export default ProjectSEO;
