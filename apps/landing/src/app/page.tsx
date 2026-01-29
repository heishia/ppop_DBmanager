import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>
            Customer Contact Management
            <br />
            <span className={styles.highlight}>Made Simple</span>
          </h1>
          <p className={styles.subtitle}>
            Import your customer data, track contact history, and send cold emails.
            All in one lightweight desktop application.
          </p>
          <div className={styles.buttons}>
            <a href="#download" className={styles.btnPrimary}>
              Download for Free
            </a>
            <a href="#features" className={styles.btnSecondary}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>+</div>
              <h3>Import from CSV/Excel</h3>
              <p>Easily import your customer data from CSV or Excel files with automatic validation.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>@</div>
              <h3>Contact Tracking</h3>
              <p>Track your last 3 contacts and total communication history for each customer.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>M</div>
              <h3>Cold Email</h3>
              <p>Send personalized cold emails to your customers using your own SMTP server.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>D</div>
              <h3>Cross-Platform</h3>
              <p>Available for Windows and macOS. Works offline with cloud sync.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Import Customers</h3>
              <p>Upload your CSV or Excel file with customer names, emails, and phone numbers.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Manage Contacts</h3>
              <p>View and update customer information. Track when you last contacted them.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Send Emails</h3>
              <p>Compose and send cold emails to selected customers with one click.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className={styles.download}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Download</h2>
          <p className={styles.downloadText}>Free and open source. No account required.</p>
          <div className={styles.downloadButtons}>
            <a href="/releases/ppop-dbmanager-win.exe" className={styles.downloadBtn}>
              <span className={styles.downloadIcon}>W</span>
              <span>
                <strong>Windows</strong>
                <small>.exe installer</small>
              </span>
            </a>
            <a href="/releases/ppop-dbmanager-mac.dmg" className={styles.downloadBtn}>
              <span className={styles.downloadIcon}>A</span>
              <span>
                <strong>macOS</strong>
                <small>.dmg installer</small>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>PPOP DB Manager - Customer Contact Management</p>
        </div>
      </footer>
    </main>
  );
}
