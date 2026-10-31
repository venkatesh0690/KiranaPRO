import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { triggerHaptic } from '../utils/nativePlatform';
import { toCatalogSearchItems } from '../utils/catalogSearchIndex';

/**
 * Desktop Spotlight Command Bar (⌘K / Ctrl+K / /) (Phase 36 Prompt 36.1)
 */
export default function CommandSpotlight({ catalog = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Global Keyboard listener for ⌘K / Ctrl+K / /
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't open if active element is an input or textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape' && isOpen) {
          setIsOpen(false);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // StoreContext supplies products grouped by category, not a flat array.
  // Normalize before ANY render path (including the closed state), otherwise
  // catalog.slice() crashes the entire app while the search panel is hidden.
  const catalogItems = useMemo(() => toCatalogSearchItems(catalog), [catalog]);

  const filteredItems = query.trim()
    ? catalogItems
        .filter((item) =>
          (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
          (item.category || '').toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 7)
    : catalogItems.slice(0, 5);

  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        if (e.shiftKey) {
          addItem('localfresh', selected);
          setIsOpen(false);
          navigate('/cart');
        } else {
          addItem('localfresh', selected);
          triggerHaptic(10);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(40px, 12vh, 120px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1.5px solid #1E3A2B'
        }}
      >
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderBottom: '1px solid #E2E8F0' }}>
          <Search size={20} color="#1E3A2B" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search groceries, vegetables or kiranas... (↑↓ to pick, Enter to add)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleListKeyDown}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#0F172A',
              fontWeight: '600',
              background: 'transparent'
            }}
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px 0' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              No matches found for "{query}". Press <kbd style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>Esc</kbd> to exit.
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 18px',
                  backgroundColor: selectedIndex === idx ? '#F0FDF4' : 'transparent',
                  borderLeft: selectedIndex === idx ? '3px solid #16A34A' : '3px solid transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  addItem('localfresh', item);
                  triggerHaptic(10);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{item.image || '🥦'}</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A' }}>{item.name}</strong>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>{item.unit} · {item.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '850', color: '#16A34A' }}>₹{item.price}</span>
                  <button
                    type="button"
                    style={{
                      padding: '4px 10px',
                      background: '#1E3A2B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Shortcuts Footer */}
        <div style={{ padding: '10px 18px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
          <span><kbd style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 5px', borderRadius: '4px' }}>↑↓</kbd> Navigate</span>
          <span><kbd style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 5px', borderRadius: '4px' }}>Enter</kbd> Add to Basket</span>
          <span><kbd style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 5px', borderRadius: '4px' }}>Shift + Enter</kbd> Go to Cart</span>
        </div>
      </div>
    </div>
  );
}
