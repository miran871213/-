'use client';

import React, { useState, useRef } from 'react';
import {
  Link2,
  UploadCloud,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shirt,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { GarmentCategory, GarmentData, ScrapeResult } from '@/types';
import { GARMENT_CATEGORIES, SAMPLE_GARMENTS } from '@/constants/models';

interface UrlInputFormProps {
  onGarmentSelected: (garment: GarmentData) => void;
  selectedGarment: GarmentData | null;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({
  onGarmentSelected,
  selectedGarment,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapeResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory>('upper_body');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. URL 스크래핑 요청
  const handleScrape = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setIsScraping(true);
    setScrapeError(null);
    setScrapedData(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // 크롤링 실패 시 에러 안내와 함께 직접 업로드 탭으로 자동 유도
        setScrapeError(
          data.error || '이미지를 자동으로 불러오지 못했습니다. 옷 사진을 직접 올려주세요.'
        );
        if (data.fallbackToUpload) {
          setActiveTab('upload');
        }
        return;
      }

      setScrapedData(data);
      // 첫 번째 추출 이미지를 기본 선택
      if (data.images && data.images.length > 0) {
        selectGarmentImage(data.images[0], data.title, data.url);
      }
    } catch {
      setScrapeError('쇼핑몰 사이트 연결에 실패했습니다. 옷 사진을 직접 업로드해 주세요.');
      setActiveTab('upload');
    } finally {
      setIsScraping(false);
    }
  };

  // 2. 의류 이미지 선택
  const selectGarmentImage = (imageUrl: string, name?: string, sourceUrl?: string) => {
    setPreviewUrl(imageUrl);
    onGarmentSelected({
      id: `garment-${Date.now()}`,
      name: name || scrapedData?.title || '선택된 의류',
      category: selectedCategory,
      imageUrl,
      sourceUrl: sourceUrl || urlInput,
      isUploaded: false,
    });
  };

  // 3. 파일 직접 업로드 처리 (드래그앤드롭 / 파일 선택)
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setScrapeError(null);
      onGarmentSelected({
        id: `upload-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: selectedCategory,
        imageUrl: result,
        isUploaded: true,
      });
    };
    reader.readAsDataURL(file);
  };

  // 4. 샘플 프리셋 의류 선택
  const handleSelectSample = (sample: (typeof SAMPLE_GARMENTS)[0]) => {
    setSelectedCategory(sample.category);
    setPreviewUrl(sample.imageUrl);
    setScrapeError(null);
    onGarmentSelected({
      id: sample.id,
      name: sample.name,
      category: sample.category,
      imageUrl: sample.imageUrl,
      isUploaded: false,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 transition-all">
      {/* 탭 전환 (URL 스크래핑 vs 직접 사진 업로드) */}
      <div className="flex border-b border-gray-200 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'url'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Link2 className="w-4 h-4" />
          쇼핑몰 URL 입력
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          직접 사진 업로드
        </button>
      </div>

      {/* 에러 발생 안내 배너 */}
      {scrapeError && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm text-amber-900 leading-relaxed">
            <p className="font-semibold">{scrapeError}</p>
            <p className="mt-1 text-amber-700">
              무신사, 지그재그 등 보안이 강한 사이트는 자동 크롤링이 제한될 수 있습니다. 캡처한 의류
              사진을 직접 업로드해 보세요!
            </p>
          </div>
        </div>
      )}

      {/* 탭 1: URL 입력 폼 */}
      {activeTab === 'url' && (
        <div>
          <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="예: https://www.musinsa.com/app/goods/..."
                className="w-full px-4 py-3 pl-10 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
              <Link2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              disabled={isScraping || !urlInput.trim()}
              className="px-5 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>추출 중...</span>
                </>
              ) : (
                <>
                  <span>의류 이미지 추출</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 스크래핑 결과 이미지 선택 갤러리 */}
          {scrapedData && scrapedData.images && scrapedData.images.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{scrapedData.title}</h4>
                  <p className="text-xs text-gray-500">
                    추출된 이미지 중 <span className="font-semibold text-violet-600">피팅할 의류 1장</span>을 선택하세요.
                  </p>
                </div>
                {scrapedData.price && (
                  <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-1 rounded-md">
                    {scrapedData.price}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {scrapedData.images.map((imgUrl, idx) => {
                  const isSelected = previewUrl === imgUrl;
                  return (
                    <div
                      key={idx}
                      onClick={() => selectGarmentImage(imgUrl, scrapedData.title)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                        isSelected
                          ? 'border-violet-600 ring-2 ring-violet-200 scale-95 shadow-md'
                          : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`추출 이미지 ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-violet-600 text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 탭 2: 직접 사진 업로드 드래그앤드롭 영역 */}
      {activeTab === 'upload' && (
        <div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-violet-500 hover:bg-violet-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 mx-auto flex items-center justify-center mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              옷 사진을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-gray-500 mt-1">
              배경이 깔끔한 누끼 사진 또는 정면 단독 사진일수록 피팅 정확도가 높아집니다.
            </p>
          </div>
        </div>
      )}

      {/* 카테고리 선택 (상의 / 하의 / 원피스) */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          의류 카테고리 선택 (AI 가상 피팅 파라미터)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GARMENT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.value as GarmentCategory);
                  if (selectedGarment) {
                    onGarmentSelected({
                      ...selectedGarment,
                      category: cat.value as GarmentCategory,
                    });
                  }
                }}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50 text-violet-700 font-bold shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 원클릭 테스트용 데모 샘플 의류 */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-500" />
            원클릭 데모 샘플 옷으로 바로 테스트
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_GARMENTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50/50 text-left transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sample.imageUrl}
                alt={sample.name}
                className="w-10 h-10 rounded-md object-cover shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-medium text-gray-900 truncate">{sample.name}</p>
                <p className="text-[10px] text-gray-500">{sample.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 의류 요약 바 */}
      {selectedGarment && (
        <div className="mt-4 p-3 bg-violet-50/70 border border-violet-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedGarment.imageUrl}
              alt="선택된 옷"
              className="w-12 h-12 rounded-lg object-cover border border-violet-200 shadow-sm"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-violet-600 bg-white px-1.5 py-0.5 rounded border border-violet-200">
                선택 완료
              </span>
              <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                {selectedGarment.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-violet-700 bg-white px-2.5 py-1 rounded-lg border border-violet-200">
              {GARMENT_CATEGORIES.find((c) => c.value === selectedGarment.category)?.label.split(' ')[0]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
