import type { Assignee, NewTaskInput, Task } from '../types';
import { Modal } from './Modal';
import { TaskForm } from './TaskForm';
import styles from './TaskDetailsModal.module.css';

type TaskDetailsModalProps = {
  task: Task;
  assignees: Assignee[];
  onClose: () => void;
  onSave: (input: NewTaskInput) => void;
};

export function TaskDetailsModal({ task, assignees, onClose, onSave }: TaskDetailsModalProps) {
  return (
    <Modal title="Task details" size="large" onClose={onClose}>
      <div className={styles.details}>
        <TaskForm
          assignees={assignees}
          initialValues={task}
          heading="Task details"
          submitLabel="Save changes"
          onCancel={onClose}
          onSubmit={(input) => {
            onSave(input);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
