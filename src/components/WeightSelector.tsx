'use client';

import React from 'react';
import {
  Gender,
  WeightUnit,
} from '@/types';
import {
  SUPPORTED_WEIGHTS,
  HEIGHT_PRESETS,
  getBaseModel,
} from '@/constants/models';
import { User, Users, Scale, Check, Sparkles, Loader2 } from 'lucide-react';

interface WeightSelectorProps {
  gender: Gender;
  setGender: (gender: Gender) => void;
  height: number;
  setHeight: (height: number) => void;
  selectedWeight: number;
  onSelectWeight: (weight: number) => void;
  cachedWeights: number[];
  isGenerating: boolean;
  onStartTryOn: () => void;
  hasGarment: boolean;
}

export const WeightSelector: React.FC<WeightSelectorProps> = ({
  gender,
  setGender,
  height,
  setHeight,
  selectedWeight,
  onSelectWeight,
  cachedWeights,
  isGenerating,
  onStartTryOn,
  hasGarment,
}) => {
  const currentModel = getBaseModel(gender, selectedWeight, height);
  const isCurrentWeightCached = cachedWeights.includes(selectedWeight);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-violet-600" />
          5kg 단위 체형 모델 설정
        </h3>
        <span className="text-xs text-gray-500 font-medium">45kg ~ 95kg</span>
      </div>

      {/* 성별 및 키 설정 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* 성별 토글 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">성별</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                gender === 'female'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              여성
            </button>
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                gender === 'male'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              남성
            </button>
          </div>
        </div>

        {/* 키(cm) 선택 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            키 (cm)
          </label>
          <select
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-gray-800"
          >
            {HEIGHT_PRESETS[gender].map((h) => (
              <option key={h} value={h}>
                {h} cm
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5kg 단위 몸무게 탭/스텝 선택 바 (45 ~ 95kg) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700">
            몸무게 선택 (5kg 단위 On-Demand 피팅)
          </label>
          <span className="text-[11px] text-violet-600 font-medium">
            현재 선택: <strong className="text-sm font-extrabold">{selectedWeight}kg</strong>
          </span>
        </div>

        {/* 5kg 단위 버튼 그리드 */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1.5">
          {SUPPORTED_WEIGHTS.map((w) => {
            const isSelected = selectedWeight === w;
            const isCached = cachedWeights.includes(w);

            return (
              <button
                key={w}
                type="button"
                onClick={() => onSelectWeight(w)}
                className={`relative py-2.5 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200 scale-105 z-10'
                    : isCached
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span>{w}kg</span>
                {/* 캐시 완료 표시 뱃지 */}
                {isCached && (
                  <span
                    className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] ${
                      isSelected ? 'bg-white text-violet-700' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 체형 모델 세부 요약 카드 */}
      <div className="p-3.5 bg-gradient-to-r from-gray-50 to-violet-50/40 rounded-xl border border-gray-200 mb-5 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentModel.imageUrl}
          alt={currentModel.label}
          className="w-14 h-18 object-cover rounded-lg border border-gray-300 shrink-0 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900">{currentModel.label}</span>
            <span className="text-[11px] font-semibold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded">
              {currentModel.bodyType}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            신장 {height}cm · BMI {currentModel.bmi}
          </p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1 leading-relaxed">
            {currentModel.silhouetteDesc}
          </p>
        </div>
      </div>

      {/* 가상 피팅 실행 CTA 버튼 */}
      <button
        type="button"
        disabled={!hasGarment || isGenerating}
        onClick={onStartTryOn}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-violet-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI 가상 피팅 생성 중...</span>
          </>
        ) : isCurrentWeightCached ? (
          <>
            <Check className="w-5 h-5" />
            <span>{selectedWeight}kg 착용샷 확인하기 (즉시 렌더링)</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>{selectedWeight}kg 체형으로 입어보기</span>
          </>
        )}
      </button>
      {!hasGarment && (
        <p className="text-center text-xs text-gray-400 mt-2">
          먼저 위에서 쇼핑몰 URL을 입력하거나 옷 사진을 선택해 주세요.
        </p>
      )}
    </div>
  );
};
