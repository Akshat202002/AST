import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function RuleEvaluator({ ast }) {
    const [data, setData] = useState({ age: '', department: '', salary: '', experience: '' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/evaluate_rule', {
                ast,
                data
            });
            setResult(response.data.result);
            setError(null);
        } catch (error) {
            setError('Failed to evaluate rule. Please check the data format.');
            console.error('Error evaluating rule:', error);
        }
    };

    return (
        <div className="container mt-4">
            <h3>Evaluate Rule</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <input
                        type="number"
                        className="form-control"
                        id="age"
                        name="age"
                        value={data.age}
                        onChange={handleChange}
                        placeholder="Enter age"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input
                        type="text"
                        className="form-control"
                        id="department"
                        name="department"
                        value={data.department}
                        onChange={handleChange}
                        placeholder="Enter department"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="salary" className="form-label">Salary</label>
                    <input
                        type="number"
                        className="form-control"
                        id="salary"
                        name="salary"
                        value={data.salary}
                        onChange={handleChange}
                        placeholder="Enter salary"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="experience" className="form-label">Experience (in years)</label>
                    <input
                        type="number"
                        className="form-control"
                        id="experience"
                        name="experience"
                        value={data.experience}
                        onChange={handleChange}
                        placeholder="Enter experience"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Evaluate</button>
            </form>
            {result !== null && (
                <div className={`mt-3 alert ${result ? 'alert-success' : 'alert-danger'}`}>
                    {result ? 'Rule passed!' : 'Rule failed!'}
                </div>
            )}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
}

RuleEvaluator.propTypes = {
    ast: PropTypes.object.isRequired,
};

export default RuleEvaluator;
