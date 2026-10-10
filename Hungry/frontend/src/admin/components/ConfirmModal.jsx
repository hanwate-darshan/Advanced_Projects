import React from 'react';
import { ClipLoader } from 'react-spinners';
import { FaTriangleExclamation } from 'react-icons/fa6';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lift max-w-md w-full p-6 border border-slate-100 animate-scale-in">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <FaTriangleExclamation size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 leading-snug">{title}</h3>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition shadow-soft flex items-center gap-2 cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#F95B23] hover:bg-[#d53a0b]'
            }`}
          >
            {isLoading ? <ClipLoader size={16} color="white" /> : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
