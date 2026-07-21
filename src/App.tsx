import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './components/login'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './components/admin/Dashboard'
import IncomingList from './components/admin/IncomingList'
import AllDeposits from './components/admin/AllDeposits'
import RackDashboard from './components/admin/RackDashboard'
import PrintRackQr from './components/admin/PrintRackQr'
import ReturnForm from './components/admin/ReturnForm'
import PlaceDeposit from './components/admin/PlaceDeposit'
import DepositQrPage from './components/admin/DepositQrPage'
import PublicDepositDetail from './components/public/PublicDepositDetail'
import RackQrPage from './components/admin/RackQrPage'
import PublicRackDetail from './components/public/PublicRackDetail'
import ItemDepositForm from './components/public/ItemDepositForm'
import ProtectedRoute from './components/ProtectedRoute'
import AddExistingDeposit from './components/admin/AddExistingDeposit'
import ManageAdmins from './components/admin/ManageAdmin'
import PublicFormQrPage from './components/admin/PublicFormQrCode'
import ResetPassword from './components/login/ResetPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/penitipan-barang" replace />} />
        <Route path="/penitipan-barang" element={<ItemDepositForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/deposit/:depositRequestId" element={<PublicDepositDetail />} />
        <Route path="/rack/:rackLocationId" element={<PublicRackDetail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="incoming" element={<IncomingList />} />
            <Route path="deposits" element={<AllDeposits />} />
            <Route path="racks" element={<RackDashboard />} />
            <Route path="print-rack-qr" element={<PrintRackQr />} />
            <Route path="return" element={<ReturnForm />} />
            <Route
              path="deposits/:depositRequestId/place"
              element={<PlaceDeposit />}
            />
            <Route
              path="deposits/:depositRequestId/qr"
              element={<DepositQrPage />}
            />
            <Route
              path="racks/:rackLocationId/qr"
              element={<RackQrPage />}
            />
            <Route path="manage-admins" element={<ManageAdmins />} />
            <Route path="add-existing" element={<AddExistingDeposit />} />
            <Route path="/admin/public-form-qr" element={<PublicFormQrPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/penitipan-barang" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App