import { createClient } from '@/lib/supabase/server';
import { AuthUser } from './types';

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('id, email, name, role, approved')
    .eq('id', authUser.id)
    .single();

  if (error || !userData) {
    return null;
  }

  return userData as AuthUser;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (user.role !== 'admin' || !user.approved) {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}

export async function requireApproved(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!user.approved) {
    throw new Error('Account not approved');
  }

  return user;
}
