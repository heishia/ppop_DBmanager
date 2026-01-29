import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '고객 목록' },
    { path: '/import', label: '가져오기' },
    { path: '/email', label: '이메일' },
  ];

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.logo}>PPOP DB</div>
        <ul className={styles.menu}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.link} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
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
