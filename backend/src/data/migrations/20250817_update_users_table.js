module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar columnas name y email si no existen
    try {
      await queryInterface.addColumn('Users', 'name', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    } catch (error) {
      console.log('Columna name ya existe o error:', error.message);
    }

    try {
      await queryInterface.addColumn('Users', 'email', {
        type: Sequelize.STRING,
        allowNull: true, // Temporal para permitir migración
        unique: false, // Temporal
      });
    } catch (error) {
      console.log('Columna email ya existe o error:', error.message);
    }

    // Actualizar el enum de roles
    try {
      await queryInterface.changeColumn('Users', 'role', {
        type: Sequelize.ENUM('admin', 'user', 'editor', 'author'),
        defaultValue: 'user',
        allowNull: false,
      });
    } catch (error) {
      console.log('Error actualizando enum de roles:', error.message);
    }

    // Copiar username a email para usuarios existentes (si es necesario)
    try {
      await queryInterface.sequelize.query(`
        UPDATE "Users" 
        SET email = username 
        WHERE email IS NULL AND username IS NOT NULL;
      `);
    } catch (error) {
      console.log('Error copiando username a email:', error.message);
    }

    // Hacer email requerido y único después de la migración de datos
    try {
      await queryInterface.changeColumn('Users', 'email', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      });
    } catch (error) {
      console.log('Error haciendo email requerido:', error.message);
    }

    // Hacer username opcional
    try {
      await queryInterface.changeColumn('Users', 'username', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      });
    } catch (error) {
      console.log('Error haciendo username opcional:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir cambios si es necesario
    try {
      await queryInterface.removeColumn('Users', 'name');
      await queryInterface.removeColumn('Users', 'email');
      
      await queryInterface.changeColumn('Users', 'role', {
        type: Sequelize.ENUM('admin', 'user'),
        defaultValue: 'user',
        allowNull: false,
      });

      await queryInterface.changeColumn('Users', 'username', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      });
    } catch (error) {
      console.log('Error en rollback:', error.message);
    }
  }
};
