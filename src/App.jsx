import { useState } from 'react';
import RuleForm from './components/RuleForm';
import RuleList from './components/RuleList';

function App() {
  const [editingRule, setEditingRule] = useState(null);

  const handleSave = (savedRule) => {
    setEditingRule(null);
  };

  return (
    <div className="container mt-4">
      <h1>Rule Engine</h1>
      <RuleForm rule={editingRule} onSave={handleSave} />
      <RuleList onEdit={setEditingRule} />
    </div>
  );
}

export default App;
