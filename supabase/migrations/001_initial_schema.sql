-- Flashcard Research Synthesizer - Initial Schema
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    reference JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'pdf', 'web', 'audio')),
    url TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Syntheses table (optional - for storing synthesis results)
CREATE TABLE syntheses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    markdown TEXT NOT NULL,
    bibliography JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cards_project_id ON cards(project_id);
CREATE INDEX idx_attachments_card_id ON attachments(card_id);
CREATE INDEX idx_syntheses_project_id ON syntheses(project_id);
CREATE INDEX idx_cards_updated_at ON cards(updated_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for cards
CREATE TRIGGER update_cards_updated_at 
    BEFORE UPDATE ON cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Ready for future auth
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE syntheses ENABLE ROW LEVEL SECURITY;

-- Sample data for development (optional)
INSERT INTO projects (name) VALUES 
    ('AI Research Findings'),
    ('Climate Change Studies');

INSERT INTO cards (project_id, body, reference) VALUES 
    (
        (SELECT id FROM projects WHERE name = 'AI Research Findings' LIMIT 1),
        'Large language models show emergent abilities at scale, particularly in reasoning tasks.',
        '{"title": "Emergent Abilities of Large Language Models", "authors": ["Jason Wei", "Yi Tay"], "url": "https://arxiv.org/abs/2206.07682"}'
    ),
    (
        (SELECT id FROM projects WHERE name = 'AI Research Findings' LIMIT 1),
        'Chain-of-thought prompting significantly improves performance on complex reasoning tasks.',
        '{"title": "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models", "authors": ["Jason Wei"], "url": "https://arxiv.org/abs/2201.11903"}'
    );

