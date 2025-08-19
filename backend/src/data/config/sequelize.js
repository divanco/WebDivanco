import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const env = process.env.NODE_ENV || 'development';

let sequelize;
if (env === 'production' && process.env.DB_DEPLOY) {
  sequelize = new Sequelize(process.env.DB_DEPLOY, {
    // ✅ CAMBIO: Habilitar logging en desarrollo para debugging
    logging: env === 'development' ? (sql, timing) => {
      // ✅ ALERTAS para queries de actualización
      if (sql.toLowerCase().includes('update') && sql.toLowerCase().includes('projects')) {
        console.warn('⚠️  UPDATE en Projects detectado');
        console.warn('⚠️  SQL completo:', sql);
      }

      // ✅ ALERTAS para queries de eliminación
      if (sql.toLowerCase().includes('delete') || sql.toLowerCase().includes('truncate')) {
        
        console.trace();
      }
      
      if (sql.toLowerCase().includes('drop table') || sql.toLowerCase().includes('drop cascade')) {
       
        console.trace();
      }
      
      console.log('=== FIN SQL ===\n');
    } : false,
    dialect: 'postgres',
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      // ✅ CAMBIO: Habilitar logging detallado en desarrollo
      logging: env === 'development' ? (sql, timing) => {
        
        
        // ✅ ALERTAS para queries críticas
        if (sql.toLowerCase().includes('delete')) {
          
          console.trace();
        }
        
        if (sql.toLowerCase().includes('update') && sql.toLowerCase().includes('projects')) {
          
        }
        
       
      } : false,
    }
  );
}

export async function testConnection() {
  try {
    await sequelize.authenticate();
   
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

export async function syncModels(alter = true) {
  try {
    await sequelize.sync({ alter });
    
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error.message);
  }
}

export default sequelize;