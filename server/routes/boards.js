import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

// Get all boards
router.get('/', (req, res) => {
  try {
    const boards = all('SELECT * FROM boards ORDER BY updated_at DESC');
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single board
router.get('/:id', (req, res) => {
  try {
    const board = get('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create board
router.post('/', (req, res) => {
  try {
    const { name, category = 'general' } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    run('INSERT INTO boards (name, category) VALUES (?, ?)', [name, category]);
    // Get the most recently created board
    const board = get('SELECT * FROM boards ORDER BY id DESC LIMIT 1');
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update board
router.put('/:id', (req, res) => {
  try {
    const { name, category } = req.body;
    const board = get('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    run('UPDATE boards SET name = ?, category = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [name || board.name, category || board.category, req.params.id]);
    const updated = get('SELECT * FROM boards WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete board
router.delete('/:id', (req, res) => {
  try {
    // Check if board exists first
    const board = get('SELECT id FROM boards WHERE id = ?', [req.params.id]);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    // Delete all notes for this board, then delete the board
    run('DELETE FROM notes WHERE board_id = ?', [req.params.id]);
    run('DELETE FROM boards WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
