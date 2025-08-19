import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Subscriber extends Model {}

Subscriber.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  subscribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'website',
  },
  // Para notificaciones
  lastEmailSent: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Subscriber',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['isActive']
    }
  ],
});

export default Subscriber;