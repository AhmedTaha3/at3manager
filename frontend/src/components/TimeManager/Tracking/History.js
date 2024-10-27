import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import '../Tracking/ConfigureTimeManager/ConfigureTimeManager.css'; // Use the same styles as ConfigureTimeManager

const History = () => {
    const navigate = useNavigate();
    const [timeManagers, setTimeManagers] = useState([]);
    const [form, setForm] = useState({ task_id:  '', startTime: '', endTime: '', duration: '', day: '', date: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Tracking/time/`;
    const taskUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Tracking/get_tasks_by_date.php`;
    const updateTaskUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/Planning/tasks/update_task.php`;
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState('');
    const [filters, setFilters] = useState({ date: new Date().toISOString().slice(0, 10) }); 

    useEffect(() => {
        fetchTimeManagers();
    }, []);

    const fetchTasks = async (selectedDate) => {
        try {
            const response = await axios.get(taskUrl, {
                headers: {
                    'X-Date' : selectedDate
                }
            });
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };
    

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFilters({ ...filters, date: selectedDate });
        fetchTasks(selectedDate);  // Call the fetchTasks function with the selected date
    };

    
    
    
    
      
    const fetchTimeManagers = async () => {
        try {
            const response = await axios.get(`${apiUrl}/get_timemanager.php`);
            if (Array.isArray(response.data)) {
                setTimeManagers(response.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setTimeManagers([]);
            }
        } catch (error) {
            console.error('Error fetching time managers:', error.response ? error.response.data : error.message);
            setTimeManagers([]); // Set to an empty array to prevent map errors
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
    
        const requestData = { ...form };
    
        try {
            if (isEditing) {
                await axios.post(`${apiUrl}/update_timemanager.php`, {
                    id: editId,
                    ...requestData
                });
            } else {
                await axios.post(`${apiUrl}/add_timemanager.php`, requestData);
            }
    
            // Find the current worked_time of the selected task
            const selectedTaskData = tasks.find(task => task.id === Number(selectedTask));
            if (selectedTaskData && !isEditing) {
                const currentWorkedTime = selectedTaskData.worked_time;
    
                // Convert current worked_time and duration to seconds
                const currentWorkedSeconds = timeToSeconds(currentWorkedTime);
                const durationSeconds = timeToSeconds(form.duration);
    
                // Add the two times together
                const updatedWorkedTimeSeconds = currentWorkedSeconds + durationSeconds;
    
                // Convert back to HH:MM:SS format
                const updatedWorkedTime = secondsToTime(updatedWorkedTimeSeconds);
                
                // Update the worked_time in the backend
                await axios.post(`${updateTaskUrl}`, {
                    id: selectedTask,
                    worked_time: updatedWorkedTime
                });
            }
    
            fetchTimeManagers();
            setForm({ task_id: '', activity: '', category: '', startTime: '', endTime: '', duration: '', day: '', date: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit the form. Please try again.');
        }
    };
    
    // Helper function to convert HH:MM:SS to total seconds
    const timeToSeconds = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };
    
    // Helper function to convert seconds to HH:MM:SS
    const secondsToTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
    
    

    const handleEdit = (timeManager) => {
        setForm({
            activity: timeManager.activity,
            category: timeManager.category,
            startTime: timeManager.startTime,
            endTime: timeManager.endTime,
            duration: timeManager.duration,
            day: timeManager.day,
            task_id: timeManager.task_id,
            date: timeManager.date,
        });
    
        // Set the selected task and date
        setSelectedTask(String(timeManager.task_id)); // Ensure it's a string for comparison
        setFilters({ ...filters, date: timeManager.date }); // Set the date to the one being edited
        
        setIsEditing(true);
        setEditId(timeManager.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrl}/delete_timemanager.php`, { id });
                fetchTimeManagers();
            } catch (error) {
                console.error('Error deleting entry:', error);
            }
        }
    };

    useEffect(() => {
        if (filters.date) {
            fetchTasks(filters.date); // Fetch tasks for the selected date
        }
    }, [filters.date]); // Trigger when filters.date changes
    // duration
    const calculateDuration = (start, end) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diff = (endTime - startTime) / 1000; // Difference in seconds
    
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = Math.floor(diff % 60);
    
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // Format as HH:MM:SS
      };
    form.duration = calculateDuration(form.startTime, form.endTime);
    //date and day
    if (form.startTime){
        const startTime = new Date(form.startTime); // Ensure startTime is a Date object
        const currentDate = startTime.toISOString().split('T')[0]; // Get the date part in 'YYYY-MM-DD' format
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDay = dayNames[startTime.getUTCDay()]; // Get the day name based on UTC day
        
        form.date = currentDate;
        form.day = currentDay;
    };
    //display date
    const displayTime = (date) => {
        // Convert the input to a Date object
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            console.error('Invalid date:', date);
            return 'Invalid time'; // Handle invalid date scenario
        }
    
        // Get hours, minutes, and seconds in local time
        const hours = String(dateObj.getHours()).padStart(2, '0'); // Pad with leading zero if needed
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
        // Construct the time string in 'HH:MM:SS' format
        const time = `${hours}:${minutes}:${seconds}`;
        return time;
    };
    
    
    
    


    return (
        <div className="configure-time-manager">
            <form className="configure-form" onSubmit={handleSubmit}>
                <div className='add-time-manager-title'>
                    <h1>{isEditing ? 'Edit Activity' : 'Add new Activity'}</h1>
                </div>
                
                {/* Input fields for the form */}
                <input type="date" className="filter-date" value={filters.date} onChange={handleDateChange} />

                <div>
                    <table className="styled-table">
                        <thead>
                        <tr>
                            <th>Select</th>
                            <th>Task Name</th>
                            <th>Deadline</th>
                            <th>Estimated Time</th>
                            <th>Worked Time</th>
                        </tr>
                        </thead>
                        {tasks.map((task) => (
                            <tr key={task.id}>
                                <td>
                                    <input
                                        type="radio"
                                        name="task"
                                        value={task.id} // Keep this as is, task.id will be a number
                                        checked={selectedTask === String(task.id)} // Convert task.id to string for comparison
                                        onChange={(e) => {
                                            setSelectedTask(e.target.value); // e.target.value is already a string
                                            setForm({ ...form, task_id: Number(e.target.value) }); // Convert to number for form submission
                                        }}
                                    />
                                </td>
                                <td>{task.name}</td>
                                <td>{task.deadline}</td>
                                <td>{task.estimated_time}</td>
                                <td>{task.worked_time}</td>
                            </tr>
                        ))}

                    </table>
                    </div>
                
                <label>Start Time:</label>
                <input 
                    type="datetime-local" 
                    name="startTime" 
                    value={form.startTime} 
                    onChange={handleInputChange} 
                    required 
                />
                
                <label>End Time:</label>
                <input 
                    type="datetime-local" 
                    name="endTime" 
                    value={form.endTime} 
                    onChange={handleInputChange} 
                    required 
                />
                {form.startTime && form.endTime && <div>
                    <label>Duration:
                        <p className='date'>{form.duration}</p>
                    </label>
                </div>}
                
                {/* Display error message */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <div className='button-container'>
                    <button className="add-activity-button" type="submit">
                        {isEditing ? 'Update Entry' : 'Save Entry'}
                    </button>
                </div>
            </form>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Activity</th>
                        <th>Duration</th>
                        {/* <th>Category</th> */}
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(timeManagers) && timeManagers.length > 0 ? (
                        timeManagers.map(timeManager => (
                            <tr key={timeManager.id}>
                                <td>{timeManager.date}</td>
                                <td>{timeManager.day}</td>
                                <td>{timeManager.activity}</td>
                                <td>{timeManager.duration}</td>
                                {/* <td>{timeManager.category}</td> */}
                                <td>{displayTime(timeManager.startTime)}</td>
                                <td>{displayTime(timeManager.endTime)}</td> 
                                <td>
                                    <button 
                                        className='edit-category-button' 
                                        onClick={() => handleEdit(timeManager)}
                                    >
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button 
                                        className='remove-category-button' 
                                        onClick={() => handleDelete(timeManager.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">No entries found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default History;
