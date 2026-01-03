import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import CreateTrip from './screens/CreateTrip';
import BuildItinerary from './screens/BuildItinerary';
import TripListing from './screens/TripListing';
import Profile from './screens/Profile';
import Search from './screens/Search';
import ItineraryView from './screens/ItineraryView';
import Community from './screens/Community';
import CalendarView from './screens/CalendarView';
import AdminPanel from './screens/AdminPanel';
import PublicTrip from './screens/PublicTrip';
import BudgetBreakdown from './screens/BudgetBreakdown';
import CitySearch from './screens/CitySearch';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/:slug" element={<PublicTrip />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/new"
            element={
              <PrivateRoute>
                <CreateTrip />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/builder/:tripId"
            element={
              <PrivateRoute>
                <BuildItinerary />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <PrivateRoute>
                <TripListing />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/view/:tripId"
            element={
              <PrivateRoute>
                <ItineraryView />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            }
          />
          <Route
            path="/search/cities"
            element={
              <PrivateRoute>
                <CitySearch />
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar/:tripId"
            element={
              <PrivateRoute>
                <CalendarView />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/trips/budget/:tripId"
            element={
              <PrivateRoute>
                <BudgetBreakdown />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

