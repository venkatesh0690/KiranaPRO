import React, { useEffect, useRef, useState } from 'react';

/**
 * Native iOS/Android Spring-Physics Swipeable Bottom Sheet (Phase 34 Prompt 34.2)
 * Features:
 * - 0.38s cubic-bezier(0.32, 0.72, 0, 1) spring physics
 * - Top grabber handle
 * - Downward touch drag-to-dismiss (> 90px threshold)
 * - Background body scroll-locking
 */
export default function BottomSheet({ isOpen, onClose, title, children }) {
  const [dragY, setDragY] = useState(0);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setDragY(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (dragY > 90) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className="kp-bottomsheet-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        transition: 'opacity 0.25s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="kp-bottomsheet-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${dragY}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
          overflow: 'hidden'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* iOS Grabber Handle */}
        <div style={{ width: '100%', padding: '10px 0 6px', display: 'flex', justifyContent: 'center', cursor: 'grab' }}>
          <div style={{ width: '40px', height: '5px', borderRadius: '9999px', backgroundColor: '#CBD5E1' }} />
        </div>

        {title && (
          <div style={{ padding: '0 20px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{title}</h3>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748B', cursor: 'pointer', padding: '4px' }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
