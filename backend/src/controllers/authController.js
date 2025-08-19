export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      const err = new Error('Token and new password are required');
      err.status = 400;
      throw err;
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      err.status = 401;
      throw err;
    }
    const user = await User.findByPk(payload.id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};
import { sendPasswordRecoveryMail } from '../utils/mailer.js';
export const recoverPassword = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    const identifier = email || username;
    
    if (!identifier) {
      const err = new Error('Email or username is required');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      } 
    });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    
    // Generar token simple (en producción usar JWT o UUID)
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await sendPasswordRecoveryMail(user.email, token);
    res.json({ message: 'Recovery email sent' });
  } catch (error) {
    next(error);
  }
};

import User from '../data/models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { sendRegistrationMail } from '../utils/mailer.js';
export const register = async (req, res, next) => {
  try {
    const { name, email, username, password, role } = req.body;
    
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      throw err;
    }

    // Verificar si el email ya existe
    const existsByEmail = await User.findOne({ where: { email } });
    if (existsByEmail) {
      const err = new Error('Email already exists');
      err.status = 409;
      throw err;
    }

    // Verificar si el username ya existe (si se proporciona)
    if (username) {
      const existsByUsername = await User.findOne({ where: { username } });
      if (existsByUsername) {
        const err = new Error('Username already exists');
        err.status = 409;
        throw err;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Validar rol recibido
    let userRole = 'user';
    if (role && ['admin', 'user', 'editor', 'author'].includes(role)) {
      userRole = role;
    }

    const user = await User.create({ 
      name,
      email,
      username: username || null,
      password: hashedPassword, 
      role: userRole 
    });

    // Enviar email de confirmación
    try {
      await sendRegistrationMail(user.email);
    } catch (mailError) {
      console.error('Error enviando email de confirmación:', mailError.message);
    }

    res.status(201).json({ 
      message: 'User registered successfully', 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email,
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Buscar usuario por email o username
    const identifier = email || username;
    if (!identifier || !password) {
      const err = new Error('Email/username and password are required');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      } 
    });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const token = jwt.sign({ 
      id: user.id, 
      role: user.role,
      email: user.email,
      name: user.name 
    }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
