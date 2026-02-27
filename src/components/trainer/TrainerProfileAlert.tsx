import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trainerService } from '@/services/trainerService';

export const TrainerProfileAlert: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndCheck = useCallback(async () => {
    if (user?.role !== 'trainer') {
      setMissingItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await trainerService.getProfile();
      const list: string[] = [];
      const firstname = (data.firstname || '').trim();
      const lastname = (data.lastname || '').trim();
      const bio = (data.bio || '').trim();
      const expertise = data.expertise || [];
      const wcm = data.whyChooseMe || [];
      const wcmFilled = wcm.some((s: string) => (s || '').trim().length > 0);
      if (!firstname) list.push('First name');
      if (!lastname) list.push('Last name');
      if (!bio) list.push('Bio');
      if (!expertise.length) list.push('At least one Area of Expertise');
      if (!wcmFilled) list.push('At least one "Why Choose Me?" point');
      setMissingItems(list);
    } catch {
      setMissingItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchAndCheck();
  }, [fetchAndCheck, location.pathname]);

  if (loading || user?.role !== 'trainer' || missingItems.length === 0) {
    return null;
  }

  return (
    <Alert
      variant="default"
      className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
    >
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Complete your profile
      </AlertTitle>
      <AlertDescription>
        <span className="text-sm text-amber-800 dark:text-amber-200">
          This message will stay until all required fields are filled in Settings.
        </span>
        <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm text-amber-700 dark:text-amber-300">
          {missingItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link
          to="/trainer/settings"
          className="mt-2 inline-block text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 dark:text-amber-200 dark:hover:text-amber-100"
        >
          Go to Settings →
        </Link>
      </AlertDescription>
    </Alert>
  );
};
