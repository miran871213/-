'use client';

import React, { useState, useEffect } from 'react';
import {
  GarmentData,
  Gender,
} from '@/types';
import { SUPPORTED_WEIGHTS, getBaseModel } from '@/constants/models';
import {
  Columns2,
  Download,
  Share2,
  Sparkles,
  Loader2,
  Check,
  Scale,
  RefreshCw,
  Info,
} from 'lucide-react';

interface TryOnViewerProps {
  garment: GarmentData;
  gender: Gender;
  height: number;
  currentWeight: number;
  fitResults: Record<number, string>;
  isGenerating: boolean;
  generatingWeight: number | null;
  onSelectWeight: (weight: number) => void;
  onOpenCompare: () => void;
}

export const TryOnViewer: React.FC<TryOnViewerProps> = ({
  garment,
  gender,
  height,
  currentWeight,
  fitResults,
  isGenerating,
  generatingWeight,
  onSelectWeight,
  onOpenCompare,
}) => {
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // 로딩 진행 안내 문구 시뮬레이션
  const loadingMessages = [
    '1단계: 선택하신 체형 베이스 모델 로드 중...',
    '2단계: 의류 누끼 분석 및 어깨/가슴 라인 맞춤 정렬 중...',
    '3단계: AI IDM-VTON 엔진으로 옷 주름 및 실루엣 합성 중...',
    '마무리 단계: 고해상도 착용 핏 렌더링 완료 중...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const currentResultImage = fitResults[currentWeight];
  const currentModel = getBaseModel(gender, currentWeight, height);
  const cachedCount = Object.keys(fitResults).length;

  // 이미지 다운로드
  const handleDownload = async () => {
    if (!currentResultImage) return;
    try {
      const response = await fetch(currentResultImage);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `fitcheck-${gender}-${height}cm-${currentWeight}kg.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(currentResultImage, '_blank');
    }
  };

  // 링크/결과 복사
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 상단 5kg 단위 핏 스위처 바 */}
      <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <Scale className="w-4 h-4 text-violet-600" />
            <span>5kg 단위 착용 핏 전환 (클릭 시 온디맨드 생성)</span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            생성 완료: <strong className="text-violet-600 font-bold">{cachedCount}개</strong> 체형
          </span>
        </div>

        {/* 5kg 스크롤 가능한 탭 목록 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUPPORTED_WEIGHTS.map((w) => {
            const isSelected = currentWeight === w;
            const isCached = !!fitResults[w];
            const isBeingGenerated = isGenerating && generatingWeight === w;

            return (
              <button
                key={w}
                type="button"
                onClick={() => onSelectWeight(w)}
                disabled={isGenerating}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-sm'
                    : isCached
                    ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {isBeingGenerated ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isCached ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : null}
                <span>{w}kg</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 중앙 메인 착용 뷰어 */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] max-h-[580px] bg-gray-900 flex items-center justify-center overflow-hidden">
        {isGenerating ? (
          /* 스켈레톤 및 실시간 진행 단계 UI */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900/95 z-20">
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider bg-violet-950/80 px-2.5 py-1 rounded-full border border-violet-800">
                AI 가상 피팅 처리 중 ({generatingWeight || currentWeight}kg)
              </span>
              <p className="text-sm font-semibold text-gray-100 transition-all duration-300 min-h-[40px] flex items-center justify-center">
                {loadingMessages[loadingStep]}
              </p>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-violet-500 h-full transition-all duration-500"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                선택하신 몸무게 핏만 개별 생성하여 불필요한 대기시간을 줄입니다.
              </p>
            </div>
          </div>
        ) : currentResultImage ? (
          /* 피팅 완료 이미지 */
          <div className="relative w-full h-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentResultImage}
              alt={`${currentWeight}kg 착용샷`}
              className="w-full h-full object-contain mx-auto"
            />

            {/* 좌측 상단 체형 메타 태그 */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <div className="bg-black/75 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
                <Scale className="w-3.5 h-3.5 text-violet-400" />
                <span>
                  {gender === 'female' ? '여성' : '남성'} {height}cm · {currentWeight}kg
                </span>
              </div>
              <div className="bg-violet-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm self-start">
                {currentModel.bodyType}
              </div>
            </div>

            {/* 우측 상단 비교 모드 & 기능 버튼 */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCompare}
                className="bg-white/95 hover:bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
              >
                <Columns2 className="w-4 h-4 text-violet-600" />
                <span>2가지 무게 비교</span>
              </button>
            </div>
          </div>
        ) : (
          /* 아직 생성되지 않은 상태 */
          <div className="text-center text-white p-6">
            <RefreshCw className="w-10 h-10 text-gray-600 mx-auto mb-3 animate-spin" />
            <p className="text-sm font-semibold">피팅 결과 준비 중...</p>
          </div>
        )}
      </div>

      {/* 하단 툴바 및 체형 정보 안내 */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 의류 및 체형 핏 코멘트 */}
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={garment.imageUrl}
              alt={garment.name}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0 shadow-sm"
            />
            <div>
              <p className="text-xs font-bold text-gray-900 truncate max-w-[240px] sm:max-w-xs">
                {garment.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Info className="w-3 h-3 text-violet-500 shrink-0" />
                <span className="line-clamp-1">{currentModel.silhouetteDesc}</span>
              </p>
            </div>
          </div>

          {/* 액션 버튼 그룹 (다운로드, 공유, 비교) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>이미지 저장</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">복사 완료!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>공유</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenCompare}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>핏 비교 모드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
