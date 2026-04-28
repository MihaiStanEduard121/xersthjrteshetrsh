/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { PresentationHost } from './components/PresentationHost';
import { PresentationViewer } from './components/PresentationViewer';
import { PresenterScreen } from './components/PresenterScreen';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/p/:id/host" element={<PresentationHost />} />
          <Route path="/p/:id/presenter" element={<PresenterScreen />} />
          <Route path="/p/:id" element={<PresentationViewer />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
