import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmailHistory, type PaginatedEmailHistory } from '../lib/api';
import styles from './HistoryPage.module.css';

// 체크 아이콘
const CheckIcon = () => (
  <svg className={styles.badgeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaginatedEmailHistory | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    loadHistory();
  }, [page]);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const result = await getEmailHistory(page, pageSize);
      setData(result);
    } catch (err) {
      setError('히스토리를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function extractSubject(note: string | null): string {
    if (!note) return '-';
    const match = note.match(/^Subject:\s*(.+)$/);
    return match ? match[1] : note;
  }

  if (loading && !data) {
    return (
      <div className={styles.page}>
        <h1>발송 히스토리</h1>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1>발송 히스토리</h1>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className={styles.page}>
        <h1>발송 히스토리</h1>
        <div className={styles.empty}>
          <h3>발송 기록이 없습니다</h3>
          <p>이메일을 발송하면 여기에 기록됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>발송 히스토리</h1>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>총 발송 건수</div>
          <div className={`${styles.statValue} ${styles.primary}`}>{data.total}</div>
        </div>
      </div>

      <div className="card">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>상태</th>
              <th>고객명</th>
              <th>이메일</th>
              <th>제목</th>
              <th>발송일시</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className={styles.badge}>
                    <CheckIcon />
                    발송됨
                  </span>
                </td>
                <td>
                  <Link to={`/customer/${item.customerId}`} className={styles.customerLink}>
                    {item.customerName}
                  </Link>
                </td>
                <td className={styles.email}>{item.customerEmail}</td>
                <td className={styles.subject} title={extractSubject(item.note)}>
                  {extractSubject(item.note)}
                </td>
                <td className={styles.date}>{formatDate(item.contactedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              이전
            </button>
            <span className={styles.pageInfo}>
              {page} / {data.totalPages} 페이지
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages || loading}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
