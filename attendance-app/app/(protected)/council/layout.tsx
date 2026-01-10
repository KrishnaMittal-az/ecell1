import { redirect } from 'next/navigation';
import { requireApproved } from '@/lib/auth';
import { CouncilLayoutClient } from './layout-client';

export const dynamic = 'force-dynamic';

export default async function CouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireApproved();
  } catch {
    redirect('/login');
  }

  return <CouncilLayoutClient>{children}</CouncilLayoutClient>;
}
