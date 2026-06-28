import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// 1. CONNESSIONE AL SERVER WEB-SOCKET
// Ci colleghiamo alla porta 3001, dove è in ascolto il nostro backend Node.js
const socket = io('http://localhost:3001');

// --- COMPONENTE 0: LOGIN ---
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

// --- COMPONENTE 1: LOBBY ---
function LobbyScreen({ isHost, lobbyData, onStartGame }) {
  if (!lobbyData) return <div className="text-white">Caricamento lobby...</div>;

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md text-white animate-fade-in">
      <div className="text-center w-full bg-neutral-900 p-4 rounded-lg border border-dashed border-neutral-500 mb-4">
        <p className="text-neutral-400 text-sm uppercase tracking-wider">Codice Invito</p>
        <h2 className="text-5xl font-mono font-bold text-green-400 tracking-widest">{lobbyData.code || "..."}</h2>
      </div>

      <div className="w-full space-y-2 mt-4">
        <h3 className="font-bold text-lg border-b border-neutral-600 pb-1">Giocatori in attesa ({lobbyData.players?.length || 0}/4)</h3>
        <ul className="space-y-2">
          {lobbyData.players?.map((p, idx) => (
            <li key={idx} className="bg-neutral-700 p-3 rounded flex items-center gap-3">
              <span className="text-xl">{p.isHost ? '👑' : '👤'}</span>
              <span className="font-medium">
                {p.name} 
                {/* Se l'ID del giocatore corrisponde al mio Socket ID, sono io! */}
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

// --- COMPONENTE RADICE ---
export default function App() {
  const [appPhase, setAppPhase] = useState('login'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [lobbyData, setLobbyData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 2. GESTIONE DEGLI EVENTI IN INGRESSO DAL SERVER
  useEffect(() => {
    
    // Il server ci conferma che ha creato la lobby
    socket.on('lobby_created', (data) => {
      setLobbyData({ code: data.roomCode, ...data.lobbyData });
      setAppPhase('lobby');
      setErrorMessage('');
    });

    // Il server ci avvisa che la lobby è cambiata (è entrato un giocatore)
    socket.on('lobby_updated', (roomData) => {
      // Usiamo una funzione per aggiornare lo stato mantenendo il codice precedente
      setLobbyData(prev => ({ ...roomData, code: prev?.code || roomData.code }));
      setAppPhase('lobby');
      setErrorMessage('');
    });

    // Il server ci segnala un errore (es. Lobby Piena o Codice Errato)
    socket.on('error_message', (data) => {
      setErrorMessage(data.message);
    });

    // Pulizia dei listener quando il componente viene distrutto (Evita memory leak)
    return () => {
      socket.off('lobby_created');
      socket.off('lobby_updated');
      socket.off('error_message');
    };
  }, []);

  // 3. AZIONI DELL'UTENTE (Invio eventi al server)
  
  const handleHostLobby = (name) => {
    const hostName = name || 'Host';
    setCurrentUser({ name: hostName, isHost: true });
    // Diciamo al server: "Ehi, crea una lobby a mio nome!"
    socket.emit('create_lobby', { name: hostName });
  };

  const handleJoinLobby = (name, code) => {
    setCurrentUser({ name, isHost: false });
    // Diciamo al server: "Ehi, fammi entrare in questa lobby!"
    setLobbyData({ code }); // Lo salviamo in attesa della risposta del server
    socket.emit('join_lobby', { name, roomCode: code });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center py-6 sm:py-10 font-sans selection:bg-transparent">
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-widest mb-6 sm:mb-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-md">
        WORDLE RACE
      </h1>

      {/* Banner degli errori visivo */}
      {errorMessage && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 shadow text-center w-full max-w-md animate-fade-in">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Gestione Fasi con l'operatore && */}
      {appPhase === 'login' && (
        <LoginScreen onHost={handleHostLobby} onJoin={handleJoinLobby} />
      )}

      {appPhase === 'lobby' && (
        <LobbyScreen 
          isHost={currentUser?.isHost} 
          lobbyData={lobbyData}
          onStartGame={() => alert("Nel prossimo step scriveremo il gioco!")} 
        />
      )}
    </div>
  );
}