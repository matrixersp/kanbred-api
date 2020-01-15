const express = require('express');

const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const { Board, validateBoard } = require('../models/board');

router.get('/', async (req, res) => {
  const boards = await Board.find().select('-__v');
  res.status(200).json(boards);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const board = await Board.findById(req.params.id).populate('lists.cards');
  if (!board)
    return res
      .status(404)
      .json({ error: 'The board with the given ID was not found.' });

  res.status(200).json(board);
});

router.post('/', async (req, res) => {
  const { error } = validateBoard(req.body);
  if (error) {
    const errors = [];
    error.details.forEach(d => errors.push({ error: d.message }));
    return res.status(400).json({ errors });
  }

  const board = new Board({ title: req.body.title });
  await board.save();

  res.status(201).json(board);
});

router.put('/:id', validateObjectId, async (req, res) => {
  const { error } = validateBoard(req.body);
  if (error) {
    const errors = [];
    error.details.forEach(d => errors.push({ error: d.message }));
    return res.status(400).json({ errors });
  }

  const board = await Board.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title },
    { new: true }
  );
  if (!board)
    return res
      .status(404)
      .json({ error: 'The board with the given ID was not found.' });

  res.status(200).json(board);
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const board = await Board.findByIdAndRemove(req.params.id);
  if (!board)
    return res
      .status(404)
      .json({ error: 'The board with the given ID was not found.' });

  res.status(200).json({ message: 'The board was successfully deleted.' });
});

module.exports = router;
