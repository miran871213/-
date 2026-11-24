import { BaseBodyModel, Gender, WeightUnit } from '@/types';

/**
 * 45kg ~ 95kg (5kg 단위) 지원 몸무게 목록
 */
export const SUPPORTED_WEIGHTS: WeightUnit[] = [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];

/**
 * 카테고리 정의 (IDM-VTON API 호환 파라미터)
 */
export const GARMENT_CATEGORIES = [
  { value: 'upper_body', label: '상의 (Top/Shirt)', icon: 'Shirt' },
  { value: 'lower_body', label: '하의 (Pants/Skirt)', icon: 'Scissors' },
  { value: 'dresses', label: '원피스/세트 (Dress/Full)', icon: 'Sparkles' },
] as const;

/**
 * 키 프리셋 (cm)
 */
export const HEIGHT_PRESETS = {
  female: [150, 155, 160, 162, 165, 168, 170, 175],
  male: [165, 170, 173, 175, 178, 180, 185, 190],
};

/**
 * BMI 계산 헬퍼 함수
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * BMI 기반 체형 라벨 분류
 */
export function getBodyTypeLabel(bmi: number): string {
  if (bmi < 18.5) return '슬림/마른 체형';
  if (bmi < 23.0) return '표준 정사이즈 체형';
  if (bmi < 25.0) return '과체중/골격 있는 체형';
  if (bmi < 30.0) return '릴랙스/통통한 체형';
  return '빅사이즈 체형';
}

/**
 * 5kg 단위 베이스 바디 모델 매핑 데이터
 * (여성 기본 키 162cm, 남성 기본 키 177cm 기준)
 * 
 * 실제 IDM-VTON 등 AI 가상 피팅 모델이 가장 자연스럽게 합성할 수 있는
 * 정면 스탠딩 포즈의 베이스 모델 이미지 URL입니다.
 */
