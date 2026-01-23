import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react'; //  Emotion 불러오기
import { HelmetProvider } from 'react-helmet-async';

import { theme } from '@/styles/theme';
import GlobalStyle from '@/GlobalStyle';

// 레이아웃 및 페이지
import { RootLayout } from '@/layouts/RootLayout';
import { GrowthHubPage } from '@/pages/GrowthHubPage';
import { CreatorPage } from '@/pages/CreatorPage';
import { TalkPage } from '@/pages/TalkPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { ScriptListPage } from '@/pages/ScriptListPage';
import { ScriptDetailPage } from '@/pages/ScriptDetailPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '/', element: <GrowthHubPage /> },
      { path: '/create', element: <CreatorPage /> },
      { path: '/talk/:scriptId', element: <TalkPage /> },
      { path: '/review', element: <ReviewPage /> },
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
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
