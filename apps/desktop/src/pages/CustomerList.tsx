import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer, createCustomer } from '../lib/api';
import type { CustomerWithContacts, CreateCustomerDto } from '@ppop/types';
import styles from './CustomerList.module.css';

function CustomerList() {
  const [customers, setCustomers] = useState<CustomerWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    email: '',
    phone: '',
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await getCustomers(page);
      setCustomers(result.items);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 고객을 삭제하시겠습니까?')) return;
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      loadCustomers();
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>고객 목록</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          고객 추가
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>불러오는 중...</div>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>컨택 횟수</th>
                  <th>최근 컨택</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <Link to={`/customer/${customer.id}`} className={styles.nameLink}>
                        {customer.name}
                      </Link>
                    </td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className="badge badge-success">{customer.totalContacts}</span>
                    </td>
                    <td>
                      {customer.recentContacts.length > 0
                        ? formatDate(customer.recentContacts[0].contactedAt)
                        : '-'}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleDelete(customer.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              className="btn btn-outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              이전
            </button>
            <span>
              {page} / {totalPages} 페이지
            </span>
            <button
              className="btn btn-outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>고객 추가</h2>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>이름</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>이메일</label>
                <input
                  className="input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>전화번호</label>
                <input
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerList;
