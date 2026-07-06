/**
 * CropModal
 *
 * A portal modal wrapping react-image-crop.
 * Shows a draggable crop UI over the image and emits a blob URL on confirm.
 *
 * Props:
 *   src            — image URL to crop (local file:// or https://)
 *   aspect         — aspect ratio (default: 16/9 for hero; pass undefined for free)
 *   onConfirm(url) — called with a blob: URL of the cropped PNG
 *   onClose()      — called when user cancels
 */
import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { createPortal } from 'react-dom';
import styles from './CropModal.module.css';

export interface CropModalProps {
  src: string;
  aspect?: number;
  onConfirm: (croppedUrl: string) => void;
  onClose: () => void;
}

export function CropModal({ src, aspect = 16 / 9, onConfirm, onClose }: CropModalProps) {
  const [crop, setCrop]         = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop>();
  const imgRef                  = useRef<HTMLImageElement>(null);

  const handleConfirm = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !completed) return;

    const canvas = document.createElement('canvas');
    const scaleX = img.naturalWidth  / img.width;
    const scaleY = img.naturalHeight / img.height;
    canvas.width  = completed.width  * scaleX;
    canvas.height = completed.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      img,
      completed.x * scaleX,
      completed.y * scaleY,
      completed.width  * scaleX,
      completed.height * scaleY,
      0, 0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      onConfirm(URL.createObjectURL(blob));
    }, 'image/png');
  }, [completed, onConfirm]);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <span className={styles.dialogTitle}>Crop image</span>
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.cropWrap}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompleted(c)}
            aspect={aspect}
            keepSelection
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop source"
              className={styles.cropImage}
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.cancelBtn} onClick={onClose} type="button">Cancel</button>
          <button
            className={styles.confirmBtn}
            onClick={() => void handleConfirm()}
            type="button"
            disabled={!completed}
          >
            Apply crop
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
