'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, X, ExternalLink, Check, Trash2, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySaved?: (apiKey: string) => void;
}

export const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onApiKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const stored = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY) || '';
      setApiKey(stored);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      alert('유효한 Gemini API 키를 입력해 주세요.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, trimmed);
    }
    setIsSaved(true);
    if (onApiKeySaved) onApiKeySaved(trimmed);

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleDelete = () => {
    if (confirm('저장된 Gemini API 키를 삭제하시겠습니까?')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
      }
      setApiKey('');
      if (onApiKeySaved) onApiKeySaved('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                Gemini 3.8 Flash API 키 설정
              </h3>
              <p className="text-xs text-gray-500">사용자 개인 API 키로 AI 핏 분석 기능 사용</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-violet-50/60 border border-violet-200/80 rounded-xl text-xs text-violet-900 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-violet-800">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              <span>보안 안내</span>
            </div>
            <p className="text-violet-700">
              입력하신 API 키는 서버에 영구 저장되지 않으며, 사용자 브라우저의 로컬 스토리지에만
              안전하게 보관되어 AI 요청 시에만 사용됩니다.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 발급 안내 링크 */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-gray-500">API 키가 없으신가요?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 underline underline-offset-2"
            >
              <span>Google AI Studio에서 무료 발급받기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {apiKey ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>키 삭제</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                isSaved ? 'bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>저장 완료!</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>키 저장하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
