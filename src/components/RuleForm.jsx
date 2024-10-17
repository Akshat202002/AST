import { useState, useEffect } from 'react';
import axios from 'axios';

function RuleForm({ rule, onSave }) {
    const [ruleString, setRuleString] = useState(rule ? rule.ruleString : '');
    const [metadata, setMetadata] = useState(rule ? rule.metadata : {});

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
        } catch (error) {
            console.error('Error creating/updating rule:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={ruleString}
                    onChange={(e) => setRuleString(e.target.value)}
                    placeholder="Enter rule"
                />
                <textarea
                    value={JSON.stringify(metadata, null, 2)}
                    onChange={(e) => setMetadata(JSON.parse(e.target.value))}
                    placeholder="Enter metadata"
                />
                <button type="submit">{rule ? 'Update Rule' : 'Create Rule'}</button>
            </form>
        </div>
    );
}

export default RuleForm;