import { useState } from 'react';
import { importFromBuffer, previewFromBuffer, type PreviewResult, type ColumnMapping } from '../lib/api';
import type { ImportResult } from '@ppop/types';
import styles from './ImportPage.module.css';

// 귀여운 아이콘들
import { PiDogFill, PiSparkle, PiMagicWandFill, PiCheckCircleFill, PiFileCsvFill } from 'react-icons/pi';
import { HiSparkles } from 'react-icons/hi2';
import { RiRobot2Fill } from 'react-icons/ri';

type Step = 'select' | 'preview' | 'result';

function ImportPage() {
  const [step, setStep] = useState<Step>('select');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ buffer: string; name: string } | null>(null);

  const loadingMessages = [
    '파일을 읽고 있어요...',
    'AI가 열 구조를 분석 중...',
    '데이터 패턴을 인식하는 중...',
    '최적의 매핑을 찾고 있어요...',
  ];

  const handleSelectFile = async () => {
    setError(null);
    setResult(null);
    setPreview(null);

    try {
      const file = await window.electronAPI.openFile();
      if (!file) return;

      setFileData({ buffer: file.buffer, name: file.name });
      setLoading(true);
      setLoadingPhase(0);

      // 로딩 메시지 순환
      const interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % loadingMessages.length);
      }, 1200);

      const previewResult = await previewFromBuffer(file.buffer, file.name);
      clearInterval(interval);
      setPreview(previewResult);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 분석 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!fileData || !preview?.mapping) return;

    try {
      setLoading(true);

      const importResult = await importFromBuffer(fileData.buffer, fileData.name, preview.mapping);
      setResult(importResult);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '가져오기 실패');
    } finally {
      setLoading(false);
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
      <div className={styles.header}>
        <h1>
          <span className={styles.aiGradient}>AI</span> 자동 가져오기
          <span className={styles.sparkle}><HiSparkles size={20} /></span>
        </h1>
        <p className={styles.description}>
          어떤 형식의 파일이든 AI가 자동으로 분석하고 변환해요
        </p>
      </div>

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
          <span className={`${styles.stepNumber} ${styles.dogStep}`}>
            <PiDogFill size={20} />
          </span>
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
            <div className={styles.uploadIcon}>
              <PiDogFill size={36} />
            </div>
            <h3>파일을 선택하세요</h3>
            <p>CSV, XLSX, XLS 모두 지원</p>
            <div className={styles.aiBadge}>
              <PiMagicWandFill size={14} />
              <span>AI가 열 이름을 자동 인식</span>
            </div>
            <button
              className={`btn btn-primary ${styles.uploadBtn}`}
              onClick={handleSelectFile}
              disabled={loading}
            >
              파일 선택하기
            </button>
          </div>
        </div>
      )}

      {/* Loading State - AI Analyzing */}
      {loading && (
        <div className={`card ${styles.loadingCard}`}>
          <div className={styles.aiLoader}>
            <div className={styles.aiLoaderRing} />
            <div className={styles.aiLoaderIcon}>
              <RiRobot2Fill size={24} />
            </div>
          </div>
          <p className={styles.loadingText}>{loadingMessages[loadingPhase]}</p>
          <div className={styles.loadingDots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      )}

      {/* Step 2: Preview & Confirm */}
      {step === 'preview' && preview && !loading && (
        <div className={styles.previewSection}>
          {/* AI Mapping Result */}
          <div className={`card ${styles.mappingCard}`}>
            <div className={styles.mappingHeader}>
              <div className={styles.aiSuccessBadge}>
                <PiCheckCircleFill size={14} />
                <span>AI 분석 완료</span>
              </div>
              <p className={styles.fileInfo}>
                <strong>{fileData?.name}</strong> · {preview.totalRows}개 데이터 발견
              </p>
            </div>

            {preview.mapping ? (
              <div className={styles.mappingGrid}>
                <div className={styles.mappingItem}>
                  <span className={styles.mappingLabel}>
                    <span className={styles.fieldIcon}>👤</span>
                    이름
                  </span>
                  <span className={styles.mappingArrow}>←</span>
                  <span className={styles.mappingSource}>{preview.mapping.name || '매핑 없음'}</span>
                </div>
                <div className={styles.mappingItem}>
                  <span className={styles.mappingLabel}>
                    <span className={styles.fieldIcon}>📧</span>
                    이메일
                  </span>
                  <span className={styles.mappingArrow}>←</span>
                  <span className={styles.mappingSource}>{preview.mapping.email || '매핑 없음'}</span>
                </div>
                <div className={styles.mappingItem}>
                  <span className={styles.mappingLabel}>
                    <span className={styles.fieldIcon}>📱</span>
                    전화번호
                  </span>
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
