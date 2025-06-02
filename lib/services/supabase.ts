import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Create storage adapter based on platform
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        return AsyncStorage.getItem(key);
      },
      setItem: (key: string, value: string) => {
        return AsyncStorage.setItem(key, value);
      },
      removeItem: (key: string) => {
        return AsyncStorage.removeItem(key);
      },
    };
  }

  return {
    getItem: (key: string) => {
      return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
      return SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
      return SecureStore.deleteItemAsync(key);
    },
  };
};

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 