import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer, updateCustomer, getContacts, createContact } from '../lib/api';
import type { CustomerWithContacts, ContactHistory, UpdateCustomerDto, ContactType } from '@ppop/types';
import styles from './CustomerDetail.module.css';

function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerWithContacts | null>(null);
  const [contacts, setContacts] = useState<ContactHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateCustomerDto>({});

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [customerData, contactsData] = await Promise.all([
        getCustomer(id),
        getContacts(id),
      ]);
      setCustomer(customerData);
      setContacts(contactsData);
      setFormData({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      });
    } catch (error) {
      console.error('Failed to load customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateCustomer(id, formData);
      setEditing(false);
      loadData();
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleAddContact = async (type: ContactType) => {
    if (!id) return;
    try {
      await createContact({ customerId: id, type });
      loadData();
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  if (!customer) {
    return <div className={styles.error}>고객을 찾을 수 없습니다</div>;
  }

  return (
    <div className={styles.page}>
      <button className="btn btn-outline" onClick={() => navigate('/')}>
        목록으로
      </button>

      <div className={styles.content}>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.cardHeader}>
            <h2>고객 정보</h2>
            {!editing && (
              <button className="btn btn-outline" onClick={() => setEditing(true)}>
                수정
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdate}>
              <div className={styles.formGroup}>
                <label>이름</label>
                <input
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>이메일</label>
                <input
                  className="input"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>전화번호</label>
                <input
                  className="input"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>이름</span>
                <span>{customer.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>이메일</span>
                <span>{customer.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>전화번호</span>
                <span>{customer.phone}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>총 컨택 횟수</span>
                <span className="badge badge-success">{customer.totalContacts}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`card ${styles.contactCard}`}>
          <div className={styles.cardHeader}>
            <h2>컨택 이력</h2>
            <div className={styles.contactActions}>
              <button className="btn btn-outline" onClick={() => handleAddContact('email')}>
                이메일 기록
              </button>
              <button className="btn btn-outline" onClick={() => handleAddContact('phone')}>
                통화 기록
              </button>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className={styles.empty}>컨택 이력이 없습니다</div>
          ) : (
            <ul className={styles.contactList}>
              {contacts.map((contact) => (
                <li key={contact.id} className={styles.contactItem}>
                  <span className={`badge ${contact.type === 'email' ? 'badge-success' : 'badge-warning'}`}>
                    {contact.type}
                  </span>
                  <span className={styles.contactDate}>{formatDate(contact.contactedAt)}</span>
                  {contact.note && <span className={styles.contactNote}>{contact.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
