import { useState } from 'react';
import type { SubmitEvent } from 'react';
import type { Assignee, NewTaskInput } from '../types';
import styles from './CreateTaskForm.module.css';

type CreateTaskFormProps = {
  assignees: Assignee[];
  onCreate: (input: NewTaskInput) => void;
};

export function CreateTaskForm({
  assignees,
  onCreate,
}: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const assigneeExists = assignees.some(
      (assignee) => assignee.id === assigneeId,
    );

    if (!trimmedTitle || !assigneeExists) {
      return;
    }

    onCreate({
      title: trimmedTitle,
      description,
      assigneeId,
    });

    setTitle('');
    setDescription('');
    setAssigneeId('');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Create a task</h2>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span>Title</span>
          <input
            className={styles.control}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Description</span>
          <textarea
            className={styles.control}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </label>

        <label className={styles.field}>
          <span>Assign to</span>
          <select
            className={styles.control}
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            required
          >
            <option value="">Choose an assignee</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </label>

        <button
          className={styles.button}
          type="submit"
          disabled={!title.trim() || !assigneeId}
        >
          Add task
        </button>
      </div>
    </form>
  );
}
