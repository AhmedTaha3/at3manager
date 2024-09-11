import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ConfigureTimeManager/ConfigureTimeManager.css'; // Use the same styles as ConfigureTimeManager

const Database = () => {
    const [timeManagers, setTimeManagers] = useState([]);
    const [form, setForm] = useState({ activity: '', category: '', startTime: '', endTime: '', duration: '', day: '', date: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations`;
    const [activity, setActivity] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');
    const [activities, setActivities] = useState([]);
    const [category, setCategory] = useState('');
    useEffect(() => {
        fetchTimeManagers();
    }, []);

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
            fetchTimeManagers();
            setForm({ activity: '', category: '', startTime: '', endTime: '', duration: '', day: '', date: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit the form. Please try again.');
        }
    };

    const handleEdit = (timeManager) => {
        setForm({
            activity: timeManager.activity,
            category: timeManager.category,
            startTime: timeManager.startTime,
            endTime: timeManager.endTime,
            duration: timeManager.duration,
            day: timeManager.day,
            date: timeManager.date
        });
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
        // Check if the input is a valid Date object
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            console.error('Invalid date:', date);
            return 'Invalid time'; // Handle invalid date scenario
        }
        
        // Extract the time part in 'HH:MM:SS' format
        const time = dateObj.toISOString().split('T')[1].split('.')[0];
        return time;
    };
    
    // fetch categories and activities
  useEffect(() => {
    fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/at3manager/backend/routes/TimeManager/configuration/get_categories.php`);
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
      const cat = selectedCat.name;
      console.log("Selected Category ID:", cat); // Debugging
      if (selectedCat) {
        setActivities(selectedCat.activities);
        setCategory(cat);
        form.category=cat;
      } else {
        setActivities([]);
      }
    };
    
    const handleActivityChange = (e) => {
      const activityId = e.target.value;
      const selectedAct = activities.find(activity => activity.id === activityId).name;
      setSelectedActivity(activityId);
      setActivity(selectedAct);
      form.activity=selectedAct;
      console.log("Selected Activity ID:", selectedAct); // Debugging
    };
    


    return (
        <div className="configure-time-manager">
            <form className="configure-form" onSubmit={handleSubmit}>
                <div className='add-time-manager-title'>
                    <h1>{isEditing ? 'Edit Activity' : 'Add new Activity'}</h1>
                </div>
                
                {/* Input fields for the form */}
                <label>
                    Category:
                    <select
                        className="add-time-manager-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        required
                    >
                        <option value="" disabled>
                        Select Category
                        </option>
                        {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                        ))}
                    </select>
                    </label>

                    {/* Activity Select */}
                    <label>
                    Activity:
                    <select
                        className="add-time-manager-select"
                        value={selectedActivity}
                        onChange={handleActivityChange}
                        required
                    >
                        <option value="" disabled>
                        Select Activity
                        </option>
                        {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                            {activity.name}
                        </option>
                        ))}
                    </select>
                    </label>
                
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
                        <th>Activity</th>
                        <th>Category</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Duration</th>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(timeManagers) && timeManagers.length > 0 ? (
                        timeManagers.map(timeManager => (
                            <tr key={timeManager.id}>
                                <td>{timeManager.activity}</td>
                                <td>{timeManager.category}</td>
                                <td>{displayTime(timeManager.startTime)}</td>
                                <td>{displayTime(timeManager.endTime)}</td>
                                <td>{timeManager.duration}</td>
                                <td>{timeManager.day}</td>
                                <td>{timeManager.date}</td>
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

export default Database;
