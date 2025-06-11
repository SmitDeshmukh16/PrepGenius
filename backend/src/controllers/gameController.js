import Game from '../models/Game.js';

export const createGame = async (req, res) => {
  try {
    const game = new Game({
      ...req.body,
      createdBy: req.userId
    });
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error creating game', error: error.message });
  }
};

export const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    await Game.findByIdAndDelete(gameId);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game', error: error.message });
  }
};