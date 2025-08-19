import { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Por favor ingresa tu email');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Por favor ingresa un email válido');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // TODO: Aquí conectarás con tu backend para guardar el email
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('¡Suscripción exitosa!');
        setEmail('');
      } else {
        setMessage('Error al suscribirse. Intenta nuevamente.');
      }
    } catch (error) {
      setMessage('Error al suscribirse. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
      <p className="text-gray-300 mb-6 text-sm leading-relaxed">
        Recibe las últimas noticias y proyectos
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your e-mail address"
            className="
              w-full px-0 py-3 
              bg-transparent 
              border-0 border-b border-gray-600 
              text-white placeholder-gray-400
              focus:outline-none focus:border-orange-500 
              transition-colors duration-200
              text-sm
            "
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full bg-naranjaDivanco hover:bg-orange-500 
            text-white text-sm font-medium 
            py-3 px-6 
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            uppercase tracking-wider
          "
        >
          {isSubmitting ? 'SUSCRIBIENDO...' : 'SUSCRIBETE'}
        </button>
        
        {message && (
          <p className={`text-xs mt-2 ${
            message.includes('exitosa') ? 'text-green-400' : 'text-red-400'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Newsletter;