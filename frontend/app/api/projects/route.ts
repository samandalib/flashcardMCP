import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// GET /api/projects - List all projects
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({
        error: 'Project name is required'
      }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({
        error: 'Project name must be less than 100 characters'
      }, { status: 400 });
    }

    if (description && typeof description !== 'string') {
      return NextResponse.json({
        error: 'Description must be a string'
      }, { status: 400 });
    }

    if (description && description.length > 500) {
      return NextResponse.json({
        error: 'Description must be less than 500 characters'
      }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name: name.trim(),
          description: description?.trim() || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
