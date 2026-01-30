import { useState, useEffect } from 'react';
import { getSmtpSettings, updateSmtpSettings, testSmtpConnection } from '../lib/api';
import styles from './SettingsPage.module.css';

interface SmtpFormData {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<SmtpFormData>({
    host: '',
    port: 587,
    user: '',
    pass: '',
    from: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordMasked, setIsPasswordMasked] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const smtp = await getSmtpSettings();
      setFormData({
        host: smtp.host || '',
        port: smtp.port || 587,
        user: smtp.user || '',
        pass: smtp.pass || '',
        from: smtp.from || '',
      });
      // 비밀번호가 마스킹되어 있는지 확인
      setIsPasswordMasked(smtp.pass === '********');
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
    
    // 비밀번호 필드가 수정되면 마스킹 해제
    if (name === 'pass' && isPasswordMasked) {
      setIsPasswordMasked(false);
      if (value === '********') {
        setFormData((prev) => ({ ...prev, pass: '' }));
      }
    }
    
    setTestResult(null);
    setSuccessMessage('');
  };

  const handleTest = async () => {
    if (!formData.host || !formData.user || !formData.from) {
      setTestResult({ valid: false, message: '모든 필드를 입력해주세요' });
      return;
    }

    // 마스킹된 비밀번호로 테스트할 수 없음
    if (isPasswordMasked) {
      setTestResult({ valid: false, message: '비밀번호를 다시 입력해주세요' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testSmtpConnection(formData);
      setTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ valid: false, message: '테스트 요청 실패' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.host || !formData.user || !formData.from) {
      alert('모든 필수 필드를 입력해주세요');
      return;
    }

    // 마스킹된 비밀번호로 저장할 수 없음
    if (isPasswordMasked) {
      alert('비밀번호를 다시 입력해주세요');
      return;
    }

    setSaving(true);
    setSuccessMessage('');

    try {
      await updateSmtpSettings(formData);
      setSuccessMessage('설정이 저장되었습니다');
      setIsPasswordMasked(true);
      setFormData((prev) => ({ ...prev, pass: '********' }));
    } catch (error) {
      console.error('Save failed:', error);
      alert('설정 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  return (
    <div className={styles.page}>
      <h1>설정</h1>

      <div className={`card ${styles.settingsCard}`}>
        <h2>SMTP 설정</h2>
        <p className={styles.description}>
          이메일 발송에 사용할 SMTP 서버 정보를 입력하세요.
        </p>

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {testResult && (
          <div
            className={`${styles.testResult} ${
              testResult.valid ? styles.testSuccess : styles.testFail
            }`}
          >
            {testResult.message}
          </div>
        )}

        <div className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="host">SMTP 호스트 *</label>
              <input
                id="host"
                name="host"
                className="input"
                value={formData.host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className={styles.formGroupSmall}>
              <label htmlFor="port">포트 *</label>
              <input
                id="port"
                name="port"
                type="number"
                className="input"
                value={formData.port}
                onChange={handleChange}
                placeholder="587"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="user">사용자명 (이메일) *</label>
            <input
              id="user"
              name="user"
              className="input"
              value={formData.user}
              onChange={handleChange}
              placeholder="your-email@gmail.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pass">비밀번호 (앱 비밀번호) *</label>
            <div className={styles.passwordField}>
              <input
                id="pass"
                name="pass"
                type={showPassword ? 'text' : 'password'}
                className="input"
                value={formData.pass}
                onChange={handleChange}
                placeholder="앱 비밀번호를 입력하세요"
                onFocus={() => {
                  if (isPasswordMasked) {
                    setFormData((prev) => ({ ...prev, pass: '' }));
                    setIsPasswordMasked(false);
                  }
                }}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '숨김' : '보기'}
              </button>
            </div>
            <span className={styles.hint}>
              Gmail의 경우 2단계 인증 후 앱 비밀번호를 생성해서 사용하세요
            </span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="from">발신 이메일 *</label>
            <input
              id="from"
              name="from"
              type="email"
              className="input"
              value={formData.from}
              onChange={handleChange}
              placeholder="noreply@yourdomain.com"
            />
          </div>

          <div className={styles.actions}>
            <button
              className="btn btn-outline"
              onClick={handleTest}
              disabled={testing || saving}
            >
              {testing ? '테스트 중...' : '연결 테스트'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || testing}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      <div className={`card ${styles.infoCard}`}>
        <h3>도움말</h3>
        <div className={styles.helpSection}>
          <h4>Gmail SMTP 설정</h4>
          <ul>
            <li>호스트: <code>smtp.gmail.com</code></li>
            <li>포트: <code>587</code> (TLS) 또는 <code>465</code> (SSL)</li>
            <li>사용자명: Gmail 주소</li>
            <li>비밀번호: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">앱 비밀번호</a> (2단계 인증 필요)</li>
          </ul>
        </div>
        <div className={styles.helpSection}>
          <h4>네이버 SMTP 설정</h4>
          <ul>
            <li>호스트: <code>smtp.naver.com</code></li>
            <li>포트: <code>587</code></li>
            <li>사용자명: 네이버 아이디</li>
            <li>비밀번호: 네이버 비밀번호</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
