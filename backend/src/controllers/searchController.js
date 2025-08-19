import { Category, Subcategory, Project, BlogPost, User } from '../data/models/index.js';
import { Op } from 'sequelize';

// Búsqueda global
export const globalSearch = async (req, res) => {
  try {
    const { 
      q: query, 
      type = 'all', 
      limit = 20,
      page = 1 
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La consulta debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = query.trim();
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const itemLimit = parseInt(limit);

    const results = {
      categories: [],
      subcategories: [],
      projects: [],
      blogPosts: [],
      total: 0
    };

    // Búsqueda en categorías
    if (type === 'all' || type === 'categories') {
      const categories = await Category.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
            { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        attributes: ['id', 'name', 'slug', 'description', 'featuredImage'],
        limit: type === 'categories' ? itemLimit : 5,
        offset: type === 'categories' ? offset : 0,
        order: [['name', 'ASC']]
      });

      results.categories = categories.map(category => ({
        ...category.toJSON(),
        type: 'category',
        url: `/showroom/${category.slug}`
      }));
    }

    // Búsqueda en subcategorías
    if (type === 'all' || type === 'subcategories') {
      const subcategories = await Subcategory.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
            { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['name', 'slug'],
          where: { isActive: true }
        }],
        attributes: ['id', 'name', 'slug', 'description', 'featuredImage'],
        limit: type === 'subcategories' ? itemLimit : 5,
        offset: type === 'subcategories' ? offset : 0,
        order: [['name', 'ASC']]
      });

      results.subcategories = subcategories.map(subcategory => ({
        ...subcategory.toJSON(),
        type: 'subcategory',
        url: `/showroom/${subcategory.category.slug}/${subcategory.slug}`
      }));
    }

    // Búsqueda en proyectos
    if (type === 'all' || type === 'projects') {
      const projects = await Project.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { title: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
            { location: { [Op.iLike]: `%${searchTerm}%` } },
            { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        attributes: ['id', 'title', 'slug', 'description', 'location', 'year', 'projectType', 'featuredImage'],
        limit: type === 'projects' ? itemLimit : 5,
        offset: type === 'projects' ? offset : 0,
        order: [['year', 'DESC'], ['title', 'ASC']]
      });

      results.projects = projects.map(project => ({
        ...project.toJSON(),
        type: 'project',
        url: `/proyectos/${project.slug}`
      }));
    }

    // Búsqueda en blog posts
    if (type === 'all' || type === 'blog') {
      const blogPosts = await BlogPost.findAll({
        where: {
          status: 'published',
          [Op.or]: [
            { title: { [Op.iLike]: `%${searchTerm}%` } },
            { content: { [Op.iLike]: `%${searchTerm}%` } },
            { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
            { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['name']
        }],
        attributes: ['id', 'title', 'slug', 'excerpt', 'publishedAt', 'featuredImage'],
        limit: type === 'blog' ? itemLimit : 5,
        offset: type === 'blog' ? offset : 0,
        order: [['publishedAt', 'DESC']]
      });

      results.blogPosts = blogPosts.map(post => ({
        ...post.toJSON(),
        type: 'blog',
        url: `/blog/${post.slug}`
      }));
    }

    // Calcular total
    results.total = results.categories.length + 
                   results.subcategories.length + 
                   results.projects.length + 
                   results.blogPosts.length;

    // Si es búsqueda específica por tipo, devolver solo ese tipo con paginación
    if (type !== 'all') {
      const specificResults = results[type === 'categories' ? 'categories' :
                                     type === 'subcategories' ? 'subcategories' :
                                     type === 'projects' ? 'projects' : 'blogPosts'];
      
      return res.json({
        success: true,
        data: specificResults,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(results.total / itemLimit),
          total_items: results.total,
          items_per_page: itemLimit
        },
        query: searchTerm,
        type
      });
    }

    res.json({
      success: true,
      data: results,
      query: searchTerm,
      total: results.total
    });
  } catch (error) {
    console.error('Error en búsqueda global:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Sugerencias de búsqueda
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = query.trim();
    const itemLimit = Math.min(parseInt(limit), 20);

    const suggestions = [];

    // Sugerencias de categorías
    const categories = await Category.findAll({
      where: {
        isActive: true,
        name: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['name', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['name', 'ASC']]
    });

    suggestions.push(...categories.map(cat => ({
      text: cat.name,
      type: 'category',
      url: `/showroom/${cat.slug}`
    })));

    // Sugerencias de subcategorías
    const subcategories = await Subcategory.findAll({
      where: {
        isActive: true,
        name: { [Op.iLike]: `%${searchTerm}%` }
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['slug'],
        where: { isActive: true }
      }],
      attributes: ['name', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['name', 'ASC']]
    });

    suggestions.push(...subcategories.map(sub => ({
      text: sub.name,
      type: 'subcategory',
      url: `/showroom/${sub.category.slug}/${sub.slug}`
    })));

    // Sugerencias de proyectos
    const projects = await Project.findAll({
      where: {
        isActive: true,
        title: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['title', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['title', 'ASC']]
    });

    suggestions.push(...projects.map(proj => ({
      text: proj.title,
      type: 'project',
      url: `/proyectos/${proj.slug}`
    })));

    // Sugerencias de blog posts
    const blogPosts = await BlogPost.findAll({
      where: {
        status: 'published',
        title: { [Op.iLike]: `%${searchTerm}%` }
      },
      attributes: ['title', 'slug'],
      limit: Math.ceil(itemLimit / 4),
      order: [['title', 'ASC']]
    });

    suggestions.push(...blogPosts.map(post => ({
      text: post.title,
      type: 'blog',
      url: `/blog/${post.slug}`
    })));

    // Limitar y ordenar resultados
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(t => t.text === item.text)
      )
      .slice(0, itemLimit);

    res.json({
      success: true,
      data: uniqueSuggestions
    });
  } catch (error) {
    console.error('Error obteniendo sugerencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Búsqueda por filtros avanzados
export const advancedSearch = async (req, res) => {
  try {
    const {
      q: query,
      categories = [],
      projectTypes = [],
      years = [],
      tags = [],
      dateFrom,
      dateTo,
      limit = 20,
      page = 1,
      sortBy = 'relevance'
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'La consulta debe tener al menos 2 caracteres'
      });
    }

    const searchTerm = query.trim();
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const itemLimit = parseInt(limit);

    const results = {
      projects: [],
      blogPosts: [],
      total: 0
    };

    // Búsqueda avanzada en proyectos
    const projectWhereClause = {
      isActive: true,
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { location: { [Op.iLike]: `%${searchTerm}%` } },
        { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };

    // Filtros adicionales para proyectos
    if (projectTypes.length > 0) {
      projectWhereClause.projectType = { [Op.in]: projectTypes };
    }

    if (years.length > 0) {
      projectWhereClause.year = { [Op.in]: years.map(y => parseInt(y)) };
    }

    let projectOrder = [['title', 'ASC']];
    if (sortBy === 'date') {
      projectOrder = [['year', 'DESC'], ['createdAt', 'DESC']];
    } else if (sortBy === 'name') {
      projectOrder = [['title', 'ASC']];
    }

    const projects = await Project.findAll({
      where: projectWhereClause,
      attributes: ['id', 'title', 'slug', 'description', 'location', 'year', 'projectType', 'featuredImage'],
      limit: itemLimit,
      offset: offset,
      order: projectOrder
    });

    results.projects = projects.map(project => ({
      ...project.toJSON(),
      type: 'project',
      url: `/proyectos/${project.slug}`
    }));

    // Búsqueda avanzada en blog posts
    const blogWhereClause = {
      status: 'published',
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { content: { [Op.iLike]: `%${searchTerm}%` } },
        { excerpt: { [Op.iLike]: `%${searchTerm}%` } },
        { searchableText: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };

    // Filtros adicionales para blog
    if (tags.length > 0) {
      blogWhereClause.tags = { [Op.overlap]: tags };
    }

    if (dateFrom || dateTo) {
      blogWhereClause.publishedAt = {};
      if (dateFrom) {
        blogWhereClause.publishedAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        blogWhereClause.publishedAt[Op.lte] = new Date(dateTo);
      }
    }

    let blogOrder = [['publishedAt', 'DESC']];
    if (sortBy === 'name') {
      blogOrder = [['title', 'ASC']];
    }

    const blogPosts = await BlogPost.findAll({
      where: blogWhereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['name']
      }],
      attributes: ['id', 'title', 'slug', 'excerpt', 'publishedAt', 'featuredImage', 'tags'],
      limit: itemLimit,
      offset: offset,
      order: blogOrder
    });

    results.blogPosts = blogPosts.map(post => ({
      ...post.toJSON(),
      type: 'blog',
      url: `/blog/${post.slug}`
    }));

    results.total = results.projects.length + results.blogPosts.length;

    res.json({
      success: true,
      data: results,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(results.total / itemLimit),
        total_items: results.total,
        items_per_page: itemLimit
      },
      query: searchTerm,
      filters: {
        categories,
        projectTypes,
        years,
        tags,
        dateFrom,
        dateTo,
        sortBy
      }
    });
  } catch (error) {
    console.error('Error en búsqueda avanzada:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
