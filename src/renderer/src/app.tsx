import { AppContent } from './app-content.tsx';
import { AppProviders } from './app.provider.tsx';

export function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
