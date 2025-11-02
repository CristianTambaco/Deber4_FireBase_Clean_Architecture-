import { useState, useEffect } from "react";
import { container } from "@/src/di/container";
import { User } from "@/src/domain/entities/User";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Observar cambios de autenticación y cargar perfil inicial desde caché
  useEffect(() => {
    let isMounted = true; // Bandera para evitar setState si el componente se desmonta

    const initAuth = async () => {
      try {
        // 1. Intentar cargar perfil desde AsyncStorage como valor inicial
        const cachedUser = await container.authDataSource.loadCachedUserProfile();
        if (cachedUser && isMounted) {
          setUser(cachedUser); // <-- Mostrar perfil caché inmediatamente
        }

        // 2. Suscribirse a cambios reales de autenticación
        const unsubscribe = container.authRepository.onAuthStateChanged((authUser) => {
          if (isMounted) {
            setUser(authUser); // <-- Actualizar con el valor real de Firebase
            setLoading(false);
          }
        });

        // Devolver la función de desuscripción
        return unsubscribe;
      } catch (err) {
        console.error("Error initializing auth in useAuth:", err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      isMounted = false;
    };
  }, []);

  const updateProfile = async (displayName: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await container.updateUserProfile.execute(displayName);
      // setUser(updatedUser); // El onAuthStateChanged debería actualizar el estado automáticamente
      return true; // El estado se actualizará via onAuthStateChanged
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ... resto de las funciones (register, login, logout, sendPasswordResetEmail) ...
  // (El código de estas funciones no cambia, pero ahora usarán los métodos actualizados del DataSource)

  const register = async (
    email: string,
    password: string,
    displayName: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await container.registerUser.execute(
        email,
        password,
        displayName
      );
      // setUser(newUser); // onAuthStateChanged debería manejarlo
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const loggedUser = await container.loginUser.execute(email, password);
      // setUser(loggedUser); // onAuthStateChanged debería manejarlo
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await container.logoutUser.execute();
      // setUser(null); // onAuthStateChanged debería manejarlo
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await container.sendPasswordResetEmail.execute(email);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    sendPasswordResetEmail,
    isAuthenticated: !!user,
  };
};