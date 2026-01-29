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
      alert('Please select recipients and fill in subject and body');
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
      alert('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <h1>Send Email</h1>

      {emailConfigured === false && (
        <div className={`card ${styles.warningCard}`}>
          <h3>Email Not Configured</h3>
          <p>Please configure SMTP settings in your environment variables.</p>
        </div>
      )}

      {result && (
        <div className={`card ${styles.resultCard}`}>
          <h3>Emails Sent</h3>
          <p>
            <span className={styles.success}>{result.success} sent</span>
            {result.failed > 0 && (
              <span className={styles.failed}>, {result.failed} failed</span>
            )}
          </p>
        </div>
      )}

      <div className={styles.content}>
        <div className={`card ${styles.recipientsCard}`}>
          <div className={styles.cardHeader}>
            <h3>Recipients</h3>
            <button className="btn btn-outline" onClick={selectAll}>
              {selectedIds.size === customers.length ? 'Deselect All' : 'Select All'}
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
            {selectedIds.size} recipient(s) selected
          </div>
        </div>

        <div className={`card ${styles.composeCard}`}>
          <h3>Compose Email</h3>
          <div className={styles.formGroup}>
            <label>Subject</label>
            <input
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Body (HTML supported)</label>
            <textarea
              className={`input ${styles.textarea}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body..."
              rows={10}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || selectedIds.size === 0 || !subject || !body}
          >
            {sending ? 'Sending...' : `Send to ${selectedIds.size} recipient(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailPage;
