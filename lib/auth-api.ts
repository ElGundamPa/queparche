/**
 * Auth API - Cliente para llamar endpoints de autenticación
 * Hace llamadas HTTP directas sin usar React Query hooks
 */

const API_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.queparche.com';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}

/**
 * Login con email o username
 */
export async function loginUser(
  emailOrUsername: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result?.data || data;
  } catch (error: any) {
    console.error('❌ Error en loginUser:', error);
    return {
      success: false,
      error: error.message || 'Error al iniciar sesión',
    };
  }
}

/**
 * Registro de usuario nuevo
 */
export async function registerUser(userData: {
  email: string;
  username: string;
  password: string;
  name: string;
}): Promise<RegisterResponse> {
  try {
    const response = await fetch(`${API_URL}/api/trpc/auth.register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result?.data || data;
  } catch (error: any) {
    console.error('❌ Error en registerUser:', error);
    return {
      success: false,
      error: error.message || 'Error al registrar usuario',
    };
  }
}
