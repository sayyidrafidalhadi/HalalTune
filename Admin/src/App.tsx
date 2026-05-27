import { RouterProvider } from 'react-router-dom';
import { QueryProvider, AuthProvider } from '@/providers';
import { Toaster } from 'react-hot-toast';
import { router } from '@/app/router';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#121212',
              color: '#fff',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
