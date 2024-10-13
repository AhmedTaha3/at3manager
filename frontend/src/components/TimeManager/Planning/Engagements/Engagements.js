import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Engagements.css'; // Use new styling file for engagements
import WeeklyGanttChart from '../WeeklyGanttChart/WeeklyGanttChart';
import TaskForm from '../Tasks/TaskForm/TaskForm';
import TaskTable from '../Tasks/TaskTable/TaskTable';

const Engagements = () => {
    const navigate = useNavigate();
    const [engagements, setEngagements] = useState([]);
    const [form, setForm] = useState({ name: '', start_time: '', end_time: '', date: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editEngagementId, setEditEngagementId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isPeriodic, setIsPeriodic] = useState(false);
    const [periodType, setPeriodType] = useState(''); // "daily" or "weekly"
    const [dailyPeriod, setDailyPeriod] = useState(0); // number of days for daily period
    const [weeklyPeriod, setWeeklyPeriod] = useState(0); // number of weeks for weekly period
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Planning/engagements`;

    const [tasks, setTasks] = useState([]);
    const [taskForm, setTaskForm] = useState({ name: '', activity_id: '', deadline: '', estimated_time: '', worked_time: '' });
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editTaskId, setEditTaskId] = useState(null);
    const [errorMessageTask, setErrorMessageTask] = useState('');
    const apiUrlTask = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Planning/tasks`;

    const [activity, setActivity] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');
    const [activities, setActivities] = useState([]);
    const apiUrlCat = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/configuration`;

    const [taskIsPeriodic, setTaskIsPeriodic] = useState(false);
    const [taskPeriodicityType, setTaskPeriodicityType] = useState('daily'); // can be 'daily' or 'weekly'
    const [taskPeriodicityInterval, setTaskPeriodicityInterval] = useState(1); // interval for repetition
    const [taskPeriodType, setTaskPeriodType] = useState('both'); // 'both', 'daily', 'weekly'
    const [taskDailyPeriod, setTaskDailyPeriod] = useState(0);
    const [taskWeeklyPeriod, setTaskWeeklyPeriod] = useState(0);

    useEffect(() => {
        fetchEngagements();
        fetchTasks();
        fetchCategories();
    }, []);



    // FETCH ENGAGEMENT
    const fetchEngagements = async () => {
        try {
            const response = await axios.get(`${apiUrl}/get_engagements.php`);
            if (Array.isArray(response.data)) {
                setEngagements(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setEngagements([]);
            }
        } catch (error) {
            console.error('Error fetching engagements:', error.response ? error.response.data : error.message);
            setEngagements([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handlePeriodChange = (e) => {
        setIsPeriodic(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        let requestDataList = [];
        const requestData = { ...form };

        if (isPeriodic) {
            if (periodType === 'daily') {
                for (let i = 0; i < dailyPeriod; i++) {
                    const newData = { ...requestData, date: incrementDate(form.date, i, 'days') };
                    requestDataList.push(newData);
                }
            } else if (periodType === 'weekly') {
                for (let i = 0; i < weeklyPeriod; i++) {
                    const newData = { ...requestData, date: incrementDate(form.date, i * 7, 'days') };
                    requestDataList.push(newData);
                }
            } else if (periodType === 'both') {
                let dailyList = [];
                for (let i = 0; i < dailyPeriod; i++) {
                    dailyList.push({ ...requestData, date: incrementDate(form.date, i, 'days') });
                }
                for (let i = 0; i < weeklyPeriod; i++) {
                    dailyList.forEach((dailyData) => {
                        requestDataList.push({ ...dailyData, date: incrementDate(dailyData.date, i * 7, 'days') });
                    });
                }
            }
        } else {
            requestDataList.push(requestData);
        }

        try {
            for (const reqData of requestDataList) {
                if (isEditing) {
                    await axios.post(`${apiUrl}/update_engagement.php`, {
                        id: editEngagementId,
                        ...reqData
                    });
                } else {
                    await axios.post(`${apiUrl}/add_engagement.php`, reqData);
                }
            }
            fetchEngagements();
            resetForm();
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit the form. Please try again.');
        }
    };

    const resetForm = () => {
        setForm({ name: '', start_time: '', end_time: '', date: '' });
        setIsEditing(false);
        setDailyPeriod(0);
        setIsPeriodic(false);
        setWeeklyPeriod(0);
        setPeriodType('');
    };

    const handleEdit = (engagement) => {
        setForm({ 
            name: engagement.name, 
            start_time: engagement.start_time, 
            end_time: engagement.end_time, 
            date: engagement.date 
        });
        setIsEditing(true);
        setEditEngagementId(engagement.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this engagement?');
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrl}/delete_engagement.php`, { id });
                fetchEngagements();
            } catch (error) {
                console.error('Error deleting engagement:', error);
            }
        }
    };

    const incrementDate = (date, increment, unit) => {
        let newDate = new Date(date);
        if (unit === 'days') {
            newDate.setDate(newDate.getDate() + increment);
        }
        return newDate.toISOString().split('T')[0];
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`${apiUrlTask}/get_tasks.php`);
            if (Array.isArray(response.data)) {
                setTasks(response.data);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    // Fetch categories and activities
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${apiUrlCat}/get_categories.php`);
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);

        const selectedCat = categories.find(category => category.id === categoryId);
        console.log("Selected Category ID:", selectedCat ? selectedCat.name : null); // Debugging

        if (selectedCat) {
            setActivities(selectedCat.activities); // Set activities based on selected category
            setSelectedActivity(''); // Reset selected activity
        } else {
            setActivities([]);
            setSelectedActivity(''); // Ensure it resets if no category is found
        }
    };

    const handleActivityChange = (e) => {
        const activityId = e.target.value;
        const selectedAct = activities.find(activity => activity.id === activityId);

        if (selectedAct) {
            setSelectedActivity(activityId); // Update selected activity
            console.log("Selected Activity ID:", selectedAct.id); // Debugging
        } else {
            console.error("Selected activity not found");
            setSelectedActivity(''); // Reset if not found
        }
    };

    const handleSubmitTask = async (requestData) => {
        setErrorMessageTask('');
    
        let requestDataList = [];
    
        // Handle periodic task creation
        if (requestData.taskIsPeriodic) {
            const periodType = requestData.taskPeriodType;
            const dailyCount = requestData.taskDailyPeriod || 0;
            const weeklyCount = requestData.taskWeeklyPeriod || 0;
    
            if (periodType === 'daily') {
                for (let i = 0; i < dailyCount; i++) {
                    const newData = { ...requestData, deadline: incrementDate(requestData.deadline, i, 'days') };
                    requestDataList.push(newData);
                }
            } else if (periodType === 'weekly') {
                for (let i = 0; i < weeklyCount; i++) {
                    const newData = { ...requestData, deadline: incrementDate(requestData.deadline, i * 7, 'days') };
                    requestDataList.push(newData);
                }
            } else if (periodType === 'both') {
                for (let i = 0; i < dailyCount; i++) {
                    const newData = { ...requestData, deadline: incrementDate(requestData.deadline, i, 'days') };
                    requestDataList.push(newData);
                }
                for (let i = 0; i < weeklyCount; i++) {
                    requestDataList.forEach((dailyData) => {
                        const newWeeklyData = { ...dailyData, deadline: incrementDate(dailyData.deadline, i * 7, 'days') };
                        requestDataList.push(newWeeklyData);
                    });
                }
            }
        } else {
            requestDataList.push(requestData); // For non-periodic tasks
        }
    
        // Submit tasks to the API
        try {
            for (const reqData of requestDataList) {
                if (isEditingTask) {
                    await axios.post(`${apiUrlTask}/update_task.php`, {
                        id: editTaskId,
                        ...reqData
                    });
                } else {
                    await axios.post(`${apiUrlTask}/add_task.php`, reqData);
                }
            }
            fetchTasks();
            resetTaskForm(); // Reset the form after submission
        } catch (error) {
            console.error('Error submitting task form:', error);
            setErrorMessageTask('Failed to submit the task. Please try again.');
        }
    };
    
    
    

    const handleEditTask = (task) => {
        setTaskForm({ 
            name: task.name, 
            activity_id: task.activity_id, 
            deadline: task.deadline, 
            estimated_time: task.estimated_time, 
            worked_time: task.worked_time 
        });
        setIsEditingTask(true);
        setEditTaskId(task.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteTask = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this task?');
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrlTask}/delete_task.php`, { id });
                fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    // is periodic for child component taskform
    const handleTaskIsPeriodicChange = (e) => {
        console.log('Event object:', e); // Check the event object
        if (e && e.target) {
            setTaskIsPeriodic(e.target.checked);
        } else {
            console.error('Event target is undefined:', e);
        }
    };
    
    const handleTaskPeriodTypeChange = (type) => setTaskPeriodType(type);
    


    const resetTaskForm = () => {
        setTaskForm({ name: '', activity_id: '', deadline: '', estimated_time: '', worked_time: '' });
        setIsEditingTask(false);
        setTaskDailyPeriod(0);
        setTaskIsPeriodic(false);
        setTaskWeeklyPeriod(0);
        setTaskPeriodType('');
    };
    
    
    return (
        <div className='engagement-container'>
            <div className='container-form-and-graph'>
                <div className="engagement-manager">
                    <form className="engagement-form" onSubmit={handleSubmit}>
                        <div className="add-engagement-title">
                            <p>{isEditing ? 'Edit Engagement' : 'Add an Engagement'}</p>
                        </div>
                        <label>Name:</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={form.name} 
                            onChange={handleInputChange} 
                            placeholder="Engagement Name" 
                            required 
                        />
                        <label>Start Time:</label>
                        <input 
                            type="time" 
                            name="start_time" 
                            value={form.start_time} 
                            onChange={handleInputChange} 
                            required 
                        />
                        <label>End Time:</label>
                        <input 
                            type="time" 
                            name="end_time" 
                            value={form.end_time} 
                            onChange={handleInputChange} 
                            required 
                        />
                        <label>Date:</label>
                        <input 
                            type="date" 
                            name="date" 
                            value={form.date} 
                            onChange={handleInputChange} 
                            required 
                        />

                        { !isEditing &&(
                        <div className='periodic-container'>
                            <label>Is Periodic?</label>
                            <input 
                                type="checkbox" 
                                checked={isPeriodic} 
                                onChange={handlePeriodChange} 
                            />
                        </div>)
                        }
                        {isPeriodic && !isEditing &&(
                            <div className='periodic-inputs'>
                                <div className='periodic-container'>
                                    <label>Period Type:</label>
                                    <input 
                                        type="radio" 
                                        name="period" 
                                        value="both" 
                                        onChange={() => setPeriodType('both')} 
                                    /> Daily and Weekly
                                </div>
                                <div className='periodic-container'>
                                <input 
                                    type="radio" 
                                    name="period" 
                                    value="daily" 
                                    onChange={() => setPeriodType('daily')} 
                                /> Daily Only
                                </div>
                                
                                <input 
                                    type="number" 
                                    name="dailyPeriod" 
                                    value={dailyPeriod} 
                                    onChange={(e) => setDailyPeriod(e.target.value)} 
                                    placeholder="Number of Days" 
                                />
                                
                                <div className='periodic-container'>
                                <input 
                                    type="radio" 
                                    name="period" 
                                    value="weekly" 
                                    onChange={() => setPeriodType('weekly')} 
                                /> Weekly Only
                                </div>
                                <input 
                                    type="number" 
                                    name="weeklyPeriod" 
                                    value={weeklyPeriod} 
                                    onChange={(e) => setWeeklyPeriod(e.target.value)} 
                                    placeholder="Number of Weeks" 
                                />
                                
                            </div>
                        )}

                        {/* Display error message */}
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button className="add-engagement-button" type="submit">{isEditing ? 'Update Engagement' : 'Add Engagement'}</button>
                        {isEditing && <button type="button" onClick={resetForm}>Cancel</button>}
                    </form>

                    <WeeklyGanttChart engagements={engagements} />
                    <TaskForm
                        taskForm={taskForm}
                        setTaskForm={setTaskForm}
                        handleSubmitTask={handleSubmitTask}
                        isEditingTask={isEditingTask}
                        errorMessageTask={errorMessageTask}
                        selectedCategory={selectedCategory}
                        handleCategoryChange={handleCategoryChange}
                        categories={categories}
                        selectedActivity={selectedActivity}
                        handleActivityChange={handleActivityChange}
                        activities={activities}
                        taskIsPeriodic={taskIsPeriodic}
                        setTaskIsPeriodic={handleTaskIsPeriodicChange}
                        taskPeriodType={taskPeriodType}
                        setTaskPeriodType={handleTaskPeriodTypeChange}
                        taskDailyPeriod={taskDailyPeriod}
                        setTaskDailyPeriod={setTaskDailyPeriod}
                        taskWeeklyPeriod={taskWeeklyPeriod}
                        setTaskWeeklyPeriod={setTaskWeeklyPeriod}
                        resetTaskForm={resetTaskForm}
                    />


                </div>

                    

                    
            </div>
            <div className='engagement-table'>
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {engagements.map((engagement) => (
                            <tr key={engagement.id}>
                                <td>{engagement.name}</td>
                                <td>{engagement.start_time}</td>
                                <td>{engagement.end_time}</td>
                                <td>{engagement.date}</td>
                                <td>
                                    <button 
                                        className="edit-engagement-button" 
                                        onClick={() => handleEdit(engagement)}
                                    >
                                        +
                                    </button>
                                    <button 
                                        className="remove-engagement-button" 
                                        onClick={() => handleDelete(engagement.id)}
                                    >
                                        x
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <TaskTable 
                tasks={tasks} 
                handleEditTask={handleEditTask} 
                handleDeleteTask={handleDeleteTask} 
                />
            </div>
        </div>
    );
};

export default Engagements;
