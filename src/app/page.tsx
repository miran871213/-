'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { UrlInputForm } from '@/components/UrlInputForm';
import { WeightSelector } from '@/components/WeightSelector';
import { TryOnViewer } from '@/components/TryOnViewer';
import { CompareModal } from '@/components/CompareModal';
import { GarmentData, Gender, TryOnResponse } from '@/types';
import { getBaseModel } from '@/constants/models';
import { Sparkles, ArrowDown, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  // 1. 상태 관리: 의류 선택
  const [selectedGarment, setSelectedGarment] = useState<GarmentData | null>(null);

  // 2. 상태 관리: 체형 설정 (성별, 키, 몸무게)
  const [gender, setGender] = useState<Gender>('female');
  const [height, setHeight] = useState<number>(162);
  const [selectedWeight, setSelectedWeight] = useState<number>(55);

  // 3. 상태 관리: 가상 피팅 결과 클라이언트 캐시 (몸무게 -> 합성 결과 이미지 URL)
  // 키/성별/의류가 변경되면 캐시를 갱신
  const [fitCache, setFitCache] = useState<Record<number, string>>({});

  // 4. 상태 관리: 비동기 생성 로딩 및 온디맨드 진행 무게
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingWeight, setGeneratingWeight] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 5. 비교 모드 모달 상태
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // 캐시된 몸무게 목록
  const cachedWeightList = useMemo(() => {
    return Object.keys(fitCache).map(Number);
  }, [fitCache]);

  // 성별 변경 시 기본 키 동기화 및 캐시 초기화
  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    setHeight(newGender === 'female' ? 162 : 177);
    setFitCache({});
  };

  // 의류 선택 핸들러 (새 의류 선택 시 기존 피팅 캐시 초기화)
  const handleGarmentSelected = (garment: GarmentData) => {
    setSelectedGarment(garment);
    setFitCache({});
    setGenerationError(null);
  };

  // 온디맨드(On-Demand) 가상 피팅 실행 로직
  const executeTryOnForWeight = async (targetWeight: number) => {
    if (!selectedGarment) {
      alert('피팅할 의류를 먼저 선택해 주세요.');
      return;
    }

    // 이미 캐시에 결과가 존재하면 API 재호출 없이 즉시 전환
    if (fitCache[targetWeight]) {
      setSelectedWeight(targetWeight);
      return;
    }

    setIsGenerating(true);
    setGeneratingWeight(targetWeight);
    setGenerationError(null);
    setSelectedWeight(targetWeight);

    try {
      const baseModel = getBaseModel(gender, targetWeight, height);

      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentImageUrl: selectedGarment.imageUrl,
          modelImageUrl: baseModel.imageUrl,
          category: selectedGarment.category,
          gender,
          weight: targetWeight,
          height,
          garmentDescription: selectedGarment.name,
        }),
      });

      const data: TryOnResponse = await response.json();

      if (!response.ok || !data.success || !data.resultImageUrl) {
        throw new Error(data.error || '가상 피팅 생성 중 오류가 발생했습니다.');
      }

      // 클라이언트 캐시에 결과 저장 (온디맨드 캐싱)
      setFitCache((prev) => ({
        ...prev,
        [targetWeight]: data.resultImageUrl!,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '가상 피팅 처리 중 오류가 발생했습니다.';
      setGenerationError(msg);
    } finally {
      setIsGenerating(false);
      setGeneratingWeight(null);
    }
  };

  // 상단/하단에서 몸무게 버튼 클릭 시
  const handleSelectWeight = (weight: number) => {
    if (fitCache[weight]) {
      // 이미 생성된 무게는 즉시 전환
      setSelectedWeight(weight);
    } else {
      // 아직 생성되지 않은 무게는 온디맨드로 바로 생성
      executeTryOnForWeight(weight);
    }
  };

  // 핏 결과가 최소 1개 이상 생성되었는지 여부
  const hasResults = Object.keys(fitCache).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 글로벌 헤더 */}
      <Header />

      {/* 메인 컨테이너 */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* 서비스 인트로 히어로 배너 */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-5 sm:p-7 shadow-lg shadow-violet-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>체형별 현실 핏 완벽 가이드</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                사이즈 고민 끝! 5kg 단위 착용 핏 비교
              </h2>
              <p className="text-xs sm:text-sm text-violet-100 mt-1 max-w-xl leading-relaxed">
                쇼핑몰 상품 링크나 사진만 넣으면, 45kg부터 95kg까지 5kg 구간별 모델에
                AI(IDM-VTON)로 옷을 입혀 나에게 가장 어울리는 사이즈감을 미리 확인합니다.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 text-center">
                <span className="block text-[11px] text-violet-200">지원 체형 구간</span>
                <span className="text-sm sm:text-base font-black">45kg ~ 95kg</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/20 text-center">
                <span className="block text-[11px] text-violet-200">생성 방식</span>
                <span className="text-sm sm:text-base font-black text-emerald-300">On-Demand</span>
              </div>
            </div>
          </div>
        </div>

        {/* 에러 피드백 알림 */}
        {generationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <span className="font-bold">⚠️ 안내:</span>
            <div className="flex-1">
              <p className="font-semibold">{generationError}</p>
              <p className="text-xs text-rose-600 mt-0.5">
                네트워크 상태를 확인하시거나 다른 사진을 선택하여 다시 시도해 주세요.
              </p>
            </div>
          </div>
        )}

        {/* 1단계 & 2단계: 의류 입력 및 체형 모델 설정 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1단계: 의류 이미지 추출 / 업로드 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                피팅할 의류 준비 (URL 또는 직접 업로드)
              </h3>
            </div>
            <UrlInputForm
              onGarmentSelected={handleGarmentSelected}
              selectedGarment={selectedGarment}
            />
          </div>

          {/* 2단계: 체형 설정 (성별, 키, 몸무게 선택) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                체형 설정 및 온디맨드 피팅 실행
              </h3>
            </div>
            <WeightSelector
              gender={gender}
              setGender={handleGenderChange}
              height={height}
              setHeight={setHeight}
              selectedWeight={selectedWeight}
              onSelectWeight={handleSelectWeight}
              cachedWeights={cachedWeightList}
              isGenerating={isGenerating}
              onStartTryOn={() => executeTryOnForWeight(selectedWeight)}
              hasGarment={!!selectedGarment}
            />
          </div>
        </div>

        {/* 3단계: 피팅 결과 뷰어 (최소 1개 생성 시 또는 로딩 중 렌더링) */}
        {(hasResults || isGenerating) && selectedGarment && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-gray-900">
                  체형별 핏(Fit) 비교 뷰어
                </h3>
              </div>
              <span className="text-xs text-gray-500">
                상단 5kg 탭을 눌러 다른 몸무게 핏도 바로 비교해 보세요!
              </span>
            </div>

            <TryOnViewer
              garment={selectedGarment}
              gender={gender}
              height={height}
              currentWeight={selectedWeight}
              fitResults={fitCache}
              isGenerating={isGenerating}
              generatingWeight={generatingWeight}
              onSelectWeight={handleSelectWeight}
              onOpenCompare={() => setIsCompareOpen(true)}
            />
          </div>
        )}

        {/* 2가지 몸무게 나란히 비교 모달 */}
        {selectedGarment && (
          <CompareModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            garment={selectedGarment}
            gender={gender}
            height={height}
            fitResults={fitCache}
            currentWeight={selectedWeight}
            onRequestGenerateWeight={(w) => {
              executeTryOnForWeight(w);
            }}
          />
        )}

        {/* 사용 안내 가이드 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-xs text-gray-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <HelpCircle className="w-4 h-4 text-violet-600" />
            <span>핏체크 5kg 스마트 이용 가이드</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-gray-600">
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
              <strong className="text-gray-900">💡 쇼핑몰 크롤링 팁</strong>
              <span>
                무신사, 에이블리 등 보안 차단이 있는 사이트는 의류 정면 사진을 캡처하여 [직접 사진
                업로드] 탭에 넣어주시면 100% 정상 작동합니다.
              </span>
            </li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
              <strong className="text-gray-900">⚡ 비용 절감 On-Demand 생성</strong>
              <span>
                모든 5kg 단위를 한 번에 일괄 생성하지 않고, 클릭하신 구간만 실시간으로 생성하여
                대기시간과 API 비용을 최소화합니다.
              </span>
            </li>
            <li className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
              <strong className="text-gray-900">🔍 2가지 무게 비교 모드</strong>
              <span>
                현재 몸무게(예: 55kg)와 목표/과거 몸무게(예: 60kg)를 나란히 띄워 루즈핏과 슬림핏의
                차이를 한눈에 비교할 수 있습니다.
              </span>
            </li>
          </ul>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="w-full bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-400">
        <p>© 2026 FitCheck 5kg. Powered by Virtual Try-On AI (IDM-VTON) & Next.js</p>
      </footer>
    </div>
  );
}
