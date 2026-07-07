import { useState } from 'react'

function Todo() {
    const [tasks, setTasks] = useState([]);

    const [text, setText] = useState('');
        
    function addTask(event) {
    event.preventDefault();
    if (!text.trim()) return;

    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
    };
    setTasks([...tasks, newTask]);
    setText('');
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

    return(
        <div className="todo-list">

        <form className="todo-form" onSubmit={addTask}>
            <input
                className="todo-input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add a task"
            />

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
                    {task.text}
                </p>

                <button
                    className="todo-delete"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.text}`}
                >
                    ×
                </button>
            </div>
        ))}
        </div>
    );
}

export default Todo;
