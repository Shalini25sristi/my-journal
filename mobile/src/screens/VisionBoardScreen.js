import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getOrCreateVisionBoard, updateVisionBoardTitle, addVisionBoardItem, deleteVisionBoardItem } from '../api/client';
import { MONTH_NAMES } from '../components/helpers';
import * as ImagePicker from 'expo-image-picker';

const TIMEFRAMES = ['monthly', 'quarterly', 'halfyearly', 'yearly', '5year', '10year'];
const MAX_ITEMS = 80;

function generateTargets(timeframe) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const targets = [];

  if (timeframe === 'monthly') {
    for (let i = 0; i <= 35; i++) {
      const d = new Date(year, month + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      targets.push({ value, label });
    }
  } else if (timeframe === 'quarterly') {
    for (let i = 0; i <= 19; i++) {
      const qm = month + (i * 3);
      const d = new Date(year, qm, 1);
      const q = Math.floor(d.getMonth() / 3) + 1;
      targets.push({ value: `${d.getFullYear()}-Q${q}`, label: `Q${q} ${d.getFullYear()}` });
    }
  } else if (timeframe === 'halfyearly') {
    for (let i = 0; i <= 15; i++) {
      const hm = month + (i * 6);
      const d = new Date(year, hm, 1);
      const h = Math.floor(d.getMonth() / 6) + 1;
      targets.push({ value: `${d.getFullYear()}-H${h}`, label: `H${h} ${d.getFullYear()}` });
    }
  } else if (timeframe === 'yearly') {
    for (let i = 0; i <= 14; i++) {
      targets.push({ value: String(year + i), label: String(year + i) });
    }
  } else if (timeframe === '5year') {
    const cs = Math.floor(year / 5) * 5;
    for (let i = 0; i <= 9; i++) {
      const start = cs + (i * 5);
      targets.push({ value: `${start}-${start + 4}`, label: `${start}-${start + 4}` });
    }
  } else if (timeframe === '10year') {
    const cs = Math.floor(year / 10) * 10;
    for (let i = 0; i <= 9; i++) {
      const start = cs + (i * 10);
      targets.push({ value: `${start}-${start + 9}`, label: `${start}-${start + 9}` });
    }
  }
  return targets;
}

