import { useEffect, useRef, useState } from 'react';
import type { Assignee, NewTaskInput } from '../types';
import { CreateTaskForm } from './CreateTaskForm';
import styles from './CreateTaskModal.module.css';

type CreateTaskModalProps = {
  assignees: Assignee[];
  onCreate: (input: NewTaskInput) => void;
};

export function CreateTaskModal({ assignees, onCreate }: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, [isOpen]);

  function closeModal() {
    dialogRef.current?.close();
    setIsOpen(false);
  }

  return (
    <>
      <button
        className={styles.trigger}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        Add task
      </button>

      {isOpen && (
        <dialog
          ref={dialogRef}
          className={styles.dialog}
          aria-label="Create a task"
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
          <div className={styles.content}>
            <CreateTaskForm
              assignees={assignees}
              onCancel={closeModal}
              onCreate={(input) => {
                onCreate(input);
                closeModal();
              }}
            />
          </div>
        </dialog>
      )}
    </>
  );
}
