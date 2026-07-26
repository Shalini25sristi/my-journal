import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeModal({ visible, onClose }) {
  const { theme, themeMeta, themeId, isNight, setTheme, toggleMode, THEMES } = useTheme();
  const s = makeStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.title}>Choose Theme</Text>
          <ScrollView style={s.scrollArea}>
            <View style={s.grid}>
              {THEMES.map((t) => {
                const active = t.id === themeId;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[s.option, active && s.optionActive]}
                    onPress={() => setTheme(t.id)}
                  >
                    <View style={[s.preview, {
                      backgroundColor: t.preview[0],
                    }]}>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {t.preview.map((c, i) => (
                          <View key={i} style={{ flex: 1, height: 48, backgroundColor: c, borderRadius: 8 }} />
                        ))}
                      </View>
                    </View>
                    <Text style={[s.optionName, active && s.optionNameActive]}>
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={s.actions}>
            <TouchableOpacity style={s.toggleBtn} onPress={toggleMode}>
              <Text style={s.toggleText}>{isNight ? '☀️ Day Mode' : '🌙 Night Mode'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.modalBackdrop,
      justifyContent: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      padding: 24,
      maxHeight: '80%',
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    scrollArea: { maxHeight: 400 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    option: {
      width: '47%',
      borderRadius: 20,
      padding: 12,
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionActive: {
      borderColor: theme.lavenderDark,
    },
    preview: {
      height: 56,
      borderRadius: 14,
      marginBottom: 8,
      overflow: 'hidden',
      justifyContent: 'center',
      padding: 4,
    },
    optionName: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },
    optionNameActive: {
      color: theme.lavenderDark,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.inputBorder,
    },
    toggleBtn: {
      padding: 12,
      borderRadius: 50,
      backgroundColor: theme.surfaceSoft,
    },
    toggleText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
    },
    closeBtn: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 50,
      backgroundColor: theme.accent1,
    },
    closeText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: 15,
    },
  });
}
