import fs from 'fs';
import path from 'path';

export interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export interface AppSettings {
  smtp: SmtpSettings;
}

const defaultSettings: AppSettings = {
  smtp: {
    host: '',
    port: 587,
    user: '',
    pass: '',
    from: '',
  },
};

// 설정 파일 경로 (앱 데이터 디렉토리에 저장)
function getSettingsPath(): string {
  // 환경변수에서 설정 경로 가져오거나 기본 경로 사용
  const appDataPath = process.env.APP_DATA_PATH || process.cwd();
  return path.join(appDataPath, 'settings.json');
}

export function getSettings(): AppSettings {
  try {
    const settingsPath = getSettingsPath();
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);
      return { ...defaultSettings, ...settings };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const currentSettings = getSettings();
  const newSettings = {
    ...currentSettings,
    ...settings,
    smtp: {
      ...currentSettings.smtp,
      ...(settings.smtp || {}),
    },
  };

  const settingsPath = getSettingsPath();
  const dir = path.dirname(settingsPath);

  // 디렉토리가 없으면 생성
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2), 'utf-8');
  return newSettings;
}

export function getSmtpSettings(): SmtpSettings {
  const settings = getSettings();
  
  // 환경 변수가 설정되어 있으면 우선 사용
  if (process.env.SMTP_HOST) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || '',
    };
  }
  
  return settings.smtp;
}

export function updateSmtpSettings(smtp: Partial<SmtpSettings>): SmtpSettings {
  const settings = saveSettings({ smtp: smtp as SmtpSettings });
  return settings.smtp;
}

export function isSmtpConfigured(): boolean {
  const smtp = getSmtpSettings();
  return !!(smtp.host && smtp.port && smtp.user && smtp.pass && smtp.from);
}
