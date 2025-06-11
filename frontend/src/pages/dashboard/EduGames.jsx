import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function EduGames() {
  const [games, setGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: '',
    topic: ''
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/games', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGames(response.data);
    } catch (error) {
      toast.error('Failed to fetch games');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/games',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Game added successfully');
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        link: '',
        topic: ''
      });
      fetchGames();
    } catch (error) {
      toast.error('Failed to add game');
    }
  };

  const handleDelete = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/games/${gameId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Game deleted successfully');
      fetchGames();
    } catch (error) {
      toast.error('Failed to delete game');
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-4xl font-bold">Educational Games</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Game
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <motion.div
            key={game._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{game.name}</h2>
              <button
                onClick={() => handleDelete(game._id)}
                className="p-2 hover:bg-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-300 mb-4">{game.description}</p>

            <div className="flex items-center justify-between mt-4">
              <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                {game.topic}
              </span>
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Play Game
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Add New Game</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Game Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Game Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Game
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default EduGames;