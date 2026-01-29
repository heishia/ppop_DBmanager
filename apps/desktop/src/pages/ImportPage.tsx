import { useState } from 'react';
import { importFromBuffer } from '../lib/api';
import type { ImportResult } from '@ppop/types';
import styles from './ImportPage.module.css';

function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async () => {
    setError(null);
    setResult(null);

    try {
      const file = await window.electronAPI.openFile();
      if (!file) return;

      setLoading(true);
      const importResult = await importFromBuffer(file.buffer, file.name);
      setResult(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1>고객 가져오기</h1>
      <p className={styles.description}>
        CSV 또는 Excel 파일에서 고객 데이터를 가져옵니다. 필수 컬럼: name, email, phone
      </p>

      <div className={`card ${styles.uploadCard}`}>
        <div className={styles.uploadArea}>
          <div className={styles.uploadIcon}>+</div>
          <h3>가져올 파일 선택</h3>
          <p>지원 형식: CSV, XLSX, XLS</p>
          <button
            className="btn btn-primary"
            onClick={handleSelectFile}
            disabled={loading}
          >
            {loading ? '가져오는 중...' : '파일 선택'}
          </button>
        </div>
      </div>

      {error && (
        <div className={`card ${styles.errorCard}`}>
          <h3>가져오기 실패</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={`card ${styles.resultCard}`}>
          <h3>가져오기 완료</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{result.total}</span>
              <span className={styles.statLabel}>전체 행</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.success}`}>{result.success}</span>
              <span className={styles.statLabel}>성공</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.error}`}>{result.failed}</span>
              <span className={styles.statLabel}>실패</span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className={styles.errors}>
              <h4>오류 목록</h4>
              <ul>
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>
                    {err.row}행: {err.field} - {err.message}
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li>...외 {result.errors.length - 10}개 오류</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={`card ${styles.templateCard}`}>
        <h3>파일 형식</h3>
        <p>파일에 다음 컬럼이 포함되어야 합니다:</p>
        <table className="table">
          <thead>
            <tr>
              <th>컬럼명</th>
              <th>필수</th>
              <th>예시</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>name</td>
              <td>예</td>
              <td>홍길동</td>
            </tr>
            <tr>
              <td>email</td>
              <td>예</td>
              <td>hong@example.com</td>
            </tr>
            <tr>
              <td>phone</td>
              <td>예</td>
              <td>010-1234-5678</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImportPage;
