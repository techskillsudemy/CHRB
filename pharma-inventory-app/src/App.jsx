// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Hopitaux from './pages/admin/Hopitaux.jsx';
import Utilisateurs from './pages/admin/Utilisateurs.jsx';
import DepotDashboard from './pages/depot/Dashboard.jsx';
import Saisie from './pages/depot/Saisie.jsx';
import Stock from './pages/depot/Stock.jsx';
import Historique from './pages/depot/Historique.jsx';
import Rapport from './pages/depot/Rapport.jsx';
import Mouvements from './pages/depot/Mouvements.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route element={<Layout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/hopitaux" element={<Hopitaux />} />
                <Route path="/admin/utilisateurs" element={<Utilisateurs />} />
              </Route>
            </Route>

            {/* Depot routes */}
            <Route element={<ProtectedRoute allowedRoles={['responsable', 'directeur', 'agent', 'super_admin']} />}>
              <Route element={<Layout />}>
                <Route path="/depot/dashboard" element={<DepotDashboard />} />
                <Route path="/depot/saisie" element={<ProtectedRoute allowedRoles={['responsable', 'agent', 'super_admin']}><Saisie /></ProtectedRoute>} />
                <Route path="/depot/stock" element={<Stock />} />
                <Route path="/depot/historique" element={<Historique />} />
                <Route path="/depot/rapport" element={<ProtectedRoute allowedRoles={['responsable', 'directeur', 'super_admin']}><Rapport /></ProtectedRoute>} />
                <Route path="/depot/mouvements" element={<ProtectedRoute allowedRoles={['responsable', 'agent', 'super_admin']}><Mouvements /></ProtectedRoute>} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
