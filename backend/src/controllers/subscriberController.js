import { Subscriber } from '../data/models/index.js';
import { sendWelcomeEmail, sendUnsubscribeConfirmation } from '../utils/mailer.js';
import { Op } from 'sequelize';

// Crear nueva suscripción
export const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validación básica
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verificar si ya existe
    let subscriber = await Subscriber.findOne({
      where: { email: cleanEmail }
    });

    if (subscriber) {
      if (subscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está suscrito'
        });
      } else {
        // Reactivar suscripción
        await subscriber.update({
          isActive: true,
          name: name?.trim() || subscriber.name,
          unsubscribeToken: null,
          resubscribedAt: new Date()
        });

        // Enviar email de bienvenida
        try {
          await sendWelcomeEmail(subscriber);
        } catch (emailError) {
          console.warn('Error enviando email de bienvenida:', emailError);
        }

        return res.json({
          success: true,
          message: 'Suscripción reactivada exitosamente',
          data: {
            email: subscriber.email,
            name: subscriber.name
          }
        });
      }
    }

    // Crear nueva suscripción
    subscriber = await Subscriber.create({
      email: cleanEmail,
      name: name?.trim() || null,
      isActive: true,
      subscribedAt: new Date()
    });

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail(subscriber);
    } catch (emailError) {
      console.warn('Error enviando email de bienvenida:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Suscripción creada exitosamente',
      data: {
        email: subscriber.email,
        name: subscriber.name
      }
    });
  } catch (error) {
    console.error('Error creando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cancelar suscripción por token
export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de cancelación requerido'
      });
    }

    const subscriber = await Subscriber.findOne({
      where: { unsubscribeToken: token }
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Token de cancelación inválido o expirado'
      });
    }

    // Marcar como inactivo
    await subscriber.update({
      isActive: false,
      unsubscribedAt: new Date()
    });

    // Enviar confirmación de cancelación
    try {
      await sendUnsubscribeConfirmation(subscriber);
    } catch (emailError) {
      console.warn('Error enviando confirmación de cancelación:', emailError);
    }

    res.json({
      success: true,
      message: 'Suscripción cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Generar token de cancelación
export const generateUnsubscribeToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requerido'
      });
    }

    const subscriber = await Subscriber.findOne({
      where: { 
        email: email.trim().toLowerCase(),
        isActive: true
      }
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró suscripción activa para este email'
      });
    }

    // El token se genera automáticamente en el modelo
    await subscriber.save();

    res.json({
      success: true,
      message: 'Token de cancelación generado',
      data: {
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`
      }
    });
  } catch (error) {
    console.error('Error generando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de suscriptores (solo para admin)
export const getSubscriberStats = async (req, res) => {
  try {
    const activeCount = await Subscriber.count({
      where: { isActive: true }
    });

    const totalCount = await Subscriber.count();

    const recentSubscribers = await Subscriber.count({
      where: {
        isActive: true,
        subscribedAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      }
    });

    const unsubscribedCount = await Subscriber.count({
      where: { isActive: false }
    });

    res.json({
      success: true,
      data: {
        activeSubscribers: activeCount,
        totalSubscribers: totalCount,
        recentSubscribers,
        unsubscribedCount,
        conversionRate: totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener lista de suscriptores (solo para admin)
export const getAllSubscribers = async (req, res) => {
  try {
    const { 
      status = 'active', 
      limit = 50, 
      page = 1,
      search 
    } = req.query;

    const whereClause = {};
    
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    if (search) {
      whereClause[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: subscribers } = await Subscriber.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'email', 'name', 'isActive', 'subscribedAt', 'unsubscribedAt'],
      order: [['subscribedAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error obteniendo suscriptores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Exportar lista de suscriptores activos (solo para admin)
export const exportActiveSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({
      where: { isActive: true },
      attributes: ['email', 'name', 'subscribedAt'],
      order: [['subscribedAt', 'DESC']]
    });

    // Formato CSV
    const csvHeader = 'Email,Nombre,Fecha de Suscripción\n';
    const csvContent = subscribers.map(subscriber => {
      const name = subscriber.name || '';
      const date = subscriber.subscribedAt.toISOString().split('T')[0];
      return `${subscriber.email},"${name}",${date}`;
    }).join('\n');

    const csv = csvHeader + csvContent;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=suscriptores_activos.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exportando suscriptores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar suscriptor permanentemente (solo para admin)
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findByPk(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Suscriptor no encontrado'
      });
    }

    await subscriber.destroy();

    res.json({
      success: true,
      message: 'Suscriptor eliminado permanentemente'
    });
  } catch (error) {
    console.error('Error eliminando suscriptor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
