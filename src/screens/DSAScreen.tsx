import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import client from '../api/client';

const TOPICS = ['Arrays', 'Strings', 'LinkedList', 'Trees', 'DP', 'Graphs', 'Sorting', 'Backtracking', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLORS: any = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' };

interface Problem {
  id: number;
  title: string;
  difficulty: string;
  topic: string;
  status: string;
  notes: string;
}

export default function DSAScreen() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('Arrays');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchProblems = async () => {
    try {
      const res = await client.get('/problems');
      setProblems(res.data);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProblems(); }, []);

  const addProblem = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Enter problem title');
    setAdding(true);
    try {
      const res = await client.post('/problems', { title, difficulty, topic, notes });
      setProblems(prev => [res.data, ...prev]);
      setModal(false);
      setTitle('');
      setNotes('');
      setDifficulty('Easy');
      setTopic('Arrays');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    } finally {
      setAdding(false);
    }
  };

  const toggleStatus = async (p: Problem) => {
    const newStatus = p.status === 'Solved' ? 'Unsolved' : 'Solved';
    try {
      const res = await client.patch(`/problems/${p.id}/status`, { status: newStatus });
      setProblems(prev => prev.map(x => x.id === p.id ? res.data : x));
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const deleteProblem = (id: number) => {
    Alert.alert('Delete?', 'Remove this problem?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await client.delete(`/problems/${id}`);
            setProblems(prev => prev.filter(p => p.id !== id));
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  const filtered = filter === 'All'
    ? problems
    : filter === 'Solved'
      ? problems.filter(p => p.status === 'Solved')
      : problems.filter(p => p.difficulty === filter);

  const solved = problems.filter(p => p.status === 'Solved').length;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{problems.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#22c55e' }]}>{solved}</Text>
          <Text style={styles.statLabel}>Solved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#ef4444' }]}>{problems.length - solved}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['All', 'Easy', 'Medium', 'Hard', 'Solved'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No problems yet. Add your first one!</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleStatus(item)}>
                <View style={styles.cardTop}>
                  <Text style={[styles.cardTitle, item.status === 'Solved' && styles.solved]} numberOfLines={2}>
                    {item.status === 'Solved' ? '✅ ' : '⬜ '}{item.title}
                  </Text>
                  <View style={[styles.diffBadge, { backgroundColor: DIFF_COLORS[item.difficulty] + '33' }]}>
                    <Text style={[styles.diffText, { color: DIFF_COLORS[item.difficulty] }]}>
                      {item.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.topic}>#{item.topic}</Text>
                {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProblem(item.id)} style={styles.deleteBtn}>
                <Text style={styles.delete}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
        <Text style={styles.fabText}>+ Add Problem</Text>
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add Problem</Text>
            <TextInput
              style={styles.input}
              placeholder="Problem title (e.g. Two Sum)"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.optionRow}>
              {DIFFICULTIES.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.optionBtn, difficulty === d && { backgroundColor: DIFF_COLORS[d] }]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.optionText, difficulty === d && { color: '#fff', fontWeight: 'bold' }]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Topic</Text>
            <View style={styles.optionRow}>
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionBtn, topic === t && { backgroundColor: '#6366f1' }]}
                  onPress={() => setTopic(t)}
                >
                  <Text style={[styles.optionText, topic === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Notes (optional)"
              placeholderTextColor="#666"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <TouchableOpacity style={styles.submitBtn} onPress={addProblem} disabled={adding}>
              {adding
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Add Problem</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)} style={{ paddingVertical: 16 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  statBox: { alignItems: 'center', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 12, flex: 1, marginHorizontal: 4 },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#6366f1' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 2 },
  filterScroll: { marginBottom: 12, flexGrow: 0 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', marginRight: 8 },
  filterActive: { backgroundColor: '#6366f1' },
  filterText: { color: '#666', fontSize: 13 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  solved: { color: '#555', textDecorationLine: 'line-through' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  diffText: { fontSize: 11, fontWeight: 'bold' },
  topic: { color: '#6366f1', fontSize: 12, marginBottom: 2 },
  notes: { color: '#888', fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 4, marginLeft: 8 },
  delete: { fontSize: 18 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 15 },
  fab: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#6366f1', borderRadius: 14, padding: 16, alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#0f0f0f', color: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 14 },
  label: { color: '#888', fontSize: 13, marginBottom: 8, marginTop: 4 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  optionBtn: { backgroundColor: '#2a2a2a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  optionText: { color: '#aaa', fontSize: 12 },
  submitBtn: { backgroundColor: '#6366f1', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelText: { color: '#666', textAlign: 'center', fontSize: 14 },
});