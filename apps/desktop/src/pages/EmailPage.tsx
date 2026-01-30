import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCustomers,
  sendBulkEmail,
  verifyEmailConfig,
  getGroups,
  createGroup,
  getGroupCustomerIds,
  addGroupMembers,
  deleteGroup,
  getErrorMessage,
} from '../lib/api';
import type { CustomerWithContacts, CustomerGroupWithCount } from '@ppop/types';
import styles from './EmailPage.module.css';

type TabType = 'individual' | 'group';

function EmailPage() {
  const [customers, setCustomers] = useState<CustomerWithContacts[]>([]);
  const [groups, setGroups] = useState<CustomerGroupWithCount[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  
  // Create group form
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 먼저 총 고객 수를 가져온 후 전체 고객 로드
      const [initialResult, configured, groupsResult] = await Promise.all([
        getCustomers(1, 1),
        verifyEmailConfig(),
        getGroups(),
      ]);
      
      // 총 고객 수만큼 한번에 가져오기
      const allCustomersResult = await getCustomers(1, initialResult.total || 1000);
      setCustomers(allCustomersResult.items);
      setEmailConfigured(configured);
      setGroups(groupsResult);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      console.error('Failed to load data:', err);
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

  const selectAllFiltered = () => {
    const filteredIds = customers.filter((customer) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    }).map(c => c.id);
    
    const allSelected = filteredIds.every(id => selectedIds.has(id));
    if (allSelected) {
      const newSelected = new Set(selectedIds);
      filteredIds.forEach(id => newSelected.delete(id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      filteredIds.forEach(id => newSelected.add(id));
      setSelectedIds(newSelected);
    }
  };

  const handleGroupSelect = async (groupId: string) => {
    setSelectedGroupId(groupId);
    if (groupId) {
      try {
        const customerIds = await getGroupCustomerIds(groupId);
        setSelectedIds(new Set(customerIds));
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        alert(`그룹 멤버 로딩 실패: ${errorMsg}`);
        console.error('Failed to load group members:', err);
      }
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setCreatingGroup(true);
    try {
      const newGroup = await createGroup({ name: newGroupName.trim() });
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowCreateGroup(false);
      setSelectedGroupId(newGroup.id);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`그룹 생성 실패: ${errorMsg}`);
      console.error('Failed to create group:', err);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSaveSelectionToGroup = async () => {
    if (!selectedGroupId || selectedIds.size === 0) {
      alert('그룹을 선택하고 고객을 선택해주세요');
      return;
    }
    
    try {
      const added = await addGroupMembers(selectedGroupId, Array.from(selectedIds));
      alert(`${added}명이 그룹에 추가되었습니다`);
      // Reload groups to update member count
      const updatedGroups = await getGroups();
      setGroups(updatedGroups);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`멤버 추가 실패: ${errorMsg}`);
      console.error('Failed to add members:', err);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId) return;
    
    const group = groups.find(g => g.id === selectedGroupId);
    if (!confirm(`"${group?.name}" 그룹을 삭제하시겠습니까?`)) return;
    
    try {
      await deleteGroup(selectedGroupId);
      setGroups(groups.filter(g => g.id !== selectedGroupId));
      setSelectedGroupId('');
      setSelectedIds(new Set());
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`그룹 삭제 실패: ${errorMsg}`);
      console.error('Failed to delete group:', err);
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
      // 줄바꿈을 <br> 태그로 변환 (HTML 이메일에서 줄바꿈 적용)
      const htmlBody = body.replace(/\n/g, '<br>');
      
      const sendResult = await sendBulkEmail({
        customerIds: Array.from(selectedIds),
        subject,
        body: htmlBody,
      });
      setResult({ success: sendResult.success, failed: sendResult.failed });
      setSelectedIds(new Set());
      setSubject('');
      setBody('');
      setSelectedGroupId('');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      alert(`이메일 발송 실패: ${errorMsg}`);
      console.error('Failed to send emails:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  
  // Filter customers by search query
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.page}>
      <h1>이메일 발송</h1>

      {error && (
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorContent}>
            <strong>오류 발생</strong>
            <p>{error}</p>
          </div>
          <button className="btn btn-outline" onClick={loadData}>
            다시 시도
          </button>
        </div>
      )}

      {emailConfigured === false && (
        <div className={`card ${styles.warningCard}`}>
          <h3>이메일 설정 필요</h3>
          <p>
            SMTP 설정이 필요합니다.{' '}
            <Link to="/settings" className={styles.settingsLink}>
              설정 페이지에서 SMTP를 설정해주세요 →
            </Link>
          </p>
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
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'individual' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('individual')}
            >
              개별 선택
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'group' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('group')}
            >
              그룹 선택
            </button>
          </div>

          {/* Group Section */}
          {activeTab === 'group' && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <select
                  className={styles.groupSelect}
                  value={selectedGroupId}
                  onChange={(e) => handleGroupSelect(e.target.value)}
                >
                  <option value="">그룹 선택...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.memberCount}명)
                    </option>
                  ))}
                </select>
                <div className={styles.groupActions}>
                  <button
                    className={`btn btn-outline ${styles.btnSmall}`}
                    onClick={() => setShowCreateGroup(!showCreateGroup)}
                  >
                    {showCreateGroup ? '취소' : '+ 새 그룹'}
                  </button>
                  {selectedGroupId && (
                    <button
                      className={`btn btn-outline ${styles.btnSmall}`}
                      onClick={handleDeleteGroup}
                      style={{ color: 'var(--danger)' }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {showCreateGroup && (
                <div className={styles.createGroupForm}>
                  <input
                    className="input"
                    placeholder="새 그룹 이름"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleCreateGroup}
                    disabled={creatingGroup || !newGroupName.trim()}
                  >
                    {creatingGroup ? '생성 중...' : '생성'}
                  </button>
                </div>
              )}

              {selectedGroup && (
                <div className={styles.groupInfo}>
                  <strong>{selectedGroup.name}</strong> 그룹에서 {selectedIds.size}명 선택됨
                </div>
              )}
            </div>
          )}

          {/* Search Input */}
          <div className={styles.searchBox}>
            <input
              type="text"
              className="input"
              placeholder="이름, 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
                title="검색 초기화"
              >
                ✕
              </button>
            )}
          </div>

          {/* Individual Selection Header */}
          {activeTab === 'individual' && (
            <div className={styles.groupHeader}>
              <button className="btn btn-outline" onClick={selectAllFiltered}>
                {filteredCustomers.length > 0 && filteredCustomers.every(c => selectedIds.has(c.id)) ? '선택 해제' : `전체 선택 (${filteredCustomers.length})`}
              </button>
              {selectedIds.size > 0 && groups.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    className={styles.groupSelect}
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="">그룹에 저장...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  {selectedGroupId && (
                    <button
                      className={`btn btn-outline ${styles.btnSmall}`}
                      onClick={handleSaveSelectionToGroup}
                    >
                      저장
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.recipientList}>
            {filteredCustomers.length === 0 ? (
              <div className={styles.noResults}>
                {searchQuery ? '검색 결과가 없습니다' : '고객이 없습니다'}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <label key={customer.id} className={styles.recipientItem}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(customer.id)}
                    onChange={() => toggleSelect(customer.id)}
                  />
                  <span className={styles.recipientName}>{customer.name}</span>
                  <span className={styles.recipientEmail}>{customer.email}</span>
                </label>
              ))
            )}
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
