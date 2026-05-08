import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

import { ToastProvider } from './src/context/ToastContext';
import { NotificationProvider } from './src/context/NotificationContext';

const AppContainer = () => {
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        const roleStr = await AsyncStorage.getItem('role');
        
        let user = userStr ? JSON.parse(userStr) : null;
        let role = null;
        if (roleStr) {
          try {
            role = roleStr.startsWith('{') ? JSON.parse(roleStr) : roleStr;
          } catch (e) {
            role = roleStr;
          }
        }

        store.dispatch({
          type: 'RESTORE_AUTH',
          token: token,
          userId: user ? user.id : null,
          fullName: user ? user.fullName : null,
          email: user ? user.email : null,
          role: role
        });
      } catch (e) {
        // Restoring token failed
        store.dispatch({ type: 'RESTORE_AUTH' });
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NotificationProvider>
          <AppNavigator />
        </NotificationProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContainer />
    </Provider>
  );
}
