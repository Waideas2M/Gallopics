import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhotographerProfile } from './pages/PhotographerProfile';
import { RiderProfile } from './pages/RiderProfile';
import { HorseProfile } from './pages/HorseProfile';
import { EventsPage } from './pages/EventsPage';
import { EventProfile } from './pages/EventProfile';

import { ImageProfile } from './pages/ImageProfile';
import { Cart } from './pages/Cart';
import ScrollToTop from './components/ScrollToTop';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { PhotographerProvider } from './context/PhotographerContext';

import { PhotographerBilling } from './pages/pg/Billing';
import { OnboardingProfile } from './pages/pg/onboarding/OnboardingProfile';
import { OnboardingReady } from './pages/pg/onboarding/OnboardingReady';
import { ProtectedRoute } from './components/ProtectedRoute';

// Photographer Workspace
import { PhotographerLayout } from './pages/pg/PhotographerLayout';
import { EventsList } from './pages/pg/EventsList';
import { EventDetail } from './pages/pg/EventDetail';
import { Settings } from './pages/pg/Settings';

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <PhotographerProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<EventsPage />} />
              <Route path="/event/:eventId" element={<EventProfile />} />
              <Route path="/photographer/:id" element={<PhotographerProfile />} />
              <Route path="/rider/:riderId" element={<RiderProfile />} />
              <Route path="/horse/:horseId" element={<HorseProfile />} />
              <Route path="/photo/:id" element={<ImageProfile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/photographerprofile" element={<PhotographerProfile />} />

              {/* Photographer Workspace (Layout-wrapped) */}
              <Route element={
                <ProtectedRoute>
                  <PhotographerLayout />
                </ProtectedRoute>
              }>
                <Route path="/pg/events" element={<EventsList />} />
                <Route path="/pg/events/:eventId" element={<EventDetail />} />
                <Route path="/pg/billing" element={<PhotographerBilling />} />
                <Route path="/pg/settings" element={<Settings />} />
              </Route>

              <Route path="/pg" element={<Navigate to="/pg/events" replace />} />

              {/* Photographer Onboarding (Fullscreen) */}
              <Route path="/pg/onboarding/profile" element={
                <ProtectedRoute>
                  <OnboardingProfile />
                </ProtectedRoute>
              } />
              <Route path="/pg/onboarding/ready" element={
                <ProtectedRoute>
                  <OnboardingReady />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </PhotographerProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
