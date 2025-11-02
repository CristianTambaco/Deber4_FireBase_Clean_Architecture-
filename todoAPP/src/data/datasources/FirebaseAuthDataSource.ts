// src/data/datasources/FirebaseAuthDataSource.ts

import {   
    createUserWithEmailAndPassword,   
    signInWithEmailAndPassword,   
    signOut,   
    onAuthStateChanged as firebaseOnAuthStateChanged,   
    updateProfile,   
    User as FirebaseUser,    
    sendPasswordResetEmail
} from "firebase/auth"; 
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"; 
import { auth, db } from "@/FirebaseConfig"; 
import { User } from "@/src/domain/entities/User";
// --- NUEVO: Importar AsyncStorage ---
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- NUEVO: Clave para AsyncStorage ---
const USER_PROFILE_KEY = "@user_profile";

export class FirebaseAuthDataSource {  
  // ===== MÉTODO PRIVADO: CONVERTIR FIREBASEUSER A USER =====   
    private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {     
        return {       
            id: firebaseUser.uid,       
            email: firebaseUser.email || "",       
            displayName: firebaseUser.displayName || "Usuario",       
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()), 
        }; 
    }

    // --- NUEVO: Función privada para guardar perfil en AsyncStorage ---
    private async saveUserProfileToStorage(user: User): Promise<void> {
        try {
            await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
            console.log("Perfil guardado en AsyncStorage:", user.id);
        } catch (error) {
            console.error("Error guardando perfil en AsyncStorage:", error);
            // No es crítico, la app puede seguir funcionando
        }
    }

    // --- NUEVO: Función privada para cargar perfil desde AsyncStorage ---
    private async loadUserProfileFromStorage(): Promise<User | null> {
        try {
            const stored = await AsyncStorage.getItem(USER_PROFILE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Asegurarse de que los campos sean correctos
                return {
                    id: parsed.id,
                    email: parsed.email,
                    displayName: parsed.displayName,
                    createdAt: new Date(parsed.createdAt),
                };
            }
        } catch (error) {
            console.error("Error cargando perfil de AsyncStorage:", error);
        }
        return null;
    }

    // --- NUEVO: Función privada para eliminar perfil de AsyncStorage ---
    private async removeUserProfileFromStorage(): Promise<void> {
        try {
            await AsyncStorage.removeItem(USER_PROFILE_KEY);
            console.log("Perfil eliminado de AsyncStorage");
        } catch (error) {
            console.error("Error eliminando perfil de AsyncStorage:", error);
        }
    }

  // ===== REGISTRO DE USUARIO =====   
    async register(     
        email: string,     
        password: string,     
        displayName: string   
    ): Promise<User> {     
        try { 
        // 1. Crear usuario en Firebase Auth       
        const userCredential = await createUserWithEmailAndPassword(         
            auth,         
            email,         
            password       
        );       
        const firebaseUser = userCredential.user; 
        // 2. Actualizar perfil en Auth (displayName)       
        await updateProfile(firebaseUser, { displayName, }); 
        // 3. Guardar datos adicionales en Firestore       
        await setDoc(doc(db, "users", firebaseUser.uid), {         
            email,         
            displayName,         
            createdAt: new Date(), 
        }); 
        // 4. Retornar usuario mapeado       
        const newUser = {         
            id: firebaseUser.uid,         
            email,         
            displayName,         
            createdAt: new Date(), 
        };

        // 5. --- NUEVO: Guardar perfil en AsyncStorage ---
        await this.saveUserProfileToStorage(newUser);

        return newUser; 
    } catch (error: any) {
    // Solo loguear si NO es un error esperado
    if (error.code !== "auth/email-already-in-use" && 
        error.code !== "auth/invalid-email" && 
        error.code !== "auth/weak-password") {
        console.log("Unexpected error registering user:", error);
    }
    if (error.code === "auth/email-already-in-use") {
        throw new Error("Este email ya está registrado");
    } else if (error.code === "auth/invalid-email") {
        throw new Error("Email inválido");
    } else if (error.code === "auth/weak-password") {
        throw new Error("La contraseña es muy débil");
    }
    throw new Error(error.message || "Error al registrar usuario");
    }
  } 
  // ===== LOGIN =====   
    async login(email: string, password: string): Promise<User> {     
        try { 
      // 1. Autenticar con Firebase Auth       
        const userCredential = await signInWithEmailAndPassword(         
            auth,         
            email,         
            password       
        );       
        const firebaseUser = userCredential.user; 
      // 2. Obtener datos adicionales de Firestore       
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));       
        const userData = userDoc.data(); 
       // 3. Retornar usuario completo       
        const user = {         
            id: firebaseUser.uid, 
            email: firebaseUser.email || "",         
            displayName: 
                userData?.displayName || firebaseUser.displayName || "Usuario",         
            createdAt: userData?.createdAt?.toDate() || new Date(), 
        };

        // Guardar perfil en AsyncStorage
        await this.saveUserProfileToStorage(user);

        return user;
    } catch (error: any) {       
        console.error("Error logging in:", error); 
      // Mensajes de error más amigables       
        if (error.code === "auth/user-not-found") {         
            throw new Error("Usuario no encontrado");       
        } else if (error.code === "auth/wrong-password") {         
            throw new Error("Contraseña incorrecta");       
        } else if (error.code === "auth/invalid-credential") {         
            throw new Error("Credenciales inválidas"); 
        }        
        throw new Error(error.message || "Error al iniciar sesión"); 
    } 
  } 
  // ===== LOGOUT =====   
    async logout(): Promise<void> {     
        try {       
            await signOut(auth);
            // Eliminar perfil de AsyncStorage al cerrar sesión 
            await this.removeUserProfileFromStorage();
        } catch (error: any) {       
            console.error("Error logging out:", error); 
        throw new Error(error.message || "Error al cerrar sesión");     
        } 
    } 
    // actualizacion
    async updateProfile(displayName: string): Promise<User> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
        throw new Error("No user is currently authenticated");
    }
    // 1. Actualizar en Firebase Auth
    await updateProfile(firebaseUser, { displayName });
    // 2. Actualizar en Firestore
    const userRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userRef, { displayName });
    // 3. Devolver usuario actualizado
    const updatedUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName,
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    };

    //  Actualizar perfil en AsyncStorage 
    await this.saveUserProfileToStorage(updatedUser);

    return updatedUser;
    }
  // ===== OBTENER USUARIO ACTUAL =====   
    async getCurrentUser(): Promise<User | null> {     
        try {       
            const firebaseUser = auth.currentUser;       
            if (!firebaseUser) return null;        
            return this.mapFirebaseUserToUser(firebaseUser); 
        } catch (error) {       
            console.error("Error getting current user:", error);       
            return null; 
        } 
    } 
  // ===== OBSERVAR CAMBIOS DE AUTENTICACIÓN =====   
    onAuthStateChanged(callback: (user: User | null) => void): () => void { 
    // Retorna función de desuscripción     
        return firebaseOnAuthStateChanged(auth, (firebaseUser) => {       
            if (firebaseUser) {         
                //  Obtener usuario completo de Firebase 
                const user = this.mapFirebaseUserToUser(firebaseUser);
                // Guardar perfil en AsyncStorage cuando cambia el estado 
                this.saveUserProfileToStorage(user).catch(err => 
                    console.error("Error guardando perfil en AsyncStorage en onAuthStateChanged:", err)
                );
                callback(user);
            } else {         
                //  Eliminar perfil de AsyncStorage cuando no hay usuario 
                this.removeUserProfileFromStorage().catch(err => 
                    console.error("Error eliminando perfil de AsyncStorage en onAuthStateChanged:", err)
                );
                callback(null); 
            } 
        }); 
    } 

    // Método para cargar el perfil desde AsyncStorage 
    async loadCachedUserProfile(): Promise<User | null> {
        return this.loadUserProfileFromStorage();
    }

    async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
    }
} 