import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our app state
interface AppState {
  user: {
    isLoggedIn: boolean;
    hasQuartzAccount: boolean;
    userId?: string;
    cardProviderId?: string;
    // Add other user properties as needed
  };
  // Add other state categories as needed
}

// Define the context type
interface AppStateContextType {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  updateUserState: (userState: Partial<AppState['user']>) => void;
  clearState: () => void;
}

// Default state
const defaultState: AppState = {
  user: {
    isLoggedIn: false,
    hasQuartzAccount: false,
    userId: undefined,
    cardProviderId: undefined,
  },
};

// Create the context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'quartz_app_state';

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setStateInternal] = useState<AppState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedState) {
          setStateInternal(JSON.parse(storedState));
        }
      } catch (error) {
        console.error('Failed to load state from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        .catch(error => console.error('Failed to save state to storage:', error));
    }
  }, [state, isLoading]);

  // Update the entire state or parts of it
  const updateState = (newState: Partial<AppState>) => {
    setStateInternal(prevState => ({
      ...prevState,
      ...newState,
    }));
  };

  // Update just the user portion of the state
  const updateUserState = (userState: Partial<AppState['user']>) => {
    setStateInternal(prevState => ({
      ...prevState,
      user: {
        ...prevState.user,
        ...userState,
      },
    }));
  };

  // Clear the state (for logout, etc.)
  const clearState = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setStateInternal(defaultState);
    } catch (error) {
      console.error('Failed to clear state from storage:', error);
    }
  };

  if (isLoading) {
    // You could return a loading component here if needed
    return null;
  }

  return (
    <AppStateContext.Provider value={{ state, updateState, updateUserState, clearState }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use the app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

