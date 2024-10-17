import { useState, useEffect } from 'react';
import axios from 'axios';

function RuleList({ onEdit }) {
    const [rules, setRules] = useState([]);
    const [viewingAst, setViewingAst] = useState(null);

    useEffect(() => {
        const fetchRules = async () => {
            const response = await axios.get('http://localhost:3000/api/rules');
            setRules(response.data);
        };
        fetchRules();
    }, []);

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/rules/${id}`);
        setRules(rules.filter(rule => rule._id !== id));
    };

    const handleViewAst = (rule) => {
        setViewingAst(rule.ast);
    };

    return (
        <div>
            <h2>Rules</h2>
            <ul>
                {rules.map(rule => (
                    <li key={rule._id}>
                        <pre>{rule.ruleString}</pre>
                        <button onClick={() => onEdit(rule)}>Edit</button>
                        <button onClick={() => handleDelete(rule._id)}>Delete</button>
                        <button onClick={() => handleViewAst(rule)}>View AST</button>
                    </li>
                ))}
            </ul>
            {viewingAst && (
                <div>
                    <h3>AST Representation</h3>
                    <pre>{JSON.stringify(viewingAst, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default RuleList;