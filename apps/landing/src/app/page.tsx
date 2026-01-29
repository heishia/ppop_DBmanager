import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            고객 연락처 관리
            <br />
            <span className={styles.highlight}>심플하게</span>
          </h1>
          <p className={styles.subtitle}>
            고객 데이터를 가져오고, 컨택 이력을 추적하고, 콜드메일을 발송하세요.
            가벼운 데스크탑 앱 하나로 모든 것을 관리합니다.
          </p>
          <div className={styles.buttons}>
            <a href="#download" className={styles.btnPrimary}>
              무료 다운로드
            </a>
            <a href="#features" className={styles.btnSecondary}>
              자세히 보기
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>주요 기능</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>+</div>
              <h3>CSV/Excel 가져오기</h3>
              <p>CSV 또는 Excel 파일에서 고객 데이터를 자동 검증과 함께 쉽게 가져옵니다.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>@</div>
              <h3>컨택 이력 추적</h3>
              <p>각 고객의 최근 3회 컨택 날짜와 총 컨택 횟수를 추적합니다.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>M</div>
              <h3>콜드메일 발송</h3>
              <p>자체 SMTP 서버를 사용하여 고객에게 콜드메일을 발송합니다.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>D</div>
              <h3>크로스 플랫폼</h3>
              <p>Windows와 macOS에서 사용 가능. 클라우드 동기화로 어디서든 접근.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>사용 방법</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>고객 가져오기</h3>
              <p>이름, 이메일, 전화번호가 포함된 CSV 또는 Excel 파일을 업로드합니다.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>연락처 관리</h3>
              <p>고객 정보를 확인하고 수정합니다. 마지막 컨택 일자를 추적합니다.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>이메일 발송</h3>
              <p>선택한 고객에게 클릭 한 번으로 콜드메일을 작성하고 발송합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className={styles.download}>
        <div className="container">
          <h2 className={styles.sectionTitle}>다운로드</h2>
          <p className={styles.downloadText}>무료 오픈소스. 계정 필요 없음.</p>
          <div className={styles.downloadButtons}>
            <a href="/releases/ppop-dbmanager-win.exe" className={styles.downloadBtn}>
              <span className={styles.downloadIcon}>W</span>
              <span>
                <strong>Windows</strong>
                <small>.exe 설치 파일</small>
              </span>
            </a>
            <a href="/releases/ppop-dbmanager-mac.dmg" className={styles.downloadBtn}>
              <span className={styles.downloadIcon}>A</span>
              <span>
                <strong>macOS</strong>
                <small>.dmg 설치 파일</small>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>PPOP DB Manager - 고객 연락처 관리</p>
        </div>
      </footer>
    </main>
  );
}
