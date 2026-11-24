/**
 * 가상 피팅 서비스 전역 타입 정의
 */

export type Gender = 'female' | 'male';

export type GarmentCategory = 'upper_body' | 'lower_body' | 'dresses';

export type WeightUnit = 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95;

export interface BaseBodyModel {
  id: string;
  gender: Gender;
  weight: number; // 5kg 단위 (45 ~ 95)
  height: number; // 기본 키 (cm)
  label: string;
  bmi: number;
  bodyType: string; // 예: '매우 마름', '슬림핏', '표준핏', '탄탄한 체형', '통통/여유핏', '빅사이즈'
  silhouetteDesc: string; // 체형 설명
  imageUrl: string; // IDM-VTON 입력용 고화질 정면 베이스 모델 사진 URL
  mockOverlayText?: string;
}

export interface GarmentData {
  id: string;
  name: string;
  category: GarmentCategory;
  imageUrl: string;
  sourceUrl?: string;
  isUploaded?: boolean;
}

export interface ScrapeResult {
  success: boolean;
  title: string;
  brand?: string;
  price?: string;
  images: string[];
  selectedImage?: string;
  error?: string;
}

export interface TryOnRequest {
  garmentImageUrl: string;
  modelImageUrl: string;
  category: GarmentCategory;
  gender: Gender;
  weight: number;
  height: number;
  garmentDescription?: string;
}

export interface TryOnResponse {
  success: boolean;
  resultImageUrl?: string;
  isMock: boolean;
  weight: number;
  gender: Gender;
  category: GarmentCategory;
  processingTimeMs?: number;
  message?: string;
  error?: string;
}

export interface FitCacheItem {
  weight: number;
  resultImageUrl: string;
  generatedAt: number;
  isMock: boolean;
}
