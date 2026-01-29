import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import ImportPage from './pages/ImportPage';
import EmailPage from './pages/EmailPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CustomerList />} />
        <Route path="/customer/:id" element={<CustomerDetail />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/email" element={<EmailPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
