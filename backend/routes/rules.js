import express from 'express';
import Rule from '../models/Rule.js';

const router = express.Router();

router.post('/create_rule', async (req, res) => {
    const { ruleString, metadata } = req.body;
    const rule = Rule.createRule(ruleString);
    await Rule.save(ruleString, metadata);
    res.json(rule);
});

router.post('/combine_rules', async (req, res) => {
    const { rules } = req.body;
    const combinedRule = Rule.combineRules(rules);
    res.json(combinedRule);
});

router.post('/evaluate_rule', (req, res) => {
    const { ast, data } = req.body;
    const result = Rule.evaluateRule(ast, data);
    res.json({ result });
});

router.get('/rules', async (req, res) => {
    const rules = await Rule.getAll();
    res.json(rules);
});

router.get('/rules/:id', async (req, res) => {
    const rule = await Rule.getById(req.params.id);
    res.json(rule);
});

router.put('/rules/:id', async (req, res) => {
    const { ruleString, metadata } = req.body;
    await Rule.update(req.params.id, ruleString, metadata);
    res.json({ message: 'Rule updated' });
});

router.delete('/rules/:id', async (req, res) => {
    await Rule.delete(req.params.id);
    res.json({ message: 'Rule deleted' });
});

export default router;