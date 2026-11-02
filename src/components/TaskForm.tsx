import { useState } from 'react';
import type { SubmitEvent } from 'react';
import type { Assignee, NewTaskInput } from '../types';
import styles from './TaskForm.module.css';

type TaskFormProps = {
  assignees: Assignee[];
  onSubmit: (input: NewTaskInput) => void;
  onCancel?: () => void;
  initialValues?: NewTaskInput;
  heading: string;
  submitLabel: string;
};

export function TaskForm({
  assignees,
  onSubmit,
  onCancel,
  initialValues,
  heading,
  submitLabel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [points, setPoints] = useState(String(initialValues?.points ?? 0));
  const [assigneeId, setAssigneeId] = useState(initialValues?.assigneeId ?? '');

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const numericPoints = Number(points);
    const assigneeExists = assignees.some(
      (assignee) => assignee.id === assigneeId,
    );

    if (
      !trimmedTitle ||
      !assigneeExists ||
      !Number.isInteger(numericPoints) ||
      numericPoints < 0
    ) {
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description,
      points: numericPoints,
      assigneeId,
    });

    setTitle('');
    setDescription('');
    setPoints('0');
    setAssigneeId('');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>{heading}</h2>

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
          <span>Points</span>
          <input
            className={styles.control}
            type="number"
            min={0}
            value={points}
            onChange={(event) => setPoints(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Assign to</span>
          <select
            className={`${styles.control} ${styles.assigneeSelect}`}
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
            required
          >
            <option value="">Choose an assignee</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                <img className={styles.optionAvatar} src={assignee.image} alt="" width={28} height={28} />
                <span>{assignee.name}</span>
              </option>
            ))}
          </select>
        </label>

        <div className={styles.actions}>
          {onCancel && (
            <button className={styles.cancel} type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className={styles.button}
            type="submit"
            disabled={!title.trim() || !assigneeId}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
