import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// GCP 설정
const PROJECT_ID = process.env.GCP_PROJECT_ID || '';
const LOCATION = process.env.GCP_LOCATION || 'asia-northeast3'; // 서울 리전

let vertexAI: VertexAI | null = null;
let credentialsInitialized = false;

/**
 * 프로덕션 환경에서 JSON 문자열로 전달된 서비스 계정 인증 처리
 */
function initializeCredentials(): void {
  if (credentialsInitialized) return;

  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credentialsJson) {
    try {
      // JSON 문자열을 임시 파일로 저장
      const tempDir = os.tmpdir();
      const credentialsPath = path.join(tempDir, 'gcp-credentials.json');
      fs.writeFileSync(credentialsPath, credentialsJson, 'utf8');

      // GOOGLE_APPLICATION_CREDENTIALS 환경변수 설정
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

      console.log('GCP credentials initialized from JSON string');
    } catch (error) {
      console.error('Failed to initialize GCP credentials:', error);
    }
  }

  credentialsInitialized = true;
}

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    if (!PROJECT_ID) {
      throw new Error('GCP_PROJECT_ID is not configured');
    }

    // 프로덕션 환경 인증 초기화
    initializeCredentials();

    vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });
  }
  return vertexAI;
}

export interface ColumnMapping {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface TransformResult {
  success: boolean;
  mapping?: ColumnMapping;
  transformedData?: Array<{ name: string; email: string; phone: string }>;
  error?: string;
}

/**
 * AI를 사용하여 Excel 데이터의 열을 우리 시스템 형태로 매핑
 */
export async function analyzeAndTransformData(
  columns: string[],
  sampleRows: Record<string, unknown>[]
): Promise<TransformResult> {
  try {
    const ai = getVertexAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const prompt = `당신은 데이터 변환 전문가입니다. 
아래 Excel 데이터를 분석하여 우리 시스템의 고객 데이터 형식으로 매핑해주세요.

## 우리 시스템의 필수 필드:
- name: 고객 이름 (필수)
- email: 이메일 주소 (필수)
- phone: 전화번호 (필수)

## 입력된 Excel 열 이름들:
${JSON.stringify(columns, null, 2)}

## 샘플 데이터 (처음 3행):
${JSON.stringify(sampleRows.slice(0, 3), null, 2)}

## 요청사항:
1. 각 열이 name, email, phone 중 어떤 필드에 해당하는지 분석해주세요
2. 열 이름이 한글이거나 다른 형태여도 내용을 보고 판단해주세요
   - 예: "고객명", "이름", "성명", "Name" → name
   - 예: "이메일", "메일", "Email", "E-mail" → email  
   - 예: "연락처", "전화번호", "핸드폰", "Phone", "Tel" → phone
3. 매핑할 수 없는 필드는 null로 표시해주세요

## 응답 형식 (JSON만 출력):
{
  "mapping": {
    "name": "원본 열 이름 또는 null",
    "email": "원본 열 이름 또는 null",
    "phone": "원본 열 이름 또는 null"
  },
  "confidence": "high | medium | low",
  "notes": "매핑 관련 참고사항"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON 파싱 (마크다운 코드블록 제거)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'AI 응답에서 JSON을 찾을 수 없습니다' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const mapping: ColumnMapping = parsed.mapping;

    // 매핑을 사용하여 데이터 변환
    const transformedData = sampleRows.map((row) => ({
      name: mapping.name ? String(row[mapping.name] || '').trim() : '',
      email: mapping.email ? String(row[mapping.email] || '').trim() : '',
      phone: mapping.phone ? String(row[mapping.phone] || '').trim() : '',
    }));

    return {
      success: true,
      mapping,
      transformedData,
    };
  } catch (error) {
    console.error('AI Transform Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI 변환 중 오류 발생',
    };
  }
}

/**
 * 전체 데이터에 매핑 적용
 */
export function applyMapping(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping
): Array<{ name: string; email: string; phone: string }> {
  return rows.map((row) => ({
    name: mapping.name ? String(row[mapping.name] || '').trim() : '',
    email: mapping.email ? String(row[mapping.email] || '').trim() : '',
    phone: mapping.phone ? String(row[mapping.phone] || '').trim() : '',
  }));
}
