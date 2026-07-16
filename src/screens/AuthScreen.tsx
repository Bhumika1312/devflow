import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await client.post(endpoint, payload);
      await login(res.data.user, res.data.token);
    } catch (err: any) {
  console.log('FULL ERROR:', JSON.stringify(err.response?.data));
  console.log('STATUS:', err.response?.status);
  console.log('MESSAGE:', err.message);
      Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>DevFlow</Text>
      <Text style={styles.tagline}>Your developer productivity companion</Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggle}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f0f0f',
    justifyContent: 'center', padding: 24,
  },
  logo: {
    fontSize: 36, fontWeight: 'bold',
    color: '#6366f1', textAlign: 'center', marginBottom: 8,
  },
  tagline: {
    color: '#666', textAlign: 'center',
    marginBottom: 40, fontSize: 14,
  },
  input: {
    backgroundColor: '#1a1a1a', color: '#fff',
    borderRadius: 12, padding: 16,
    marginBottom: 16, fontSize: 15,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#6366f1', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  toggle: {
    color: '#6366f1', textAlign: 'center',
    marginTop: 20, fontSize: 14,
  },
});