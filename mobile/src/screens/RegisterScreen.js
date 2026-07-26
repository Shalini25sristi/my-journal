import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { registerUser } from '../api/client';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setMessage('Please fill in all fields.');
      setMsgType('error');
      return;
    }
    if (username.length < 3) {
      setMessage('Username must be at least 3 characters.');
      setMsgType('error');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setMsgType('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMsgType('error');
      return;
    }

    const result = await registerUser(username, email.toLowerCase(), password, confirmPassword);
    if (result.success) {
      setMessage('Account created! Redirecting...');
      setMsgType('success');
      setTimeout(() => navigation.navigate('Login'), 800);
    } else {
      setMessage(result.message || 'Registration failed.');
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
            <Text style={s.title}>Join My Journal</Text>
            <Text style={s.subtitle}>Start your journey 🌟</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputGroup}>
              <Text style={s.label}>Username</Text>
              <TextInput
                style={s.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                placeholderTextColor={theme.placeholder}
                autoCapitalize="none"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email address"
                placeholderTextColor={theme.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Password</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={theme.placeholder}
                secureTextEntry
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>Confirm Password</Text>
              <TextInput
                style={s.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                placeholderTextColor={theme.placeholder}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={s.button} onPress={handleRegister}>
              <Text style={s.buttonText}>Create Account</Text>
            </TouchableOpacity>

            {message ? (
              <Text style={[s.message, msgType === 'error' ? s.error : s.success]}>
                {message}
              </Text>
            ) : null}
          </View>

          <View style={s.authSwitch}>
            <Text style={s.hintText}>Already have an account?</Text>
            <TouchableOpacity
              style={s.switchBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={s.switchBtnText}>Log In</Text>
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
