import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import ImportPage from './pages/ImportPage';
import EmailPage from './pages/EmailPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CustomerList />} />
        <Route path="/customer/:id" element={<CustomerDetail />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/email" element={<EmailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
