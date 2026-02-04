import { Router } from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { all, get, run, runWithChanges } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get notes for a board
router.get('/boards/:boardId/notes', (req, res) => {
  try {
    const notes = all('SELECT * FROM notes WHERE board_id = ? ORDER BY created_at DESC', [req.params.boardId]);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create note
router.post('/boards/:boardId/notes', upload.single('image'), (req, res) => {
  try {
    const { boardId } = req.params;
    const { content = '', position_x = 0, position_y = 0, color = '#fef08a', width = 200, height = 200 } = req.body;

    // Check if board exists
    const board = get('SELECT id FROM boards WHERE id = ?', [boardId]);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    let image_url = req.file ? `/uploads/${req.file.filename}` : null;
    // Also check for image_url in body (for external URLs)
    if (!image_url && req.body.image_url) {
      image_url = req.body.image_url;
    }

    run(
      `INSERT INTO notes (board_id, content, image_url, position_x, position_y, color, width, height)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [boardId, content, image_url, position_x, position_y, color, width, height]
    );

    // Get the most recently created note for this board
    const note = get('SELECT * FROM notes WHERE board_id = ? ORDER BY id DESC LIMIT 1', [boardId]);

    // Update board's updated_at
    run('UPDATE boards SET updated_at = datetime(\'now\') WHERE id = ?', [boardId]);

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update note
router.put('/notes/:id', upload.single('image'), (req, res) => {
  try {
    const note = get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const { content, position_x, position_y, color, width, height } = req.body;
    let image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url !== undefined ? req.body.image_url : note.image_url);

    run(
      `UPDATE notes SET
        content = ?, image_url = ?, position_x = ?, position_y = ?,
        color = ?, width = ?, height = ?, updated_at = datetime('now')
      WHERE id = ?`,
      [
        content !== undefined ? content : note.content,
        image_url,
        position_x !== undefined ? position_x : note.position_x,
        position_y !== undefined ? position_y : note.position_y,
        color || note.color,
        width !== undefined ? width : note.width,
        height !== undefined ? height : note.height,
        req.params.id
      ]
    );

    const updated = get('SELECT * FROM notes WHERE id = ?', [req.params.id]);

    // Update board's updated_at
    run('UPDATE boards SET updated_at = datetime(\'now\') WHERE id = ?', [note.board_id]);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete('/notes/:id', (req, res) => {
  try {
    const note = get('SELECT board_id FROM notes WHERE id = ?', [req.params.id]);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    runWithChanges('DELETE FROM notes WHERE id = ?', [req.params.id]);

    // Update board's updated_at
    run('UPDATE boards SET updated_at = datetime(\'now\') WHERE id = ?', [note.board_id]);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate placeholder image for a note
router.post('/notes/:id/generate-image', async (req, res) => {
  try {
    const note = get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Use picsum.photos for placeholder images
    const width = 400;
    const height = 300;
    const randomId = Math.floor(Math.random() * 1000);
    const image_url = `https://picsum.photos/seed/${randomId}/${width}/${height}`;

    run('UPDATE notes SET image_url = ?, updated_at = datetime(\'now\') WHERE id = ?', [image_url, req.params.id]);

    const updated = get('SELECT * FROM notes WHERE id = ?', [req.params.id]);

    // Update board's updated_at
    run('UPDATE boards SET updated_at = datetime(\'now\') WHERE id = ?', [note.board_id]);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
