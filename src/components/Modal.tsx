import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './Modal.module.css';

type ModalProps = {
  title: string;
  size?: 'default' | 'large';
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, size = 'default', onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Layout cleanup closes the native dialog before its DOM is removed.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function closeModal() {
    // Close before unmounting so the browser can return focus to the opener.
    dialogRef.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${size === 'large' ? styles.large : ''}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled)',
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        const active = event.currentTarget.ownerDocument.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
