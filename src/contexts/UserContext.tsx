import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/database.types';
import { supabase } from '../lib/supabase';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (userId: string, initialer?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('disc_golf_user_id');
    if (storedUserId) {
      loadUser(storedUserId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('disc_golf_user_id');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userId: string, initialer?: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingUser) {
        setUser(existingUser);
        localStorage.setItem('disc_golf_user_id', userId);
      } else {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({ user_id: userId, initialer: initialer || null })
          .select()
          .single();

        if (error) throw error;
        setUser(newUser);
        localStorage.setItem('disc_golf_user_id', userId);
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('disc_golf_user_id');
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
