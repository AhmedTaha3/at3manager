// TaskTable.js
import React from 'react';

const TaskTable = ({ tasks, handleEditTask, handleDeleteTask, getActivityNameById }) => {
    return (
        <div className='engagement-table'>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Activity NAME</th>
                        <th>Deadline</th>
                        <th>Estimated Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.name}</td>
                                <td>{getActivityNameById(task.activity_id)}</td>
                                <td>{task.deadline}</td>
                                <td>{task.estimated_time}</td>
                                <td>
                                    <button className="edit-engagement-button" onClick={() => handleEditTask(task)}>
                                        +
                                    </button>
                                    <button className="remove-engagement-button" onClick={() => handleDeleteTask(task.id)}>
                                        x
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No tasks found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TaskTable;