export default function VisionBoardScreen({ navigation }) {
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('monthly');
  const [target, setTarget] = useState('');
  const [board, setBoard] = useState(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [textMsg, setTextMsg] = useState('');

  const targets = generateTargets(timeframe);

  useEffect(() => {
    if (targets.length > 0 && !target) {
      setTarget(targets[0].value);
    }
  }, [timeframe]);

  const loadBoard = useCallback(async () => {
    if (!target) return;
    setLoading(true);
    const result = await getOrCreateVisionBoard(timeframe, target);
    if (result.success) {
      setBoard(result.board);
      setBoardTitle(result.board.title || '');
      setItems(result.board.items || []);
    }
    setLoading(false);
  }, [timeframe, target]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const saveTitle = async () => {
    if (!board) return;
    await updateVisionBoardTitle(board.id, boardTitle);
  };

  const addText = async () => {
    if (!textContent.trim()) {
      setTextMsg('Please enter some text.');
      return;
    }
    if (!board) return;
    const result = await addVisionBoardItem(board.id, 'text', textContent.trim());
    if (result.success) {
      setShowTextModal(false);
      setTextContent('');
      setTextMsg('');
      await loadBoard();
    } else {
      setTextMsg(result.message || 'Failed to add item.');
    }
  };

  const addImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera roll permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      maxFileSize: 5 * 1024 * 1024,
    });
    if (result.canceled || !board) return;
    const asset = result.assets[0];
    const base64 = asset.base64;
    if (!base64) {
      Alert.alert('Error', 'Could not read image.');
      return;
    }
    const dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${base64}`;
    const res = await addVisionBoardItem(board.id, 'image', dataUri);
    if (res.success) {
      await loadBoard();
    } else {
      Alert.alert('Error', res.message || 'Failed to add image.');
    }
  };

  const deleteItem = (itemId) => {
    Alert.alert('Remove Item', 'Remove this item from the board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteVisionBoardItem(itemId);
          await loadBoard();
        },
      },
    ]);
  };

  const s = makeStyles(theme);

  return (
    <View style={[s.container, { backgroundColor: theme.bg[0] }]}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>Vision Board</Text>
          <Text style={s.subtitle}>Visualize your goals</Text>
        </View>

        <View style={s.controls}>
          <View style={s.controlGroup}>
            <Text style={s.controlLabel}>Timeframe</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
              {TIMEFRAMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[s.chip, timeframe === t && s.chipActive]}
                  onPress={() => { setTimeframe(t); setTarget(''); }}
                >
                  <Text style={[s.chipText, timeframe === t && s.chipTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.controlGroup}>
            <Text style={s.controlLabel}>Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
              {targets.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[s.chip, target === t.value && s.chipActive]}
                  onPress={() => setTarget(t.value)}
                >
                  <Text style={[s.chipText, target === t.value && s.chipTextActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.accent1} style={{ marginTop: 40 }} />
        ) : board ? (
          <View style={s.boardSection}>
            <View style={s.titleRow}>
              <TextInput
                style={s.boardTitleInput}
                value={boardTitle}
                onChangeText={setBoardTitle}
                placeholder="Board Title"
                placeholderTextColor={theme.textLight}
                onBlur={saveTitle}
              />
              <Text style={s.itemCount}>{items.length}/{MAX_ITEMS}</Text>
            </View>

            <View style={s.actionRow}>
              <TouchableOpacity
                style={[s.actionBtn, items.length >= MAX_ITEMS && { opacity: 0.5 }]}
                onPress={() => setShowTextModal(true)}
                disabled={items.length >= MAX_ITEMS}
              >
                <Text style={s.actionBtnText}>+ Text</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnSecondary, items.length >= MAX_ITEMS && { opacity: 0.5 }]}
                onPress={addImage}
                disabled={items.length >= MAX_ITEMS}
              >
                <Text style={s.actionBtnText}>+ Image</Text>
              </TouchableOpacity>
            </View>

            <View style={s.boardGrid}>
              {items.map((item, i) => (
                <TouchableOpacity
                  key={item.id || i}
                  style={s.boardItem}
                  onLongPress={() => deleteItem(item.id)}
                >
                  {item.itemType === 'image' ? (
                    <Image source={{ uri: item.content }} style={s.boardImage} />
                  ) : (
                    <Text style={s.boardText} numberOfLines={4}>{item.content}</Text>
                  )}
                </TouchableOpacity>
              ))}
              {items.length === 0 && (
                <View style={s.emptyBoard}>
                  <Text style={s.emptyText}>Your vision board is empty. Add text or images!</Text>
                </View>
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={showTextModal} transparent animationType="fade" onRequestClose={() => setShowTextModal(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Add Text</Text>
            <TextInput
              style={s.modalTextInput}
              value={textContent}
              onChangeText={setTextContent}
              placeholder="Enter your affirmation or goal..."
              placeholderTextColor={theme.placeholder}
              multiline
              textAlignVertical="top"
            />
            {textMsg ? <Text style={s.modalMsg}>{textMsg}</Text> : null}
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnSecondary]} onPress={() => { setShowTextModal(false); setTextMsg(''); }}>
                <Text style={s.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnPrimary]} onPress={addText}>
                <Text style={s.modalBtnPrimaryText}>Add</Text>
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
    topBar: {
      flexDirection: 'row',
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
    header: { alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: theme.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.textLight, fontWeight: '600' },
    controls: { gap: 12, marginBottom: 20 },
    controlGroup: { gap: 6 },
    controlLabel: { fontSize: 12, fontWeight: '700', color: theme.textLight, paddingLeft: 4 },
    chips: { flexDirection: 'row', gap: 8 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 50,
      backgroundColor: theme.surfaceSoft,
      marginRight: 8,
    },
    chipActive: { backgroundColor: theme.lavenderDark },
    chipText: { fontSize: 13, fontWeight: '700', color: theme.text },
    chipTextActive: { color: '#fff' },
    boardSection: { gap: 12 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    boardTitleInput: {
      borderWidth: 2,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 12,
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      backgroundColor: theme.inputBg,
      textAlign: 'center',
      minWidth: 200,
      flex: 1,
    },
    itemCount: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.textLight,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 50,
      backgroundColor: theme.surfaceSoft,
    },
    actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
    actionBtn: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 50,
      backgroundColor: theme.accent1,
    },
    actionBtnSecondary: { backgroundColor: theme.accent2 },
    actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    boardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      padding: 12,
      borderRadius: 24,
      backgroundColor: theme.surface,
      minHeight: 300,
    },
    boardItem: {
      width: '30%',
      aspectRatio: 1,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.surfaceHover,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 8,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    boardImage: { width: '100%', height: '100%', borderRadius: 12 },
    boardText: { fontSize: 11, fontWeight: '700', color: theme.text, textAlign: 'center' },
    emptyBoard: {
      width: '100%',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: { fontSize: 14, color: theme.textLight, fontWeight: '700', textAlign: 'center' },
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
    modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 12 },
    modalTextInput: {
      borderWidth: 2,
      borderColor: theme.inputBorder,
      borderRadius: 16,
      padding: 14,
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.inputBg,
      minHeight: 100,
    },
    modalMsg: { color: theme.error, fontSize: 12, fontWeight: '700', marginTop: 6 },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 16,
    },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 50 },
    modalBtnPrimary: { backgroundColor: theme.accent1 },
    modalBtnPrimaryText: { color: '#fff', fontWeight: '800' },
    modalBtnSecondary: { backgroundColor: theme.surfaceSoft },
    modalBtnSecondaryText: { color: theme.text, fontWeight: '800' },
  });
}
