'use client';

import React, { useState, useEffect } from 'react';
import { GarmentData, Gender } from '@/types';
import { getBaseModel } from '@/constants/models';
import { GEMINI_API_KEY_STORAGE_KEY } from './ApiKeyModal';
import {
  Sparkles,
  Bot,
  Ruler,
  Compass,
  Scale,
  Loader2,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface GeminiFitAdvisorProps {
  garment: GarmentData | null;
  gender: Gender;
  height: number;
  weight: number;
  compareWeight?: number;
  onOpenApiKeyModal: () => void;
}

type QuestionType = 'fit_analysis' | 'size_recommendation' | 'styling_advice' | 'compare_weights';

export const GeminiFitAdvisor: React.FC<GeminiFitAdvisorProps> = ({
  garment,
  gender,
  height,
  weight,
  compareWeight,
  onOpenApiKeyModal,
}) => {
  const [selectedType, setSelectedType] = useState<QuestionType>('fit_analysis');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.8-flash');

  // 로컬 스토리지 API 키 감지
  useEffect(() => {
    const checkKey = () => {
      if (typeof window !== 'undefined') {
        const key = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
        setHasApiKey(!!key?.trim());
      }
    };
    checkKey();
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  // 의류 또는 몸무게가 변경되면 분석 초기화
  useEffect(() => {
    setAnalysisText(null);
    setErrorMsg(null);
  }, [garment?.id, weight, compareWeight]);

  const currentModel = getBaseModel(gender, weight, height);
  const compModel = compareWeight ? getBaseModel(gender, compareWeight, height) : undefined;

  // Gemini API 호출 함수
  const runGeminiAnalysis = async (typeToRun = selectedType) => {
    if (!garment) {
      alert('분석할 의류를 먼저 선택해 주세요.');
      return;
    }

    const storedKey =
      typeof window !== 'undefined'
        ? localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || ''
        : '';

    if (!storedKey) {
      onOpenApiKeyModal();
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSelectedType(typeToRun);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': storedKey,
        },
        body: JSON.stringify({
          garment: {
            name: garment.name,
            category: garment.category,
            imageUrl: garment.imageUrl,
          },
          bodyProfile: {
            gender,
            height,
            weight,
            bmi: currentModel.bmi,
            bodyType: currentModel.bodyType,
            silhouetteDesc: currentModel.silhouetteDesc,
          },
          compareProfile: compModel
            ? {
                gender,
                height,
                weight: compareWeight!,
                bmi: compModel.bmi,
                bodyType: compModel.bodyType,
              }
            : undefined,
          questionType: typeToRun,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.needsApiKey) {
          setHasApiKey(false);
          onOpenApiKeyModal();
        }
        throw new Error(data.error || 'Gemini 분석을 완료하지 못했습니다.');
      }

      setAnalysisText(data.analysis);
      if (data.modelUsed) setModelUsed(data.modelUsed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisText) return;
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { type: 'fit_analysis' as const, label: '핏 정밀 진단', icon: Bot },
    { type: 'size_recommendation' as const, label: '추천 사이즈 (S/M/L)', icon: Ruler },
    { type: 'styling_advice' as const, label: '체형 보정 코디 팁', icon: Compass },
    ...(compareWeight
      ? [{ type: 'compare_weights' as const, label: `${weight}kg vs ${compareWeight}kg 비교`, icon: Scale }]
      : []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4 sm:p-6 transition-all">
      {/* 타이틀 및 API 키 상태 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">
                Gemini 3.8 Flash AI 핏 & 사이즈 어드바이저
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {modelUsed}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {currentModel.weight}kg 모델({currentModel.bodyType}) 착용감과 맞춤 사이즈를 AI가 심층 분석합니다.
            </p>
          </div>
        </div>

        {/* API 키 설정 버튼 */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          className={`self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            hasApiKey
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{hasApiKey ? 'Gemini API 키 연결됨' : 'Gemini API 키 입력하기'}</span>
        </button>
      </div>

      {/* 분석 카테고리 탭 선택 */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedType === tab.type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => {
                setSelectedType(tab.type);
                runGeminiAnalysis(tab.type);
              }}
              disabled={isLoading || !garment}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* API 키가 없는 경우 안내 배너 */}
      {!hasApiKey && !analysisText && (
        <div className="my-3 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-xl text-center">
          <Sparkles className="w-7 h-7 text-violet-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-900">
            사용자 개인 Gemini API 키로 무제한 핏 분석을 받아보세요!
          </h4>
          <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
            Google AI Studio에서 무료로 발급받은 API 키를 등록하면, Gemini 3.8 Flash가 체형에 맞는 실시간 맞춤 핏 리포트를 제공합니다.
          </p>
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Gemini API 키 무료 등록하기</span>
          </button>
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="py-8 text-center text-gray-600 space-y-3">
          <Loader2 className="w-7 h-7 text-violet-600 animate-spin mx-auto" />
          <p className="text-xs sm:text-sm font-semibold text-gray-800">
            Gemini 3.8 Flash가 {weight}kg 체형과 의류 스펙을 정밀 진단 중입니다...
          </p>
          <p className="text-[11px] text-gray-400">
            신장 {height}cm · BMI {currentModel.bmi} · {currentModel.bodyType} 기준 분석
          </p>
        </div>
      )}

      {/* 에러 발생 안내 */}
      {errorMsg && (
        <div className="my-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">분석 요청 중 오류가 발생했습니다.</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 분석 결과 출력 박스 */}
      {analysisText && !isLoading && (
        <div className="mt-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              AI 핏 리포트 ({tabs.find((t) => t.type === selectedType)?.label})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>결과 복사</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => runGeminiAnalysis(selectedType)}
                className="px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-50 rounded-lg border border-violet-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>재분석</span>
              </button>
            </div>
          </div>

          {/* 마크다운 형태의 텍스트 렌더링 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap">
            {analysisText}
          </div>
        </div>
      )}

      {/* 시작 유도 버튼 (결과가 없고 로딩도 아닐 때) */}
      {!analysisText && !isLoading && hasApiKey && (
        <div className="pt-3 text-center">
          <button
            type="button"
            disabled={!garment}
            onClick={() => runGeminiAnalysis(selectedType)}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{currentModel.weight}kg 맞춤 Gemini 3.8 Flash 분석 시작하기</span>
          </button>
        </div>
      )}
    </div>
  );
};
