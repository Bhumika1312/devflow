import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import client from '../api/client';

const MODES = [
  { label: 'Focus', duration: 25 * 60, color: '#6366f1' },
  { label: 'Break', duration: 5 * 60, color: '#22c55e' },
  { label: 'Long Break', duration: 15 * 60, color: '#f59e0b' },
];

export default function TimerScreen() {
  const [modeIndex, setModeIndex] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<any>(null);
  const mode = MODES[modeIndex];

  useEffect(() => {
    setSeconds(mode.duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [modeIndex]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (modeIndex === 0) {
              setSessions(prev => prev + 1);
              client.post('/sessions', { duration_minutes: 25 }).catch(() => {});
              Alert.alert('Session Complete!', 'Great work! Take a break.');
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIndex]);

  const reset = () => { setRunning(false); setSeconds(mode.duration); };
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const progress = seconds / mode.duration;

  return (
    <View style={styles.container}>
      <View style={styles.modeRow}>
        {MODES.map((m, i) => (
          <TouchableOpacity
            key={m.label}
            style={[styles.modeBtn, modeIndex === i && { backgroundColor: m.color }]}
            onPress={() => setModeIndex(i)}
          >
            <Text style={[styles.modeBtnText, modeIndex === i && { color: '#fff', fontWeight: 'bold' }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.ring, { borderColor: mode.color }]}>
        <Text style={[styles.timerText, { color: mode.color }]}>{mins}:{secs}</Text>
        <Text style={styles.modeLabel}>{mode.label}</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, {
          width: `${progress * 100}%` as any,
          backgroundColor: mode.color
        }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: mode.color }]}
          onPress={() => setRunning(!running)}
        >
          <Text style={styles.startText}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionBox}>
        <Text style={styles.sessionLabel}>Sessions Today</Text>
        <View style={styles.dots}>
          {sessions > 0 && [...Array(Math.min(sessions, 8))].map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: mode.color }]} />
          ))}
          {sessions === 0 && <Text style={styles.noSessions}>Complete a session to start tracking!</Text>}
        </View>
        <Text style={styles.sessionCount}>{sessions} x 25 min = {sessions * 25} min coded</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 24, alignItems: 'center' },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 40, marginTop: 8 },
  modeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1a1a1a' },
  modeBtnText: { color: '#888', fontSize: 13 },
  ring: {
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 8, justifyContent: 'center',
    alignItems: 'center', marginBottom: 32,
  },
  timerText: { fontSize: 56, fontWeight: 'bold' },
  modeLabel: { color: '#666', fontSize: 14, marginTop: 4 },
  progressBar: { width: '100%', height: 6, backgroundColor: '#1a1a1a', borderRadius: 3, marginBottom: 32 },
  progressFill: { height: 6, borderRadius: 3 },
  controls: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  resetBtn: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 16 },
  resetText: { color: '#fff', fontSize: 15 },
  startBtn: { borderRadius: 14, paddingHorizontal: 48, paddingVertical: 16 },
  startText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sessionBox: { alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, width: '100%' },
  sessionLabel: { color: '#888', fontSize: 13, marginBottom: 12 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', justifyContent: 'center', minHeight: 24 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  noSessions: { color: '#444', fontSize: 12 },
  sessionCount: { color: '#fff', fontSize: 14, fontWeight: '600' },
});