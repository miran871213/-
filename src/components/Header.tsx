import React, { useState, useEffect } from 'react';
import { Sparkles, Shirt, Scale, Zap, KeyRound, ChevronDown } from 'lucide-react';
import { GEMINI_API_KEY_STORAGE_KEY, GEMINI_MODEL_STORAGE_KEY } from './ApiKeyModal';

interface HeaderProps {
  onOpenApiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenApiKeyModal }) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');

  useEffect(() => {
    const checkSettings = () => {
      if (typeof window !== 'undefined') {
        const key = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
        const model = localStorage.getItem(GEMINI_MODEL_STORAGE_KEY);
        setHasApiKey(!!key?.trim());
        if (model) setSelectedModel(model);
      }
    };
    checkSettings();
    window.addEventListener('storage', checkSettings);
    return () => window.removeEventListener('storage', checkSettings);
  }, []);

  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GEMINI_MODEL_STORAGE_KEY, newModel);
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-5xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-violet-200 shrink-0">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">핏체크 5kg</h1>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 hidden sm:block">
              5kg 단위 내 체형별 가상 핏 비교 & Gemini AI 맞춤 분석
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* 상시 노출 Gemini AI 모델 선택 드롭다운 */}
          <div className="flex items-center bg-violet-50 hover:bg-violet-100/80 border border-violet-200 rounded-xl px-2 py-1 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mr-1" />
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-violet-900 focus:outline-none cursor-pointer pr-1"
            >
              <option value="gemini-3.8-flash">⚡ Gemini 3.8 Flash (정밀)</option>
              <option value="gemini-3.5-flash-lite">🚀 Gemini 3.5 Flash Lite (초고속)</option>
            </select>
          </div>

          {onOpenApiKeyModal && (
            <button
              type="button"
              onClick={onOpenApiKeyModal}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden md:inline">API 키</span>
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
            <Scale className="w-3.5 h-3.5 text-violet-600" />
            <span className="font-medium">45kg ~ 95kg</span>
          </div>
        </div>
      </div>
    </header>
  );
};
