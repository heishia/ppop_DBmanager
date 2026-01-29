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

interface NavItem {
  path: string;
  label: string;
  isAI?: boolean;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: '/import', label: 'AI로 시작하기', isAI: true },
    { path: '/', label: '고객 목록' },
    { path: '/email', label: '이메일' },
  ];

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <span className={styles.logoEn}>PPOP DB</span>
          <span className={styles.logoKr}>매니저</span>
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
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default Layout;
