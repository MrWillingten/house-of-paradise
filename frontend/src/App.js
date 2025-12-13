import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import Trips from './pages/Trips';
import HotelDetail from './pages/HotelDetail';
import TripDetail from './pages/TripDetail';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordSuccess from './pages/ResetPasswordSuccess';
import Profile from './pages/Profile';
import Account from './pages/Account';
import NewsletterVerify from './pages/NewsletterVerify';
import Wishlist from './pages/Wishlist';
import Loyalty from './pages/Loyalty';
import './App.css';
import './styles/global.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trip/:id" element={<TripDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/newsletter/verify" element={<NewsletterVerify />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;