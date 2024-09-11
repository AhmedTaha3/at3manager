import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ConfigureTimeManager.css';

const ConfigureTimeManager = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ category: '', activities: [''] });
    const [isEditing, setIsEditing] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/TimeManager/configuration`;

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
            console.error('Error fetching categories:', error.response ? error.response.data : error.message);
            setCategories([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleActivityChange = (index, value) => {
        const updatedActivities = [...form.activities];
        updatedActivities[index] = value;
        setForm({ ...form, activities: updatedActivities });
    };

    const handleAddActivity = () => {
        setForm({ ...form, activities: [...form.activities, ''] });
    };

    const handleRemoveActivity = (index) => {
        const updatedActivities = form.activities.filter((_, i) => i !== index);
        setForm({ ...form, activities: updatedActivities });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const requestData = {
            name: form.category,
            activities: form.activities.filter(activity => activity.trim() !== '') // Remove empty activities
        };

        try {
            if (isEditing) {
                await axios.post(`${apiUrl}/update_category.php`, {
                    id: editCategoryId,
                    ...requestData
                });
            } else {
                await axios.post(`${apiUrl}/add_category.php`, requestData);
            }
            fetchCategories();
            setForm({ category: '', activities: [''] });
            setIsEditing(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit the form. Please try again.');
        }
    };

    const handleEdit = (category) => {
        setForm({ category: category.name, activities: category.activities.map(activity => activity.name) });
        setIsEditing(true);
        setEditCategoryId(category.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this category?');
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrl}/delete_category.php`, { id });
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    return (
        <div className="configure-time-manager">
            <form className="configure-form" onSubmit={handleSubmit}>
                {!isEditing ? (
                    <div className='add-time-manager-title'>
                        <h1>Add a Category</h1>
                    </div>
                ) : (
                    <div className='add-time-manager-title'>
                        <h1>Edit a Category</h1>
                    </div>
                )}
                <label>Category:</label>
                <input 
                    type="text" 
                    name="category" 
                    value={form.category} 
                    onChange={handleInputChange} 
                    placeholder="Category" 
                    required 
                />
                
                {/* Display error message */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <label>Activities:</label>
                {form.activities.map((activity, index) => (
                    <div key={index} className='activity-input-container'>
                        <input 
                            type="text" 
                            value={activity} 
                            onChange={(e) => handleActivityChange(index, e.target.value)} 
                            placeholder="Activity" 
                            required 
                        />
                        <button 
                            type="button" 
                            className='remove-activity-button' 
                            onClick={() => handleRemoveActivity(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button 
                    type="button" 
                    className='add-activity-button' 
                    onClick={handleAddActivity}
                >
                    Add Activity
                </button>

                <div className='button-container'>
                    <button className="add-activity-button" type="submit">
                        {isEditing ? 'Update Category' : 'Save Category'}
                    </button>
                </div>
            </form>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Activities</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>{category.activities.map(activity => activity.name).join(', ') || 'N/A'}</td>
                                <td>
                                    <button 
                                        className='edit-category-button' 
                                        onClick={() => handleEdit(category)}
                                    >
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button 
                                        className='remove-category-button' 
                                        onClick={() => handleDelete(category.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No categories found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ConfigureTimeManager;
