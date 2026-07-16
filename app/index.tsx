import { AuthProvider, useAuth } from '../src/context/AuthContext';
import AuthScreen from '../src/screens/AuthScreen';
import AppNavigator from '../src/navigation/AppNavigator';
import { View, ActivityIndicator } from 'react-native';

function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0f0f0f' }}>
      <ActivityIndicator color="#6366f1" size="large" />
    </View>
  );

  return user ? <AppNavigator /> : <AuthScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}