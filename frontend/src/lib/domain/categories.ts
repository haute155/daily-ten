import { CategoryKey } from '@/lib/types';

export const CATEGORIES: Array<{ key: CategoryKey; label: string }> = [
  { key: 'exercise', label: '운동' },
  { key: 'sleep', label: '수면' },
  { key: 'learning', label: '학습' },
  { key: 'healing', label: '힐링' },
  { key: 'diet', label: '식습관' },
  { key: 'work', label: '업무' },
];

export const CATEGORY_LABELS: Record<CategoryKey, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.label])
) as Record<CategoryKey, string>;

export const UNCATEGORIZED_LABEL = '미분류';

export function getCategoryLabel(category?: CategoryKey): string {
  return category ? CATEGORY_LABELS[category] : UNCATEGORIZED_LABEL;
}

/**
 * 항목 이름 기반 카테고리 자동 제안 (키워드 휴리스틱).
 * Phase 4에서 LLM 태깅으로 대체 예정 — 그 전까지의 라이트 버전.
 * 매칭 실패 시 undefined (미분류 유지).
 */
const KEYWORD_MAP: Array<{ category: CategoryKey; keywords: string[] }> = [
  { category: 'exercise', keywords: ['운동', '헬스', '러닝', '달리기', '조깅', '산책', '걷기', '요가', '필라테스', '스트레칭', '웨이트', '수영', '자전거', '등산', '푸시업', '스쿼트', '홈트'] },
  { category: 'sleep', keywords: ['수면', '잠', '취침', '기상', '일찍 자', '일찍 일어', '낮잠'] },
  { category: 'learning', keywords: ['독서', '책', '공부', '학습', '강의', '인강', '스터디', '영어', '외국어', '코딩', '개발 공부', '글쓰기', '저널링', '일기', '블로그'] },
  { category: 'healing', keywords: ['명상', '휴식', '힐링', '감사', '마음', '호흡', '스크린', '디지털 디톡스', '음악', '반신욕'] },
  { category: 'diet', keywords: ['식단', '식사', '아침 먹', '야식', '간식', '물 ', '물마시', '단백질', '영양제', '비타민', '금주', '금연', '커피 줄', '설탕'] },
  { category: 'work', keywords: ['업무', '일 ', '출근', '회의', '이메일', '보고', '사이드', '프로젝트', '투두', '계획', '정리', '청소'] },
];

export function suggestCategory(label: string): CategoryKey | undefined {
  const normalized = label.trim().toLowerCase();
  if (!normalized) return undefined;

  for (const { category, keywords } of KEYWORD_MAP) {
    if (keywords.some(k => normalized.includes(k.trim().toLowerCase()))) {
      return category;
    }
  }
  return undefined;
}
