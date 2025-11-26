import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

type UserRole = 'inquilino' | 'propietario' | 'admin';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}

interface UseAuthOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { requiredRole, redirectTo = '/auth/login' } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const expiresAt = localStorage.getItem('expires_at');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!expiresAt || !refreshToken) return;

      const expirationTime = parseInt(expiresAt) * 1000; // convertir a milliseconds
      const now = Date.now();
      const timeUntilExpiry = expirationTime - now;

      // Si el token expira en menos de 5 minutos, renovarlo
      if (timeUntilExpiry < 5 * 60 * 1000) {
        try {
          console.log('Token próximo a expirar, renovando...');
          const response = await api.post('/api/auth/refresh', {
            refresh_token: refreshToken
          });

          // Actualizar tokens en localStorage
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);
          localStorage.setItem('expires_at', response.data.expires_at);
          console.log('Token renovado exitosamente');
        } catch (error) {
          console.error('Error renovando token:', error);
          // Si falla el refresh, cerrar sesión
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('expires_at');
          localStorage.removeItem('user');
          router.push(redirectTo);
        }
      }
    };

    const validateAuth = async () => {
      // Verificar si hay token
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No token found, redirecting to login');
        router.push(redirectTo);
        return;
      }

      // Verificar si hay datos de usuario
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('No user data found, redirecting to login');
        localStorage.removeItem('access_token');
        router.push(redirectTo);
        return;
      }

      try {
        const parsedUser: User = JSON.parse(userData);

        // Verificar que tenga los campos requeridos
        if (!parsedUser.id || !parsedUser.role) {
          console.log('Invalid user data, redirecting to login');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          router.push(redirectTo);
          return;
        }

        // Verificar rol si es requerido
        if (requiredRole && parsedUser.role !== requiredRole) {
          console.log(`Wrong role. Expected: ${requiredRole}, Got: ${parsedUser.role}`);
          // Redirigir al dashboard correcto según el rol
          const correctDashboard = parsedUser.role === 'inquilino'
            ? '/home/inquilino'
            : '/home/propietario';
          router.push(correctDashboard);
          return;
        }

        setUser(parsedUser);

        // Verificar expiración del token
        await checkTokenExpiration();

        // Configurar intervalo para verificar expiración cada minuto
        refreshIntervalRef.current = setInterval(checkTokenExpiration, 60 * 1000);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push(redirectTo);
        return;
      }

      setLoading(false);
    };

    validateAuth();

    // Cleanup: limpiar intervalo al desmontar
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [requiredRole, redirectTo, router]);

  const logout = () => {
    // Limpiar intervalo de refresh
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return { user, loading, logout };
}