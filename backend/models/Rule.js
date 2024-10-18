import mongoose from 'mongoose';

const validAttributes = ['age', 'department', 'salary', 'experience'];

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
        if (!tokens) {
            throw new Error("Invalid rule string format");
        }

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
                if (tokens[index] !== ')') {
                    throw new Error("Mismatched parentheses");
                }
                index++;
                return node;
            } else {
                const left = tokens[index++];
                const operator = tokens[index++];
                const right = tokens[index++];

                if (!validAttributes.includes(left)) {
                    throw new Error(`Invalid attribute: ${left} is not a valid attribute.`);
                }

                if (!['>', '<', '='].includes(operator)) {
                    throw new Error(`Invalid operator: ${operator}.`);
                }

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
        const ast = Rule.createRule(ruleString);
        const rule = new RuleModel({ ruleString, metadata });
        await rule.save();
        return rule;
    }

    static async getAll() {
        return RuleModel.find({});
    }
}

export default Rule;
