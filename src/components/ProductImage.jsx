import React from 'react';
import CatalogProductVisual from './CatalogProductVisual';

/**
 * Resilient ProductImage component that renders high-resolution WebP product images,
 * animated skeleton shimmers during resolution, and styled category fallbacks.
 * Matches Phase 1 Prompt 1.2 specification.
 */
export function ProductImage({ product, className = '', ...props }) {
  return <CatalogProductVisual product={product} className={`kp-product-image-wrap ${className}`} {...props} />;
}

export default ProductImage;
