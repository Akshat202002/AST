import express from 'express';
import Rule from '../models/Rule.js';

const router = express.Router();

/**
 * @route POST /create_rule
 * @desc Create a new rule
 * @access Public
 * @param {string} req.body.ruleString - The rule string to save
 * @param {Object} req.body.metadata - The metadata associated with the rule
 */
router.post('/create_rule', async (req, res) => {
    try {
        const { ruleString, metadata } = req.body;
        const rule = await Rule.save(ruleString, metadata);
        res.json(rule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /combine_rules
 * @desc Combine multiple rules into a single rule
 * @access Public
 * @param {Array} req.body.rules - The array of rules to combine
 */
router.post('/combine_rules', async (req, res) => {
    try {
        const { rules } = req.body;
        const combinedRule = Rule.combineRules(rules);
        res.json(combinedRule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route POST /evaluate_rule
 * @desc Evaluate a rule against data
 * @access Public
 * @param {Object} req.body.ast - The AST of the rule to evaluate
 * @param {Object} req.body.data - The data to evaluate against
 */
router.post('/evaluate_rule', (req, res) => {
    try {
        const { ast, data } = req.body;
        const result = Rule.evaluateRule(ast, data);
        res.json({ result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route GET /rules
 * @desc Get all rules
 * @access Public
 */
router.get('/rules', async (req, res) => {
    try {
        const rules = await Rule.getAll();
        res.json(rules);
    } catch (error) {
        console.error('Error fetching rules:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /rules/:id
 * @desc Get a rule by ID
 * @access Public
 */
router.get('/rules/:id', async (req, res) => {
    try {
        const rule = await Rule.getById(req.params.id);
        res.json(rule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route PUT /rules/:id
 * @desc Update a rule by ID
 * @access Public
 * @param {string} req.body.ruleString - The new rule string
 * @param {Object} req.body.metadata - The new metadata
 */
router.put('/rules/:id', async (req, res) => {
    try {
        const { ruleString, metadata } = req.body;
        const rule = await Rule.update(req.params.id, ruleString, metadata);
        res.json(rule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route DELETE /rules/:id
 * @desc Delete a rule by ID
 * @access Public
 */
router.delete('/rules/:id', async (req, res) => {
    try {
        await Rule.delete(req.params.id);
        res.json({ message: 'Rule deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;