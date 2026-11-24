'use client';

import React, { useState } from 'react';
import { GarmentData, Gender } from '@/types';
import { SUPPORTED_WEIGHTS, getBaseModel } from '@/constants/models';
import { X, Columns2, Sparkles, Scale, AlertCircle } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  garment: GarmentData;
  gender: Gender;
  height: number;
  fitResults: Record<number, string>;
  currentWeight: number;
  onRequestGenerateWeight: (weight: number) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  garment,
  gender,
  height,
  fitResults,
  currentWeight,
  onRequestGenerateWeight,
}) => {
  // 기본 비교 대상: 현재 선택 무게와 인접한 5kg 단위 (예: 55kg vs 60kg)
  const [weightA, setWeightA] = useState<number>(currentWeight);
  const [weightB, setWeightB] = useState<number>(
    currentWeight <= 90 ? currentWeight + 5 : currentWeight - 5
  );

  if (!isOpen) return null;

  const modelA = getBaseModel(gender, weightA, height);
  const modelB = getBaseModel(gender, weightB, height);

  const imageA = fitResults[weightA];
  const imageB = fitResults[weightB];

  const weightDiff = Math.abs(weightA - weightB);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-violet-100 text-violet-700 rounded-lg">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                5kg 단위 핏(Fit) 비교 모드
              </h3>
              <p className="text-xs text-gray-500">
                두 가지 몸무게 착용 모습을 나란히 놓고 사이즈감과 핏 차이를 분석합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 의류 요약 바 */}
        <div className="px-5 py-2.5 bg-violet-50/60 border-b border-violet-100 flex items-center justify-between text-xs">
          <span className="font-bold text-violet-900 truncate">
            의류: {garment.name}
          </span>
          <span className="text-violet-700 font-semibold shrink-0">
            신장 기준: {height}cm ({gender === 'female' ? '여성' : '남성'})
          </span>
        </div>

        {/* 바디 비교 영역 (좌우 2분할 뷰) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* 무게 A 패널 */}
            <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">기준 모델 A</span>
                <select
                  value={weightA}
                  onChange={(e) => setWeightA(Number(e.target.value))}
                  className="text-xs font-bold py-1.5 px-2.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg focus:outline-none"
                >
                  {SUPPORTED_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}kg {fitResults[w] ? '(생성됨)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 이미지 뷰 */}
              <div className="relative aspect-[3/4] bg-gray-900 flex items-center justify-center">
                {imageA ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageA}
                    alt={`${weightA}kg 핏`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-4 text-center text-white">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-300">
                      {weightA}kg 피팅 이미지가 아직 생성되지 않았습니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onRequestGenerateWeight(weightA);
                      }}
                      className="mt-3 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      {weightA}kg 생성하기
                    </button>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] font-bold px-2 py-1 rounded">
                  {weightA}kg · BMI {modelA.bmi}
                </div>
              </div>

              {/* 체형 설명 */}
              <div className="p-3 bg-white border-t border-gray-200 text-xs">
                <span className="font-bold text-gray-900">{modelA.bodyType}</span>
                <p className="text-gray-500 mt-0.5 line-clamp-2">{modelA.silhouetteDesc}</p>
              </div>
            </div>

            {/* 무게 B 패널 */}
            <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
              <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">비교 모델 B</span>
                <select
                  value={weightB}
                  onChange={(e) => setWeightB(Number(e.target.value))}
                  className="text-xs font-bold py-1.5 px-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg focus:outline-none"
                >
                  {SUPPORTED_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}kg {fitResults[w] ? '(생성됨)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 이미지 뷰 */}
              <div className="relative aspect-[3/4] bg-gray-900 flex items-center justify-center">
                {imageB ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageB}
                    alt={`${weightB}kg 핏`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-4 text-center text-white">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-300">
                      {weightB}kg 피팅 이미지가 아직 생성되지 않았습니다.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onRequestGenerateWeight(weightB);
                      }}
                      className="mt-3 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      {weightB}kg 생성하기
                    </button>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] font-bold px-2 py-1 rounded">
                  {weightB}kg · BMI {modelB.bmi}
                </div>
              </div>

              {/* 체형 설명 */}
              <div className="p-3 bg-white border-t border-gray-200 text-xs">
                <span className="font-bold text-gray-900">{modelB.bodyType}</span>
                <p className="text-gray-500 mt-0.5 line-clamp-2">{modelB.silhouetteDesc}</p>
              </div>
            </div>
          </div>

          {/* 비교 분석 요약 팁 */}
          <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3">
            <Scale className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-gray-700">
              <p className="font-bold text-gray-900">
                {weightA}kg vs {weightB}kg 핏 차이 포인트 (체중 차이: {weightDiff}kg)
              </p>
              <p className="mt-1">
                {weightA < weightB
                  ? `${weightA}kg에서는 정사이즈 또는 깔끔한 정돈된 핏으로 연출되며, ${weightB}kg에서는 어깨선 및 품에 적당한 텐션감이 더해져 보다 입체적인 실루엣이 형성됩니다.`
                  : weightA > weightB
                  ? `${weightA}kg 체형에서는 품과 가슴둘레가 여유롭게 핏되며, ${weightB}kg 체형에서는 슬림하고 정돈된 라인이 강조됩니다.`
                  : '동일한 몸무게입니다. 상단 셀렉트박스에서 다른 몸무게를 선택해 비교해 보세요.'}
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
