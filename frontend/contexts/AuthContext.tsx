// frontend/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { utilisateurService, Utilisateur } from '../services/utilisateurService';

interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;
  isConnecte: boolean;
  isLoading: boolean;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUtilisateur: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  useEffect(() => {
    loadUtilisateur();
  }, []);

  const loadUtilisateur = async () => {
    try {
      const user = await utilisateurService.getUtilisateurConnecte();
      const savedToken = await utilisateurService.getToken();
      setUtilisateur(user);
      setToken(savedToken);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await utilisateurService.connexion({ email, mot_de_passe: password });
      
      // ✅ Si on arrive ici, la connexion a réussi
      if (response.utilisateur && response.token) {
        setUtilisateur(response.utilisateur);
        setToken(response.token);
      } else {
        throw new Error('Erreur inattendue lors de la connexion');
      }
    } catch (error: any) {
      // 🔥 RELANCER l'erreur pour qu'elle soit capturée dans se-connecter.tsx
      throw error;
    }
  };

  const logout = async () => {
    await utilisateurService.deconnexion();
    setUtilisateur(null);
    setToken(null);
    setRedirectAfterLogin(null);
  };

  const refreshUtilisateur = async () => {
    await loadUtilisateur();
  };

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        token,
        isConnecte: !!utilisateur && !!token,
        isLoading,
        redirectAfterLogin,
        setRedirectAfterLogin,
        login,
        logout,
        refreshUtilisateur,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}