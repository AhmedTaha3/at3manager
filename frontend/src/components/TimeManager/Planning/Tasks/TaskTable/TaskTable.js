// TaskTable.js
import React from 'react';

const TaskTable = ({ tasks, handleEdit, handleDelete }) => {
    return (
        <div className='engagement-table'>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Activity ID</th>
                        <th>Deadline</th>
                        <th>Estimated Time</th>
                        <th>Worked Time</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(tasks) && tasks.length > 0 ? (
                        tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.name}</td>
                                <td>{task.activity_id}</td>
                                <td>{task.deadline}</td>
                                <td>{task.estimated_time}</td>
                                <td>{task.worked_time}</td>
                                <td>
                                    <button className="edit-task-button" onClick={() => handleEdit(task)}>
                                        +
                                    </button>
                                </td>
                                <td>
                                    <button className="remove-task-button" onClick={() => handleDelete(task.id)}>
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
