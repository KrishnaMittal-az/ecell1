import { auth0 } from '@/lib/auth0/auth0';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CallbackHandlerPage() {
    const session = await auth0.getSession();

    if (!session || !session.user) {
        redirect('/login');
    }

    const auth0User = session.user;
    const supabase = await createClient();

    // Check if user exists in Supabase public.users table
    const userEmail = auth0User.email;
    if (!userEmail) {
        redirect('/login?error=no_email');
    }

    const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, role, approved')
        .eq('email', userEmail)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error fetching user:', fetchError);
        redirect('/login?error=database_error');
    }

    if (!existingUser) {
        // Create new user in Supabase
        const { error: insertError } = await supabase.from('users').insert({
            id: auth0User.sub, // Use Auth0 user ID
            email: auth0User.email!,
            name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
            role: 'member',
            approved: false,
        });

        if (insertError) {
            console.error('Error creating user:', insertError);
            redirect('/login?error=user_creation_failed');
        }

        // New user needs approval
        redirect('/pending-approval');
    }

    // User exists - check approval
    if (!existingUser.approved) {
        redirect('/pending-approval');
    }

    // Redirect based on role
    if (existingUser.role === 'admin') {
        redirect('/admin/dashboard');
    } else {
        redirect('/council/dashboard');
    }
}
