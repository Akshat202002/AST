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
    /**
     * Creates an instance of Node.
     * @param {string} type - The type of the node (operator or operand).
     * @param {Node|null} left - The left child node.
     * @param {Node|null} right - The right child node.
     * @param {Object|null} value - The value of the node.
     */
    constructor(type, left = null, right = null, value = null) {
        this.type = type;
        this.left = left;
        this.right = right;
        this.value = value;
    }
}

class Rule {
    /**
     * Creates an AST from a rule string.
     * @param {string} ruleString - The rule string to parse.
     * @returns {Node} The root node of the AST.
     * @throws {Error} If the rule string format is invalid.
     */
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

    /**
     * Combines multiple ASTs into a single AST using the AND operator.
     * @param {Node[]} rules - The array of ASTs to combine.
     * @returns {Node} The combined AST.
     */
    static combineRules(rules) {
        if (rules.length === 0) return null;
        if (rules.length === 1) return rules[0];
        let combined = rules[0];
        for (let i = 1; i < rules.length; i++) {
            combined = new Node('operator', combined, rules[i], 'AND');
        }
        return combined;
    }

    /**
     * Evaluates an AST against a data object.
     * @param {Node} ast - The AST to evaluate.
     * @param {Object} data - The data object to evaluate against.
     * @returns {boolean} The result of the evaluation.
     */
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

    /**
     * Saves a rule to the database.
     * @param {string} ruleString - The rule string to save.
     * @param {Object} metadata - The metadata associated with the rule.
     * @returns {Promise<Object>} The saved rule with its AST.
     */
    static async save(ruleString, metadata) {
        const ast = Rule.createRule(ruleString);
        const rule = new RuleModel({ ruleString, metadata });
        await rule.save();
        return rule;
    }

    /**
     * Retrieves all rules from the database.
     * @returns {Promise<Object[]>} An array of all rules with their ASTs.
     */
    static async getAll() {
        return RuleModel.find({});
    }

    /**
     * Retrieves a rule by its ID.
     * @param {string} id - The ID of the rule to retrieve.
     * @returns {Promise<Object>} The retrieved rule with its AST.
     */
    static async getById(id) {
        const rule = await RuleModel.findById(id);
        return { ...rule.toObject(), ast: Rule.createRule(rule.ruleString) };
    }

    /**
     * Updates a rule in the database.
     * @param {string} id - The ID of the rule to update.
     * @param {string} ruleString - The new rule string.
     * @param {Object} metadata - The new metadata.
     * @returns {Promise<Object>} The updated rule with its AST.
     */
    static async update(id, ruleString, metadata) {
        await RuleModel.findByIdAndUpdate(id, { ruleString, metadata });
        const rule = await RuleModel.findById(id);
        const ast = Rule.createRule(rule.ruleString);
        return { ...rule.toObject(), ast };
    }

    /**
     * Deletes a rule from the database.
     * @param {string} id - The ID of the rule to delete.
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await RuleModel.findByIdAndDelete(id);
    }
}

export default Rule;