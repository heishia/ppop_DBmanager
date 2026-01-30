import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

// AI 스파클 아이콘
const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

// 설정 아이콘
const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

interface NavItem {
  path: string;
  label: string;
  isAI?: boolean;
  icon?: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/import', label: 'AI로 시작하기', isAI: true },
    { path: '/', label: '고객 목록' },
    { path: '/email', label: '이메일' },
    { path: '/history', label: '발송 히스토리' },
  ];

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          PPOP DB Manager
        </div>
        <ul className={styles.menu}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.link} ${
                  location.pathname === item.path ? styles.active : ''
                } ${item.isAI ? styles.aiLink : ''}`}
              >
                {item.isAI && <span className={styles.sparkle}><SparkleIcon /></span>}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.navBottom}>
          <Link
            to="/settings"
            className={`${styles.link} ${styles.settingsLink} ${
              location.pathname === '/settings' ? styles.active : ''
            }`}
          >
            <SettingsIcon />
            <span>설정</span>
          </Link>
        </div>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default Layout;
