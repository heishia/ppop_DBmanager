import { useState } from 'react';
import { importFromBuffer, previewFromBuffer, type PreviewResult, type ColumnMapping } from '../lib/api';
import type { ImportResult } from '@ppop/types';
import styles from './ImportPage.module.css';

type Step = 'select' | 'preview' | 'result';

function ImportPage() {
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ buffer: string; name: string } | null>(null);

  const handleSelectFile = async () => {
    setError(null);
    setResult(null);
    setPreview(null);

    try {
      const file = await window.electronAPI.openFile();
      if (!file) return;

      setFileData({ buffer: file.buffer, name: file.name });
      setLoading(true);
      setLoadingMessage('AI가 데이터를 분석 중...');

      const previewResult = await previewFromBuffer(file.buffer, file.name);
      setPreview(previewResult);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 분석 실패');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleImport = async () => {
    if (!fileData || !preview?.mapping) return;

    try {
      setLoading(true);
      setLoadingMessage('데이터를 가져오는 중...');

      const importResult = await importFromBuffer(fileData.buffer, fileData.name, preview.mapping);
      setResult(importResult);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '가져오기 실패');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleReset = () => {
    setStep('select');
    setPreview(null);
    setResult(null);
    setError(null);
    setFileData(null);
  };

  return (
    <div className={styles.page}>
      <h1>고객 가져오기</h1>
      <p className={styles.description}>
        CSV 또는 Excel 파일에서 고객 데이터를 가져옵니다. AI가 자동으로 열을 매핑해요!
      </p>

      {/* Step Indicator */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${step === 'select' ? styles.active : ''} ${step !== 'select' ? styles.done : ''}`}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepLabel}>파일 선택</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step === 'preview' ? styles.active : ''} ${step === 'result' ? styles.done : ''}`}>
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepLabel}>AI 분석</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step === 'result' ? styles.active : ''}`}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>완료</span>
        </div>
      </div>

      {error && (
        <div className={`card ${styles.errorCard}`}>
          <h3>오류 발생</h3>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={handleReset}>
            다시 시도
          </button>
        </div>
      )}

      {/* Step 1: File Select */}
      {step === 'select' && !loading && (
        <div className={`card ${styles.uploadCard}`}>
          <div className={styles.uploadArea}>
            <div className={styles.uploadIcon}>+</div>
            <h3>가져올 파일 선택</h3>
            <p>지원 형식: CSV, XLSX, XLS</p>
            <p className={styles.aiNote}>어떤 열 이름이든 AI가 자동으로 분석해요!</p>
            <button
              className="btn btn-primary"
              onClick={handleSelectFile}
              disabled={loading}
            >
              파일 선택
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={`card ${styles.loadingCard}`}>
          <div className={styles.spinner} />
          <p>{loadingMessage}</p>
        </div>
      )}

      {/* Step 2: Preview & Confirm */}
      {step === 'preview' && preview && !loading && (
        <div className={styles.previewSection}>
          {/* AI Mapping Result */}
          <div className={`card ${styles.mappingCard}`}>
            <h3>AI 분석 결과</h3>
            <p className={styles.fileInfo}>
              파일: <strong>{fileData?.name}</strong> ({preview.totalRows}행)
            </p>

            {preview.mapping ? (
              <div className={styles.mappingGrid}>
                <div className={styles.mappingItem}>
                  <span className={styles.mappingLabel}>이름 (name)</span>
                  <span className={styles.mappingArrow}>←</span>
                  <span className={styles.mappingSource}>{preview.mapping.name || '매핑 없음'}</span>
                </div>
                <div className={styles.mappingItem}>
                  <span className={styles.mappingLabel}>이메일 (email)</span>
                  <span className={styles.mappingArrow}>←</span>
                  <span className={styles.mappingSource}>{preview.mapping.email || '매핑 없음'}</span>
                </div>
                <div className={styles.mappingItem}>
                  <span className={styles.mappingLabel}>전화번호 (phone)</span>
                  <span className={styles.mappingArrow}>←</span>
                  <span className={styles.mappingSource}>{preview.mapping.phone || '매핑 없음'}</span>
                </div>
              </div>
            ) : (
              <div className={styles.mappingError}>
                <p>AI 매핑 실패: {preview.error}</p>
              </div>
            )}
          </div>

          {/* Preview Table */}
          {preview.preview && preview.preview.length > 0 && (
            <div className={`card ${styles.previewCard}`}>
              <h3>미리보기 (상위 5행)</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>전화번호</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => (
                    <tr key={i}>
                      <td>{row.name || <span className={styles.empty}>-</span>}</td>
                      <td>{row.email || <span className={styles.empty}>-</span>}</td>
                      <td>{row.phone || <span className={styles.empty}>-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Original Data */}
          <div className={`card ${styles.originalCard}`}>
            <h3>원본 데이터 열</h3>
            <div className={styles.columnList}>
              {preview.columns.map((col, i) => (
                <span key={i} className={styles.columnTag}>{col}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className="btn btn-secondary" onClick={handleReset}>
              취소
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={!preview.mapping}
            >
              {preview.totalRows}개 데이터 가져오기
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && (
        <div className={`card ${styles.resultCard}`}>
          <h3>가져오기 완료!</h3>
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

          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={handleReset}>
              새 파일 가져오기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportPage;
