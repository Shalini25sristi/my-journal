import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loadProfile, updateProfile, changePassword } from '../api/client';
import ThemeModal from './ThemeModal';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTheme, setShowTheme] = useState(false);

  const [form, setForm] = useState({ username: '', gender: '', age: '', dateOfBirth: '', profession: '', location: '', bio: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => {
    (async () => {
      const result = await loadProfile();
      if (result.success && result.user) {
        const u = result.user;
        setProfile(u);
        setForm({
          username: u.username || '',
          gender: u.gender || '',
          age: u.age ? String(u.age) : '',
          dateOfBirth: u.dateOfBirth || '',
          profession: u.profession || '',
          location: u.location || '',
          bio: u.bio || '',
        });
      }
      setLoading(false);
    })();
  }, []);

  const saveProfile = async () => {
    const result = await updateProfile({
      username: form.username,
      gender: form.gender,
      age: form.age ? parseInt(form.age, 10) : null,
      dateOfBirth: form.dateOfBirth,
      profession: form.profession,
      location: form.location,
      bio: form.bio,
    });
    setMsg(result.message || (result.success ? 'Profile updated!' : 'Failed to update.'));
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwMsg('Please fill in all fields.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg('Password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg('Passwords do not match.');
      return;
    }
    const result = await changePassword({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
      confirmPassword: pwForm.confirmPassword,
    });
    setPwMsg(result.message || (result.success ? 'Password changed!' : 'Failed to change.'));
    if (result.success) {
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const s = makeStyles(theme);

  if (loading) {
    return (
      <View style={[s.container, { backgroundColor: theme.bg[0], justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent1} />
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: theme.bg[0] }]}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.themeBtn} onPress={() => setShowTheme(true)}>
          <Text style={s.themeBtnText}>🎨</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {profile ? profile.username?.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={s.name}>{profile?.username || user}</Text>
          <Text style={s.email}>{profile?.email || ''}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Personal Details</Text>
          <View style={s.grid}>
            {[
              { key: 'username', label: 'Username' },
              { key: 'gender', label: 'Gender' },
              { key: 'age', label: 'Age', keyboard: 'numeric' },
              { key: 'dateOfBirth', label: 'Date of Birth' },
              { key: 'profession', label: 'Profession' },
              { key: 'location', label: 'Location' },
            ].map(field => (
              <View key={field.key} style={s.inputGroup}>
                <Text style={s.label}>{field.label}</Text>
                <TextInput
                  style={s.input}
                  value={form[field.key]}
                  onChangeText={(t) => setForm({ ...form, [field.key]: t })}
                  placeholder={`Your ${field.label.toLowerCase()}`}
                  placeholderTextColor={theme.placeholder}
                  keyboardType={field.keyboard || 'default'}
                />
              </View>
            ))}
            <View style={[s.inputGroup, { gridColumn: '1 / -1' }]}>
              <Text style={s.label}>Bio</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={form.bio}
                onChangeText={(t) => setForm({ ...form, bio: t })}
                placeholder="Tell us about yourself"
                placeholderTextColor={theme.placeholder}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
          {msg ? <Text style={[s.msg, msg.includes('Failed') ? s.error : s.success]}>{msg}</Text> : null}
          <TouchableOpacity style={s.saveBtn} onPress={saveProfile}>
            <Text style={s.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Change Password</Text>
          {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
            <View key={field} style={s.inputGroup}>
              <Text style={s.label}>
                {field === 'currentPassword' ? 'Current Password' :
                 field === 'newPassword' ? 'New Password' : 'Confirm Password'}
              </Text>
              <TextInput
                style={s.input}
                value={pwForm[field]}
                onChangeText={(t) => setPwForm({ ...pwForm, [field]: t })}
                placeholder="••••••••"
                placeholderTextColor={theme.placeholder}
                secureTextEntry
              />
            </View>
          ))}
          {pwMsg ? <Text style={[s.msg, pwMsg.includes('Failed') ? s.error : s.success]}>{pwMsg}</Text> : null}
          <TouchableOpacity style={s.saveBtn} onPress={handleChangePassword}>
            <Text style={s.saveBtnText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <ThemeModal visible={showTheme} onClose={() => setShowTheme(false)} />
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20, paddingBottom: 40 },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    backBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 50,
      backgroundColor: theme.surface,
    },
    backText: { fontWeight: '700', color: theme.text, fontSize: 14 },
    themeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeBtnText: { fontSize: 18 },
    header: { alignItems: 'center', marginBottom: 24 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.accent1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
    name: { fontSize: 22, fontWeight: '800', color: theme.text, marginBottom: 4 },
    email: { fontSize: 14, color: theme.textLight, fontWeight: '600' },
    card: {
      padding: 24,
      borderRadius: 28,
      backgroundColor: theme.surface,
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 20,
    },
    grid: { gap: 16 },
    inputGroup: { gap: 6 },
    label: { fontSize: 13, fontWeight: '700', color: theme.text, paddingLeft: 4 },
    input: {
      borderWidth: 2,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 14,
      fontSize: 15,
      color: theme.text,
      backgroundColor: theme.inputBg,
    },
    textArea: { minHeight: 80 },
    msg: { fontSize: 13, fontWeight: '700', marginTop: 10, textAlign: 'center' },
    error: { color: theme.error },
    success: { color: theme.success },
    saveBtn: {
      paddingVertical: 12,
      borderRadius: 50,
      backgroundColor: theme.accent1,
      alignItems: 'center',
      marginTop: 16,
    },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
    logoutBtn: {
      paddingVertical: 14,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: theme.rose,
      alignItems: 'center',
      marginTop: 8,
    },
    logoutBtnText: { color: theme.rose, fontWeight: '800', fontSize: 15 },
  });
}
