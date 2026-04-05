'use client';

import { useState } from 'react';

interface Props {
  title: string;
  count: number;
  previewCount?: number;
  children: React.ReactNode;
  allChildren: React.ReactNode;
}

export default function ListModal({ title, count, previewCount = 6, children, allChildren }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children}
      {count > previewCount && (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 curator-btn-outline text-[10px] px-6 py-2.5 w-full sm:w-auto"
        >
          TÜMÜNÜ GÖR ({count})
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" />
          <div
            className="relative bg-surface border border-outline-variant/20 rounded-sm w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
              <div>
                <h3 className="text-lg font-bold text-on-surface tracking-tight">{title}</h3>
                <p className="label-caps text-outline mt-0.5">{count} kayıt</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-icon material-icon-sm" aria-hidden="true">close</span>
              </button>
            </div>
            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5">
              {allChildren}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
