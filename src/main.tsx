import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import { RootLayout } from '@/layouts/RootLayout';
import { GrowthHubPage } from '@/pages/GrowthHubPage';
import { CreatorPage } from '@/pages/CreatorPage';
import { TalkPage } from '@/pages/TalkPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { ScriptListPage } from '@/pages/ScriptListPage';

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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
