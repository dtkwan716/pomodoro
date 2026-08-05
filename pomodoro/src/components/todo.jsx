import { useRef, useState, useEffect } from 'react'
import { UserAuth } from './context/AuthContext';
import { supabase } from '../supabase';

function Todo() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const dateInputRef = useRef(null);
        
    const { session } = UserAuth();

    useEffect( () => {
        const getProData = async () => {
            if (!session?.user) return;

            const { data, error } = await supabase
            .from("Tasks")
            .select("*")
            .eq("user_id", session.user.id);

            if(error) {
                console.error("Error fetching tasks:", error);
                return;
            }

            setTasks(data || []);
        };
        getProData();
    }, [session]);

    const supaDeleteTask = async (task) => {
        const { error } = await supabase
        .from("Tasks")
        .delete()
        .eq("id", task.id);

        if (error) {
            console.error("Error deleting task:", error);
        }
    }

    const supaUpdateTask = async (task) => {
        const newCompleted = !task.completed;
        const { data, error } = await supabase
        .from('Tasks')
        .update({ completed: newCompleted }) 
        .eq('id', task.id)                          
        .select()      
        
        if (error) {
            console.error("Error updating task:", error);
        }

    }

    async function addTask(event) {
    event.preventDefault();
    if (!text.trim()) return;
    
    if(session){
        const { data, error } = await supabase
        .from("Tasks")
        .insert({
            user_id: session.user.id,
            completed: false,
            dueDate: dueDate || null,
            text: text.trim(),
        })
        .select()
        .single();

        if (error) {
            console.error("Error inserting task:", error);
            return;
        }

        const newTask = {
            id: data.id,
            text: text.trim(),
            dueDate: dueDate,
            completed: false,
        };
        setTasks([...tasks, newTask]);
    } else {
        const newTask = {
            id: Date.now(),
            text: text.trim(),
            dueDate: dueDate,
            completed: false,
        };
        setTasks([...tasks, newTask]);
    }
    setText('');
    setDueDate('');
    }

    function deleteTask(id) {
        const task = tasks.find(task => task.id === id);
        if (task) {
            if(session) {
                supaDeleteTask(task);
            }
        }
        setTasks(tasks.filter(task => task.id !== id));
    }

    function toggleCompleted(id) {
        setTasks(currentTasks => currentTasks.map(task => {
            if (task.id === id) {
                if(session) {
                    supaUpdateTask(task);
                }
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
        if (!dueDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month, day] = dueDate.split("-");
        const dateDue = new Date(year, month - 1, day); 
        dateDue.setHours(0, 0, 0, 0);

        if (dateDue < today){
            return "Overdue"; 
        } else if (dateDue > today){
            return "Soon";
        } else {
            return "Today";
        }
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
                        <span className="todo-date" style={{ color: pastDue(task.dueDate) == "Overdue" ? '#d53c3c' : pastDue(task.dueDate) == "Today" ? '#fadb7e' : 'inherit' }}>
                            {pastDue(task.dueDate) == "Overdue" ? "Overdue" : pastDue(task.dueDate) == "Today" ? "Today" : formatDueDate(task.dueDate)}
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
