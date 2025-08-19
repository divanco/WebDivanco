import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class BlogPost extends Model {}

BlogPost.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  excerpt: {
    type: DataTypes.TEXT(500),
    validate: {
      len: [0, 500]
    }
  },
  slug: {
    type: DataTypes.STRING(220),
    allowNull: false,
    unique: true,
  },
  // Imágenes del post
  featuredImage: {
    type: DataTypes.JSON,
  },
  images: {
    type: DataTypes.JSON,
  },
  videos: {
    type: DataTypes.JSON,
  },
  
 
  // Relación opcional con proyecto
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Projects',
      key: 'id',
    },
  },
  // Tags para categorización
  tags: {
    type: DataTypes.JSON,
  },
  // Campo para búsqueda
  searchableText: {
    type: DataTypes.TEXT,
  },
  // Estados
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  publishedAt: {
    type: DataTypes.DATE,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'BlogPost',
  hooks: {
    beforeSave: (post, options) => {
      const tagsText = post.tags ? post.tags.join(' ') : '';
      const contentText = post.content ? post.content.replace(/<[^>]*>/g, '') : ''; // Remover HTML
      
      post.searchableText = `${post.title} ${post.excerpt || ''} ${contentText} ${tagsText}`.toLowerCase();
    }
  },
  indexes: [
    {
      fields: ['slug']
    },
   
    {
      fields: ['projectId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['publishedAt']
    },
    {
      fields: ['searchableText']  // Índice simple
    }
  ]
});

export default BlogPost;