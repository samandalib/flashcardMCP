require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Node.js + Next.js backend running!' });
});

app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Sample data from backend',
    items: ['Item 1', 'Item 2', 'Item 3'],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Projects API endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json({ projects: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({ 
        error: 'Project name is required and must be at least 3 characters' 
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ 
        error: 'Project name must be less than 100 characters' 
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ 
        error: 'Project description must be less than 500 characters' 
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: name.trim(),
          description: description ? description.trim() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    res.status(201).json({ project: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notes API endpoints
app.get('/api/projects/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }

    res.json({ notes: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return res.status(400).json({ 
        error: 'Title is required' 
      });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ 
        error: 'Content is required' 
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({ 
        error: 'Title must be less than 200 characters' 
      });
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          project_id: id,
          title: title.trim(),
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }

    res.status(201).json({ note: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Validate input
    if (title && (typeof title !== 'string' || title.trim().length < 1)) {
      return res.status(400).json({ 
        error: 'Title must be a non-empty string' 
      });
    }

    if (content && typeof content !== 'string') {
      return res.status(400).json({ 
        error: 'Content must be a string' 
      });
    }

    if (title && title.trim().length > 200) {
      return res.status(400).json({ 
        error: 'Title must be less than 200 characters' 
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      return res.status(500).json({ error: 'Failed to update note' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ note: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return res.status(500).json({ error: 'Failed to delete note' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});