'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="text-5xl mb-4">⏳</div>
                    <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">
                        Your account has been created successfully! Please wait for an administrator to approve your account.
                    </p>
                    <p className="text-sm text-gray-500">
                        You will be able to access the system once your account is approved.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="mt-4">
                            Back to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
