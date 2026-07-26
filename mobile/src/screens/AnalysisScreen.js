import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loadPages, loadTrackerData } from '../api/client';
import { MONTH_NAMES, calculateCurrentStreak, calculateAnyStreak } from '../components/helpers';

const SCOPES = ['weekly', 'monthly', 'yearly', 'overall'];

export default function AnalysisScreen({ navigation }) {
  const { theme } = useTheme();
  const [pages, setPages] = useState([]);
  const [scope, setScope] = useState('overall');
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    const pResult = await loadPages(true);
    const allPages = pResult.pages || [];
    setPages(allPages);

    const pagesToAnalyze = selectedPage === 'all' ? allPages : allPages.filter(p => p.id === selectedPage);
    if (pagesToAnalyze.length === 0) {
      setAnalysis(null);
      setLoading(false);
      return;
    }

    const allData = {};
    const years = selectedPage === 'all'
      ? [selectedYear]
      : [selectedYear];

    for (const page of pagesToAnalyze) {
      for (const y of years) {
        if (!allData[page.id]) allData[page.id] = {};
        allData[page.id][y] = await loadTrackerData(page.id, y);
      }
    }

    const today = new Date();
    let totalDaysMarked = 0;
    let totalDays = 0;
    let fullData = {};
    let allValues = [];

    for (const page of pagesToAnalyze) {
      for (const y of years) {
        const d = allData[page.id][y] || {};
        for (const [dateKey, val] of Object.entries(d)) {
          if (val !== null && val !== '' && val !== false) {
            totalDaysMarked++;
            const pageLabel = page.name;
            if (!fullData[pageLabel]) fullData[pageLabel] = {};
            fullData[pageLabel][dateKey] = val;
            allValues.push({ page: pageLabel, value: val, date: dateKey, option: (page.options || []).find(o => String(o.value) === String(val)) });
          }
        }
        totalDays += 365;
      }
    }

    const anyStreak = calculateAnyStreak(
      Object.keys(fullData).length > 0
        ? Object.values(fullData).reduce((a, b) => ({ ...a, ...b }), {})
        : {}
    );

    let longestStreak = 0;
    for (const page of pagesToAnalyze) {
      for (const y of years) {
        const { streak } = calculateCurrentStreak(allData[page.id]?.[y] || {});
        longestStreak = Math.max(longestStreak, streak);
      }
    }

    // distribution
    const distribution = {};
    for (const item of allValues) {
      const label = item.option ? item.option.label : item.value;
      if (!distribution[label]) distribution[label] = 0;
      distribution[label]++;
    }

    // monthly trend
    const monthlyTrend = {};
    for (let m = 0; m < 12; m++) {
      monthlyTrend[MONTH_NAMES[m]] = 0;
    }
    for (const item of allValues) {
      const m = parseInt(item.date.split('-')[1], 10) - 1;
      monthlyTrend[MONTH_NAMES[m]]++;
    }

    // page comparison
    const pageComparison = {};
    for (const page of pagesToAnalyze) {
      let count = 0;
      for (const y of years) {
        const d = allData[page.id]?.[y] || {};
        for (const val of Object.values(d)) {
          if (val !== null && val !== '' && val !== false) count++;
        }
      }
      pageComparison[page.name] = count;
    }

    const sortedDist = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
    const mostFrequentOption = sortedDist.length > 0 ? sortedDist[0][0] : 'N/A';

    setAnalysis({
      daysTracked: totalDaysMarked,
      currentStreak: anyStreak,
      longestStreak,
      mostFrequentOption,
      distribution: sortedDist,
      monthlyTrend: Object.entries(monthlyTrend),
      pageComparison: Object.entries(pageComparison).sort((a, b) => b[1] - a[1]),
      totalPossible: totalDays,
    });
    setLoading(false);
  }, [selectedPage, selectedYear]);

  useEffect(() => { runAnalysis(); }, [runAnalysis]);

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
          <Text style={s.title}>Analysis</Text>
          <Text style={s.subtitle}>Your journaling insights</Text>
        </View>

        <View style={s.controls}>
          <View style={s.controlGroup}>
            <Text style={s.controlLabel}>Scope</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SCOPES.map(sc => (
                <TouchableOpacity
                  key={sc}
                  style={[s.chip, scope === sc && s.chipActive]}
                  onPress={() => setScope(sc)}
                >
                  <Text style={[s.chipText, scope === sc && s.chipTextActive]}>
                    {sc.charAt(0).toUpperCase() + sc.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.controlGroup}>
            <Text style={s.controlLabel}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                <TouchableOpacity
                  key={y}
                  style={[s.chip, selectedYear === y && s.chipActive]}
                  onPress={() => setSelectedYear(y)}
                >
                  <Text style={[s.chipText, selectedYear === y && s.chipTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.controlGroup}>
            <Text style={s.controlLabel}>Page</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[s.chip, selectedPage === 'all' && s.chipActive]}
                onPress={() => setSelectedPage('all')}
              >
                <Text style={[s.chipText, selectedPage === 'all' && s.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {pages.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[s.chip, selectedPage === p.id && s.chipActive]}
                  onPress={() => setSelectedPage(p.id)}
                >
                  <Text style={[s.chipText, selectedPage === p.id && s.chipTextActive]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.accent1} style={{ marginTop: 40 }} />
        ) : analysis && analysis.daysTracked > 0 ? (
          <View style={s.analysisContent}>
            <View style={s.summaryGrid}>
              <View style={s.summaryCard}>
                <Text style={s.summaryIcon}>📅</Text>
                <Text style={s.summaryLabel}>Days Tracked</Text>
                <Text style={s.summaryValue}>{analysis.daysTracked}</Text>
              </View>
              <View style={s.summaryCard}>
                <Text style={s.summaryIcon}>🔥</Text>
                <Text style={s.summaryLabel}>Current Streak</Text>
                <Text style={s.summaryValue}>{analysis.currentStreak}</Text>
              </View>
              <View style={s.summaryCard}>
                <Text style={s.summaryIcon}>🏆</Text>
                <Text style={s.summaryLabel}>Longest Streak</Text>
                <Text style={s.summaryValue}>{analysis.longestStreak}</Text>
              </View>
              <View style={s.summaryCard}>
                <Text style={s.summaryIcon}>⭐</Text>
                <Text style={s.summaryLabel}>Most Frequent</Text>
                <Text style={s.summaryValue} numberOfLines={1}>{analysis.mostFrequentOption}</Text>
              </View>
            </View>

            {analysis.distribution.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Option Distribution</Text>
                {analysis.distribution.slice(0, 10).map(([label, count], i) => {
                  const maxCount = analysis.distribution[0][1];
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <View key={i} style={s.barRow}>
                      <Text style={s.barLabel} numberOfLines={1}>{label}</Text>
                      <View style={s.barTrack}>
                        <View style={[s.barFill, { width: `${pct}%` }]}>
                          <Text style={s.barValue}>{count}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={s.section}>
              <Text style={s.sectionTitle}>Monthly Trend</Text>
              {analysis.monthlyTrend.map(([month, count], i) => {
                const maxCount = Math.max(...analysis.monthlyTrend.map(([, c]) => c), 1);
                const pct = (count / maxCount) * 100;
                return (
                  <View key={i} style={s.barRow}>
                    <Text style={s.barLabel}>{month.substring(0, 3)}</Text>
                    <View style={s.barTrack}>
                      <View style={[s.barFill, { width: `${pct}%` }]}>
                        <Text style={s.barValue}>{count}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {analysis.pageComparison.length > 1 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Page Comparison</Text>
                {analysis.pageComparison.map(([name, count], i) => {
                  const maxCount = analysis.pageComparison[0][1];
                  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <View key={i} style={s.barRow}>
                      <Text style={s.barLabel} numberOfLines={1}>{name}</Text>
                      <View style={s.barTrack}>
                        <View style={[s.barFill, { width: `${pct}%` }]}>
                          <Text style={s.barValue}>{count}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyText}>No data yet. Start tracking to see your analysis!</Text>
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
    analysisContent: { gap: 20 },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    summaryCard: {
      width: '47%',
      padding: 16,
      borderRadius: 22,
      backgroundColor: theme.surface,
      alignItems: 'center',
    },
    summaryIcon: { fontSize: 24, marginBottom: 6 },
    summaryLabel: { fontSize: 12, fontWeight: '700', color: theme.textLight, marginBottom: 4 },
    summaryValue: { fontSize: 22, fontWeight: '800', color: theme.text },
    section: {
      padding: 20,
      borderRadius: 24,
      backgroundColor: theme.surface,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 14,
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    barLabel: {
      width: 60,
      fontSize: 12,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'right',
    },
    barTrack: {
      flex: 1,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.inputBorder,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 11,
      backgroundColor: theme.accent1,
      justifyContent: 'center',
      paddingRight: 8,
    },
    barValue: {
      fontSize: 11,
      fontWeight: '800',
      color: '#fff',
      textAlign: 'right',
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.textLight,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
