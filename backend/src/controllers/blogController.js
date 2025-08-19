import { BlogPost, User, Project, Subscriber } from '../data/models/index.js';
import { uploadResponsiveImage, deleteResponsiveImages, uploadVideo, deleteVideo } from '../config/cloudinary.js';
import { sendBlogNotification } from '../utils/mailer.js';
import { Op } from 'sequelize';

// Obtener todos los posts del blog
export const getAllBlogPosts = async (req, res) => {
  try {
    const { 
      status ,
      project,
      tags,
      featured = false,
      limit = 10,
      page = 1
    } = req.query;

    const whereClause = {};
    
   if (status && status !== 'all') whereClause.status = status;
    if (project) whereClause.projectId = project;
    if (featured === 'true') whereClause.isFeatured = true;
    if (tags) {
      const tagsArray = tags.split(',');
      whereClause.tags = {
        [Op.overlap]: tagsArray
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: posts } = await BlogPost.findAndCountAll({
      where: whereClause,
      include: [
        
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug', 'year'],
          required: false
        }
      ],
      order: [
        ['isFeatured', 'DESC'],
        ['publishedAt', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo posts del blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener post por slug
export const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status } = req.query; // permite filtrar opcionalmente

    const whereClause = { slug };
    if (status && status !== 'all') whereClause.status = status;

    const post = await BlogPost.findOne({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug', 'year'],
          required: false
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Incrementar contador de vistas solo si está publicado
    if (post.status === 'published') {
      await post.increment('viewCount');
    }

    // Obtener posts relacionados solo si está publicado
    let relatedPosts = [];
    if (post.status === 'published') {
      relatedPosts = await BlogPost.findAll({
        where: {
          id: { [Op.ne]: post.id },
          status: 'published',
          
        },
        limit: 3,
        order: [['publishedAt', 'DESC']]
      });
    }

    res.json({
      success: true,
      data: {
        post,
        relatedPosts
      }
    });
  } catch (error) {
    console.error('Error obteniendo post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo post
export const createBlogPost = async (req, res) => {
  try {
    const {
      title,
      content,
      slug,
      excerpt,
      projectId,
      tags = [],
      status = 'draft',
      isFeatured = false,
      publishedAt
    } = req.body;

    // Validaciones básicas
    if (!title || title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'El título es requerido y debe tener al menos 5 caracteres'
      });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'El contenido es requerido'
      });
    }

    
    // Verificar proyecto si se especifica
    if (projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(400).json({
          success: false,
          message: 'El proyecto especificado no existe'
        });
      }
    }

    // Crear el post
    const postData = {
      slug,
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt?.trim(),
      projectId: projectId || null,
      tags: Array.isArray(tags) ? tags : [],
      status,
      isFeatured: Boolean(isFeatured),
      publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null
    };

    const post = await BlogPost.create(postData);

    // Recargar con relaciones
    await post.reload({
      include: [
        
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug'],
          required: false
        }
      ]
    });

    // Si se publica, enviar notificaciones a suscriptores
    if (status === 'published') {
      try {
        const subscribers = await Subscriber.findAll({
          where: { isActive: true }
        });
        
        if (subscribers.length > 0) {
          await sendBlogNotification(subscribers, post);
        }
      } catch (emailError) {
        console.warn('Error enviando notificaciones:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: post
    });
  } catch (error) {
    console.error('Error creando post:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un post con ese título'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar post
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;
    // Si projectId viene como string vacío, convertir a null
    if (updateData.projectId === '') {
      updateData.projectId = null;
    }

    const post = await BlogPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Si se está publicando por primera vez
    const wasUnpublished = post.status !== 'published';
    const willBePublished = updateData.status === 'published';

    if (willBePublished && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    await post.update(updateData);

    // Recargar con relaciones
    await post.reload({
      include: [
       
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug'],
          required: false
        }
      ]
    });

    // Si se publica por primera vez, enviar notificaciones
    if (wasUnpublished && willBePublished) {
      try {
        const subscribers = await Subscriber.findAll({
          where: { isActive: true }
        });
        
        if (subscribers.length > 0) {
          await sendBlogNotification(subscribers, post);
        }
      } catch (emailError) {
        console.warn('Error enviando notificaciones:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Post actualizado exitosamente',
      data: post
    });
  } catch (error) {
    console.error('Error actualizando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir imagen para post
export const uploadBlogPostImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'featured' } = req.body; // 'featured' o 'gallery'

    // Soportar tanto single como multiple
    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    console.log('[BACKEND] uploadBlogPostImage - Archivos recibidos:', files.length);
    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const post = await BlogPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const folder = `blog/${new Date().getFullYear()}/${post.slug}`;
    let newImages = [];
    for (const file of files) {
      const img = await uploadResponsiveImage(file.path, folder);
      newImages.push(img);
    }

    let updateData = {};
    if (type === 'featured') {
      // Solo tomar la primera imagen
      if (post.featuredImage) {
        try {
          await deleteResponsiveImages(post.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen anterior:', deleteError);
        }
      }
      updateData.featuredImage = newImages[0];
    } else if (type === 'gallery') {
      // Acumular todas las imágenes nuevas
      const currentImages = post.images || [];
      updateData.images = [...currentImages, ...newImages];
    }

    await post.update(updateData);

    res.json({
      success: true,
      message: 'Imagen(es) subida(s) exitosamente',
      data: {
        post: post,
        newImages: newImages
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir video para post
export const uploadBlogPostVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo de video'
      });
    }

    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Subir video a Cloudinary
    const folder = `blog/${new Date().getFullYear()}/${post.slug}/videos`;
    const videoResult = await uploadVideo(req.file.path, folder);

    const videoData = {
      id: Date.now().toString(),
      title: title || 'Video',
      description: description || '',
      url: videoResult.secure_url,
      publicId: videoResult.public_id,
      duration: videoResult.duration,
      format: videoResult.format,
      uploadedAt: new Date().toISOString()
    };

    // Agregar video a la lista
    const currentVideos = post.videos || [];
    const updateData = {
      videos: [...currentVideos, videoData]
    };

    await post.update(updateData);

    res.json({
      success: true,
      message: 'Video subido exitosamente',
      data: {
        post: post,
        newVideo: videoData
      }
    });
  } catch (error) {
    console.error('Error subiendo video:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar imagen de galería
export const deleteBlogPostImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    if (imageId === 'featured') {
      // Eliminar imagen destacada
      if (post.featuredImage) {
        try {
          await deleteResponsiveImages(post.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen:', deleteError);
        }
      }
      await post.update({ featuredImage: null });
    } else {
      // Eliminar de galería
      const currentImages = post.images || [];
      const imageIndex = parseInt(imageId);
      
      if (imageIndex >= 0 && imageIndex < currentImages.length) {
        const imageToDelete = currentImages[imageIndex];
        
        try {
          await deleteResponsiveImages(imageToDelete);
        } catch (deleteError) {
          console.warn('Error eliminando imagen:', deleteError);
        }
        
        const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
        await post.update({ images: updatedImages });
      }
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar video
export const deleteBlogPostVideo = async (req, res) => {
  try {
    const { id, videoId } = req.params;
    
    const post = await BlogPost.findByPk(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    const currentVideos = post.videos || [];
    const videoIndex = currentVideos.findIndex(video => video.id === videoId);
    
    if (videoIndex !== -1) {
      const videoToDelete = currentVideos[videoIndex];
      
      try {
        await deleteVideo(videoToDelete.publicId);
      } catch (deleteError) {
        console.warn('Error eliminando video:', deleteError);
      }
      
      const updatedVideos = currentVideos.filter(video => video.id !== videoId);
      await post.update({ videos: updatedVideos });
    }

    res.json({
      success: true,
      message: 'Video eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando video:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar post
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByPk(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post no encontrado'
      });
    }

    // Eliminar imágenes de Cloudinary
    if (post.featuredImage) {
      try {
        await deleteResponsiveImages(post.featuredImage);
      } catch (deleteError) {
        console.warn('Error eliminando imagen destacada:', deleteError);
      }
    }

    if (post.images && post.images.length > 0) {
      try {
        for (const imageSet of post.images) {
          await deleteResponsiveImages(imageSet);
        }
      } catch (deleteError) {
        console.warn('Error eliminando galería:', deleteError);
      }
    }

    // Eliminar post de la base de datos
    await post.destroy();

    res.json({
      success: true,
      message: 'Post eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando post:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener posts destacados
export const getFeaturedBlogPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const posts = await BlogPost.findAll({
      where: { 
        status: 'published',
        isFeatured: true 
      },
      include: [
       
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'slug'],
          required: false
        }
      ],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error obteniendo posts destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener posts recientes
export const getRecentBlogPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await BlogPost.findAll({
      where: { status: 'published' },
      
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error obteniendo posts recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
