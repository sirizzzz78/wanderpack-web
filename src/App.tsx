import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { TripSetupPage } from './pages/TripSetupPage';
import { PackingListPage } from './pages/PackingListPage';
import { useTrips } from './db/hooks';
import { checkAndNotify } from './lib/notifications';

export function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    () => localStorage.getItem('hasSeenOnboarding') === 'true'
  );

  const trips = useTrips();

  // Check-on-open notifications
  useEffect(() => {
    if (hasSeenOnboarding && trips.length > 0) {
      checkAndNotify(trips);
    }
  }, [hasSeenOnboarding, trips]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setHasSeenOnboarding(true);
  };

  if (!hasSeenOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter basename="/readili-web">
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<TripSetupPage />} />
          <Route path="/trip/:id" element={<PackingListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
