/**
 * Context d'authentification
 * 
 * Rôle :
 * - Gérer l'état de connexion de l'utilisateur
 * - Sauvegarder la route de redirection après login
 * - Fournir les infos utilisateur à toute l'application
 * 
 * Utilisé par : Toute l'application via useAuth()
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { utilisateurService, Utilisateur } from '../services/utilisateurService';

interface AuthContextType {
  utilisateur: Utilisateur | null;
  token: string | null;  // ✅ Ajout du token
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

  // Charger l'utilisateur au démarrage de l'app
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
  const response = await utilisateurService.connexion({ email, mot_de_passe: password });
  setUtilisateur(response.utilisateur);
  if (response.token) {
    setToken(response.token);
  }
};

const logout = async () => {
  await utilisateurService.deconnexion();
  setUtilisateur(null);
  setToken(null);  // ✅ Reset du token
  setRedirectAfterLogin(null);
};

  const refreshUtilisateur = async () => {
    await loadUtilisateur();
  };

  return (
    <AuthContext.Provider
    value={{
    utilisateur,
    token,  // ✅ Ajout du token
    isConnecte: !!utilisateur && !!token,  // ✅ Vérifier token aussi
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

// Hook personnalisé pour utiliser le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}