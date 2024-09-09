import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

function AddTimeManager() {
  const [activity, setActivity] = useState('');
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

  // Convert ISO string to 'YYYY-MM-DD HH:MM:SS' format
  const formatDateForDatabase = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Handle start of the activity
  const handleStart = async () => {
    if (!activity) {
      setError('Please select an activity.');
      return;
    }

    const now = new Date();
    const start = formatDateForDatabase(now.toISOString()); // Format start time
    setStartTime(start);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/at3manager/backend/routes/add_timemanager.php`,
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
    const end = formatDateForDatabase(now.toISOString()); // Format end time
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
        `${apiBaseUrl}/at3manager/backend/routes/update_timemanager.php`,
        {
          id,
          endTime: end,
          duration,
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
    <div>
      <h1>Add Time Manager Record</h1>
      <form>
        <label>
          Activity:
          <select value={activity} onChange={(e) => setActivity(e.target.value)} required>
            <option value="" disabled>Select Activity</option>
            <option value="Maraqi">Maraqi</option>
            <option value="MDA">MDA</option>
            <option value="Study">Study</option>
            <option value="Management">Management</option>
          </select>
        </label>
        <br />
        <button type="button" onClick={handleStart} disabled={localStorage.getItem('timeManagerId') || !activity}>
          Start
        </button>
        <button type="button" onClick={handleEnd} disabled={!localStorage.getItem('timeManagerId')}>
          End
        </button>
        <button type="button" onClick={() => {
          localStorage.removeItem('timeManagerId');
          localStorage.removeItem('startTime');
        }}>
          Reset
        </button>
      </form>
      {elapsedTime && <div>Elapsed Time: {elapsedTime}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default AddTimeManager;
