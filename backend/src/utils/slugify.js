/**
 * Genera un slug a partir de un texto
 * @param {string} text - Texto a convertir en slug
 * @returns {string} - Slug generado
 */
export const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Reemplazar caracteres especiales del español
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    // Reemplazar espacios y caracteres especiales con guiones
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    // Remover guiones al inicio y final
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Genera un slug único verificando que no exista en la base de datos
 * @param {string} text - Texto base para el slug
 * @param {Object} model - Modelo de Sequelize para verificar unicidad
 * @param {number} id - ID del registro actual (para ediciones)
 * @returns {Promise<string>} - Slug único
 */
export const generateUniqueSlug = async (text, model, id = null) => {
  let baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const whereClause = { slug };
    
    // Si estamos editando, excluir el registro actual
    if (id) {
      whereClause.id = { [model.sequelize.Sequelize.Op.ne]: id };
    }
    
    const existingRecord = await model.findOne({ where: whereClause });
    
    if (!existingRecord) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};
