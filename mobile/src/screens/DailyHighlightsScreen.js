import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loadHighlights, saveHighlights } from '../api/client';
import { MONTH_NAMES, WEEKDAY_SHORT, calculateAnyStreak } from '../components/helpers';

export default function DailyHighlightsScreen({ navigation }) {
  const { theme } = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const d = await loadHighlights(year);
    setData(d);
    setLoading(false);
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const updateHighlight = (dateKey, text) => {
    const newData = { ...data, [dateKey]: text };
    if (!text.trim()) {
      delete newData[dateKey];
    }
    setData(newData);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const cleaned = {};
      for (const [k, v] of Object.entries(newData)) {
        if (v && v.trim()) cleaned[k] = v;
      }
      await saveHighlights(year, cleaned);
    }, 800);
  };

  const streak = calculateAnyStreak(data);
  const s = makeStyles(theme);

  return (
    <View style={[s.container, { backgroundColor: theme.bg[0] }]}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
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

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.title}>Daily Highlights</Text>
          <Text style={s.subtitle}>Jot down a few lines for each day</Text>
        </View>

        {streak > 0 ? (
          <View style={s.streakBar}>
            <Text style={s.streakText}>🔥 {streak} day{streak !== 1 ? 's' : ''} streak</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color={theme.accent1} style={{ marginTop: 40 }} />
        ) : (
          <View style={s.grid}>
            {MONTH_NAMES.map((monthName, month) => {
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              return (
                <View key={month} style={s.monthCard}>
                  <Text style={s.monthTitle}>{monthName}</Text>
                  <View style={s.daysList}>
                    {Array.from({ length: daysInMonth }).map((_, day) => {
                      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
                      const val = data[dateKey] || '';
                      const d = new Date(year, month, day + 1);
                      const dow = WEEKDAY_SHORT[d.getDay()];
                      return (
                        <View key={day} style={s.highlightItem}>
                          <View style={s.highlightDate}>
                            <Text style={s.dowText}>{dow}</Text>
                            <Text style={s.domText}>{day + 1}</Text>
                          </View>
                          <TextInput
                            style={s.highlightInput}
                            value={val}
                            onChangeText={(t) => updateHighlight(dateKey, t)}
                            placeholder="Write your highlight..."
                            placeholderTextColor={theme.placeholder}
                            multiline
                            textAlignVertical="top"
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    yearPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 50,
      backgroundColor: theme.surface,
    },
    yearArrow: { fontSize: 14, color: theme.text, padding: 4 },
    yearText: { fontSize: 16, fontWeight: '800', color: theme.text },
    header: { alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: theme.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.textLight, fontWeight: '600' },
    streakBar: {
      alignSelf: 'center',
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 50,
      backgroundColor: theme.accent1,
      marginBottom: 16,
    },
    streakText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    grid: { gap: 16 },
    monthCard: {
      borderRadius: 24,
      padding: 16,
      backgroundColor: theme.surface,
    },
    monthTitle: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 12,
    },
    daysList: { gap: 8 },
    highlightItem: {
      flexDirection: 'row',
      gap: 10,
      padding: 10,
      borderRadius: 16,
      backgroundColor: theme.highlightItemBg,
    },
    highlightDate: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dowText: { fontSize: 10, fontWeight: '800', color: theme.textLight, textTransform: 'uppercase' },
    domText: { fontSize: 16, fontWeight: '800', color: theme.text },
    highlightInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      minHeight: 48,
      textAlignVertical: 'top',
    },
  });
}
