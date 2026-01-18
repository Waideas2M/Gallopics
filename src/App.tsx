import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PhotographerProfile } from './pages/PhotographerProfile';
import { RiderProfile } from './pages/RiderProfile';
import { HorseProfile } from './pages/HorseProfile';
import { EventsPage } from './pages/EventsPage';
import { EventProfile } from './pages/EventProfile';

import { ImageProfile } from './pages/ImageProfile';
import { Cart } from './pages/Cart';
import ScrollToTop from './components/ScrollToTop';

import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:eventId" element={<EventProfile />} />
          <Route path="/photographer/:id" element={<PhotographerProfile />} />
          <Route path="/rider/:riderId" element={<RiderProfile />} />
          <Route path="/horse/:horseId" element={<HorseProfile />} />
          <Route path="/photo/:id" element={<ImageProfile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/photographerprofile" element={<PhotographerProfile />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
