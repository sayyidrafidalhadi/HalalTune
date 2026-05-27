import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/modules/login/LoginPage';
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { TracksPage } from '@/modules/tracks/TracksPage';
import { ArtistsPage } from '@/modules/artists/ArtistsPage';
import { AlbumsPage } from '@/modules/albums/AlbumsPage';
import { PlaylistsPage } from '@/modules/playlists/PlaylistsPage';
import { PodcastsPage } from '@/modules/podcasts/PodcastsPage';
import { ReportsPage } from '@/modules/reports/ReportsPage';
import { UsersPage } from '@/modules/users/UsersPage';
import { CategoriesPage } from '@/modules/categories/CategoriesPage';
import { AnalyticsPage } from '@/modules/analytics/AnalyticsPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tracks', element: <TracksPage /> },
      { path: 'artists', element: <ArtistsPage /> },
      { path: 'albums', element: <AlbumsPage /> },
      { path: 'playlists', element: <PlaylistsPage /> },
      { path: 'podcasts', element: <PodcastsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
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
