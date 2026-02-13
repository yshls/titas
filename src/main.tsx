import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import GlobalStyle from '@/GlobalStyle';
import { AppWrapper } from '@/AppWrapper';

// 레이아웃 및 페이지
import { RootLayout } from '@/layouts/RootLayout';
import { GrowthHubPage } from '@/pages/GrowthHubPage';
import { CreatorPage } from '@/pages/CreatorPage';
import { TalkPage } from '@/pages/TalkPage';
import { MistakesPage } from '@/pages/MistakesPage';
import ReviewPage from '@/pages/ReviewPage';
import { ScriptListPage } from '@/pages/ScriptListPage';
import { ScriptDetailPage } from '@/pages/ScriptDetailPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { HistoryPage } from '@/pages/HistoryPage';

if (new URLSearchParams(window.location.search).has('debug')) {
  import('eruda').then((eruda) => eruda.default.init());
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '/', element: <GrowthHubPage /> },
      { path: '/create', element: <CreatorPage /> },
      { path: '/talk/:scriptId', element: <TalkPage /> },
      { path: '/mistakes', element: <MistakesPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/history', element: <HistoryPage /> },

      { path: '/scripts', element: <ScriptListPage /> },
      { path: '/script/:id', element: <ScriptDetailPage /> },

      { path: '/privacy', element: <PrivacyPolicyPage /> },
      { path: '/terms', element: <TermsOfServicePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppWrapper>
        <GlobalStyle />
        <RouterProvider router={router} />
      </AppWrapper>
    </HelmetProvider>
  </React.StrictMode>,
);
