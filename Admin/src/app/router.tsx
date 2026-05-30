import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/modules/login/LoginPage';
import { TracksPage } from '@/modules/tracks/TracksPage';
import { UploadPage } from '@/modules/upload/UploadPage';

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="tracks" replace /> },
      { path: 'tracks', element: <TracksPage /> },
      { path: 'upload', element: <UploadPage /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/admin" replace />,
  },
]);
