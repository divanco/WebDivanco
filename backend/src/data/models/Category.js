import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT(1000),
    validate: {
      len: [0, 1000]
    }
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    // Ejemplo: "ceramicas-y-porcelanatos"
  },
  // Contenido completo de la categoría
  content: {
    type: DataTypes.TEXT(3000),
    validate: {
      len: [0, 3000]
    }
  },
  // Imágenes responsivas
  featuredImage: {
    type: DataTypes.JSON,
  },
  images: {
    type: DataTypes.JSON,
    // Array de sets de imágenes responsivas
  },
  videos: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
    // PDFs de catálogos, fichas técnicas, etc.
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  searchableText: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isShowInHome: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'Category',
  hooks: {
    beforeSave: (category, options) => {
      // Auto-generar slug si no existe
      if (!category.slug && category.name) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Generar searchableText
      category.searchableText = `${category.name} ${category.description || ''} ${category.content || ''}`.toLowerCase();
    }
  },
  indexes: [
    {
      fields: ['slug']
    },
    {
      fields: ['searchableText']  // Índice simple sin GIN
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['order']
    }
  ]
});

export default Category;