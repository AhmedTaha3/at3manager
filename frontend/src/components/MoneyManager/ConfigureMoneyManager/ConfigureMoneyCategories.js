import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ConfigureMoneyManager.css';

const ConfigureMoneyCategories = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ category: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/MoneyManager/configuration/categories`;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${apiUrl}/getCategories.php`);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted:', form); // Log the form data
        setErrorMessage('');

        // Validate that the input is not empty before submitting
        if (!form.category.trim()) {
            setErrorMessage('Category name cannot be empty.');
            return;
        }

        try {
            let newCategory;
            if (isEditing) {
                // Update the existing category
                await axios.post(`${apiUrl}/updateCategory.php`, {
                    id: editCategoryId,
                    name: form.category,
                });
                newCategory = { id: editCategoryId, name: form.category };
                setCategories(categories.map(category => (category.id === editCategoryId ? newCategory : category)));
            } else {
                // Add a new category
                const response = await axios.post(`${apiUrl}/addCategory.php`, { name: form.category });
                newCategory = { id: response.data.id, name: form.category };
                setCategories([...categories, newCategory]);
            }

            setForm({ category: '' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit the form. Please try again.');
        }
    };

    const handleEdit = (category) => {
        setForm({ category: category.name });
        setIsEditing(true);
        setEditCategoryId(category.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this category?');
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrl}/deleteCategory.php`, { id });
                setCategories(categories.filter(category => category.id !== id));
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    return (
        <div className="configure-money-manager">
            <form className="configure-form" onSubmit={handleSubmit}>
                <div className="add-money-manager-title">
                    <h1>{isEditing ? 'Edit a Category' : 'Add a Category'}</h1>
                </div>
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

                <div className="button-container">
                    <button className="add-activity-button" type="submit">
                        {isEditing ? 'Update Category' : 'Save Category'}
                    </button>
                </div>
            </form>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 ? (
                        categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.name}</td>
                                <td>
                                    <button className="edit-category-button" onClick={() => handleEdit(category)}>
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button className="remove-category-button" onClick={() => handleDelete(category.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No categories found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ConfigureMoneyCategories;
