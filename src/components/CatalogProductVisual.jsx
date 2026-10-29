import { useState } from 'react';
import { getCatalogVisual } from '../utils/catalogVisual';

export default function CatalogProductVisual({ product, className = '' }) {
  const visual = getCatalogVisual(product);
  const [broken, setBroken] = useState(false);
  const showPhoto = Boolean(visual.photo) && !broken;
  return (
    <div className={`kp-catalog-product-visual ${className}`} style={{ backgroundColor:visual.background }}>
      {showPhoto ? (
        <img className="kp-catalog-photo" src={visual.photo} alt={`Representative photo of ${visual.label}`}
          loading="lazy" decoding="async" onError={() => setBroken(true)} />
      ) : (
        <div className="kp-catalog-illustration" role="img" aria-label={`Illustration: ${visual.label}`}>
          <span className="kp-catalog-emoji" aria-hidden="true">{visual.emoji}</span>
          <span className="kp-catalog-visual-caption">{visual.label}</span>
        </div>
      )}
    </div>
  );
}
