// Importiamo le librerie necessarie (usiamo la sintassi CommonJS standard di Node)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Inizializziamo Express
const app = express();
app.use(cors());

// Creiamo un server HTTP nativo (necessario per agganciarci i WebSockets)
const server = http.createServer(app);

// Inizializziamo Socket.io e gli diamo i permessi CORS per comunicare con React (porta 5173)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// MEMORIA DEL SERVER
// Questa variabile salva tutte le lobby attive finché il server è acceso.
// Perfetto per il Raspberry Pi: non stressa il disco fisso!
const lobbies = {};

// Inizio dell'ascolto delle connessioni
io.on('connection', (socket) => {
  console.log(`🟢 Un utente si è connesso: ${socket.id}`);

  // 1. EVENTO: L'utente Host clicca su "Crea Lobby"
  socket.on('create_lobby', (data) => {
    // Generiamo un codice di 4 lettere maiuscole casuali (es. ABCD)
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Creiamo la struttura della lobby in memoria
    lobbies[roomCode] = {
      hostId: socket.id,
      settings: { mode: 'ffa', wordLength: 5 },
      players: [{ id: socket.id, name: data.name, isHost: true }]
    };

    // Uniamo l'utente alla "Stanza" (Room) virtuale di Socket.io
    socket.join(roomCode); 
    
    // Rispondiamo SOLO a chi ha creato la lobby mandandogli i dati
    socket.emit('lobby_created', { roomCode, lobbyData: lobbies[roomCode] });
    console.log(`👑 Lobby ${roomCode} creata da ${data.name}`);
  });

  // 2. EVENTO: Un ospite inserisce il codice per entrare
  socket.on('join_lobby', (data) => {
    const room = lobbies[data.roomCode];
    
    if (room) {
      if (room.players.length >= 4) {
        // Se la stanza è piena, mandiamo un errore solo a chi sta provando a entrare
        socket.emit('error_message', { message: 'La lobby è piena!' });
        return;
      }
      
      // Aggiungiamo il giocatore all'array della stanza
      const newPlayer = { id: socket.id, name: data.name, isHost: false };
      room.players.push(newPlayer);
      socket.join(data.roomCode);
      
      // 'io.to(roomCode).emit' trasmette l'aggiornamento a TUTTI i giocatori già dentro!
      io.to(data.roomCode).emit('lobby_updated', room);
      console.log(`👤 ${data.name} è entrato nella lobby ${data.roomCode}`);
    } else {
      socket.emit('error_message', { message: 'Lobby inesistente o codice errato!' });
    }
  });

  // 3. EVENTO: L'Host cambia le regole (es. da Tutti-contro-Tutti a Co-op)
  socket.on('update_settings', (data) => {
    const room = lobbies[data.roomCode];
    // Controllo di Sicurezza: Solo chi ha l'ID dell'host può cambiare le regole
    if (room && room.hostId === socket.id) {
      room.settings = { ...room.settings, ...data.settings };
      // Avvisiamo tutti i giocatori del cambio regole
      io.to(data.roomCode).emit('lobby_updated', room);
    }
  });

  // 4. EVENTO: Disconnessione (chiusura pagina web)
  socket.on('disconnect', () => {
    console.log(`🔴 Utente disconnesso: ${socket.id}`);
    // Piu avanti scriveremo la logica per rimuovere il giocatore dalla lobby
    // e chiuderla se chi esce è l'Host.
  });
});

// Avvio effettivo del Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server Socket.io attivo e in ascolto su http://localhost:${PORT}`);
});