import { AppProviders } from '@/providers/AppProviders';
import { AppRouter } from '@/routes';
import { useInitializeAuth } from '@/features/auth/useInitializeAuth';

// 1. We create a NEW component just for the content
function AppContent() {
    // This now works because AppContent is rendered INSIDE AppProviders
    useInitializeAuth();
    
    return <AppRouter />;
}

// 2. The main App component ONLY wraps things in providers
function App() {
    return (
        <AppProviders>
            <AppContent />
        </AppProviders>
    );
}

export default App;