import { useState } from 'react';
import { getCatalogVisual } from '../utils/catalogVisual';

export default function CatalogProductVisual({ product, className = '' }) {
  const visual = getCatalogVisual(product);
  // Failed image state is tied to the URL so reused cards can render a new item.
  const [failedUrl, setFailedUrl] = useState(null);
  const showPhoto = Boolean(visual.photo) && failedUrl !== visual.photo;
  return (
    <div className={`kp-catalog-product-visual ${className}`} style={{ backgroundColor:visual.background }}>
      {showPhoto ? (
        <img className="kp-catalog-photo" src={visual.photo}
          srcSet={visual.photoSrcSet || undefined}
          sizes={className.includes('kp-modal') ? '(max-width: 640px) 90vw, 340px' : '(max-width: 640px) 130px, 200px'}
          alt={`Representative photo of ${visual.label}`}
          loading={className.includes('kp-modal') ? 'eager' : 'lazy'}
          decoding="async" fetchPriority={className.includes('kp-modal') ? 'auto' : 'low'}
          width="240" height="240"
          onError={() => setFailedUrl(visual.photo)} />
      ) : (
        <div className="kp-catalog-illustration" role="img" aria-label={`Illustration: ${visual.label}`}>
          <span className="kp-catalog-emoji" aria-hidden="true">{visual.emoji}</span>
          <span className="kp-catalog-visual-caption">{visual.label}</span>
        </div>
      )}
      {showPhoto && visual.photoCreditUrl && className.includes('kp-modal') && (
        <a className="kp-product-image-credit" href={visual.photoCreditUrl}
           target="_blank" rel="noopener noreferrer"
           onClick={event => event.stopPropagation()}>
          Photo source / license
        </a>
      )}
    </div>
  );
}
