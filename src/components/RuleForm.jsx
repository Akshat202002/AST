import { useState } from 'react';
import axios from 'axios';

function RuleForm() {
    const [ruleString, setRuleString] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await axios.post('http://localhost:3000/api/create_rule', { ruleString });
        setResult(response.data);
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
                <button type="submit">Create Rule</button>
            </form>
            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
    );
}

export default RuleForm;