import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer, createCustomer, searchCustomers, getErrorMessage } from '../lib/api';
import type { CustomerWithContacts, CreateCustomerDto } from '@ppop/types';
import styles from './CustomerList.module.css';

function CustomerList() {
  const [customers, setCustomers] = useState<CustomerWithContacts[]>([]);
  const [searchResults, setSearchResults] = useState<CustomerWithContacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    email: '',
    phone: '',
  });

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCustomers(page);
      setCustomers(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // 디바운스된 검색
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCustomers(searchQuery.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadCustomers();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 고객을 삭제하시겠습니까?')) return;
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`삭제 실패: ${errorMsg}`);
      console.error('Failed to delete customer:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCustomer(formData);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '' });
      loadCustomers();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`고객 추가 실패: ${errorMsg}`);
      console.error('Failed to create customer:', err);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const displayCustomers = searchQuery.trim() ? searchResults : customers;
  const showPagination = !searchQuery.trim();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1>고객 목록</h1>
          <span className={styles.totalCount}>총 {totalCount.toLocaleString()}명</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          고객 추가
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          className="input"
          placeholder="이름, 이메일, 전화번호로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className={styles.clearBtn}
            onClick={() => setSearchQuery('')}
            title="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>

      {searchQuery.trim() && (
        <div className={styles.searchInfo}>
          {isSearching ? (
            <span>검색 중...</span>
          ) : (
            <span>{searchResults.length}개의 검색 결과</span>
          )}
        </div>
      )}

      {error && (
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorContent}>
            <strong>오류 발생</strong>
            <p>{error}</p>
          </div>
          <button className="btn btn-outline" onClick={loadCustomers}>
            다시 시도
          </button>
        </div>
      )}

      {loading && !searchQuery ? (
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
                {displayCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.noResults}>
                      {searchQuery.trim() ? '검색 결과가 없습니다' : '고객이 없습니다'}
                    </td>
                  </tr>
                ) : (
                  displayCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <Link to={`/customer/${customer.id}`} className={styles.nameLink}>
                          {customer.name}
                        </Link>
                      </td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <span className="badge badge-success">
                          {customer.totalContacts}
                        </span>
                      </td>
                      <td>
                        {customer.recentContacts?.length > 0
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showPagination && (
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
          )}
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
