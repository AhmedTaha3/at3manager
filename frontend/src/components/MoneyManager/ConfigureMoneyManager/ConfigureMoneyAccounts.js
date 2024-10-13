import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ConfigureMoneyManager.css';

const ConfigureMoneyAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({ account: '', balance: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editAccountId, setEditAccountId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrl = `${apiBaseUrl}/at3manager/backend/routes/MoneyManager/configuration/accounts`;

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(`${apiUrl}/getAccounts.php`);
            console.log('API Response:', response.data); // Log the API response
            if (Array.isArray(response.data)) {
                setAccounts(response.data.map(account => ({
                    ...account,
                    balance: parseFloat(account.balance) || 0 // Ensure balance is a float
                })));
            } else {
                console.error('Unexpected response format:', response.data);
                setAccounts([]);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error.response ? error.response.data : error.message);
            setAccounts([]);
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
        if (!form.account.trim() || !form.balance.trim()) {
            setErrorMessage('Account name and balance cannot be empty.');
            return;
        }

        try {
            let newAccount;
            if (isEditing) {
                // Update the existing account
                await axios.post(`${apiUrl}/updateAccount.php`, {
                    id: editAccountId,
                    name: form.account,
                    balance: parseFloat(form.balance), // Ensure balance is sent as a float
                });
                newAccount = { id: editAccountId, name: form.account, balance: parseFloat(form.balance) };
                setAccounts(accounts.map(account => (account.id === editAccountId ? newAccount : account)));
            } else {
                // Add a new account
                const response = await axios.post(`${apiUrl}/addAccount.php`, {
                    name: form.account,
                    balance: parseFloat(form.balance), // Ensure balance is sent as a float
                });
                newAccount = { id: response.data.id, name: form.account, balance: parseFloat(form.balance) };
                setAccounts([...accounts, newAccount]);
            }

            setForm({ account: '', balance: '' }); // Reset the form
            setIsEditing(false); // Reset editing state
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage('Failed to submit the form. Please try again.');
        }
    };

    const handleEdit = (account) => {
        setForm({ account: account.name, balance: account.balance.toString() }); // Convert balance to string for input
        setIsEditing(true);
        setEditAccountId(account.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this account?');
        if (confirmDelete) {
            try {
                await axios.post(`${apiUrl}/deleteAccount.php`, { id });
                setAccounts(accounts.filter(account => account.id !== id));
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        }
    };

    return (
        <div className="configure-money-manager">
            <form className="configure-form" onSubmit={handleSubmit}>
                <div className="add-money-manager-title">
                    <h1>{isEditing ? 'Edit an Account' : 'Add an Account'}</h1>
                </div>
                <label>Account Name:</label>
                <input
                    type="text"
                    name="account"
                    value={form.account}
                    onChange={handleInputChange}
                    placeholder="Account Name"
                    required
                />
                <label>Balance:</label>
                <input
                    type="number"
                    name="balance"
                    value={form.balance}
                    onChange={handleInputChange}
                    placeholder="Balance"
                    required
                />

                {/* Display error message */}
                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <div className="button-container">
                    <button className="add-activity-button" type="submit">
                        {isEditing ? 'Update Account' : 'Save Account'}
                    </button>
                </div>
            </form>

            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Account Name</th>
                        <th>Balance</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.length > 0 ? (
                        accounts.map(account => (
                            <tr key={account.id}>
                                <td>{account.name}</td>
                                <td>{account.balance.toFixed(2)}</td>
                                <td>
                                    <button className="edit-category-button" onClick={() => handleEdit(account)}>
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button className="remove-category-button" onClick={() => handleDelete(account.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No accounts found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ConfigureMoneyAccounts;
