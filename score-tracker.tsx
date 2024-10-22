import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Trophy, User, Plus, Minus, X, Edit2, Check } from 'lucide-react';

function ScoreTracker() {
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
  const [activeGame, setActiveGame] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerColor, setNewPlayerColor] = useState('#ff0000');
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    localStorage.setItem('scoreTrackerPlayers', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('scoreTrackerGames', JSON.stringify(games));
  }, [games]);

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
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const updatePlayer = (playerId, updates) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    ));
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

  const startNewGame = (selectedPlayers) => {
    setActiveGame({
      id: Date.now(),
      players: selectedPlayers.map(p => ({ ...p, score: 0 })),
      timestamp: new Date()
    });
    setView('game');
  };

  const updateScore = (playerId, increment) => {
    setActiveGame(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { ...p, score: Math.max(0, p.score + increment) } : p
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

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('scoreTrackerPlayers');
      localStorage.removeItem('scoreTrackerGames');
      setPlayers([]);
      setGames([]);
      setActiveGame(null);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Home View */}
      {view === 'home' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setView('newGame')}
              className="p-4 bg-blue-500 text-white rounded flex items-center justify-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              New Game
            </button>
            <button
              onClick={() => setView('players')}
              className="p-4 bg-green-500 text-white rounded flex items-center justify-center gap-2"
            >
              <Users className="h-5 w-5" />
              Manage Players
            </button>
          </div>

          {players.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Players</span>
                  <button onClick={clearAllData} className="text-sm text-red-500">
                    Reset All Data
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {players.map(player => (
                    <div
                      key={player.id}
                      className="p-2 border rounded flex justify-between"
                      style={{ borderLeft: `4px solid ${player.color}` }}
                    >
                      <span>{player.name}</span>
                      <span>
                        {player.wins}W - {player.losses}L
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {games.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {games.slice(-5).reverse().map(game => (
                    <div key={game.id} className="p-2 border rounded">
                      <div className="font-medium">
                        Winner: {players.find(p => p.id === game.winnerId)?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Players: {game.players.map(p => p.name).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Players View */}
      {view === 'players' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Add Player</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Player Name"
                  className="w-full p-2 border rounded"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                />
                <input
                  type="color"
                  className="w-full p-1 border rounded"
                  value={newPlayerColor}
                  onChange={e => setNewPlayerColor(e.target.value)}
                />
                <button
                  onClick={addPlayer}
                  className="w-full p-2 bg-green-500 text-white rounded"
                >
                  Add Player
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {players.map(player => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div 
                    className="flex flex-col h-full"
                    style={{ borderLeft: `4px solid ${player.color}` }}
                  >
                    <div className="p-2 flex-grow">
                      {editingPlayerId === player.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="p-1 border rounded flex-grow"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter') saveEdit(player.id);
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(player.id)}
                            className="p-1 text-green-500"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-lg">{player.name}</div>
                          <div className="text-sm text-gray-600">
                            Wins: {player.wins} / Losses: {player.losses}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t mt-2 pt-2 flex justify-center space-x-3">
                      <button
                        onClick={() => startEditing(player)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <button
            onClick={() => setView('home')}
            className="w-full p-2 bg-gray-500 text-white rounded"
          >
            Back
          </button>
        </>
      )}

      {/* New Game View */}
      {view === 'newGame' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Players</CardTitle>
          </CardHeader>
          <CardContent>
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
              <div className="space-x-2">
                <button
                  onClick={() => startNewGame(activeGame?.players || [])}
                  disabled={!activeGame?.players?.length}
                  className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                >
                  Start Game
                </button>
                <button
                  onClick={() => {
                    setActiveGame(null);
                    setView('home');
                  }}
                  className="p-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game View */}
      {view === 'game' && activeGame && (
        <Card>
          <CardHeader>
            <CardTitle>Current Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeGame.players.map(player => (
                <div
                  key={player.id}
                  className="p-4 border rounded"
                  style={{ borderLeft: `4px solid ${player.color}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-2xl">{player.score}</span>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => updateScore(player.id, -1)}
                      className="p-2 bg-red-500 text-white rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateScore(player.id, 1)}
                      className="p-2 bg-green-500 text-white rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={endGame}
                className="w-full p-2 bg-blue-500 text-white rounded"
              >
                End Game
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ScoreTracker;
