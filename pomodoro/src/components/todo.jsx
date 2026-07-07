import { useRef, useState } from 'react'

function Todo() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const dateInputRef = useRef(null);
        
    function addTask(event) {
    event.preventDefault();
    if (!text.trim()) return;

    const newTask = {
        id: Date.now(),
        text: text.trim(),
        dueDate: dueDate.trim(),
        completed: false,
    };
    setTasks([...tasks, newTask]);
    setText('');
    setDueDate('');
    }

    function deleteTask(id) {
        setTasks(tasks.filter(task => task.id !== id));
    }

    function toggleCompleted(id) {
        setTasks(currentTasks => currentTasks.map(task => {
            if (task.id === id) {
                return {...task, completed: !task.completed};
            } else {
                return task;
            }
        }));
    }

    function toggleCompletedWithKeyboard(event, id) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCompleted(id);
        }
    }

    function formatDueDate(date) {
        if (!date) return '';

        const [year, month, day] = date.split('-');
        if (!year || !month || !day) return '';

        return `${Number(month)}/${Number(day)}`;
    }

    const pastDue = (dueDate) => {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateDue = new Date(dueDate);
        dateDue.setHours(0, 0, 0, 0);

        return dateDue < today;
    }

    function openDatePicker() {
        if (dateInputRef.current?.showPicker) {
            dateInputRef.current.showPicker();
        } else {
            dateInputRef.current?.focus();
            dateInputRef.current?.click();
        }
    }

    return(
        <div className="todo-list">

        <form className="todo-form" onSubmit={addTask}>
            <input
                className="todo-input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a task"
            />

            <button
                className="todo-date-picker"
                type="button"
                onClick={openDatePicker}
                aria-label="Choose due date"
            >
                <span className="todo-date-icon" aria-hidden="true" />
                <input
                    ref={dateInputRef}
                    className="todo-due-date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    onKeyDown={event => event.preventDefault()}
                    onPaste={event => event.preventDefault()}
                    type="date"
                    tabIndex="-1"
                />
            </button>

            <button className="todo-add" type="submit">Add</button>
        </form>

        {tasks.map(task => (
            <div className={`todo-item ${task.completed ? 'is-completed' : ''}`} key={task.id}>
                <p
                    className="todo-text"
                    onClick={() => toggleCompleted(task.id)}
                    onKeyDown={event => toggleCompletedWithKeyboard(event, task.id)}
                    role="button"
                    tabIndex="0"
                    aria-label={`Mark ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`}
                >
                    {task.dueDate && (
                        <span className="todo-date" style={{ color: pastDue(task.dueDate) ? '#d53c3c' : 'inherit' }}>
                            {pastDue(task.dueDate) ? "Overdue" : formatDueDate(task.dueDate)}
                        </span>
                    )}
                    {task.text}
                </p>

                <button
                    className="todo-delete"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.text}`}
                >
                    &times;
                </button>
            </div>
        ))}
        </div>
    );
}

export default Todo;
