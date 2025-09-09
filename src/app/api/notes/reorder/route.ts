import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT /api/notes/reorder - Update the order of multiple notes
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { noteOrders } = body;

    // Validate input
    if (!Array.isArray(noteOrders) || noteOrders.length === 0) {
      return NextResponse.json({
        error: 'noteOrders must be a non-empty array'
      }, { status: 400 });
    }

    // Validate each order item
    for (const item of noteOrders) {
      if (!item.id || typeof item.order !== 'number') {
        return NextResponse.json({
          error: 'Each item must have id (string) and order (number) properties'
        }, { status: 400 });
      }
    }

    // Update notes in batch using a transaction-like approach
    // Since Supabase doesn't support transactions in the client, we'll update one by one
    const updatePromises = noteOrders.map(({ id, order }) =>
      supabase
        .from('notes')
        .update({ display_order: order })
        .eq('id', id)
    );

    const results = await Promise.all(updatePromises);

    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors updating note orders:', errors);
      return NextResponse.json({
        error: 'Failed to update some note orders',
        details: errors.map(e => e.error?.message).join(', ')
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Note orders updated successfully',
      updated: noteOrders.length
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
