import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loadPages, loadTrackerData, saveTrackerData, loadPageOptions, savePageOptions } from '../api/client';
import { MONTH_NAMES, WEEKDAY_SHORT, isFutureDate, calculateCurrentStreak, MAX_OPTIONS } from '../components/helpers';

export default function TrackerScreen({ route, navigation }) {
  const { pageId } = route.params;
  const { theme } = useTheme();
  const [page, setPage] = useState(null);
  const [options, setOptions] = useState([]);
  const [data, setData] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [streakData, setStreakData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [editOptions, setEditOptions] = useState([]);
  const [optMsg, setOptMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const pagesResult = await loadPages(true);
    const p = (pagesResult.pages || []).find(x => x.id === pageId);
    setPage(p || null);
    const opts = (p && p.options) || [];
    setOptions(opts);
    const currentYear = new Date().getFullYear();
    const [d, sd] = await Promise.all([
      loadTrackerData(pageId, year),
      loadTrackerData(pageId, currentYear),
    ]);
    setData(d);
    setStreakData(sd);
    setLoading(false);
  }, [pageId, year]);

  useEffect(() => { load(); }, [load]);

  const cycleOption = async (dateKey) => {
    if (isFutureDate(dateKey)) return;
    const currentValue = data[dateKey];
    const currentIdx = options.findIndex(o => String(o.value) === String(currentValue));
    const nextIdx = currentIdx >= options.length - 1 ? -1 : currentIdx + 1;
    const newValue = nextIdx >= 0 ? options[nextIdx].value : null;
    const newData = { ...data, [dateKey]: newValue };
    if (newValue === null || newValue === undefined || newValue === '') {
      delete newData[dateKey];
    }
    setData(newData);
    const cleaned = {};
    for (const [k, v] of Object.entries(newData)) {
      if (v !== null && v !== false && v !== '') cleaned[k] = v;
    }
    await saveTrackerData(pageId, year, cleaned);
    const currentYear = new Date().getFullYear();
    const sd = await loadTrackerData(pageId, currentYear);
    setStreakData(sd);
  };

  const openOptionsEditor = () => {
    setEditOptions(options.map(o => ({ ...o })));
    setOptMsg('');
    setShowOptionsModal(true);
  };

  const saveOptions = async () => {
    const valid = editOptions.filter(o => o.label.trim() && o.value.trim());
    if (valid.length === 0) {
      setOptMsg('Need at least one valid option.');
      return;
    }
    const result = await savePageOptions(pageId, valid);
    if (result.success) {
      setShowOptionsModal(false);
      await load();
    } else {
      setOptMsg(result.message || 'Failed to save.');
    }
  };

  const { streak, value } = calculateCurrentStreak(streakData);
  const streakOption = options.find(o => String(o.value) === String(value));

  const bgGradient = { backgroundColor: theme.bg[0] };
  const s = makeStyles(theme);

  if (loading) {
    return (
      <View style={[s.container, bgGradient, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent1} />
      </View>
    );
  }

  const getOption = (val) => options.find(o => String(o.value) === String(val));

  return (
    <View style={[s.container, bgGradient]}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.editBtn} onPress={openOptionsEditor}>
          <Text style={s.editBtnText}>Edit Options</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>{page ? page.name : 'Tracker'}</Text>
          <Text style={s.subtitle}>
            {options.length ? 'Tap to cycle through options' : 'No options yet — add some!'}
          </Text>
        </View>

        <View style={s.controls}>
          <View style={s.yearPicker}>
            <TouchableOpacity onPress={() => setYear(y => y - 1)}>
              <Text style={s.yearArrow}>◀</Text>
            </TouchableOpacity>
            <Text style={s.yearText}>{year}</Text>
            <TouchableOpacity onPress={() => setYear(y => y + 1)}>
              <Text style={s.yearArrow}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        {streak > 0 ? (
          <View style={s.streakBar}>
            <Text style={s.streakText}>
              🔥 {streak} day{streak !== 1 ? 's' : ''}{streakOption ? ` — ${streakOption.label}` : ''}
            </Text>
          </View>
        ) : null}

        {options.length > 0 ? (
          <View style={s.legend}>
            {options.map((opt, i) => (
              <View key={i} style={s.legendItem}>
                <View style={[s.legendSwatch, { backgroundColor: opt.bg }]} />
                <Text style={s.legendLabel}>{opt.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={s.grid}>
          {MONTH_NAMES.map((monthName, month) => {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
            return (
              <View key={month} style={s.monthCard}>
                <Text style={s.monthTitle}>{monthName}</Text>
                <View style={s.weekdays}>
                  {WEEKDAY_SHORT.map(d => (
                    <Text key={d} style={s.wdText}>{d}</Text>
                  ))}
                </View>
                <View style={s.daysGrid}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <View key={`e-${i}`} style={s.emptyCell} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                    const val = data[dateKey];
                    const opt = getOption(val);
                    const future = isFutureDate(dateKey);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          s.dayCell,
                          opt ? { backgroundColor: opt.bg } : null,
                          future && s.futureCell,
                        ]}
                        onPress={() => cycleOption(dateKey)}
                        disabled={future}
                      >
                        <Text style={[s.dayNumber, opt ? { color: opt.color } : null]}>
                          {day + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showOptionsModal} transparent animationType="fade" onRequestClose={() => setShowOptionsModal(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Edit Options</Text>
            <ScrollView style={s.optionsEditor}>
              {editOptions.map((opt, i) => (
                <View key={i} style={s.optionRow}>
                  <TextInput
                    style={s.optInput}
                    value={opt.label}
                    onChangeText={(t) => {
                      const newOpts = [...editOptions];
                      newOpts[i] = { ...newOpts[i], label: t };
                      setEditOptions(newOpts);
                    }}
                    placeholder="Label"
                    placeholderTextColor={theme.placeholder}
                  />
                  <TextInput
                    style={[s.optInput, { flex: 0.7 }]}
                    value={opt.value}
                    onChangeText={(t) => {
                      const newOpts = [...editOptions];
                      newOpts[i] = { ...newOpts[i], value: t };
                      setEditOptions(newOpts);
                    }}
                    placeholder="Value"
                    placeholderTextColor={theme.placeholder}
                  />
                  <TouchableOpacity
                    style={s.removeBtn}
                    onPress={() => setEditOptions(editOptions.filter((_, j) => j !== i))}
                  >
                    <Text style={s.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[s.addOptBtn, editOptions.length >= MAX_OPTIONS && { opacity: 0.5 }]}
              onPress={() => {
                if (editOptions.length >= MAX_OPTIONS) return;
                setEditOptions([...editOptions, { value: `option-${editOptions.length + 1}`, label: '', bg: '#b197fc', color: '#fff' }]);
              }}
              disabled={editOptions.length >= MAX_OPTIONS}
            >
              <Text style={s.addOptBtnText}>+ Add Option</Text>
            </TouchableOpacity>
            {optMsg ? <Text style={s.optMsg}>{optMsg}</Text> : null}
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnSecondary]} onPress={() => setShowOptionsModal(false)}>
                <Text style={s.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, s.modalBtnPrimary]} onPress={saveOptions}>
                <Text style={s.modalBtnPrimaryText}>Save</Text>
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
      justifyContent: 'space-between',
      alignItems: 'center',
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
    editBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: theme.lavenderDark,
    },
    editBtnText: { fontWeight: '700', color: theme.text, fontSize: 13 },
    header: { alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: theme.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.textLight, fontWeight: '600' },
    controls: { alignItems: 'center', marginBottom: 12 },
    yearPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 50,
      backgroundColor: theme.surface,
    },
    yearArrow: { fontSize: 16, color: theme.text, padding: 4 },
    yearText: { fontSize: 18, fontWeight: '800', color: theme.text },
    streakBar: {
      alignSelf: 'center',
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 50,
      backgroundColor: theme.accent1,
      marginBottom: 12,
    },
    streakText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 16,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: theme.surface,
    },
    legendSwatch: { width: 14, height: 14, borderRadius: 7 },
    legendLabel: { fontSize: 12, fontWeight: '700', color: theme.text },
    grid: { gap: 16 },
    monthCard: {
      padding: 16,
      borderRadius: 24,
      backgroundColor: theme.surface,
    },
    monthTitle: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 10,
    },
    weekdays: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 6,
    },
    wdText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '800',
      color: theme.textLight,
      textTransform: 'uppercase',
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    emptyCell: {
      width: '13%',
      aspectRatio: 1,
    },
    dayCell: {
      width: '13%',
      aspectRatio: 1,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.ratingBg,
      borderWidth: 1,
      borderColor: theme.ratingBorder,
    },
    futureCell: { opacity: 0.4 },
    dayNumber: { fontSize: 11, fontWeight: '700', color: theme.textLight },
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
      maxHeight: '80%',
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text, marginBottom: 12 },
    optionsEditor: { maxHeight: 300 },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      padding: 8,
      borderRadius: 16,
      backgroundColor: theme.optionRowBg,
      marginBottom: 8,
    },
    optInput: {
      flex: 1,
      padding: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      fontSize: 13,
      color: theme.text,
      backgroundColor: theme.inputBg,
    },
    removeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.rose,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
    addOptBtn: {
      padding: 10,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.lavenderDark,
      alignItems: 'center',
      marginTop: 8,
    },
    addOptBtnText: { fontWeight: '800', color: theme.text, fontSize: 13 },
    optMsg: { color: theme.error, fontSize: 12, fontWeight: '700', marginTop: 6 },
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
