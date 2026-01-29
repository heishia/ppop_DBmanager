import { useState, useEffect } from 'react';
import { getCustomers, sendBulkEmail, verifyEmailConfig } from '../lib/api';
import type { CustomerWithContacts } from '@ppop/types';
import styles from './EmailPage.module.css';

function EmailPage() {
  const [customers, setCustomers] = useState<CustomerWithContacts[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersResult, configured] = await Promise.all([
        getCustomers(1, 100),
        verifyEmailConfig(),
      ]);
      setCustomers(customersResult.items);
      setEmailConfigured(configured);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === customers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c.id)));
    }
  };

  const handleSend = async () => {
    if (selectedIds.size === 0 || !subject || !body) {
      alert('수신자를 선택하고 제목과 본문을 입력해주세요');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const sendResult = await sendBulkEmail({
        customerIds: Array.from(selectedIds),
        subject,
        body,
      });
      setResult({ success: sendResult.success, failed: sendResult.failed });
      setSelectedIds(new Set());
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Failed to send emails:', error);
      alert('이메일 발송에 실패했습니다');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  return (
    <div className={styles.page}>
      <h1>이메일 발송</h1>

      {emailConfigured === false && (
        <div className={`card ${styles.warningCard}`}>
          <h3>이메일 설정 필요</h3>
          <p>환경 변수에 SMTP 설정을 입력해주세요.</p>
        </div>
      )}

      {result && (
        <div className={`card ${styles.resultCard}`}>
          <h3>발송 완료</h3>
          <p>
            <span className={styles.success}>{result.success}건 성공</span>
            {result.failed > 0 && (
              <span className={styles.failed}>, {result.failed}건 실패</span>
            )}
          </p>
        </div>
      )}

      <div className={styles.content}>
        <div className={`card ${styles.recipientsCard}`}>
          <div className={styles.cardHeader}>
            <h3>수신자</h3>
            <button className="btn btn-outline" onClick={selectAll}>
              {selectedIds.size === customers.length ? '선택 해제' : '전체 선택'}
            </button>
          </div>
          <div className={styles.recipientList}>
            {customers.map((customer) => (
              <label key={customer.id} className={styles.recipientItem}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(customer.id)}
                  onChange={() => toggleSelect(customer.id)}
                />
                <span className={styles.recipientName}>{customer.name}</span>
                <span className={styles.recipientEmail}>{customer.email}</span>
              </label>
            ))}
          </div>
          <div className={styles.selectedCount}>
            {selectedIds.size}명 선택됨
          </div>
        </div>

        <div className={`card ${styles.composeCard}`}>
          <h3>이메일 작성</h3>
          <div className={styles.formGroup}>
            <label>제목</label>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="이메일 제목"
            />
          </div>
          <div className={styles.formGroup}>
            <label>본문 (HTML 지원)</label>
            <textarea
              className={`input ${styles.textarea}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="이메일 본문을 입력하세요..."
              rows={10}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || selectedIds.size === 0 || !subject || !body}
          >
            {sending ? '발송 중...' : `${selectedIds.size}명에게 발송`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailPage;
