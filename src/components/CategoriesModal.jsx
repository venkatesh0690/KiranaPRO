import { X, ChevronRight } from 'lucide-react';
import { allCategories } from '../data/stores';

export default function CategoriesModal({ isOpen, onClose, onSelectCategory }) {
  if (!isOpen) return null;

  return (
    <div className="catm-backdrop" onClick={onClose}>
      <div className="catm-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="catm-header">
          <div>
            <h2 className="catm-title">All Categories</h2>
            <p className="catm-sub">Browse fresh supplies from neighborhood kiranas</p>
          </div>
          <button type="button" className="catm-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Pastel Cards (Directly matching Screenshot 3's Category Grid) */}
        <div className="catm-grid">
          {allCategories.map((cat) => (
            <div
              key={cat.id}
              className="catm-card"
              style={{ background: cat.bg }}
              onClick={() => {
                onSelectCategory(cat.name);
                onClose();
              }}
            >
              <div className="catm-card-top">
                <span className="catm-card-tag">{cat.tag}</span>
                <ChevronRight size={16} color="var(--n500)" />
              </div>
              <div className="catm-card-icon">{cat.icon}</div>
              <span className="catm-card-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
