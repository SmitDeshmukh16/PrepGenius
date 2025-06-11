import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import ForgotPassword from '../pages/ForgotPassword';
import DsaSheet from '../pages/dashboard/DsaSheet';
import Sessions from '../pages/dashboard/Sessions';
import PlacementCalendar from '../pages/dashboard/PlacementCalendar';
import ResumeAnalyzer from '../pages/dashboard/ResumeAnalyzer';
import AtsScore from '../pages/dashboard/AtsScore';
import McqGenerator from '../pages/dashboard/McqGenerator';
import EyeTracking from '../pages/dashboard/EyeTracking';
import InterviewBot from '../pages/dashboard/InterviewBot';
import YoutubeLearn from '../pages/dashboard/YoutubeLearn';
import EduGames from '../pages/dashboard/EduGames';

const ProtectedRoute = ({ children, allowedRoles = ['farmer', 'enterprise'], readOnly = false }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard/dsa-sheet" replace />;
  }

  return React.cloneElement(children, { readOnly: readOnly && userRole === 'farmer' });
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
      { 
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
        children: [
          { index: true, element: <Navigate to="dsa-sheet" replace /> },
          {
            path: 'dsa-sheet',
            element: <ProtectedRoute allowedRoles={['farmer', 'enterprise']} readOnly={true}><DsaSheet /></ProtectedRoute>
          },
          {
            path: 'sessions',
            element: <ProtectedRoute allowedRoles={['farmer', 'enterprise']} readOnly={true}><Sessions /></ProtectedRoute>
          },
          {
            path: 'placement-calendar',
            element: <ProtectedRoute allowedRoles={['farmer', 'enterprise']} readOnly={true}><PlacementCalendar /></ProtectedRoute>
          },
          {
            path: 'resume-analyzer',
            element: <ProtectedRoute allowedRoles={['farmer']}><ResumeAnalyzer /></ProtectedRoute>
          },
          {
            path: 'ats-score',
            element: <ProtectedRoute allowedRoles={['farmer']}><AtsScore /></ProtectedRoute>
          },
          {
            path: 'mcq-generator',
            element: <ProtectedRoute allowedRoles={['farmer', 'enterprise']}><McqGenerator /></ProtectedRoute>
          },
          {
            path: 'eye-tracking',
            element: <ProtectedRoute allowedRoles={['farmer']}><EyeTracking /></ProtectedRoute>
          },
          {
            path: 'interview-bot',
            element: <ProtectedRoute allowedRoles={['farmer']}><InterviewBot /></ProtectedRoute>
          },
           {
            path: 'youtube-learn',
            element: <ProtectedRoute allowedRoles={['farmer']}><YoutubeLearn /></ProtectedRoute>
          },
          {
            path: 'edu-games',
            element: <ProtectedRoute allowedRoles={['farmer']}><EduGames /></ProtectedRoute>
          }
        ]
      },
      { 
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      { 
        path: 'settings',
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> }
    ]
  }
]);