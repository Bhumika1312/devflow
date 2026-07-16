const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { duration_minutes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO code_sessions (user_id, duration_minutes) VALUES ($1,$2) RETURNING *',
      [req.user.id, duration_minutes]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT date, SUM(duration_minutes) as total FROM code_sessions
       WHERE user_id=$1 AND date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY date ORDER BY date`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;