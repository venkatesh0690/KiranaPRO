import { useState } from 'react';
import { Camera, FileText, Check, Plus, Minus, ShoppingBag, X, Sparkles } from 'lucide-react';
import { cleanWhatsAppText, parseGroceryLines, fuzzyMatchProduct } from '../utils/parchiScanner';
import { useCart } from '../context/CartContext';

export default function ParchiScannerModal({ catalog, onClose }) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'photo'
  const [inputText, setInputText] = useState(
    '1. 2 kg Tomatoes\n2. 500g Bendakaya\n3. 1 kg Toor Dal\n4. 1 bunch Kothimeera\n5. 1 kg Onions'
  );
  const [matchedItems, setMatchedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const handleParse = (textToParse) => {
    setIsProcessing(true);
    setHasScanned(true);

    setTimeout(() => {
      const cleaned = cleanWhatsAppText(textToParse || inputText);
      const lines = parseGroceryLines(cleaned);
      const results = lines.map((item) => {
        const match = fuzzyMatchProduct(item, catalog);
        return {
          rawLine: item.rawLine,
          requestedQty: item.qty,
          matchedProduct: match,
          selectedQty: match ? Math.max(1, Math.round(item.qty)) : 1,
          selected: Boolean(match)
        };
      });

      setMatchedItems(results);
      setIsProcessing(false);
    }, 400);
  };

  const handleToggleSelect = (index) => {
    setMatchedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateQty = (index, delta) => {
    setMatchedItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQty = Math.max(1, (item.selectedQty || 1) + delta);
        return { ...item, selectedQty: newQty };
      })
    );
  };

  const handleAddAllToCart = () => {
    let count = 0;
    matchedItems.forEach((item) => {
      if (item.selected && item.matchedProduct) {
        for (let q = 0; q < item.selectedQty; q++) {
          addItem('localfresh', item.matchedProduct);
        }
        count++;
      }
    });

    onClose();
  };

  const selectedCount = matchedItems.filter((i) => i.selected && i.matchedProduct).length;
  const estimatedTotal = matchedItems.reduce((sum, i) => {
    if (i.selected && i.matchedProduct) {
      return sum + (Number(i.matchedProduct.price || 0) * (i.selectedQty || 1));
    }
    return sum;
  }, 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-surface, #FFFFFF)',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '85vh',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--brand-primary, #1E3A2B)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} color="#A7F3D0" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                Handwritten Parchi & Grocery List Scanner
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#A7F3D0' }}>
              Bilingual Telugu & English fuzzy match to live inventory
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch: Paste / Type vs Photo */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'paste' ? '#FFFFFF' : 'transparent',
              borderBottom: activeTab === 'paste' ? '2px solid var(--brand-primary, #1E3A2B)' : 'none',
              fontWeight: activeTab === 'paste' ? '800' : '600',
              fontSize: '13px',
              color: activeTab === 'paste' ? 'var(--brand-primary, #1E3A2B)' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} />
            Paste / Type Parchi List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'photo' ? '#FFFFFF' : 'transparent',
              borderBottom: activeTab === 'photo' ? '2px solid var(--brand-primary, #1E3A2B)' : 'none',
              fontWeight: activeTab === 'photo' ? '800' : '600',
              fontSize: '13px',
              color: activeTab === 'photo' ? 'var(--brand-primary, #1E3A2B)' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Camera size={16} />
            Snap Photo of Paper List
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'photo' ? (
            <div style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              background: '#F8FAFC'
            }}>
              <Camera size={40} color="var(--brand-primary, #1E3A2B)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#1E293B' }}>
                Snap a photo of your paper parchi
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B' }}>
                Hold your phone flat above the paper list in good lighting.
              </p>
              <button
                type="button"
                onClick={() => {
                  // Simulate photo OCR scan
                  handleParse(
                    '1. Ash Gourd (Boodida Gummadi) 500g\n2. Yellow Cucumber (Dosakaya) 2 pcs\n3. Lady Finger (Bendakaya) 1 kg\n4. Potatoes 1 kg\n5. Garlic 200g'
                  );
                }}
                style={{
                  padding: '10px 20px',
                  background: 'var(--brand-primary, #1E3A2B)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Simulate Camera Capture
              </button>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Type or paste items (one item per line or separated by commas):
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 2 kg Tomatoes, 500g Bendakaya, 1 packet Sona Masoori Rice"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <button
                type="button"
                onClick={() => handleParse(inputText)}
                disabled={isProcessing || !inputText.trim()}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  background: 'var(--brand-primary, #1E3A2B)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isProcessing ? 'Analyzing & Matching with Live Mandi Stock…' : '🔍 Scan & Match with KiranaPRO Storefront'}
              </button>
            </div>
          )}

          {/* Matched Items Results List */}
          {hasScanned && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
                  Matched Products ({selectedCount} of {matchedItems.length})
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Uncheck any item you don't need
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchedItems.map((item, idx) => {
                  const product = item.matchedProduct;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: item.selected ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                        background: item.selected ? '#F0FDF4' : '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleSelect(idx)}
                          style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            Parchi line: <em>"{item.rawLine}"</em>
                          </div>
                          {product ? (
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
                              {product.name} • <span style={{ color: 'var(--brand-emerald, #15803D)' }}>₹{product.price}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: '600' }}>
                              ⚠️ No in-stock match found in Visakhapatnam inventory
                            </div>
                          )}
                        </div>
                      </div>

                      {product && item.selected && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#FFFFFF',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1'
                        }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(idx, -1)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                            {item.selectedQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(idx, 1)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout CTA */}
        {hasScanned && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Estimated Total:</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-primary, #1E3A2B)' }}>
                ₹{estimatedTotal}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddAllToCart}
              disabled={selectedCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: selectedCount > 0 ? 'var(--brand-primary, #1E3A2B)' : '#94A3B8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: selectedCount > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              <ShoppingBag size={18} />
              Add {selectedCount} Items to Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
