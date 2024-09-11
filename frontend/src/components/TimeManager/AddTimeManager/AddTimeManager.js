import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import "./AddTimeManager.css";

function AddTimeManager() {
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/configuration`;
  const [activity, setActivity] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [activities, setActivities] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(''); // Default to empty string
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('');

  

  // Initialize default date and day
  useEffect(() => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayNames[today.getUTCDay()];

    setDate(currentDate);
    setDay(currentDay);

    // Check if there's an ongoing activity
    const storedId = localStorage.getItem('timeManagerId');
    if (storedId) {
      setIsStarted(true);
      setStartTime(localStorage.getItem('startTime'));
    }
    }, []);

    useEffect(() => {
      let timer;
      if (isStarted && startTime) {
        timer = setInterval(() => {
          const now = new Date();
          const duration = calculateDuration(startTime, now.toISOString());
          setElapsedTime(duration);
        }, 1000); // Update every second
      }

      return () => clearInterval(timer); // Clean up the interval on component unmount
    }, [isStarted, startTime]);
  // fetch categories and activities
  useEffect(() => {
    fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${apiUrl}/get_categories.php`);
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
      } else {
        setActivities([]);
      }
    };
    
    const handleActivityChange = (e) => {
      const activityId = e.target.value;
      const selectedAct = activities.find(activity => activity.id === activityId).name;
      setSelectedActivity(activityId);
      setActivity(selectedAct);
      console.log("Selected Activity ID:", selectedAct); // Debugging
    };
    


  // Convert date to local time and format it as 'YYYY-MM-DD HH:MM:SS'
  const formatDateForDatabase = (isoString) => {
    const date = new Date(isoString);

    // Adjust the time to local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Handle start of the activity
  const handleStart = async () => {
  console.log("Selected activity:", activity); 
  console.log("Selected category:", category);
    if (!activity) {
      setError('Please select an activity.');
      return;
    }

    const now = new Date();
    const start = formatDateForDatabase(now); // Format start time using local time
    setStartTime(start);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/add_timemanager.php`,
        {
          activity,
          startTime: start,
          endTime: start, // Send empty endTime
          day,
          date,
          category
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      if (result.success) {
        setMessage(result.message);
        setError('');
        setIsStarted(true);
        localStorage.setItem('timeManagerId', result.id); // Store the ID in localStorage
        localStorage.setItem('startTime', start); // Store the start time in localStorage
      } else {
        setMessage('');
        setError(result.message);
      }
    } catch (error) {
      setMessage('');
      setError('An error occurred while starting the activity.');
    }
  };

  // Handle end of the activity
  const handleEnd = async () => {
    if (!startTime) {
      setError('Start time is missing. Please click "Start" first.');
      return;
    }

    const now = new Date();
    const end = formatDateForDatabase(now); // Format end time using local time
    setEndTime(end);

    if (new Date(end) <= new Date(startTime)) {
      setError('End time must be greater than start time.');
      setMessage('');
      return;
    }

    const duration = calculateDuration(startTime, end);
    const id = localStorage.getItem('timeManagerId'); // Retrieve the ID from localStorage
    if (id) {
      setIsStarted(false);
    }
    try {
      const response = await axios.post(
        `${apiBaseUrl}/at3manager/backend/routes/TimeManager/operations/update_timemanager.php`,
        {
          id,
          endTime: end,
          duration,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      if (result.success) {
        setMessage(result.message);
        setError('');
        localStorage.removeItem('timeManagerId'); // Remove the ID from localStorage
        localStorage.removeItem('startTime'); // Remove the start time from localStorage
        setElapsedTime(''); // Clear elapsed time
      } else {
        setMessage('');
        setError(result.message);
      }
    } catch (error) {
      setMessage('');
      setError('An error occurred while ending the activity.');
    }
  };

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = (endTime - startTime) / 1000; // Difference in seconds

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; // Format as HH:MM:SS
  };

  return (
<div className="add-time-manager-container">
  <h1 className="add-time-manager-title" onClick={() => navigate('/timemanager/database')}>New activity </h1>
  <form>
    {/* Category Select */}
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
    <br />

    {/* Start and End Buttons */}
    <div className="center-buttons">
      <button
        type="button"
        className={`add-time-manager-button ${
          localStorage.getItem('timeManagerId') || !selectedActivity
            ? ''
            : 'add-time-manager-button-start'
        }`}
        onClick={handleStart}
        disabled={!selectedActivity || localStorage.getItem('timeManagerId')}
      >
        Start
      </button>
      <button
        type="button"
        className={`add-time-manager-button ${
          localStorage.getItem('timeManagerId')
            ? 'add-time-manager-button-end'
            : ''
        }`}
        onClick={handleEnd}
        disabled={!localStorage.getItem('timeManagerId')}
      >
        End
      </button>
    </div>
  </form>

  {/* Elapsed Time Display */}
  {elapsedTime && (
    <div className="add-time-manager-elapsed-time">{elapsedTime}</div>
  )}
</div>



  );
}

export default AddTimeManager;