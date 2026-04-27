import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: '#fffaf6',
            color: '#3a1a1a',
            border: '1px solid #dcd8d2',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(58, 26, 26, 0.12)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#27864a',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#c0392b',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
