import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class MediaFile extends Model {}

MediaFile.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'project_id'
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'original_name'
  },
  type: {
    type: DataTypes.ENUM('render', 'plano', 'video', 'obra_proceso', 'obra_finalizada', 'otro'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  urls: {
    type: DataTypes.JSON, // URLs de Cloudinary
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isMain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_main'
  },
  isSliderImage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_slider_image'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  width: DataTypes.INTEGER,
  height: DataTypes.INTEGER,
  fileSize: {
    type: DataTypes.INTEGER,
    field: 'file_size'
  },
  format: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'MediaFile',
  tableName: 'media_files'
});

export default MediaFile;