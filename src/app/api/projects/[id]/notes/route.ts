import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/projects/[id]/notes - List notes for a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST /api/projects/[id]/notes - Create new note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { title, content, tabs, active_tab } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Validate input
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json({
        error: 'Note title is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (title.trim().length > 200) {
      return NextResponse.json({
        error: 'Note title must be less than 200 characters'
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json({
        error: 'Note content is required'
      }, { status: 400 });
    }

    // Create default tabs structure if not provided
    const defaultTabs = {
      finding: {
        content: '',
        order: 1,
        created_at: new Date().toISOString()
      },
      evidence: {
        content: '',
        order: 2,
        created_at: new Date().toISOString()
      },
      details: {
        content: '',
        order: 3,
        created_at: new Date().toISOString()
      }
    };

    // Set initial content in the finding tab
    defaultTabs.finding.content = content.trim();

    const noteData = {
      project_id: projectId,
      title: title.trim(),
      content: content.trim(),
      tabs: tabs || defaultTabs,
      active_tab: active_tab || 'finding',
      default_tabs: ['finding', 'evidence', 'details']
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(noteData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
