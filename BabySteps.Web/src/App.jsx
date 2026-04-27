import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';

// Shared
import Header from './components/Header';
import GuestRegisterModal from './components/GuestRegisterModal';

// Root / Host pages
import LandingPage from './pages/LandingPage';
import HostRegisterPage from './pages/host/HostRegisterPage';
import HostLoginPage from './pages/host/HostLoginPage';
import CreateEventPage from './pages/host/CreateEventPage';
import HostDashboard from './pages/host/HostDashboard';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

// Event guest pages (nested under /e/:slug)
import EventLayout from './pages/event/EventLayout';
import EventHomePage from './pages/event/EventHomePage';
import EventCategoriesPage from './pages/event/EventCategoriesPage';
import EventCategoryProductsPage from './pages/event/EventCategoryProductsPage';
import EventStoresPage from './pages/event/EventStoresPage';
import EventStoreProductsPage from './pages/event/EventStoreProductsPage';
import EventNappyListPage from './pages/event/EventNappyListPage';
import EventSearchPage from './pages/event/EventSearchPage';
import EventReservedPage from './pages/event/EventReservedPage';
import EventRegisterPage from './pages/event/EventRegisterPage';

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <BrowserRouter>
          <Header />
          <GuestRegisterModal />
          <main>
            <Routes>
              {/* Root - landing for new hosts */}
              <Route path="/" element={<LandingPage />} />

              {/* Host auth & management */}
              <Route path="/host/register" element={<HostRegisterPage />} />
              <Route path="/host/login" element={<HostLoginPage />} />
              <Route path="/host/create-event" element={<CreateEventPage />} />
              <Route path="/host/dashboard" element={<HostDashboard />} />

              {/* Super admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/superadmin" element={<SuperAdminDashboard />} />

              {/* Event guest experience */}
              <Route path="/e/:slug" element={<EventLayout />}>
                <Route index element={<EventHomePage />} />
                <Route path="categories" element={<EventCategoriesPage />} />
                <Route path="category/:id" element={<EventCategoryProductsPage />} />
                <Route path="stores" element={<EventStoresPage />} />
                <Route path="stores/:id" element={<EventStoreProductsPage />} />
                <Route path="nappy-list" element={<EventNappyListPage />} />
                <Route path="search" element={<EventSearchPage />} />
                <Route path="reserved" element={<EventReservedPage />} />
                <Route path="register" element={<EventRegisterPage />} />
              </Route>
            </Routes>
          </main>
        </BrowserRouter>
      </EventProvider>
    </AuthProvider>
  );
}
