import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    left: { type: mongoose.Schema.Types.Mixed, default: null },
    right: { type: mongoose.Schema.Types.Mixed, default: null },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
});

const ruleSchema = new mongoose.Schema({
    ruleString: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const RuleModel = mongoose.model('Rule', ruleSchema);

class Node {
    constructor(type, left = null, right = null, value = null) {
        this.type = type;
        this.left = left;
        this.right = right;
        this.value = value;
    }
}

class Rule {
    static createRule(ruleString) {
        const tokens = ruleString.match(/\(|\)|\w+|>|<|=|AND|OR/g);
        let index = 0;

        function parseExpression() {
            let node = parseTerm();
            while (tokens[index] === 'AND' || tokens[index] === 'OR') {
                const operator = tokens[index++];
                const right = parseTerm();
                node = new Node('operator', node, right, operator);
            }
            return node;
        }

        function parseTerm() {
            if (tokens[index] === '(') {
                index++;
                const node = parseExpression();
                index++;
                return node;
            } else {
                const left = tokens[index++];
                const operator = tokens[index++];
                const right = tokens[index++];
                return new Node('operand', null, null, { left, operator, right });
            }
        }

        return parseExpression();
    }

    static combineRules(rules) {
        if (rules.length === 0) return null;
        if (rules.length === 1) return rules[0];
        let combined = rules[0];
        for (let i = 1; i < rules.length; i++) {
            combined = new Node('operator', combined, rules[i], 'AND');
        }
        return combined;
    }

    static evaluateRule(ast, data) {
        function evaluate(node) {
            if (node.type === 'operand') {
                const { left, operator, right } = node.value;
                switch (operator) {
                    case '>':
                        return data[left] > parseFloat(right);
                    case '<':
                        return data[left] < parseFloat(right);
                    case '=':
                        return data[left] === right;
                    default:
                        return false;
                }
            } else if (node.type === 'operator') {
                const leftValue = evaluate(node.left);
                const rightValue = evaluate(node.right);
                if (node.value === 'AND') {
                    return leftValue && rightValue;
                } else if (node.value === 'OR') {
                    return leftValue || rightValue;
                }
            }
            return false;
        }
        return evaluate(ast);
    }

    static async save(ruleString, metadata) {
        const rule = new RuleModel({ ruleString, metadata });
        await rule.save();
    }

    static async getAll() {
        return await RuleModel.find();
    }

    static async getById(id) {
        return await RuleModel.findById(id);
    }

    static async update(id, ruleString, metadata) {
        await RuleModel.findByIdAndUpdate(id, { ruleString, metadata });
    }

    static async delete(id) {
        await RuleModel.findByIdAndDelete(id);
    }
}

export default Rule;