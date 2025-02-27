import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { mercadolibre } from '../lib/mercadolibre';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          await fetchUser(session.user.id);
        } else if (mounted) {
          setUser(null);
          setIsLoading(false);
          mercadolibre.clearConnectionStatus();
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await fetchUser(session.user.id);
          } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            setUser(null);
            setIsLoading(false);
            mercadolibre.clearConnectionStatus();
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
          setUser(null);
          setIsLoading(false);
          mercadolibre.clearConnectionStatus();
        }
      }
    };

    initAuth();
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser?.user) {
        throw new Error('No authenticated user found');
      }

      // Get user data
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist, create one
          if (authUser.user.user_metadata?.role) {
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .upsert({
                id: userId,
                email: authUser.user.email,
                role: authUser.user.user_metadata.role,
              })
              .select()
              .single();

            if (insertError) {
              throw insertError;
            }

            if (newUser) {
              setUser(newUser);
              setIsLoading(false);
              return;
            }
          }
        }
        throw error;
      }

      setUser(data);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      setError(error.message || 'Failed to fetch user data');
      // Clean up on error
      await supabase.auth.signOut();
      setUser(null);
      mercadolibre.clearConnectionStatus();
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, error };
}
