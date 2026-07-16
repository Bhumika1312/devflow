const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dsa_problems WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { title, difficulty, topic, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO dsa_problems (user_id, title, difficulty, topic, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, title, difficulty, topic, notes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE dsa_problems SET status=$1, solved_at=$2 WHERE id=$3 AND user_id=$4 RETURNING *',
      [status, status === 'Solved' ? new Date() : null, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM dsa_problems WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
