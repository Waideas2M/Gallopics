import { useEffect } from 'react';
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
import { WorkspaceProvider } from './context/WorkspaceContext';

import { PhotographerBilling } from './pages/pg/Billing';
import { OnboardingProfile } from './pages/pg/onboarding/OnboardingProfile';
import { OnboardingReady } from './pages/pg/onboarding/OnboardingReady';
import { ProtectedRoute } from './components/ProtectedRoute';

// Photographer Workspace
import { PhotographerLayout } from './pages/pg/PhotographerLayout';
import { EventsList } from './pages/pg/EventsList';
import { EventDetail } from './pages/pg/EventDetail';

import { Settings } from './pages/pg/Settings';
import { TokensPage } from './pages/pg/TokensPage';
import { UploadPage } from './pages/pg/UploadPage';
import { SoldPhotos } from './pages/pg/SoldPhotos';
import { Receipts } from './pages/pg/Receipts';
import { Photographers } from './pages/pg/Photographers';

function App() {
  useEffect(() => {
    // Ensure app boot всегда lands clean: no search overlay/scroll-lock leftovers
    document.body.style.overflow = '';
    document.body.classList.remove('isSearchMode');
  }, []);

  return (
    <CartProvider>
      <AuthProvider>
        <PhotographerProvider>
          <BrowserRouter>
            <WorkspaceProvider>
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
                  <Route path="/pg/sold" element={<SoldPhotos />} />
                  <Route path="/pg/receipts" element={<Receipts />} />
                  <Route path="/pg/billing" element={<PhotographerBilling />} />
                  <Route path="/pg/settings" element={<Settings />} />
                  <Route path="/pg/tokens" element={<TokensPage />} />

                  {/* Admin Workspace (Cloned) */}
                  <Route path="/admin/events" element={<EventsList />} />
                  <Route path="/admin/events/:eventId" element={<EventDetail />} />
                  <Route path="/admin/sold" element={<SoldPhotos />} />
                  <Route path="/admin/receipts" element={<Receipts />} />
                  <Route path="/admin/billing" element={<PhotographerBilling />} />
                  <Route path="/admin/settings" element={<Settings />} />
                  <Route path="/admin/tokens" element={<TokensPage />} />
                  <Route path="/admin/photographers" element={<Photographers />} />
                </Route>

                <Route path="/pg/upload" element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } />

                <Route path="/admin/upload" element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } />

                <Route path="/pg" element={<Navigate to="/pg/events" replace />} />
                <Route path="/admin" element={<Navigate to="/admin/events" replace />} />

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
            </WorkspaceProvider>
          </BrowserRouter>
        </PhotographerProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