export const BASE_MODELS: Record<Gender, Record<number, BaseBodyModel>> = {
  female: {
    45: {
      id: 'female-45',
      gender: 'female',
      weight: 45,
      height: 162,
      label: '45kg (초슬림 핏)',
      bmi: 17.1,
      bodyType: '초슬림/스키니',
      silhouetteDesc: '전체적으로 얇은 실루엣, 루즈핏이나 오버핏 착용 시 옷이 크게 남는 핏감',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    },
    50: {
      id: 'female-50',
      gender: 'female',
      weight: 50,
      height: 162,
      label: '50kg (슬림핏)',
      bmi: 19.0,
      bodyType: '슬림 표준',
      silhouetteDesc: '군살 없는 정돈된 라인, S사이즈 또는 Free사이즈가 깔끔하게 떨어지는 핏',
      imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    },
    55: {
      id: 'female-55',
      gender: 'female',
      weight: 55,
      height: 162,
      label: '55kg (가장 대중적인 표준핏)',
      bmi: 21.0,
      bodyType: '가장 이상적인 표준핏',
      silhouetteDesc: '대한민국 여성 평균 체형에 가장 가까운 균형 잡힌 정사이즈(M) 실루엣',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    60: {
      id: 'female-60',
      gender: 'female',
      weight: 60,
      height: 162,
      label: '60kg (볼륨감 있는 내추럴핏)',
      bmi: 22.9,
      bodyType: '볼륨 내추럴',
      silhouetteDesc: '어깨와 바스트 라인이 안정적이며, 힙라인에 자연스러운 볼륨이 생기는 핏',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    },
    65: {
      id: 'female-65',
      gender: 'female',
      weight: 65,
      height: 162,
      label: '65kg (편안한 릴랙스핏)',
      bmi: 24.8,
      bodyType: '릴랙스 핏',
      silhouetteDesc: '전체적으로 여유로운 곡선형, 타이트한 옷은 밀착되며 루즈핏 옷이 잘 어울림',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    },
    70: {
      id: 'female-70',
      gender: 'female',
      weight: 70,
      height: 162,
      label: '70kg (체격 있는 안정핏)',
      bmi: 26.7,
      bodyType: '탄탄/여유 체형',
      silhouetteDesc: '가슴과 허리 라인이 강조되며, L사이즈 이상의 여유로운 핏감이 추천되는 실루엣',
      imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    },
    75: {
      id: 'female-75',
      gender: 'female',
      weight: 75,
      height: 162,
      label: '75kg (볼륨 플러스핏)',
      bmi: 28.6,
      bodyType: '플러스 볼륨',
      silhouetteDesc: '상체와 하체 모두 충분한 체적감을 가지며, 스트레치성 의류나 드레이프 원단에 적합',
      imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80',
    },
    80: {
      id: 'female-80',
      gender: 'female',
      weight: 80,
      height: 162,
      label: '80kg (플러스사이즈 1)',
      bmi: 30.5,
      bodyType: '플러스사이즈',
      silhouetteDesc: '체형 커버형 실루엣, 어깨와 암홀 여유가 필수적인 풍성한 체형 라인',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    },
    85: {
      id: 'female-85',
      gender: 'female',
      weight: 85,
      height: 162,
      label: '85kg (플러스사이즈 2)',
      bmi: 32.4,
      bodyType: '풍성한 체형',
      silhouetteDesc: '품이 넓은 오버사이즈 또는 빅사이즈 전문 패턴이 잘 어울리는 실루엣',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    },
    90: {
      id: 'female-90',
      gender: 'female',
      weight: 90,
      height: 162,
      label: '90kg (빅사이즈 핏)',
      bmi: 34.3,
      bodyType: '빅사이즈',
      silhouetteDesc: '넉넉하고 여유 있는 박시핏 착용 시 편안함을 주는 체형 라인',
      imageUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80',
    },
    95: {
      id: 'female-95',
      gender: 'female',
      weight: 95,
      height: 162,
      label: '95kg (여유로운 빅사이즈 핏)',
      bmi: 36.2,
      bodyType: '슈퍼 플러스사이즈',
      silhouetteDesc: '체형을 포근하게 감싸는 루즈 실루엣으로 기장과 가슴둘레 확인이 필수적',
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    },
  },
  male: {
    45: {
      id: 'male-45',
      gender: 'male',
      weight: 45,
      height: 177,
      label: '45kg (초슬림 체형)',
      bmi: 14.4,
      bodyType: '매우 마름',
      silhouetteDesc: '어깨와 흉곽이 좁아 기성복 S사이즈도 넉넉하게 남는 실루엣',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    },
    50: {
      id: 'male-50',
      gender: 'male',
      weight: 50,
      height: 177,
      label: '50kg (슬렌더 핏)',
      bmi: 16.0,
      bodyType: '슬렌더',
      silhouetteDesc: '모던한 스키니/슬렌더 실루엣, 드롭숄더 옷의 오버핏감이 극대화됨',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    },
    55: {
      id: 'male-55',
      gender: 'male',
      weight: 55,
      height: 177,
      label: '55kg (마른 체형)',
      bmi: 17.6,
      bodyType: '마른 체형',
      silhouetteDesc: '슬림한 체형으로 90~95 사이즈가 자연스럽게 떨어지는 핏',
      imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    },
    60: {
      id: 'male-60',
      gender: 'male',
      weight: 60,
      height: 177,
      label: '60kg (슬림핏)',
      bmi: 19.2,
      bodyType: '슬림 핏',
      silhouetteDesc: '군더더기 없는 슬림 라인, 슬림핏 셔츠나 테이퍼드 팬츠가 가장 예쁜 핏',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
    65: {
      id: 'male-65',
      gender: 'male',
      weight: 65,
      height: 177,
      label: '65kg (균형잡힌 표준핏)',
      bmi: 20.7,
      bodyType: '균형 표준',
      silhouetteDesc: '95(M) 사이즈의 기준이 되는 균형 잡힌 남성 표준 체형',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    },
    70: {
      id: 'male-70',
      gender: 'male',
      weight: 70,
      height: 177,
      label: '70kg (대한민국 남성 평균핏)',
      bmi: 22.3,
      bodyType: '평균 표준',
      silhouetteDesc: '대한민국 20~30대 남성 표준 체형, 100(L) 정사이즈가 딱 맞는 실루엣',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    },
    75: {
      id: 'male-75',
      gender: 'male',
      weight: 75,
      height: 177,
      label: '75kg (탄탄한 골격핏)',
      bmi: 23.9,
      bodyType: '탄탄/머슬',
      silhouetteDesc: '어깨와 가슴골격이 발달한 탄탄한 체형, 핏한 티셔츠가 맵시있게 어울림',
      imageUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    },
    80: {
      id: 'male-80',
      gender: 'male',
      weight: 80,
      height: 177,
      label: '80kg (체격 있는 벌크/여유핏)',
      bmi: 25.5,
      bodyType: '체격형',
      silhouetteDesc: '듬직한 상체 체격으로 105(XL) 사이즈의 여유로운 핏감이 추천됨',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    },
    85: {
      id: 'male-85',
      gender: 'male',
      weight: 85,
      height: 177,
      label: '85kg (중후한 여유핏)',
      bmi: 27.1,
      bodyType: '여유/체격형',
      silhouetteDesc: '가슴과 복부에 볼륨감이 있어 편안한 스트레이트핏이나 오버핏이 이상적임',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    },
    90: {
      id: 'male-90',
      gender: 'male',
      weight: 90,
      height: 177,
      label: '90kg (빅사이즈 핏)',
      bmi: 28.7,
      bodyType: '빅사이즈',
      silhouetteDesc: '110(2XL) 기준의 넉넉한 핏감, 활동성이 보장되는 루즈핏 필수',
      imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    },
    95: {
      id: 'male-95',
      gender: 'male',
      weight: 95,
      height: 177,
      label: '95kg (헤비 빅사이즈 핏)',
      bmi: 30.3,
      bodyType: '헤비 빅사이즈',
      silhouetteDesc: '체격을 넉넉히 감싸주는 빅사이즈 실루엣으로 편안한 착용감이 핵심',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    },
  },
};

/**
 * 성별, 몸무게(5kg 단위), 키에 맞는 베이스 모델 정보 반환
 */
export function getBaseModel(gender: Gender, weight: number, customHeight?: number): BaseBodyModel {
  // 5kg 단위로 반올림/클램프
  const clampedWeight = Math.min(95, Math.max(45, Math.round(weight / 5) * 5));
  const base = BASE_MODELS[gender][clampedWeight] || BASE_MODELS[gender][55];
  
  if (customHeight && customHeight !== base.height) {
    const bmi = calculateBMI(clampedWeight, customHeight);
    return {
      ...base,
      height: customHeight,
      bmi,
      bodyType: getBodyTypeLabel(bmi),
    };
  }
  return base;
}

/**
 * 원클릭 테스트를 위한 데모 샘플 의류 목록
 */
export const SAMPLE_GARMENTS = [
  {
    id: 'sample-1',
    name: '오버핏 코튼 반팔 티셔츠 (White)',
    category: 'upper_body' as const,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    price: '32,000원',
    brand: 'FITCHECK STUDIO',
  },
  {
    id: 'sample-2',
    name: '클래식 옥스포드 스트라이프 셔츠 (Blue)',
    category: 'upper_body' as const,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    price: '49,000원',
    brand: 'URBAN TAILOR',
  },
  {
    id: 'sample-3',
    name: '베이직 와이드 핏 데님 팬츠 (Denim)',
    category: 'lower_body' as const,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    price: '58,000원',
    brand: 'DENIM CO.',
  },
  {
    id: 'sample-4',
    name: '플리츠 롱 셔츠 원피스 (Olive)',
    category: 'dresses' as const,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    price: '64,000원',
    brand: 'ATELIER',
  },
];
