import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LandingPage } from '@/components/LandingPage';
import { LobbyScreen } from '@/components/LobbyScreen';
import { Gameboard } from '@/components/Gameboard';

// Root layout component that wraps all routes
function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background font-sans">{children}</main>
  );
}

// Define your routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <LandingPage onEnter={() => {}} />
      </RootLayout>
    ),
  },
  {
    path: '/lobby',
    element: (
      <RootLayout>
        <LobbyScreen />
      </RootLayout>
    ),
  },
  {
    path: '/game',
    element: (
      <RootLayout>
        <Gameboard />
      </RootLayout>
    ),
  },
  {
    path: '*',
    element: (
      <RootLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mt-2 text-muted-foreground">Page not found</p>
            <a
              href="/"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Go back home
            </a>
          </div>
        </div>
      </RootLayout>
    ),
  },
]);

// Router component to use in your app
export function AppRouter() {
  return <RouterProvider router={router} />;
}
