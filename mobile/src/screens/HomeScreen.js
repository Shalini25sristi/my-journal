import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  TextInput, Alert, RefreshControl, Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { loadPages, createPage, updatePage, deletePage, loadTrackerData } from '../api/client';
import { getPageIcon, calculateCurrentStreak, MAX_PAGES, CARD_COLORS } from '../components/helpers';
import ThemeModal from './ThemeModal';

const COLOR_MAP = {
  pink: { border: '#ff9ebb', bg: 'rgba(255,200,221,0.3)' },
  peach: { border: '#ffb8a0', bg: 'rgba(255,218,185,0.3)' },
  lemon: { border: '#f3e078', bg: 'rgba(255,245,186,0.3)' },
  lavender: { border: '#c49dfc', bg: 'rgba(224,195,252,0.3)' },
  mint: { border: '#9ef58e', bg: 'rgba(202,255,191,0.3)' },
  rose: { border: '#ff8282', bg: 'rgba(255,173,173,0.3)' },
  sky: { border: '#78aaff', bg: 'rgba(160,196,255,0.3)' },
  dream: { border: '#9b8aff', bg: 'rgba(189,178,255,0.3)' },
};

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [pages, setPages] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageName, setPageName] = useState('');
  const [pageMsg, setPageMsg] = useState('');

  const loadAll = useCallback(async () => {
    const result = await loadPages(true);
    if (result.pages) {
      setPages(result.pages);
      const s = {};
      const year = new Date().getFullYear();
      for (const p of result.pages) {
        const data = await loadTrackerData(p.id, year);
        const { streak } = calculateCurrentStreak(data);
        if (streak > 0) s[p.id] = streak;
      }
      setStreaks(s);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleCreatePage = async () => {
    if (!pageName.trim()) {
      setPageMsg('Please enter a page name.');
      return;
    }
    const result = await createPage(pageName.trim());
    if (result.success) {
      setShowPageModal(false);
      setPageName('');
      setPageMsg('');
      await loadAll();
    } else {
      setPageMsg(result.message || 'Failed to create page.');
    }
  };

  const handleRenamePage = async () => {
    if (!pageName.trim()) {
      setPageMsg('Please enter a page name.');
      return;
    }
    const result = await updatePage(editingPage.id, pageName.trim());
    if (result.success) {
      setShowPageModal(false);
      setEditingPage(null);
      setPageName('');
      setPageMsg('');
      await loadAll();
    } else {
      setPageMsg(result.message || 'Failed to rename page.');
    }
  };

  const handleDeletePage = (page) => {
    Alert.alert('Delete Page', `Delete "${page.name}"? This will also remove all its tracked data.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deletePage(page.id);
          if (result.success) {
            await loadAll();
          } else {
            Alert.alert('Error', result.message || 'Failed to delete page.');
          }
        },
      },
    ]);
  };

  const openCreateModal = () => {
    setEditingPage(null);
    setPageName('');
    setPageMsg('');
    setShowPageModal(true);
  };

  const openRenameModal = (page) => {
    setEditingPage(page);
    setPageName(page.name);
    setPageMsg('');
    setShowPageModal(true);
  };

  const bgGradient = { backgroundColor: theme.bg[0] };
  const s = makeStyles(theme);

  return (
    <View style={[s.container, bgGradient]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent1} />}
      >
        <View style={s.topBar}>
          <View style={s.topBarRight}>
            <TouchableOpacity style={s.topBtn} onPress={() => setShowTheme(true)}>
              <Text style={s.topBtnText}>🎨</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.topBtn} onPress={() => navigation.navigate('Analysis')}>
              <Text style={s.topBtnText}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.topBtn} onPress={() => navigation.navigate('VisionBoard')}>
              <Text style={s.topBtnText}>🎯</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.avatarBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={s.avatarText}>
                {user ? user.charAt(0).toUpperCase() : '?'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.header}>
          <Text style={s.title}>My Journal</Text>
          <Text style={s.subtitle}>Your cozy tracking space</Text>
        </View>

        <View style={s.editBar}>
          <TouchableOpacity style={s.addBtn} onPress={openCreateModal}>
            <Text style={s.addBtnText}>+ New Page</Text>
          </TouchableOpacity>
          <Text style={s.pageCount}>{pages.length}/{MAX_PAGES} pages</Text>
        </View>

        <View style={s.grid}>
          {pages.map((page, index) => {
            const colorKey = CARD_COLORS[index % CARD_COLORS.length];
            const colors = COLOR_MAP[colorKey];
            const streak = streaks[page.id];
            return (
              <TouchableOpacity
                key={page.id}
                style={[s.card, { borderTopColor: colors.border, backgroundColor: colors.bg }]}
                onPress={() => navigation.navigate('Tracker', { pageId: page.id })}
                onLongPress={() => {
                  Alert.alert(page.name, '', [
                    { text: 'Rename', onPress: () => openRenameModal(page) },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDeletePage(page) },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                {streak ? (
                  <View style={s.streakBadge}>
                    <Text style={s.streakText}>🔥 {streak}</Text>
                  </View>
                ) : null}
                <Text style={s.cardIcon}>{getPageIcon(page)}</Text>
                <Text style={s.cardTitle}>{page.name}</Text>
                <Text style={s.cardDesc}>
                  {(page.options || []).length} option{(page.options || []).length !== 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[s.card, { borderTopColor: theme.dreamDark, backgroundColor: 'rgba(189,178,255,0.2)' }]}
            onPress={() => navigation.navigate('DailyHighlights')}
          >
            <Text style={s.cardIcon}>🌈</Text>
            <Text style={s.cardTitle}>Daily Highlights</Text>
            <Text style={s.cardDesc}>Jot down a few lines</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ThemeModal visible={showTheme} onClose={() => setShowTheme(false)} />

      <Modal visible={showPageModal} transparent animationType="fade" onRequestClose={() => setShowPageModal(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{editingPage ? 'Rename Page' : 'Create New Page'}</Text>
            <TextInput
              style={s.modalInput}
              value={pageName}
              onChangeText={setPageName}
              placeholder="Page name"
              placeholderTextColor={theme.placeholder}
              autoFocus
            />
            {pageMsg ? <Text style={s.modalMsg}>{pageMsg}</Text> : null}
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnSecondary]}
                onPress={() => { setShowPageModal(false); setPageMsg(''); }}
              >
                <Text style={s.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.modalBtnPrimary]}
                onPress={editingPage ? handleRenamePage : handleCreatePage}
              >
                <Text style={s.modalBtnPrimaryText}>{editingPage ? 'Rename' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: 20, paddingBottom: 40 },
    topBar: { alignItems: 'flex-end', marginBottom: 12 },
    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    topBtn: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: theme.surfaceSoft,
    },
    topBtnText: { fontSize: 18 },
    avatarBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.accent1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    header: { alignItems: 'center', marginBottom: 16 },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textLight,
      fontWeight: '600',
      marginTop: 4,
    },
    editBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: theme.surface,
      borderRadius: 50,
    },
    addBtn: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 50,
      backgroundColor: theme.accent3,
    },
    addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    pageCount: { color: theme.textLight, fontWeight: '700', fontSize: 13 },
    grid: { gap: 14 },
    card: {
      borderRadius: 24,
      padding: 20,
      borderTopWidth: 5,
      alignItems: 'center',
    },
    streakBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: theme.accent1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 50,
    },
    streakText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    cardIcon: { fontSize: 28, marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 4 },
    cardDesc: { fontSize: 13, color: theme.textLight, fontWeight: '600' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.modalBackdrop,
      justifyContent: 'center',
      padding: 20,
    },
    modalCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 16 },
    modalInput: {
      borderWidth: 2,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 14,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.inputBg,
    },
    modalMsg: { color: theme.error, fontSize: 13, fontWeight: '700', marginTop: 8 },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 20,
    },
    modalBtn: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 50,
    },
    modalBtnPrimary: { backgroundColor: theme.accent1 },
    modalBtnPrimaryText: { color: '#fff', fontWeight: '800' },
    modalBtnSecondary: { backgroundColor: theme.surfaceSoft },
    modalBtnSecondaryText: { color: theme.text, fontWeight: '800' },
  });
}
