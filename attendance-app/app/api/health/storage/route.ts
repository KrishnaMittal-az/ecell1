import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Use service role client to list buckets (requires admin permissions)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if storage bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to access storage',
        error: bucketsError.message,
        checks: {
          supabaseConnection: false,
          storageBucket: false,
        }
      }, { status: 500 });
    }

    const momBucket = buckets?.find(b => b.id === 'mom-pdfs');

    if (!momBucket) {
      return NextResponse.json({
        status: 'warning',
        message: 'Storage bucket "mom-pdfs" not found',
        checks: {
          supabaseConnection: true,
          storageBucket: false,
        },
        instructions: 'Please run the schema.sql file in your Supabase SQL Editor to create the storage bucket.'
      }, { status: 200 });
    }

    // Try to list files in the bucket
    const { error: listError } = await supabase.storage
      .from('mom-pdfs')
      .list('', { limit: 1 });

    if (listError) {
      return NextResponse.json({
        status: 'warning',
        message: 'Storage bucket exists but cannot access files',
        error: listError.message,
        checks: {
          supabaseConnection: true,
          storageBucket: true,
          storageAccess: false,
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Storage is properly configured',
      checks: {
        supabaseConnection: true,
        storageBucket: true,
        storageAccess: true,
      },
      bucketInfo: {
        name: momBucket.name,
        public: momBucket.public,
        createdAt: momBucket.created_at,
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Storage health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        supabaseConnection: false,
        storageBucket: false,
      }
    }, { status: 500 });
  }
}
