import { useState, useEffect } from 'react';
import axios from 'axios';

function RuleForm({ rule, onSave }) {
    const [ruleString, setRuleString] = useState(rule ? rule.ruleString : '');
    const [metadata, setMetadata] = useState(rule ? rule.metadata : {});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (rule) {
            setRuleString(rule.ruleString);
            setMetadata(rule.metadata);
        }
    }, [rule]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = rule
                ? await axios.put(`http://localhost:3000/api/rules/${rule._id}`, { ruleString, metadata })
                : await axios.post('http://localhost:3000/api/create_rule', { ruleString, metadata });
            onSave(response.data);
            setError(null);
        } catch (error) {
            setError(error.response.data.error);
        }
    };

    return (
        <div className="container mt-4">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="ruleString" className="form-label">Rule String</label>
                    <input
                        type="text"
                        className="form-control"
                        id="ruleString"
                        value={ruleString}
                        onChange={(e) => setRuleString(e.target.value)}
                        placeholder="Enter rule"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="metadata" className="form-label">Metadata</label>
                    <textarea
                        className="form-control"
                        id="metadata"
                        value={JSON.stringify(metadata, null, 2)}
                        onChange={(e) => setMetadata(JSON.parse(e.target.value))}
                        placeholder="Enter metadata"
                    />
                </div>
                <button type="submit" className="btn btn-primary">{rule ? 'Update Rule' : 'Create Rule'}</button>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
}

export default RuleForm;