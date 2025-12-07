'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import UserAccount from '@/components/UserAccount';

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useUser();
  const view = params.view || 'profile';

  useEffect(() => {
    // Redirect to home if not authenticated (after loading completes)
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="account-page">
      <div className="container">
        <UserAccount initialView={view} />
      </div>
    </div>
  );
}
