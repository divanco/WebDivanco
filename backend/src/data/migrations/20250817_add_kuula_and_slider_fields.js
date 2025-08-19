import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  console.log('🔄 Ejecutando migración: Agregar campos kuulaUrl y showInSlider a Projects');
  
  try {
    // Agregar campo kuulaUrl
    await queryInterface.addColumn('Projects', 'kuulaUrl', {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida'
        },
        len: [0, 500]
      }
    });
    console.log('✅ Campo kuulaUrl agregado correctamente');

    // Agregar campo showInSlider
    await queryInterface.addColumn('Projects', 'showInSlider', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    console.log('✅ Campo showInSlider agregado correctamente');

    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
};

export const down = async (queryInterface) => {
  console.log('🔄 Revirtiendo migración: Eliminar campos kuulaUrl y showInSlider');
  
  try {
    // Eliminar campos en orden inverso
    await queryInterface.removeColumn('Projects', 'showInSlider');
    console.log('✅ Campo showInSlider eliminado');

    await queryInterface.removeColumn('Projects', 'kuulaUrl');
    console.log('✅ Campo kuulaUrl eliminado');

    console.log('🎉 Rollback completado exitosamente');

  } catch (error) {
    console.error('❌ Error en el rollback:', error);
    throw error;
  }
};
