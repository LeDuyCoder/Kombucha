'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Store, X } from 'lucide-react';

export type AlertType = 'warning' | 'error' | 'info' | 'success' | 'store_closed';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType>({
  showAlert: () => {},
  hideAlert: () => {},
});

export const useAlert = () => useContext(AlertContext);

interface AlertState {
  isOpen: boolean;
  message: string;
  type: AlertType;
  title?: string;
}

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'warning',
    title: undefined,
  });

  const showAlert = useCallback((message: string, type?: AlertType, title?: string) => {
    // Smart detection if type wasn't explicitly provided
    let detectedType: AlertType = type || 'warning';
    const lower = (message || '').toLowerCase();
    
    if (!type) {
      if (lower.includes('đóng cửa') || lower.includes('tạm ngừng') || lower.includes('nghỉ')) {
        detectedType = 'store_closed';
      } else if (lower.includes('lỗi') || lower.includes('thất bại') || lower.includes('không thể')) {
        detectedType = 'error';
      } else if (lower.includes('thành công') || lower.includes('đã gửi')) {
        detectedType = 'success';
      }
    }

    setAlertState({
      isOpen: true,
      message,
      type: detectedType,
      title,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Intercept native browser window.alert so that no default OS alert pops up
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalAlert = window.alert;
    window.alert = (msg: any) => {
      showAlert(String(msg));
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showAlert]);

  const getIcon = () => {
    switch (alertState.type) {
      case 'store_closed':
        return (
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
            <Store className="w-8 h-8" />
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 shadow-2xs">
            <AlertCircle className="w-8 h-8" />
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        );
      case 'info':
        return (
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
            <Info className="w-8 h-8" />
          </div>
        );
      case 'warning':
      default:
        return (
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-2xs">
            <AlertTriangle className="w-8 h-8" />
          </div>
        );
    }
  };

  const getTitle = () => {
    if (alertState.title) return alertState.title;
    switch (alertState.type) {
      case 'store_closed':
        return 'Quán Đang Tạm Đóng Cửa';
      case 'error':
        return 'Thông Báo Lỗi';
      case 'success':
        return 'Thành Công';
      case 'info':
        return 'Thông Tin';
      case 'warning':
      default:
        return 'Lưu Ý';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      {alertState.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-stone-200 relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient highlight strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

            <button
              onClick={hideAlert}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {getIcon()}

            <h3 className="text-lg font-black text-stone-900 tracking-tight mb-2">
              {getTitle()}
            </h3>

            <p className="text-stone-600 text-sm leading-relaxed mb-6 font-medium whitespace-pre-line">
              {alertState.message}
            </p>

            <button
              onClick={hideAlert}
              autoFocus
              className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm tracking-wide shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
          
          <div className="fixed inset-0 z-[-1]" onClick={hideAlert} />
        </div>
      )}
    </AlertContext.Provider>
  );
};
