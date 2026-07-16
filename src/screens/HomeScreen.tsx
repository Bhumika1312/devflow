import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ totalProblems: 0, solved: 0, todayMinutes: 0, weekMinutes: 0, focusCompleted: 0 });
  const [weekData, setWeekData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // THIS IS THE KEY FIX — reload every time you visit Home tab
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const [problems, sessions, focus] = await Promise.all([
        client.get('/problems'),
        client.get('/sessions'),
        client.get('/focus'),
      ]);
      const today = new Date().toISOString().split('T')[0];
      const todaySession = sessions.data.find((s: any) => s.date === today);
      const weekTotal = sessions.data.reduce((acc: number, s: any) => acc + parseInt(s.total), 0);
      setStats({
        totalProblems: problems.data.length,
        solved: problems.data.filter((p: any) => p.status === 'Solved').length,
        todayMinutes: todaySession ? parseInt(todaySession.total) : 0,
        weekMinutes: weekTotal,
        focusCompleted: focus.data.filter((f: any) => f.completed).length,
      });
      setWeekData(sessions.data);
    } catch (e) {
      console.log('Stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator color="#6366f1" size="large" />
    </View>
  );

  const maxMinutes = Math.max(...weekData.map((d: any) => parseInt(d.total)), 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Here's your progress</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {[
          { label: 'Total Problems', value: stats.totalProblems, color: '#6366f1', icon: '🧠' },
          { label: 'Solved', value: stats.solved, color: '#22c55e', icon: '✅' },
          { label: 'Today (min)', value: stats.todayMinutes, color: '#f59e0b', icon: '⏱️' },
          { label: 'This Week', value: `${stats.weekMinutes}m`, color: '#ec4899', icon: '📅' },
          { label: 'Focus Done', value: stats.focusCompleted, color: '#8b5cf6', icon: '🎯' },
          { label: 'Success Rate', value: stats.totalProblems ? `${Math.round(stats.solved / stats.totalProblems * 100)}%` : '0%', color: '#06b6d4', icon: '📈' },
        ].map(item => (
          <View key={item.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Coding Time This Week</Text>
        <View style={styles.bars}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const match = weekData.find((d: any) => new Date(d.date).getDay() === (i + 1) % 7);
            const val = match ? parseInt(match.total) : 0;
            const height = Math.max((val / maxMinutes) * 100, 4);
            return (
              <View key={day} style={styles.barCol}>
                <Text style={styles.barVal}>{val > 0 ? `${val}m` : ''}</Text>
                <View style={[styles.bar, { height, backgroundColor: val > 0 ? '#6366f1' : '#1a1a1a' }]} />
                <Text style={styles.barLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.progressBox}>
        <Text style={styles.chartTitle}>DSA Progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {
            width: stats.totalProblems
              ? `${(stats.solved / stats.totalProblems) * 100}%` as any
              : '0%'
          }]} />
        </View>
        <Text style={styles.progressText}>{stats.solved} of {stats.totalProblems} problems solved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 24 },
  greeting: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 14 },
  logoutBtn: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  logoutText: { color: '#ef4444', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 16, width: '47%', alignItems: 'center' },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#666', fontSize: 11, marginTop: 4, textAlign: 'center' },
  chartBox: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 16 },
  chartTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 16 },
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barCol: { alignItems: 'center', flex: 1 },
  barVal: { color: '#6366f1', fontSize: 9, marginBottom: 4 },
  bar: { width: 28, borderRadius: 6, minHeight: 4 },
  barLabel: { color: '#666', fontSize: 10, marginTop: 6 },
  progressBox: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 32 },
  progressTrack: { backgroundColor: '#2a2a2a', borderRadius: 6, height: 10, marginBottom: 8 },
  progressFill: { backgroundColor: '#6366f1', height: 10, borderRadius: 6 },
  progressText: { color: '#666', fontSize: 13 },
});