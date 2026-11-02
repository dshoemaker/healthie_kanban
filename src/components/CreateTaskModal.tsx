import { useState } from 'react';
import type { Assignee, NewTaskInput } from '../types';
import { CreateTaskForm } from './CreateTaskForm';
import { Modal } from './Modal';
import styles from './CreateTaskModal.module.css';

type CreateTaskModalProps = {
  assignees: Assignee[];
  onCreate: (input: NewTaskInput) => void;
};

export function CreateTaskModal({ assignees, onCreate }: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);

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
        <Modal title="Create a task" onClose={() => setIsOpen(false)}>
          <CreateTaskForm
            assignees={assignees}
            onCancel={() => setIsOpen(false)}
            onCreate={(input) => {
              onCreate(input);
              setIsOpen(false);
            }}
          />
        </Modal>
      )}
    </>
  );
}
