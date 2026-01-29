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
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!customer) {
    return <div className={styles.error}>Customer not found</div>;
  }

  return (
    <div className={styles.page}>
      <button className="btn btn-outline" onClick={() => navigate('/')}>
        Back to List
      </button>

      <div className={styles.content}>
        <div className={`card ${styles.infoCard}`}>
          <div className={styles.cardHeader}>
            <h2>Customer Info</h2>
            {!editing && (
              <button className="btn btn-outline" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdate}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  className="input"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name</span>
                <span>{customer.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email</span>
                <span>{customer.email}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Phone</span>
                <span>{customer.phone}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Total Contacts</span>
                <span className="badge badge-success">{customer.totalContacts}</span>
              </div>
            </div>
          )}
        </div>

        <div className={`card ${styles.contactCard}`}>
          <div className={styles.cardHeader}>
            <h2>Contact History</h2>
            <div className={styles.contactActions}>
              <button className="btn btn-outline" onClick={() => handleAddContact('email')}>
                Log Email
              </button>
              <button className="btn btn-outline" onClick={() => handleAddContact('phone')}>
                Log Call
              </button>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className={styles.empty}>No contact history</div>
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
