import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

function RuleList({ onEdit }) {
    const [rules, setRules] = useState([]);
    const [viewingAst, setViewingAst] = useState(null);
    const [modifications, setModifications] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/rules');
                setRules(response.data);
                setError(null);
            } catch (error) {
                setError('Failed to fetch rules. Please try again later.');
                console.error('Error fetching rules:', error);
            }
        };
        fetchRules();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/rules/${id}`);
            setRules(rules.filter(rule => rule._id !== id));
        } catch (error) {
            setError('Failed to delete rule. Please try again later.');
            console.error('Error deleting rule:', error);
        }
    };

    const handleViewAst = (rule) => {
        setViewingAst(rule.ast);
    };

    return (
        <div className="container mt-4">
            <h2>Rules</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <ul className="list-group">
                {rules.map(rule => (
                    <li key={rule._id} className="list-group-item">
                        <pre>{rule.ruleString}</pre>
                        <button className="btn btn-secondary me-2" onClick={() => onEdit(rule)}>Edit</button>
                        <button className="btn btn-danger me-2" onClick={() => handleDelete(rule._id)}>Delete</button>
                        <button className="btn btn-warning me-2" onClick={() => handleViewAst(rule)}>View AST</button>
                    </li>
                ))}
            </ul>
            {viewingAst && (
                <div className="mt-4">
                    <h3>AST Representation</h3>
                    <pre>{JSON.stringify(viewingAst, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

RuleList.propTypes = {
    onEdit: PropTypes.func.isRequired,
};

export default RuleList;