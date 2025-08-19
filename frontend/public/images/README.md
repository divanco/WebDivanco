# Carpeta de Imágenes - Divanco

Esta carpeta contiene todas las imágenes estáticas del proyecto.

## Estructura:

- `/images/` - Imágenes principales (logo, hero, etc.)
- `/images/projects/` - Imágenes de proyectos
- `/images/blog/` - Imágenes para el blog

## Uso:

Las imágenes se referencian desde el código usando rutas absolutas:
```jsx
// Correcto
<img src="/images/logo.svg" alt="Divanco" />
<img src="/images/hero-background.jpg" alt="Hero" />

// Para proyectos
<img src="/images/projects/proyecto-1.jpg" alt="Proyecto 1" />
```

## Imágenes recomendadas a añadir:

1. **Logo**: `logo.svg` o `logo.png`
2. **Hero Background**: `hero-background.jpg` (mínimo 1920x1080px)
3. **Favicon**: `favicon.ico`

## Formatos recomendados:

- **Logo**: SVG (vector) o PNG con fondo transparente
- **Fotografías**: JPG (para fotos) o WebP (mejor compresión)
- **Iconos**: SVG o PNG
- **Fondos**: JPG o WebP
