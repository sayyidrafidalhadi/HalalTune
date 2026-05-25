import { AuthProvider, useAuth } from "./hooks/useAuth";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Moderation } from "./pages/Moderation";
import { UploadPage } from "./pages/Upload";
import { Artists } from "./pages/Artists";
import { Reports } from "./pages/Reports";
import { Categories } from "./pages/Categories";
import { Users } from "./pages/Users";
import { Settings } from "./pages/Settings";
import { LoginPage } from "./pages/Login";
import { useSidebarStore } from "./store/useSidebarStore";

function AppContent() {
  const { user } = useAuth();
  const activePage = useSidebarStore((state) => state.activePage);

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'analytics': return <Analytics />;
      case 'moderation': return <Moderation />;
      case 'tracks': return <UploadPage />;
      case 'artists': return <Artists />;
      case 'reports': return <Reports />;
      case 'categories': return <Categories />;
      case 'users': return <Users />;
      case 'settings': return <Settings />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-bold mb-2">Section Under Construction</h2>
          <p className="text-muted-foreground">The {activePage} section is coming soon.</p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout>
      {renderPage()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
