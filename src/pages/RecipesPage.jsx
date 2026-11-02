import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock, Users, Plus, Check } from 'lucide-react';
import { ANDHRA_RECIPE_BASKETS } from '../data/recipeBaskets';
import { useCart } from '../context/CartContext';
import CatalogProductVisual from '../components/CatalogProductVisual';

function cleanItemName(str) {
  if (!str) return 'Grocery Item';
  return String(str)
    .replace(/&#x2F;/gi, '/')
    .replace(/&#47;/g, '/')
    .replace(/&amp;/gi, '&')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .trim();
}

export default function RecipesPage({ userLocation = 'Siripuram' }) {
  const navigate = useNavigate();
  const { addItem, totalItems } = useCart();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [addedRecipeId, setAddedRecipeId] = useState(null);

  const filters = [
    { id: 'ALL', label: 'All Recipe Kits' },
    { id: 'LOCAL FAVORITE', label: 'Local Favorites' },
    { id: 'DAILY COMFORT', label: 'Daily Comfort' },
    { id: 'HEALTHY BREAKFAST', label: 'Breakfast' },
    { id: '4 PM TEA TIME', label: 'Tea Time Snacks' },
    { id: 'SUNDAY SPECIAL', label: 'Sunday Special' }
  ];

  const filteredBaskets = activeFilter === 'ALL'
    ? ANDHRA_RECIPE_BASKETS
    : ANDHRA_RECIPE_BASKETS.filter(r => r.tag === activeFilter);

  const handleAddRecipeKit = (recipe) => {
    // Stop immediately on a different-store cart: no partial recipe kit and
    // no false success state when the shared cart shows its warning popup.
    for (const it of recipe.ingredients) {
      if (!addItem('localfresh', {
        id:it.id,name:cleanItemName(it.name),
        price:it.price,mrp:it.price+5,unit:it.unit
      })) return;
    }
    setAddedRecipeId(recipe.id);
    setTimeout(() => setAddedRecipeId(null), 2500);
  };

  return (
    <div className="kp-recipes-page" style={{ minHeight: '100vh', background: 'var(--neu-surface, #FAF7FC)', paddingBottom: '90px' }}>
      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(180deg, #1A0826 0%, #2A0845 50%, #1D0630 100%)',
        color: '#FFFFFF',
        padding: '16px 20px 24px',
        borderBottom: '1px solid rgba(222, 0, 183, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/home')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
            aria-label="Back to home"
          >
            <ArrowLeft size={19} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #DE00B7 0%, #7521FF 100%)',
              color: '#FFFFFF',
              fontSize: '10.5px',
              fontWeight: '850',
              padding: '2px 8px',
              borderRadius: '6px',
              letterSpacing: '0.6px',
              marginBottom: '2px'
            }}>
              MANDI MEAL KITS
            </span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.3px' }}>
              What to Cook Today?
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            aria-label={`Cart with ${totalItems} items`}
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#DE00B7',
                color: '#FFFFFF',
                fontSize: '10.5px',
                fontWeight: '850',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <p style={{
          margin: '0 auto',
          maxWidth: '480px',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.82)',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          Handcrafted Andhra & South Indian recipe baskets. All pre-portioned ingredients sourced directly from <strong>LocalFresh Mandi ({userLocation})</strong> and delivered together in 20–30 mins.
        </p>
      </header>

      {/* ── FILTER PILLS ── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '14px 16px',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(117, 33, 255, 0.1)',
        scrollbarWidth: 'none'
      }}>
        {filters.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            style={{
              background: activeFilter === f.id ? 'linear-gradient(135deg, #7521FF 0%, #DE00B7 100%)' : '#FAF7FC',
              color: activeFilter === f.id ? '#FFFFFF' : '#475569',
              border: activeFilter === f.id ? 'none' : '1px solid rgba(117, 33, 255, 0.12)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '750',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: activeFilter === f.id ? '0 2px 8px rgba(182, 0, 223, 0.35)' : 'none'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── RECIPE CARDS GRID ── */}
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredBaskets.map(recipe => {
            const kitPrice = recipe.ingredients.reduce((s, i) => s + i.price, 0);
            const isJustAdded = addedRecipeId === recipe.id;

            return (
              <div
                key={recipe.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid rgba(117, 33, 255, 0.12)',
                  boxShadow: '0 4px 16px rgba(42, 8, 69, 0.06)',
                  padding: '18px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '32px', lineHeight: 1 }}>{recipe.image}</span>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        background: '#FDF2F8',
                        color: '#BE185D',
                        border: '1px solid #FBCFE8',
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '1px 7px',
                        borderRadius: '6px',
                        marginBottom: '4px'
                      }}>
                        {recipe.tag}
                      </span>
                      <h2 style={{ margin: 0, fontSize: '16.5px', fontWeight: '850', color: '#1F152E' }}>
                        {recipe.title}
                      </h2>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: '#6B5E7D', display: 'block' }}>Meal Kit Price</span>
                    <strong style={{ fontSize: '18px', fontWeight: '900', color: '#7521FF' }}>₹{kitPrice}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B5E7D', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {recipe.time}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} /> Serves {recipe.servings}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: '0 0 14px' }}>
                  {recipe.desc}
                </p>

                {/* Ingredients Thumbnails & List */}
                <div style={{
                  background: '#FAF7FC',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid rgba(117, 33, 255, 0.08)',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#7521FF', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    📦 INCLUDED IN THIS BASKET ({recipe.ingredients.length} ITEMS)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                    {recipe.ingredients.map(ing => (
                      <div
                        key={ing.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                          <CatalogProductVisual product={{ id: ing.id, name: ing.name }} />
                        </div>
                        <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1F152E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {cleanItemName(ing.name).split('(')[0]}
                          </div>
                          <span style={{ fontSize: '10px', color: '#64748B' }}>
                            {ing.unit} · ₹{ing.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Tap Add Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleAddRecipeKit(recipe)}
                    style={{
                      flex: 1,
                      background: isJustAdded
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #7521FF 0%, #B600DF 50%, #DE00B7 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      fontSize: '13.5px',
                      fontWeight: '850',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(117, 33, 255, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isJustAdded ? (
                      <>
                        <Check size={16} strokeWidth={3} /> Added to Basket!
                      </>
                    ) : (
                      <>
                        <Plus size={16} strokeWidth={2.5} /> 1-Tap Add Meal Kit (₹{kitPrice})
                      </>
                    )}
                  </button>
                  {isJustAdded && (
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      style={{
                        background: '#1F152E',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      View Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
