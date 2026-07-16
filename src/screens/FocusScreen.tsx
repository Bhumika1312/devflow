import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import client from '../api/client';

const DURATIONS = [15, 25, 30, 45, 60];

interface Goal {
  id: number;
  goal: string;
  duration_minutes: number;
  completed: boolean;
}

export default function FocusScreen() {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(25);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [active, setActive] = useState<Goal | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => { loadGoals(); }, []);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleDone();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const loadGoals = async () => {
    try {
      const res = await client.get('/focus');
      setGoals(res.data);
    } catch {}
  };

  const startFocus = async () => {
    if (!goal.trim()) return Alert.alert('Error', 'Please set a goal first!');
    try {
      const res = await client.post('/focus', { goal, duration_minutes: duration });
      setActive(res.data);
      setSeconds(duration * 60);
      setRunning(true);
      setGoals(prev => [res.data, ...prev]);
      setGoal('');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  };

  const handleDone = async () => {
    if (!active) return;
    try {
      await client.patch(`/focus/${active.id}/complete`);
      setGoals(prev => prev.map(g => g.id === active!.id ? { ...g, completed: true } : g));
      setActive(null);
      Alert.alert('Goal Complete!', 'Amazing focus session!');
    } catch {}
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f0f0f' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {active && running ? (
          <View style={styles.activeSession}>
            <Text style={styles.activeEmoji}>🎯</Text>
            <Text style={styles.activeLabel}>Focusing on:</Text>
            <Text style={styles.activeGoal} numberOfLines={3}>{active.goal}</Text>
            <Text style={styles.activeTimer}>{mins}:{secs}</Text>
            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => { clearInterval(intervalRef.current); setRunning(false); setActive(null); }}
            >
              <Text style={styles.stopText}>Stop Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.heading}>Set Your Focus Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Solve 3 DP problems"
              placeholderTextColor="#666"
              value={goal}
              onChangeText={setGoal}
              multiline
              numberOfLines={2}
            />
            <Text style={styles.label}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationBtn, duration === d && styles.durationActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.durationText, duration === d && { color: '#fff', fontWeight: 'bold' }]}>
                    {d}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={startFocus}>
              <Text style={styles.startText}>Start Focus</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.historyTitle}>Recent Goals</Text>
        {goals.length === 0 ? (
          <Text style={styles.empty}>No focus sessions yet</Text>
        ) : (
          goals.map(item => (
            <View key={item.id} style={styles.goalCard}>
              <Text style={styles.goalIcon}>{item.completed ? '✅' : '⏳'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalText, item.completed && styles.goalDone]} numberOfLines={2}>
                  {item.goal}
                </Text>
                <Text style={styles.goalDuration}>{item.duration_minutes} min</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 20 },
  activeSession: {
    backgroundColor: '#1a1a1a', borderRadius: 20,
    padding: 28, alignItems: 'center', marginBottom: 24,
  },
  activeEmoji: { fontSize: 40, marginBottom: 12 },
  activeLabel: { color: '#888', fontSize: 14, marginBottom: 8 },
  activeGoal: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
    textAlign: 'center', marginBottom: 24, lineHeight: 24,
  },
  activeTimer: { fontSize: 60, fontWeight: 'bold', color: '#6366f1', marginBottom: 24 },
  stopBtn: { backgroundColor: '#2a2a2a', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  stopText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  form: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, marginBottom: 24 },
  heading: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: {
    backgroundColor: '#0f0f0f', color: '#fff',
    borderRadius: 10, padding: 14, fontSize: 14,
    marginBottom: 16, minHeight: 50,
  },
  label: { color: '#888', fontSize: 13, marginBottom: 10 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  durationBtn: { backgroundColor: '#2a2a2a', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  durationActive: { backgroundColor: '#6366f1' },
  durationText: { color: '#888', fontSize: 13 },
  startBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center' },
  startText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  historyTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  goalCard: {
    backgroundColor: '#1a1a1a', borderRadius: 12,
    padding: 14, marginBottom: 8, flexDirection: 'row',
    alignItems: 'flex-start', gap: 12,
  },
  goalIcon: { fontSize: 20, marginTop: 2 },
  goalText: { color: '#fff', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  goalDone: { color: '#555', textDecorationLine: 'line-through' },
  goalDuration: { color: '#6366f1', fontSize: 12, marginTop: 4 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20, fontSize: 14 },
});