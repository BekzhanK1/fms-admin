// src/Categories.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        // Fetch categories on component mount
        const fetchCategories = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return setError('Access token not found.');

            try {
                const res = await fetch('http://85.198.90.80:8000/api/v1/categories', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Failed to fetch categories');
                setCategories(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return setError('Access token not found.');

        const newCategoryData = { name: newCategory, description: newDescription };
        try {
            const res = await fetch('http://85.198.90.80:8000/api/v1/categories/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCategoryData),
            });

            if (!res.ok) throw new Error('Failed to add category');
            const addedCategory = await res.json();
            setCategories((prev) => [...prev, addedCategory]);
            setNewCategory('');
            setNewDescription('');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return setError('Access token not found.');

        try {
            const res = await fetch(`http://85.198.90.80:8000/api/v1/categories/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to delete category');
            setCategories(categories.filter(c => c.id !== categoryId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={styles.container}>
            <h2>Categories</h2>

            {/* Button to navigate back to Dashboard */}
            <div style={styles.navButtonContainer}>
                <Link to="/dashboard" style={styles.navButton}>Back to Dashboard</Link>
            </div>

            <div style={styles.addCategoryForm}>
                <input
                    type="text"
                    placeholder="Category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={styles.input}
                />
                <textarea
                    placeholder="Category description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={styles.textarea}
                />
                <button onClick={handleAddCategory} style={styles.button}>Add Category</button>
            </div>

            {categories.length === 0 ? <p>No categories available.</p> : (
                <ul style={styles.categoriesList}>
                    {categories.map(({ id, name, description }) => (
                        <li key={id} style={styles.categoryItem}>
                            <h3>{name}</h3>
                            <p>{description}</p>
                            <button
                                onClick={() => handleDeleteCategory(id)}
                                style={styles.deleteButton}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    addCategoryForm: { marginBottom: '20px' },
    input: { marginBottom: '10px', padding: '8px', width: '100%', fontSize: '16px' },
    textarea: { marginBottom: '10px', padding: '8px', width: '100%', fontSize: '16px', height: '80px' },
    button: { backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    categoriesList: { listStyleType: 'none', padding: '0' },
    categoryItem: { marginBottom: '20px', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '5px', border: '1px solid #ddd' },
    deleteButton: { backgroundColor: '#f44336', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    navButtonContainer: { marginBottom: '20px' },
    navButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        textDecoration: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};

export default Categories;
