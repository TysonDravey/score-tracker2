// [Previous imports stay the same...]

function ScoreTracker() {
    // [Previous state and function definitions stay the same...]
  
    // Modify the Players View section in the return statement to update the color picker UI:
    
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Other views stay the same... */}
  
        {/* Players View */}
        {view === 'players' && (
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
                  className="w-full p-2 bg-green-500 text-white rounded disabled:bg-gray-300"
                >
                  Add Player
                </button>
              </div>
            </div>
  
            {/* Rest of the Players View stays the same... */}
          </div>
        )}
  
        {/* Other views stay the same... */}
      </div>
    );
  }
  
  export default ScoreTracker;