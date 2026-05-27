export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CREATOR: 'creator',
  USER: 'user',
} as const;

export const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 100,
  admin: 80,
  moderator: 60,
  creator: 40,
  user: 20,
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Tracks', path: '/admin/tracks', icon: 'Music' },
  { label: 'Artists', path: '/admin/artists', icon: 'Mic2' },
  { label: 'Albums', path: '/admin/albums', icon: 'Album' },
  { label: 'Playlists', path: '/admin/playlists', icon: 'ListMusic' },
  { label: 'Podcasts', path: '/admin/podcasts', icon: 'Podcast' },
  { label: 'Reports', path: '/admin/reports', icon: 'Flag' },
  { label: 'Users', path: '/admin/users', icon: 'Users' },
  { label: 'Categories', path: '/admin/categories', icon: 'Tags' },
  { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
] as const;
