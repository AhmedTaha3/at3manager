import React from 'react';

const TaskForm = ({
    taskForm,
    setTaskForm,
    handleSubmitTask,
    isEditingTask,
    errorMessageTask,
    selectedCategory,
    handleCategoryChange,
    categories,
    selectedActivity,
    handleActivityChange,
    activities,
    taskIsPeriodic,
    setTaskIsPeriodic,
    taskPeriodType,
    setTaskPeriodType,
    taskDailyPeriod,
    setTaskDailyPeriod,
    taskWeeklyPeriod,
    setTaskWeeklyPeriod,
    resetTaskForm 
}) => {

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskForm({ ...taskForm, [name]: value });
    };

    const onSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
    
        // Automatically set activity_id and worked_time
        const updatedTaskForm = {
            ...taskForm,
            activity_id: selectedActivity,
            worked_time: "00:00",    // Set worked time to 0 by default
            taskIsPeriodic, 
            taskPeriodType,
            taskDailyPeriod,
            taskWeeklyPeriod
        };
        console.log("activity_id: " + selectedActivity);
    
        // Pass the updated task form to handleSubmitTask
        handleSubmitTask(updatedTaskForm); // Call the function with the updated task data
        resetTaskForm();
    };

    return (
        <div>
            <form className="engagement-form" onSubmit={onSubmit}>
                <div className="add-engagement-title">
                    <p>{isEditingTask ? 'Edit Task' : 'Add a Task'}</p>
                </div>

                {/* Category Select */}
                <label>
                    Category:
                    <select
                        className="add-time-manager-select"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        required
                    >
                        <option value="" disabled>Select Category</option>
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
                        <option value="" disabled>Select Activity</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.id}>
                                {activity.name}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Task Name */}
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={taskForm.name}
                    onChange={handleInputChange}
                    placeholder="Task Name"
                    required
                />

                {/* Deadline */}
                <label>Deadline:</label>
                <input
                    type="date"
                    name="deadline"
                    value={taskForm.deadline}
                    onChange={handleInputChange}
                    required
                />

                {/* Estimated Time */}
                <label>Estimated Time:</label>
                <input
                    type="time"
                    name="estimated_time"
                    value={taskForm.estimated_time}
                    onChange={handleInputChange}
                    required
                />

                {/* Is Periodic Checkbox */}
                {!isEditingTask && (
                    <div className='periodic-container'>
                        <label>Is Periodic?</label>
                        <input
                            type="checkbox"
                            checked={taskIsPeriodic}
                            onChange={setTaskIsPeriodic}
                        />
                    </div>
                )}


                {/* Periodicity Inputs */}
                {taskIsPeriodic && !isEditingTask && (
                    <div className='periodic-inputs'>
                        <div className='periodic-container'>
                            <label>Period Type:</label>
                            <input
                                type="radio"
                                name="period"
                                value="both"
                                checked={taskPeriodType === 'both'}
                                onChange={() => setTaskPeriodType('both')}
                            /> Daily and Weekly
                        </div>
                        <div className='periodic-container'>
                            <input
                                type="radio"
                                name="period"
                                value="daily"
                                checked={taskPeriodType === 'daily'}
                                onChange={() => setTaskPeriodType('daily')}
                            /> Daily Only
                        </div>

                        <input
                            type="number"
                            name="dailyPeriod"
                            value={taskDailyPeriod}
                            onChange={(e) => setTaskDailyPeriod(Number(e.target.value))} // Ensure the value is a number
                            placeholder="Number of Days"
                        />

                        <div className='periodic-container'>
                            <input
                                type="radio"
                                name="period"
                                value="weekly"
                                checked={taskPeriodType === 'weekly'}
                                onChange={() => setTaskPeriodType('weekly')}
                            /> Weekly Only
                        </div>

                        <input
                            type="number"
                            name="weeklyPeriod"
                            value={taskWeeklyPeriod}
                            onChange={(e) => setTaskWeeklyPeriod(Number(e.target.value))} // Ensure the value is a number
                            placeholder="Number of Weeks"
                        />
                    </div>
                )}

                {/* Error Message */}
                {errorMessageTask && <div className="error-message">{errorMessageTask}</div>}

                {/* Submit Button */}
                <div className="submit-button-container">
                    <button className="add-engagement-button" type="submit">
                        {isEditingTask ? 'Update Task' : 'Save Task'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;
