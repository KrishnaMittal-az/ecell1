import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const checks: Record<string, boolean> = {};
    const errors: string[] = [];

    // Check all required tables
    const tables = ['users', 'attendance_sessions', 'attendance_logs', 'faculty', 'faculty_view_tokens'] as const;
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table as any).select('id').limit(1);
        checks[`table_${table}`] = !error;
        if (error) errors.push(`Table ${table}: ${error.message}`);
      } catch (err) {
        checks[`table_${table}`] = false;
        errors.push(`Table ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    const allHealthy = Object.values(checks).every(v => v);

    if (!allHealthy) {
      return NextResponse.json({
        status: 'warning',
        message: 'Some database tables are not accessible',
        checks,
        errors,
        instructions: 'Please run the schema.sql file in your Supabase SQL Editor.'
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'All database tables are accessible',
      checks,
      tablesVerified: tables,
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      instructions: 'Check your Supabase credentials in .env.local'
    }, { status: 500 });
  }
}
