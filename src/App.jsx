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
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-elevated)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'var(--color-success)',
              secondary: 'var(--color-success-foreground)',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: 'var(--color-destructive)',
              secondary: 'var(--color-destructive-foreground)',
            },
          },
        }}
      />
    </>
  );
}

export default App;
