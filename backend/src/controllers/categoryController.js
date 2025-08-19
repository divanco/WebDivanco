import { Category, Subcategory } from '../data/models/index.js';
import { uploadResponsiveImage, deleteResponsiveImages } from '../config/cloudinary.js';

// Obtener todas las categorías
export const getAllCategories = async (req, res) => {
  try {
    const { includeSubcategories = false, activeOnly = true } = req.query;

    const queryOptions = {
      where: activeOnly === 'true' ? { isActive: true } : {},
      order: [['order', 'ASC'], ['name', 'ASC']],
    };

    if (includeSubcategories === 'true') {
      queryOptions.include = [{
        model: Subcategory,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
        order: [['order', 'ASC']]
      }];
    }

    const categories = await Category.findAll(queryOptions);

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categoría por slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { includeSubcategories = true } = req.query;

    const queryOptions = {
      where: { slug, isActive: true },
    };

    if (includeSubcategories === 'true') {
      queryOptions.include = [{
        model: Subcategory,
        as: 'subcategories',
        where: { isActive: true },
        required: false,
        order: [['order', 'ASC']]
      }];
    }

    const category = await Category.findOne(queryOptions);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva categoría
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      content,
      order = 0,
      isShowInHome = false
    } = req.body;

    // Validaciones básicas
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido y debe tener al menos 2 caracteres'
      });
    }

    // Crear la categoría
    const categoryData = {
      name: name.trim(),
      description: description?.trim(),
      content: content?.trim(),
      order: parseInt(order),
      isShowInHome: Boolean(isShowInHome)
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: category
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    await category.update(updateData);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: category
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Subir imagen destacada para categoría
export const uploadCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Eliminar imagen anterior si existe
    if (category.featuredImage) {
      try {
        await deleteResponsiveImages(category.featuredImage);
      } catch (deleteError) {
        console.warn('Error eliminando imagen anterior:', deleteError);
      }
    }

    // Subir nueva imagen
    const images = await uploadResponsiveImage(req.file.path, `categories/${category.slug}`);

    // Actualizar categoría con nueva imagen
    await category.update({ featuredImage: images });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        category: category,
        images: images
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

// Eliminar categoría (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si tiene subcategorías activas
    const subcategoriesCount = await Subcategory.count({
      where: { categoryId: id, isActive: true }
    });

    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque tiene subcategorías activas'
      });
    }

    // Soft delete
    await category.update({ isActive: false });

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener categorías para el home
export const getHomepageCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { 
        isActive: true, 
        isShowInHome: true 
      },
      order: [['order', 'ASC']],
      limit: 6 // Máximo 6 categorías en home
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías del home:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
