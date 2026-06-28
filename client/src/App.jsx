import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(window.location.hostname + ':3001');

const getLetterColors = (guess, targetWord) => {
  if (!guess || !targetWord) return [];
  const wordLength = targetWord.length;
  const colors = Array(wordLength).fill('bg-neutral-600'); 
  const targetLetters = targetWord.split('');

  for (let i = 0; i < wordLength; i++) {
    if (guess[i] === targetLetters[i]) {
      colors[i] = 'bg-green-500';
      targetLetters[i] = null;
    }
  }
  for (let i = 0; i < wordLength; i++) {
    if (colors[i] !== 'bg-green-500' && targetLetters.includes(guess[i])) {
      colors[i] = 'bg-yellow-500';
      targetLetters[targetLetters.indexOf(guess[i])] = null;
    }
  }
  return colors;
};

function LoginScreen({ onHost, onJoin }) {
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
      <h2 className="text-2xl font-bold border-b-2 border-neutral-600 pb-2 w-full text-center text-white">Accesso Giocatori</h2>
      <div className="w-full space-y-3 bg-neutral-700 p-4 rounded-lg border border-neutral-600">
        <h3 className="font-semibold text-neutral-300">Partecipa a una Partita</h3>
        <input 
          type="text" placeholder="Il tuo Nickname (es. Mario)" 
          className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded text-white focus:outline-none focus:border-green-500"
          value={nickname} onChange={(e) => setNickname(e.target.value)}
        />
        <input 
          type="text" placeholder="Codice Lobby (es. ABCD)" 
          className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded text-white focus:outline-none focus:border-green-500 uppercase font-mono tracking-widest"
          maxLength={4}
          value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
        />
        <button 
          onClick={() => onJoin(nickname, joinCode)}
          disabled={!nickname || joinCode.length !== 4}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded transition-colors"
        >
          Entra nella Lobby
        </button>
      </div>
      <div className="flex items-center w-full my-2">
        <div className="flex-grow border-t border-neutral-600"></div>
        <span className="px-3 text-neutral-400 text-sm">OPPURE</span>
        <div className="flex-grow border-t border-neutral-600"></div>
      </div>
      <div className="w-full">
        <button 
          onClick={() => onHost(nickname || 'Host')}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-lg"
        >
          👑 Crea Nuova Lobby
        </button>
      </div>
    </div>
  );
}

