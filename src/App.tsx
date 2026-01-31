import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { SongsProvider } from './context/SongsContext';
import { UIProvider } from './context/UIContext';
import { AppRouter } from './routes';
import { Toast } from './common/Toast';

function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <SongsProvider>
          <PlayerProvider>
            <AppRouter />
            <Toast />
          </PlayerProvider>
        </SongsProvider>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
