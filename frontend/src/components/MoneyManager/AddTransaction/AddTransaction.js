import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddTransaction.css'; // Make sure the CSS file matches the AddTimeManager style

const AddTransaction = () => {
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [form, setForm] = useState({
        category: '',
        account: '',
        value: '',
        transactionType: 'credit', // Default to credit (Add Money)
        operation: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const apiUrlCategories = `${apiBaseUrl}/at3manager/backend/routes/MoneyManager/configuration/categories/getCategories.php`;
    const apiUrlAccounts = `${apiBaseUrl}/at3manager/backend/routes/MoneyManager/configuration/accounts/getAccounts.php`;

    useEffect(() => {
        fetchCategories();
        fetchAccounts();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(apiUrlCategories);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(apiUrlAccounts);
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate inputs
        if (!form.category || !form.account || !form.value || !form.operation) {
            setErrorMessage('All fields are required.');
            return;
        }

        const value = parseFloat(form.value);
        if (isNaN(value) || value <= 0) {
            setErrorMessage('Value must be a positive number.');
            return;
        }

        const transactionValue = form.transactionType === 'debit' ? -value : value;
        const transactionData = {
            category: form.category,
            account: form.account,
            value: transactionValue,
            operation: form.operation,
            date: new Date().toISOString().split('T')[0], // Today's date
        };

        try {
            await axios.post(`${apiBaseUrl}/at3manager/backend/routes/MoneyManager/operations/addTransaction.php`, transactionData);
            setForm({ category: '', account: '', value: '', transactionType: 'credit', operation: '' });
            alert('Transaction added successfully!');
        } catch (error) {
            console.error('Error adding transaction:', error);
            setErrorMessage('Failed to add transaction. Please try again.');
        }
    };

    return (
        <div className="add-transaction-container">
            <h1 className="add-transaction-title">Add Transaction</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Category:
                    <select
                        className="add-transaction-select"
                        name="category"
                        value={form.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.name} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Account:
                    <select
                        className="add-transaction-select"
                        name="account"
                        value={form.account}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select an account</option>
                        {accounts.map((account) => (
                            <option key={account.name} value={account.name}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Value:
                    <input
                        type="number"
                        className="add-transaction-input"
                        name="value"
                        value={form.value}
                        onChange={handleInputChange}
                        placeholder="Enter transaction value"
                        required
                    />
                </label>
                <label>
                    Operation:
                    <input
                        type="text"
                        className="add-transaction-input"
                        name="operation"
                        value={form.operation}
                        onChange={handleInputChange}
                        placeholder="Enter operation description"
                        required
                    />
                </label>
                <div className="transaction-type">
                    <div className="center-buttons">
                        <label className="add-transaction-button add-transaction-button-credit">
                            <input
                                type="radio"
                                name="transactionType"
                                value="credit"
                                checked={form.transactionType === 'credit'}
                                onChange={handleInputChange}
                            />
                            Income (+)
                        </label>
                        <label className="add-transaction-button add-transaction-button-debit">
                            <input
                                type="radio"
                                name="transactionType"
                                value="debit"
                                checked={form.transactionType === 'debit'}
                                onChange={handleInputChange}
                            />
                            Expense (-)
                        </label>
                    </div>
                </div>
                {errorMessage && <div className="add-transaction-error">{errorMessage}</div>}
                <button type="submit" className="remove-category-button">Submit Transaction</button>
            </form>
        </div>
    );
};

export default AddTransaction;
