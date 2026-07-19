import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';


import { lazy, Suspense } from 'react';

import './i18n'; 

import GlobalStyle from '@/GlobalStyle';
import { AppWrapper } from '@/AppWrapper';

// 레이아웃 및 페이지 (Lazy load)
import { RootLayout } from '@/layouts/RootLayout';
const GrowthHubPage = lazy(() => import('@/pages/GrowthHubPage').then(m => ({ default: m.GrowthHubPage })));
const CreatorPage = lazy(() => import('@/pages/CreatorPage').then(m => ({ default: m.CreatorPage })));
const TalkPage = lazy(() => import('@/pages/TalkPage').then(m => ({ default: m.TalkPage })));
const MistakesPage = lazy(() => import('@/pages/MistakesPage').then(m => ({ default: m.MistakesPage })));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const ScriptListPage = lazy(() => import('@/pages/ScriptListPage').then(m => ({ default: m.ScriptListPage })));
const ScriptDetailPage = lazy(() => import('@/pages/ScriptDetailPage').then(m => ({ default: m.ScriptDetailPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage })));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
    {children}
  </Suspense>
);

if (new URLSearchParams(window.location.search).has('debug')) {
  import('eruda').then((eruda) => eruda.default.init());
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '/', element: <SuspenseWrapper><GrowthHubPage /></SuspenseWrapper> },
      { path: '/create', element: <SuspenseWrapper><CreatorPage /></SuspenseWrapper> },
      { path: '/talk/:scriptId', element: <SuspenseWrapper><TalkPage /></SuspenseWrapper> },
      { path: '/mistakes', element: <SuspenseWrapper><MistakesPage /></SuspenseWrapper> },
      { path: '/review', element: <SuspenseWrapper><ReviewPage /></SuspenseWrapper> },
      { path: '/history', element: <SuspenseWrapper><HistoryPage /></SuspenseWrapper> },

      { path: '/scripts', element: <SuspenseWrapper><ScriptListPage /></SuspenseWrapper> },
      { path: '/script/:id', element: <SuspenseWrapper><ScriptDetailPage /></SuspenseWrapper> },

      { path: '/privacy', element: <SuspenseWrapper><PrivacyPolicyPage /></SuspenseWrapper> },
      { path: '/terms', element: <SuspenseWrapper><TermsOfServicePage /></SuspenseWrapper> },
    ],
  },
]);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppWrapper>
          <GlobalStyle />
          <RouterProvider router={router} />
        </AppWrapper>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
