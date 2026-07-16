const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { goal, duration_minutes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO focus_goals (user_id, goal, duration_minutes) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, goal, duration_minutes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE focus_goals SET completed=TRUE WHERE id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM focus_goals WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;