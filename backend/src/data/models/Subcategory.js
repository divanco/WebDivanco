import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Subcategory extends Model {}

Subcategory.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      len: [2, 150]
    }
  },
  description: {
    type: DataTypes.TEXT(1000),
    validate: {
      len: [0, 1000]
    }
  },
  slug: {
    type: DataTypes.STRING(170),
    allowNull: false,
    // Ejemplo: "porcelanato-madera-rustica"
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id',
    },
  },
  // Información del producto/material
  brand: {
    type: DataTypes.STRING(100),
  },
  model: {
    type: DataTypes.STRING(100),
  },
  sku: {
    type: DataTypes.STRING(50),
  },
  // Especificaciones técnicas
  specifications: {
    type: DataTypes.JSON,
    // { dimensions: "60x60cm", thickness: "9mm", finish: "mate", colors: ["blanco", "gris"] }
  },
  // Contenido descriptivo completo
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
  },
  videos: {
    type: DataTypes.JSON,
  },
  documents: {
    type: DataTypes.JSON,
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
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  modelName: 'Subcategory',
  hooks: {
    beforeSave: (subcategory, options) => {
      // Auto-generar slug
      if (!subcategory.slug && subcategory.name) {
        subcategory.slug = subcategory.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-');
      }
      
      // Generar searchableText
      const specsText = subcategory.specifications ? 
        Object.values(subcategory.specifications).join(' ') : '';
      
      subcategory.searchableText = `${subcategory.name} ${subcategory.description || ''} ${subcategory.content || ''} ${subcategory.brand || ''} ${subcategory.model || ''} ${specsText}`.toLowerCase();
    }
  },
  indexes: [
    {
      fields: ['categoryId']
    },
    {
      fields: ['slug', 'categoryId'],
      unique: true
    },
    {
      fields: ['searchableText']  // Índice simple
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isFeatured']
    },
    {
      fields: ['brand']
    }
  ]
});

export default Subcategory;