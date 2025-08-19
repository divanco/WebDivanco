import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, text, html, from }) {
  return transporter.sendMail({
    from: from || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
}

export async function sendRegistrationMail(to) {
  return sendMail({
    to,
    subject: 'Registro exitoso',
    text: '¡Bienvenido! Tu registro fue exitoso.',
  });
}

export async function sendPasswordRecoveryMail(to, token) {
  const recoveryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  return sendMail({
    to,
    subject: 'Recuperación de contraseña',
    text: `Para recuperar tu contraseña, haz clic en el siguiente enlace: ${recoveryUrl}`,
    html: `<p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p><a href="${recoveryUrl}">${recoveryUrl}</a>`
  });
}

// Enviar email de bienvenida a nuevo suscriptor
export async function sendWelcomeEmail(subscriber) {
  try {
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido a Divanco</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
          .unsubscribe { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a Divanco!</h1>
          </div>
          <div class="content">
            <h2>Hola${subscriber.name ? ` ${subscriber.name}` : ''}!</h2>
            <p>Gracias por suscribirte a nuestro newsletter. Estamos emocionados de tenerte en nuestra comunidad.</p>
            <p>Recibirás notificaciones sobre:</p>
            <ul>
              <li>📝 Nuevos artículos en nuestro blog</li>
              <li>🏗️ Proyectos arquitectónicos destacados</li>
              <li>🔧 Materiales y tendencias en construcción</li>
              <li>📅 Eventos y novedades del estudio</li>
            </ul>
            <p>¡Esperamos que disfrutes del contenido!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" class="btn">Visitar nuestro sitio web</a>
            </div>
          </div>
          <div class="footer">
            <p>Divanco - Estudio de Arquitectura</p>
            <div class="unsubscribe">
              <p>Si no deseas recibir más emails, puedes <a href="${unsubscribeUrl}">cancelar tu suscripción</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendMail({
      to: subscriber.email,
      subject: '¡Bienvenido al Newsletter de Divanco!',
      html
    });
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error.message);
    throw error;
  }
}

// Enviar notificación de nuevo post del blog
export async function sendBlogNotification(subscribers, blogPost) {
  if (!subscribers || subscribers.length === 0) {
    console.log('📧 No hay suscriptores para notificar');
    return;
  }

  try {
    const postUrl = `${process.env.FRONTEND_URL}/blog/${blogPost.slug}`;
    
    // Enviar emails en lotes para evitar sobrecarga
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      batches.push(subscribers.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const emailPromises = batch.map(async (subscriber) => {
        const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Nuevo artículo en Divanco</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
              .post-preview { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .post-title { color: #2c3e50; margin-bottom: 10px; }
              .post-excerpt { color: #666; line-height: 1.5; }
              .unsubscribe { margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📝 Nuevo Artículo Publicado</h1>
              </div>
              <div class="content">
                <h2>Hola${subscriber.name ? ` ${subscriber.name}` : ''}!</h2>
                <p>Tenemos un nuevo artículo en nuestro blog que creemos que te interesará:</p>
                
                <div class="post-preview">
                  <h3 class="post-title">${blogPost.title}</h3>
                  ${blogPost.excerpt ? `<p class="post-excerpt">${blogPost.excerpt}</p>` : ''}
                  ${blogPost.author ? `<p><strong>Por:</strong> ${blogPost.author.name}</p>` : ''}
                  <p><strong>Publicado:</strong> ${new Date(blogPost.publishedAt).toLocaleDateString('es-ES')}</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${postUrl}" class="btn">Leer Artículo Completo</a>
                </div>
                
                <p>¡Esperamos que disfrutes de la lectura!</p>
              </div>
              <div class="footer">
                <p>Divanco - Estudio de Arquitectura</p>
                <div class="unsubscribe">
                  <p>Si no deseas recibir más emails, puedes <a href="${unsubscribeUrl}">cancelar tu suscripción</a></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        return sendMail({
          to: subscriber.email,
          subject: `📝 Nuevo artículo: ${blogPost.title}`,
          html
        });
      });

      await Promise.all(emailPromises);
      console.log(`✅ Lote de ${batch.length} notificaciones enviadas`);
      
      // Pausa entre lotes para evitar rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Notificaciones enviadas a ${subscribers.length} suscriptores para: ${blogPost.title}`);
  } catch (error) {
    console.error('❌ Error enviando notificaciones de blog:', error.message);
    throw error;
  }
}

// Enviar confirmación de cancelación de suscripción
export async function sendUnsubscribeConfirmation(subscriber) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Suscripción cancelada</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #95a5a6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Suscripción Cancelada</h1>
          </div>
          <div class="content">
            <h2>Hola${subscriber.name ? ` ${subscriber.name}` : ''}!</h2>
            <p>Tu suscripción a nuestro newsletter ha sido cancelada exitosamente.</p>
            <p>Ya no recibirás notificaciones por email de parte nuestra.</p>
            <p>Si en algún momento cambias de opinión, siempre puedes volver a suscribirte desde nuestro sitio web.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" class="btn">Visitar nuestro sitio web</a>
            </div>
            <p>¡Gracias por haber sido parte de nuestra comunidad!</p>
          </div>
          <div class="footer">
            <p>Divanco - Estudio de Arquitectura</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendMail({
      to: subscriber.email,
      subject: 'Suscripción cancelada - Divanco',
      html
    });
  } catch (error) {
    console.error('❌ Error enviando confirmación de cancelación:', error.message);
    throw error;
  }
}

export default transporter;
