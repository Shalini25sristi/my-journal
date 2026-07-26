import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loginUser } from '../api/client';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      setMsgType('error');
      return;
    }
    const result = await loginUser(username, password);
    if (result.success) {
      await login(result.user.username, result.token);
    } else {
      setMessage(result.message || 'Login failed.');
      setMsgType('error');
    }
  };

  const bgGradient = { backgroundColor: theme.bg[0] };
  const s = makeStyles(theme);

  return (
    <KeyboardAvoidingView
      style={[s.container, bgGradient]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>My Journal</Text>
            <Text style={s.subtitle}>Welcome back ✨</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputGroup}>
              <Text style={s.label}>Username</Text>
              <TextInput
                style={s.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                placeholderTextColor={theme.placeholder}
                autoCapitalize="none"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.placeholder}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={s.button} onPress={handleLogin}>
              <Text style={s.buttonText}>Log In</Text>
            </TouchableOpacity>

            {message ? (
              <Text style={[s.message, msgType === 'error' ? s.error : s.success]}>
                {message}
              </Text>
            ) : null}
          </View>

          <View style={s.authSwitch}>
            <Text style={s.hintText}>Don't have an account?</Text>
            <TouchableOpacity
              style={s.switchBtn}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.switchBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 32,
      padding: 36,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 10,
    },
    header: { alignItems: 'center', marginBottom: 32 },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: { fontSize: 16, color: theme.textLight, fontWeight: '600' },
    form: { gap: 18 },
    inputGroup: { gap: 6 },
    label: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      paddingLeft: 6,
    },
    input: {
      borderWidth: 2,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 14,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.inputBg,
    },
    button: {
      backgroundColor: theme.accent1,
      paddingVertical: 14,
      borderRadius: 50,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
    message: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '700',
      marginTop: 16,
    },
    error: { color: theme.error },
    success: { color: theme.success },
    authSwitch: { alignItems: 'center', marginTop: 24, gap: 10 },
    hintText: { fontSize: 14, color: theme.textLight, fontWeight: '600' },
    switchBtn: {
      backgroundColor: theme.accent3,
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 50,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 6,
    },
    switchBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  });
}
