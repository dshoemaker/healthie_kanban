import type { Assignee, NewTaskInput } from '../types';
import { TaskForm } from './TaskForm';

type CreateTaskFormProps = {
  assignees: Assignee[];
  onCreate: (input: NewTaskInput) => void;
  onCancel?: () => void;
};

export function CreateTaskForm({ assignees, onCreate, onCancel }: CreateTaskFormProps) {
  return (
    <TaskForm
      assignees={assignees}
      onSubmit={onCreate}
      onCancel={onCancel}
      heading="Create a task"
      submitLabel="Add task"
    />
  );
}
