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
      <h1>Import Customers</h1>
      <p className={styles.description}>
        Import customer data from CSV or Excel files. Required columns: name, email, phone
      </p>

      <div className={`card ${styles.uploadCard}`}>
        <div className={styles.uploadArea}>
          <div className={styles.uploadIcon}>+</div>
          <h3>Select File to Import</h3>
          <p>Supported formats: CSV, XLSX, XLS</p>
          <button
            className="btn btn-primary"
            onClick={handleSelectFile}
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Select File'}
          </button>
        </div>
      </div>

      {error && (
        <div className={`card ${styles.errorCard}`}>
          <h3>Import Failed</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={`card ${styles.resultCard}`}>
          <h3>Import Complete</h3>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{result.total}</span>
              <span className={styles.statLabel}>Total Rows</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.success}`}>{result.success}</span>
              <span className={styles.statLabel}>Imported</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.error}`}>{result.failed}</span>
              <span className={styles.statLabel}>Failed</span>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className={styles.errors}>
              <h4>Errors</h4>
              <ul>
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>
                    Row {err.row}: {err.field} - {err.message}
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li>...and {result.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className={`card ${styles.templateCard}`}>
        <h3>File Format</h3>
        <p>Your file should have the following columns:</p>
        <table className="table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Required</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>name</td>
              <td>Yes</td>
              <td>John Doe</td>
            </tr>
            <tr>
              <td>email</td>
              <td>Yes</td>
              <td>john@example.com</td>
            </tr>
            <tr>
              <td>phone</td>
              <td>Yes</td>
              <td>010-1234-5678</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ImportPage;
