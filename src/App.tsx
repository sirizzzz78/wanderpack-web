import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useTrips } from './db/hooks';
import { checkAndNotify } from './lib/notifications';
import { checkStorageQuota } from './lib/storageCheck';

const TripSetupPage = lazy(() =>
  import('./pages/TripSetupPage').then(m => ({ default: m.TripSetupPage }))
);
const PackingListPage = lazy(() =>
  import('./pages/PackingListPage').then(m => ({ default: m.PackingListPage }))
);

function PageLoader() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--background)]">
      <Loader2 size={24} className="animate-spin text-[var(--lavender)]" />
    </div>
  );
}

export function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    () => localStorage.getItem('hasSeenOnboarding') === 'true'
  );
  const [storageWarning, setStorageWarning] = useState(false);

  const trips = useTrips();

  // Check-on-open notifications
  useEffect(() => {
    if (hasSeenOnboarding && trips.length > 0) {
      checkAndNotify(trips);
    }
  }, [hasSeenOnboarding, trips]);

  // Storage quota check
  useEffect(() => {
    checkStorageQuota().then(est => {
      if (est && est.usagePercent > 80) setStorageWarning(true);
    });
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  if (!hasSeenOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter basename="/readili-web">
      <ErrorBoundary>
        <div className="app-shell">
          {storageWarning && (
            <div className="bg-[var(--salmon)] text-white text-[13px] font-medium px-4 py-2 flex items-center gap-2 justify-center">
              <AlertTriangle size={14} /> Storage is almost full. Consider deleting old trips.
              <button onClick={() => setStorageWarning(false)} className="ml-2 underline text-[12px]">Dismiss</button>
            </div>
          )}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/setup" element={<TripSetupPage />} />
              <Route path="/trip/:id" element={<PackingListPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
