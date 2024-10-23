import React, { useState, useEffect } from 'react';
import { Users, Trophy, User, Plus, Minus, X, Edit2, Check, Settings } from 'lucide-react';

function ScoreTracker() {
  // State definitions
  const [view, setView] = useState('home');
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem('scoreTrackerPlayers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [games, setGames] = useState(() => {
    try {
      const saved = localStorage.getItem('scoreTrackerGames');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem('scoreTrackerSettings');
      return savedSettings ? JSON.parse(savedSettings) : {
        scoreIncrement: 1,
        allowNegativeScores: false,
        enableTournamentMode: false,
        teamMode: false,
        theme: {
          primary: '#3b82f6',   // blue-500
          secondary: '#10b981', // emerald-500
          danger: '#ef4444',    // red-500
        }
      };
    } catch {
      return {
        scoreIncrement: 1,
        allowNegativeScores: false,
        enableTournamentMode: false,
        teamMode: false,
        theme: {
          primary: '#3b82f6',
          secondary: '#10b981',
          danger: '#ef4444',
        }
      };
    }
  });
  const [activeGame, setActiveGame] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerColor, setNewPlayerColor] = useState('#ff0000');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // LocalStorage Effects
  useEffect(() => {
    localStorage.setItem('scoreTrackerPlayers', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('scoreTrackerGames', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('scoreTrackerSettings', JSON.stringify(settings));
  }, [settings]);

  // Player Management Functions
  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([
        ...players,
        {
          id: Date.now(),
          name: newPlayerName,
          color: newPlayerColor,
          wins: 0,
          losses: 0
        }
      ]);
      setNewPlayerName('');
      setNewPlayerColor('#ff0000');
    }
  };

  const removePlayer = (playerId) => {
    if (window.confirm('Are you sure you want to remove this player? Their stats will be lost.')) {
      setPlayers(players.filter(p => p.id !== playerId));
    }
  };

  const startEditing = (player) => {
    setEditingPlayerId(player.id);
    setEditingName(player.name);
  };

  const saveEdit = (playerId) => {
    if (editingName.trim()) {
      updatePlayer(playerId, { name: editingName });
    }
    setEditingPlayerId(null);
    setEditingName('');
  };

  const updatePlayer = (playerId, updates) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    ));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
      localStorage.removeItem('scoreTrackerPlayers');
      localStorage.removeItem('scoreTrackerGames');
      localStorage.removeItem('scoreTrackerSettings');
      setPlayers([]);
      setGames([]);
      setActiveGame(null);
      setSelectedPlayer(null);
      window.location.reload(); // Refresh to reset settings
    }
  };

  // Game Management Functions
  const startNewGame = (selectedPlayers) => {
    setActiveGame({
      id: Date.now(),
      players: selectedPlayers.map(p => ({
        ...p,
        score: 0
      })),
      timestamp: new Date()
    });
    setView('game');
  };

  const updateScore = (playerId, increment) => {
    setActiveGame(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? {
          ...p,
          score: settings.allowNegativeScores 
            ? p.score + (increment * settings.scoreIncrement)
            : Math.max(0, p.score + (increment * settings.scoreIncrement))
        } : p
      )
    }));
  };

  const endGame = () => {
    if (!activeGame?.players?.length) return;
    
    const winner = activeGame.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    setPlayers(prevPlayers => prevPlayers.map(p => {
      const isWinner = p.id === winner.id;
      const inGame = activeGame.players.some(gp => gp.id === p.id);
      if (!inGame) return p;
      return {
        ...p,
        wins: isWinner ? p.wins + 1 : p.wins,
        losses: !isWinner ? p.losses + 1 : p.losses
      };
    }));

    setGames(prev => [...prev, { ...activeGame, winnerId: winner.id }]);
    setActiveGame(null);
    setView('home');
  };


  //part 2
  // Render Functions
  const renderHome = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setView('newGame')}
          className="p-4 text-white rounded flex items-center justify-center gap-2"
          style={{ backgroundColor: settings.theme.primary }}
        >
          <Trophy className="h-5 w-5" />
          New Game
        </button>
        <button
          onClick={() => setView('players')}
          className="p-4 text-white rounded flex items-center justify-center gap-2"
          style={{ backgroundColor: settings.theme.secondary }}
        >
          <Users className="h-5 w-5" />
          Players
        </button>
        <button
          onClick={() => setView('settings')}
          className="p-4 bg-gray-500 text-white rounded flex items-center justify-center gap-2"
        >
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>

      {players.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Players</h2>
            <button 
              onClick={clearAllData}
              className="text-sm"
              style={{ color: settings.theme.danger }}
            >
              Reset All Data
            </button>
          </div>
          <div className="space-y-2">
            {players.map(player => (
              <div
                key={player.id}
                className="p-2 border rounded flex justify-between items-center"
                style={{ borderLeft: `4px solid ${player.color}` }}
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-gray-600">
                  {player.wins}W - {player.losses}L
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {games.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Recent Games</h2>
          <div className="space-y-2">
            {games.slice(-5).reverse().map(game => (
              <div key={game.id} className="p-2 border rounded">
                <div className="font-medium">
                  Winner: {players.find(p => p.id === game.winnerId)?.name}
                </div>
                <div className="text-sm text-gray-600">
                  Players: {game.players.map(p => p.name).join(', ')}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(game.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPlayers = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Add Player</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Player Name</label>
            <input
              type="text"
              placeholder="Enter player name"
              className="w-full p-2 border rounded"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Player Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-20"
                value={newPlayerColor}
                onChange={e => setNewPlayerColor(e.target.value)}
              />
              <div 
                className="flex-1 h-10 rounded border"
                style={{ backgroundColor: newPlayerColor }}
              ></div>
            </div>
          </div>

          <button
            onClick={addPlayer}
            disabled={!newPlayerName.trim()}
            className="w-full p-2 text-white rounded disabled:bg-gray-300"
            style={{ backgroundColor: settings.theme.secondary }}
          >
            Add Player
          </button>
        </div>
      </div>

      {/* Existing Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map(player => (
          <div key={player.id} className="bg-white rounded-lg shadow">
            <div 
              className="p-4 flex flex-col h-full"
              style={{ borderLeft: `4px solid ${player.color}` }}
            >
              {editingPlayerId === player.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') saveEdit(player.id);
                    }}
                    autoFocus
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Player Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-8 w-16"
                        value={player.color}
                        onChange={e => updatePlayer(player.id, { color: e.target.value })}
                      />
                      <div 
                        className="flex-1 h-8 rounded border"
                        style={{ backgroundColor: player.color }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={() => saveEdit(player.id)}
                    className="w-full p-2 text-white rounded"
                    style={{ backgroundColor: settings.theme.secondary }}
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-grow">
                    <div className="text-xl font-bold">{player.name}</div>
                    <div className="text-gray-600">
                      Wins: {player.wins} / Losses: {player.losses}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
                    <button
                      onClick={() => startEditing(player)}
                      className="p-2 hover:bg-blue-50 rounded-full"
                      style={{ color: settings.theme.primary }}
                      title="Edit Player"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="p-2 hover:bg-red-50 rounded-full"
                      style={{ color: settings.theme.danger }}
                      title="Remove Player"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setView('home')}
        className="w-full p-2 bg-gray-500 text-white rounded"
      >
        Back to Home
      </button>
    </div>
  );

  //part 3
  const renderNewGame = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Select Players</h2>
      <div className="space-y-4">
        {players.map(player => (
          <div
            key={player.id}
            className="p-2 border rounded flex items-center justify-between"
            style={{ borderLeft: `4px solid ${player.color}` }}
          >
            <span>{player.name}</span>
            <input
              type="checkbox"
              className="h-5 w-5"
              onChange={(e) => {
                const selectedPlayers = activeGame?.players || [];
                if (e.target.checked) {
                  setActiveGame({
                    ...activeGame,
                    players: [...selectedPlayers, { ...player, score: 0 }]
                  });
                } else {
                  setActiveGame({
                    ...activeGame,
                    players: selectedPlayers.filter(p => p.id !== player.id)
                  });
                }
              }}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={() => startNewGame(activeGame?.players || [])}
            disabled={!activeGame?.players?.length}
            className="flex-1 p-2 text-white rounded disabled:bg-gray-300"
            style={{ backgroundColor: settings.theme.primary }}
          >
            Start Game
          </button>
          <button
            onClick={() => {
              setActiveGame(null);
              setView('home');
            }}
            className="flex-1 p-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Current Game</h2>
      <div className="space-y-4">
        {activeGame?.players.map(player => (
          <div
            key={player.id}
            className="p-4 border rounded"
            style={{ borderLeft: `4px solid ${player.color}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium">{player.name}</span>
              <span className="text-2xl font-bold">{player.score}</span>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => updateScore(player.id, -1)}
                className="p-3 text-white rounded-full"
                style={{ backgroundColor: settings.theme.danger }}
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                onClick={() => updateScore(player.id, 1)}
                className="p-3 text-white rounded-full"
                style={{ backgroundColor: settings.theme.secondary }}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={endGame}
          className="w-full p-3 text-white rounded text-lg"
          style={{ backgroundColor: settings.theme.primary }}
        >
          End Game
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        {/* Scoring Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Score Increment</label>
            <select 
              className="w-full p-2 border rounded"
              value={settings.scoreIncrement}
              onChange={e => setSettings(prev => ({
                ...prev,
                scoreIncrement: parseInt(e.target.value)
              }))}
            >
              <option value="1">1 Point</option>
              <option value="2">2 Points</option>
              <option value="5">5 Points</option>
              <option value="10">10 Points</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowNegative"
              className="h-4 w-4"
              checked={settings.allowNegativeScores}
              onChange={e => setSettings(prev => ({
                ...prev,
                allowNegativeScores: e.target.checked
              }))}
            />
            <label htmlFor="allowNegative" className="text-sm">
              Allow Negative Scores
            </label>
          </div>
        </div>

        {/* Game Mode Settings */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Game Modes</h3>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tournamentMode"
              className="h-4 w-4"
              checked={settings.enableTournamentMode}
              onChange={e => setSettings(prev => ({
                ...prev,
                enableTournamentMode: e.target.checked
              }))}
            />
            <label htmlFor="tournamentMode" className="text-sm">
              Tournament Mode
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="teamMode"
              className="h-4 w-4"
              checked={settings.teamMode}
              onChange={e => setSettings(prev => ({
                ...prev,
                teamMode: e.target.checked
              }))}
            />
            <label htmlFor="teamMode" className="text-sm">
              Team Mode
            </label>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Theme Colors</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-20"
                value={settings.theme.primary}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  theme: {
                    ...prev.theme,
                    primary: e.target.value
                  }
                }))}
              />
              <div 
                className="flex-1 h-10 rounded border"
                style={{ backgroundColor: settings.theme.primary }}
              ></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-20"
                value={settings.theme.secondary}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  theme: {
                    ...prev.theme,
                    secondary: e.target.value
                  }
                }))}
              />
              <div 
                className="flex-1 h-10 rounded border"
                style={{ backgroundColor: settings.theme.secondary }}
              ></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Danger Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-20"
                value={settings.theme.danger}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  theme: {
                    ...prev.theme,
                    danger: e.target.value
                  }
                }))}
              />
              <div 
                className="flex-1 h-10 rounded border"
                style={{ backgroundColor: settings.theme.danger }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setView('home')}
        className="w-full p-2 bg-gray-500 text-white rounded"
      >
        Back to Home
      </button>
    </div>
  );

  // Main render
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4" style={{ paddingTop: '5rem' }}>
      {view === 'home' && renderHome()}
      {view === 'players' && renderPlayers()}
      {view === 'newGame' && renderNewGame()}
      {view === 'game' && renderGame()}
      {view === 'settings' && renderSettings()}
    </div>
  );
}

export default ScoreTracker;