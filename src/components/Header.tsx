import React from 'react';
import { Sparkles, Shirt, Scale, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-violet-200">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">핏체크 5kg</h1>
              <span className="text-[11px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                AI VTON
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">
              쇼핑몰 URL 하나로 확인하는 5kg 단위 내 체형별 가상 핏 비교
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
            <Scale className="w-3.5 h-3.5 text-violet-600" />
            <span className="font-medium">45kg ~ 95kg</span>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>온디맨드 생성</span>
          </div>
        </div>
      </div>
    </header>
  );
};
