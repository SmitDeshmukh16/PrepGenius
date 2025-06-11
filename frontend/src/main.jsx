import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </LanguageProvider>
  </StrictMode>
);