function LobbyScreen({ isHost, lobbyData, onStartGame, onUpdateSettings, onLeave }) {
  if (!lobbyData) return <div className="text-white">Caricamento lobby...</div>;

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md text-white animate-fade-in relative">
      <button 
        onClick={onLeave}
        className="absolute top-4 left-4 bg-neutral-700 hover:bg-red-600 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow"
      >
        🚪 Esci
      </button>

      <div className="text-center w-full bg-neutral-900 p-4 rounded-lg border border-dashed border-neutral-500 mb-4 mt-6">
        <p className="text-neutral-400 text-sm uppercase tracking-wider">Codice Invito</p>
        <h2 className="text-5xl font-mono font-bold text-green-400 tracking-widest">{lobbyData.code || "..."}</h2>
      </div>
      <div className="w-full space-y-3">
        <h3 className="font-bold text-lg border-b border-neutral-600 pb-1">Impostazioni Partita</h3>
        
        <div className="flex justify-between items-center bg-neutral-700 p-3 rounded">
          <span className="text-neutral-300">Modalità:</span>
          {isHost ? (
            <select 
              value={lobbyData.settings?.mode || 'ffa'} 
              onChange={(e) => onUpdateSettings({ mode: e.target.value })}
              className="bg-neutral-900 text-white p-2 rounded border border-neutral-600 focus:outline-none font-semibold cursor-pointer"
            >
              <option value="ffa">⚔️ Tutti contro Tutti</option>
              <option value="coop">🤝 Co-op a Turni</option>
            </select>
          ) : (
            <span className="font-bold text-blue-300">
              {lobbyData.settings?.mode === 'coop' ? 'Co-op a Turni' : 'Tutti contro Tutti'}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center bg-neutral-700 p-3 rounded">
          <span className="text-neutral-300">Lunghezza Parola:</span>
          {isHost ? (
            <select 
              value={lobbyData.settings?.wordLength || 5} 
              onChange={(e) => onUpdateSettings({ wordLength: parseInt(e.target.value) })}
              className="bg-neutral-900 text-white p-2 rounded border border-neutral-600 focus:outline-none font-semibold cursor-pointer"
            >
              {[4, 5, 6, 7, 8, 9, 10].map(len => (
                <option key={len} value={len}>{len} Lettere</option>
              ))}
            </select>
          ) : (
            <span className="font-bold text-blue-300">
              {lobbyData.settings?.wordLength || 5} Lettere
            </span>
          )}
        </div>

      </div>
      <div className="w-full space-y-2 mt-4">
        <h3 className="font-bold text-lg border-b border-neutral-600 pb-1">Giocatori ({lobbyData.players?.length || 0}/4)</h3>
        <ul className="space-y-2">
          {lobbyData.players?.map((p, idx) => (
            <li key={idx} className="bg-neutral-700 p-3 rounded flex items-center gap-3">
              <span className="text-xl">{p.isHost ? '👑' : '👤'}</span>
              <span className="font-medium">
                {p.name} 
                {p.id === socket.id && <span className="text-xs bg-blue-600 px-2 py-1 rounded ml-2 text-white">TU</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {isHost ? (
        <button 
          onClick={onStartGame}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors mt-6 text-lg shadow-lg"
        >
          ▶ Inizia la Sfida
        </button>
      ) : (
        <p className="text-neutral-400 animate-pulse mt-6 font-medium">In attesa dell'Host...</p>
      )}
    </div>
  );
}

function GameScreen({ lobbyData, secretWord, dictionary, currentTurn, currentUser, onTurnUpdate, onLeave }) {
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  
  const [localError, setLocalError] = useState('');
  const [shakeRow, setShakeRow] = useState(false);
  const [opponentsProgress, setOpponentsProgress] = useState({});

  const maxGuesses = 6;
  const wordLength = lobbyData?.settings?.wordLength || 5;
  const isCoop = lobbyData?.settings?.mode === 'coop';
  
  const isMyTurn = !isCoop || currentTurn === socket.id;
  const activePlayerName = lobbyData?.players?.find(p => p.id === currentTurn)?.name || "Avversario";

  useEffect(() => {
    if (isCoop) {
      socket.on('opponent_typing', (guess) => setCurrentGuess(guess));
      socket.on('coop_guess_accepted', (data) => {
        setGuesses(data.guesses);
        setCurrentGuess(''); 
        onTurnUpdate(data.currentTurn);
        
        const lastWord = data.guesses[data.guesses.length - 1];
        if (lastWord === secretWord || data.guesses.length >= maxGuesses) {
          setTimeout(() => {
            socket.emit('player_finished', {
              roomCode: lobbyData.code,
              isWin: lastWord === secretWord,
              playerName: currentUser.name,
              attempts: data.guesses.length
            });
          }, 1000);
        }
      });
    } else {
      socket.on('opponent_ffa_guess', (data) => {
        setOpponentsProgress(prev => {
          const currentProgress = prev[data.playerId] || [];
          return { ...prev, [data.playerId]: [...currentProgress, data.colors] };
        });
      });
    }

    return () => {
      socket.off('opponent_typing');
      socket.off('coop_guess_accepted');
      socket.off('opponent_ffa_guess');
    };
  }, [isCoop, secretWord, lobbyData, currentUser, onTurnUpdate]);

  const handleType = (newString) => {
    if (!isMyTurn) return; 
    setCurrentGuess(newString);
    if (isCoop) {
      socket.emit('typing', { roomCode: lobbyData.code, currentGuess: newString });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isMyTurn || guesses.includes(secretWord) || guesses.length >= maxGuesses) return;

      if (event.key === 'Enter') {
        submitGuess();
      } else if (event.key === 'Backspace') {
        handleType(currentGuess.slice(0, -1));
      } else if (/^[A-Za-z]$/.test(event.key)) {
        if (currentGuess.length < wordLength) {
          handleType((currentGuess + event.key).toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, secretWord, wordLength, isMyTurn, dictionary]);

  const submitGuess = () => {
    if (currentGuess.length !== wordLength) return;
    
    if (!dictionary.includes(currentGuess)) {
      setLocalError(`La parola "${currentGuess}" non è valida!`);
      setShakeRow(true);
      setTimeout(() => { setLocalError(''); setShakeRow(false); }, 1500);
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    
    if (isCoop) {
      socket.emit('submit_coop_guess', { roomCode: lobbyData.code, guesses: newGuesses });
    } else {
      setGuesses(newGuesses);
      setCurrentGuess('');
      
      const rowColors = getLetterColors(currentGuess, secretWord);
      socket.emit('ffa_guess', { roomCode: lobbyData.code, colors: rowColors });

      if (currentGuess === secretWord || newGuesses.length >= maxGuesses) {
        setTimeout(() => {
          socket.emit('player_finished', {
            roomCode: lobbyData.code,
            isWin: currentGuess === secretWord,
            playerName: currentUser.name,
            attempts: newGuesses.length
          });
        }, 1000);
      }
    }
  };

  const usedKeys = {};
  guesses.forEach(guess => {
    const colors = getLetterColors(guess, secretWord);
    guess.split('').forEach((letter, i) => {
      const color = colors[i];
      if (color === 'bg-green-500' || usedKeys[letter] === 'bg-green-500') usedKeys[letter] = 'bg-green-500';
      else if (color === 'bg-yellow-500' && usedKeys[letter] !== 'bg-green-500') usedKeys[letter] = 'bg-yellow-500';
      else if (!usedKeys[letter]) usedKeys[letter] = 'bg-neutral-800 opacity-50'; 
    });
  });

  return (
    <div className="flex flex-col items-center w-full animate-fade-in text-white pb-4">
      
      <div className="w-full max-w-2xl flex justify-between items-start mb-2 border-b border-neutral-700 pb-2 px-2">
        <div className="flex gap-4 items-center">
          <button 
            onClick={onLeave}
            className="bg-neutral-800 hover:bg-red-600 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow border border-neutral-700"
          >
            🚪 Abbandona
          </button>
          <div>
            <span className="text-xs text-neutral-400 block uppercase font-bold">
              {isCoop ? 'Co-op a Turni' : 'Tutti Contro Tutti'}
            </span>
            <span className="font-bold text-green-400 tracking-widest">{lobbyData?.code}</span>
          </div>
        </div>
        
        {!isCoop && (
          <div className="flex flex-col items-end text-xs">
            <span className="text-neutral-500 font-bold uppercase mb-1">Corsa Avversari</span>
            {lobbyData?.players?.filter(p => p.id !== socket.id).map(p => (
              <div key={p.id} className="flex flex-col items-end gap-1 mt-1 bg-neutral-800 p-2 rounded border border-neutral-700">
                <span className="text-neutral-300 font-semibold">{p.name}</span>
                <div className="grid gap-[2px]">
                  {opponentsProgress[p.id]?.map((attemptColors, rIdx) => (
                    <div key={rIdx} className="flex gap-[2px]">
                      {attemptColors.map((color, cIdx) => (
                        <div key={cIdx} className={`w-2 h-2 rounded-sm ${color}`}></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isCoop && (
        <div className={`w-full max-w-lg p-2 text-center font-bold mb-2 rounded shadow-lg transition-colors duration-300 ${isMyTurn ? 'bg-green-600 text-white animate-pulse' : 'bg-neutral-700 text-neutral-300'}`}>
          {isMyTurn ? '✨ È IL TUO TURNO! ✨' : `⏳ In attesa di ${activePlayerName}...`}
        </div>
      )}

      <div className="h-6 mb-2 text-red-400 font-bold text-sm text-center">
        {localError && <span className="animate-pulse">⚠️ {localError}</span>}
      </div>

      <div className="grid gap-2 mb-6" style={{ gridTemplateRows: `repeat(${maxGuesses}, minmax(0, 1fr))` }}>
        {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
          const colors = guesses[rowIndex] ? getLetterColors(guesses[rowIndex], secretWord) : [];

          return (
            <div key={rowIndex} className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}>
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                const letter = guess[colIndex] || '';
                let bgColor = colors[colIndex] || 'bg-neutral-800 border-2';
                if (!colors[colIndex]) {
                   bgColor += (isCurrentRow && shakeRow) ? ' border-red-500 scale-105' : ' border-neutral-600';
                }

                const boxSize = wordLength >= 8 ? 'w-9 h-9 sm:w-11 sm:h-11 text-xl'
                              : wordLength >= 6 ? 'w-12 h-12 sm:w-14 sm:h-14 text-2xl' 
                              : 'w-14 h-14 sm:w-16 sm:h-16 text-3xl';

                return (
                  <div key={colIndex} className={`${boxSize} flex items-center justify-center font-bold uppercase transition-all duration-300 rounded ${bgColor} ${letter && isCurrentRow && !shakeRow ? 'border-neutral-400 scale-105' : 'scale-100'}`}>
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className={`w-full max-w-lg px-2 flex flex-col gap-2 ${!isMyTurn ? 'opacity-50 pointer-events-none' : ''}`}>
        {[
          ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
          ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
          ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
        ].map((row, i) => (
          <div key={i} className="flex justify-center gap-1 sm:gap-2">
            {row.map((key) => {
              const isAction = key === 'ENTER' || key === 'BACK';
              const keyBg = usedKeys[key] || 'bg-neutral-600';
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'ENTER') submitGuess();
                    else if (key === 'BACK') handleType(currentGuess.slice(0, -1));
                    else if (currentGuess.length < wordLength) handleType(currentGuess + key);
                  }}
                  className={`flex items-center justify-center font-bold rounded text-white shadow ${isAction ? 'px-3 sm:px-4 text-xs sm:text-sm bg-neutral-500' : 'w-8 sm:w-10 text-lg'} h-14 sm:h-16 transition-colors duration-200 ${isAction ? '' : keyBg} hover:opacity-80 active:scale-95`}
                >
                  {key === 'BACK' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsScreen({ isHost, gameResult, secretWord, lobbyData, onReturnToLobby, onLeave }) {
  if (!gameResult) return null;

  const isCoop = lobbyData?.settings?.mode === 'coop';
  const isMyResult = gameResult.winnerId === socket.id;

  let title, titleColor, subtitle;

  if (isCoop) {
    title = gameResult.isWin ? '🏆 VITTORIA!' : '💀 SCONFITTA!';
    titleColor = gameResult.isWin ? 'text-green-400' : 'text-red-500';
    subtitle = gameResult.isWin ? 'Avete indovinato la parola insieme!' : 'Avete esaurito i tentativi!';
  } else {
    if (gameResult.isWin) {
      if (isMyResult) {
        title = '🏆 HAI VINTO!';
        titleColor = 'text-green-400';
        subtitle = `Hai battuto tutti indovinando in ${gameResult.attempts} tentativi!`;
      } else {
        title = '💀 HAI PERSO!';
        titleColor = 'text-red-500';
        subtitle = `${gameResult.winnerName} ha indovinato la parola prima di te!`;
      }
    } else {
      if (isMyResult) {
        title = '💀 HAI PERSO!';
        titleColor = 'text-red-500';
        subtitle = 'Hai esaurito tutti i tuoi tentativi!';
      } else {
        title = '⏱️ PARTITA FINITA';
        titleColor = 'text-yellow-500';
        subtitle = `${gameResult.winnerName} ha esaurito i tentativi.`;
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-neutral-800 rounded-xl shadow-2xl text-center text-white w-full max-w-md animate-fade-in relative">
      <button 
        onClick={onLeave}
        className="absolute top-4 left-4 bg-neutral-700 hover:bg-red-600 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow"
      >
        🚪 Abbandona
      </button>

      <div className="space-y-1 mt-6">
        <h2 className={`text-4xl font-extrabold tracking-wide ${titleColor}`}>
          {title}
        </h2>
        <p className="text-neutral-300 font-medium">{subtitle}</p>
      </div>

      <div className="w-full bg-neutral-900 p-4 rounded-lg border border-neutral-700 space-y-2 mt-2">
        <p className="text-neutral-400 text-sm uppercase">La parola corretta era:</p>
        <p className="text-3xl font-mono font-bold text-yellow-400 tracking-widest">{secretWord}</p>
      </div>

      <div className="w-full bg-neutral-700/50 p-4 rounded-lg text-left space-y-2">
        <h4 className="font-bold border-b border-neutral-600 pb-1 text-neutral-200">Riepilogo Partita:</h4>
        <p><span className="text-neutral-400">Modalità:</span> {isCoop ? 'Co-op a Turni' : 'Tutti Contro Tutti'}</p>
        {gameResult.isWin && (
          <p><span className="text-neutral-400">Risolto da:</span> {isCoop ? 'Tutto il Team' : gameResult.winnerName}</p>
        )}
        <p><span className="text-neutral-400">Tentativi {gameResult.isWin ? 'impiegati' : 'esauriti'}:</span> {gameResult.attempts} / 6</p>
      </div>

      {isHost ? (
        <button 
          onClick={onReturnToLobby}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-lg shadow-lg mt-2"
        >
          🔄 Riporta tutti in Lobby
        </button>
      ) : (
        <p className="text-neutral-400 text-sm animate-pulse mt-4">In attesa che l'Host decida per la rivincita...</p>
      )}
    </div>
  );
}

export default function App() {
  const [appPhase, setAppPhase] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [lobbyData, setLobbyData] = useState(null);
  
  const [secretWord, setSecretWord] = useState('');
  const [dictionary, setDictionary] = useState([]); 
  const [currentTurn, setCurrentTurn] = useState('');
  const [gameResult, setGameResult] = useState(null);
  
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    socket.on('lobby_created', (data) => {
      setLobbyData({ code: data.roomCode, ...data.lobbyData });
      setAppPhase('lobby');
      setErrorMessage('');
    });

    socket.on('lobby_updated', (roomData) => {
      setLobbyData(prev => ({ ...roomData, code: prev?.code || roomData.code }));
      
      // FIX CROLLO LOBBY: Aggiorniamo la fase solo se stavamo entrando, 
      // così non veniamo sbalzati via se stiamo già giocando!
      setAppPhase(prev => {
        if (prev === 'login') return 'lobby';
        return prev;
      });

      // FIX CORONA: Se il server ci promuove Host, aggiorniamo il nostro stato locale
      const me = roomData.players.find(p => p.id === socket.id);
      if (me) {
        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          return { ...prevUser, isHost: me.isHost };
        });
      }
    });

    socket.on('error_message', (data) => {
      setErrorMessage(data.message);
    });

    socket.on('game_started', (data) => {
      setSecretWord(data.word);
      setDictionary(data.dictionary); 
      setCurrentTurn(data.currentTurn);
      setGameResult(null); 
      setAppPhase('playing');
    });

    socket.on('go_to_results', (data) => {
      setGameResult(data);
      setAppPhase('results');
    });

    socket.on('back_to_lobby', () => {
      setAppPhase('lobby');
    });

    return () => {
      socket.off('lobby_created');
      socket.off('lobby_updated');
      socket.off('error_message');
      socket.off('game_started');
      socket.off('go_to_results');
      socket.off('back_to_lobby');
    };
  }, []);

  const handleHostLobby = (name) => {
    const hostName = name || 'Host';
    setCurrentUser({ name: hostName, isHost: true });
    socket.emit('create_lobby', { name: hostName });
  };

  const handleJoinLobby = (name, code) => {
    setCurrentUser({ name, isHost: false });
    setLobbyData({ code }); 
    socket.emit('join_lobby', { name, roomCode: code });
  };

  const handleUpdateSettings = (newSettings) => {
    socket.emit('update_settings', { roomCode: lobbyData.code, settings: newSettings });
  };

  const handleStartGame = () => {
    socket.emit('start_game', { roomCode: lobbyData.code });
  };

  const handleReturnToLobby = () => {
    socket.emit('return_to_lobby', { roomCode: lobbyData.code });
  };

  // FIX TASTO ESCI: Azzera tutti gli stati del Client e ti riporta alla Home!
  const handleLeaveLobby = () => {
    if (lobbyData) {
      socket.emit('leave_lobby', { roomCode: lobbyData.code });
    }
    setAppPhase('login');
    setLobbyData(null);
    setSecretWord('');
    setGameResult(null);
    setDictionary([]);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center py-6 sm:py-10 font-sans selection:bg-transparent">
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-widest mb-6 sm:mb-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-md">
        WORDLE RACE
      </h1>

      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in border border-red-400">
          {errorMessage}
        </div>
      )}

      {appPhase === 'login' && (
        <LoginScreen onHost={handleHostLobby} onJoin={handleJoinLobby} />
      )}

      {appPhase === 'lobby' && (
        <LobbyScreen 
          isHost={currentUser?.isHost} 
          lobbyData={lobbyData}
          onStartGame={handleStartGame} 
          onUpdateSettings={handleUpdateSettings}
          onLeave={handleLeaveLobby}
        />
      )}

      {appPhase === 'playing' && (
        <GameScreen 
          lobbyData={lobbyData} 
          secretWord={secretWord}
          dictionary={dictionary}
          currentTurn={currentTurn}
          currentUser={currentUser}
          onTurnUpdate={(newTurn) => setCurrentTurn(newTurn)}
          onLeave={handleLeaveLobby}
        />
      )}

      {appPhase === 'results' && (
        <ResultsScreen 
          isHost={currentUser?.isHost}
          gameResult={gameResult}
          secretWord={secretWord}
          lobbyData={lobbyData} 
          onReturnToLobby={handleReturnToLobby}
          onLeave={handleLeaveLobby}
        />
      )}
    </div>
  );
}