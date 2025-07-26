// app/components/Modal.tsx
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export function ProductColorsModal({ children, onClose, isModalOpen }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []); // If we don't check mount the document will not defined

  if (!mounted) return null;

  return createPortal(
    <>
    <div onClick={onClose}id="product-colors-popup-overlay" className="product-colors-popup-overlay" style={{ display: isModalOpen ? 'block' : 'none' }}></div>
<div id="product-colors-popup" className={isModalOpen ? 'product-colors-drawer-open product-colors-popup': 'product-colors-popup'} style={{ display: isModalOpen ? 'block' : 'none' }}> 
      <div className="color__selected_optionn"> <span className="color_selectt">
        Select a color
        </span>
        <span id="product-colors-close-popup-button" className="product-colors-close-popup-button" onClick={onClose}>×</span>
      </div>

      {children}
    
    </div>
    </>,
    document.getElementById("product-colors-modal-root")
  );
}
