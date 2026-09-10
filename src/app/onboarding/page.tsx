'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/components/OnboardingProvider';
// Compatibility entry point for Settings and saved links. The guide lives inside the app.
export default function OnboardingPage() {
  const { preferences } = useOnboarding();
  const router = useRouter();
  useEffect(() => {
    if (preferences) router.replace(preferences.onboarding_step === 3 ? '/library' : '/search');
  }, [preferences, router]);
  return (
    <p role="status" className="p-8 text-center">
      Preparando tu bienvenida…
    </p>
  );
}
