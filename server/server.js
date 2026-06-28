const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const app = express();
app.use(cors());

// --- FIX PERCORSO E FALLBACK SPA ---
const DIST_PATH = path.join(__dirname, 'dist');
app.use(express.static(DIST_PATH));

// Fallback "Old School" a prova di errore per React/Vite
app.use((req, res, next) => {
  if (!req.url.startsWith('/socket.io') && !req.url.includes('.')) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  } else {
    next();
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// STRUTTURA DIZIONARI DA 4 A 10 LETTERE
const DICTIONARY = {};
for (let i = 4; i <= 10; i++) {
  DICTIONARY[i] = { answerList: [], guessList: [] };
}

DICTIONARY[4].answerList = ['ALBA', 'ALTO', 'ARIA', 'ARTE', 'AUTO', 'CANE', 'CASA', 'CAPO', 'CIBO', 'COME', 'COSA', 'DATO', 'DITO', 'DONO', 'DOVE', 'ELMO', 'ERBA', 'EURO', 'FARE', 'FARO', 'FATA', 'FILM', 'FILO', 'FOTO', 'FUGA', 'GARA', 'GELO', 'GIRO', 'GOLA', 'GUAI', 'GUFO', 'IDEA', 'LANA', 'LATO', 'LAVA', 'LEGA', 'LEVA', 'LUCE', 'LUNA', 'LUPO', 'MAGO', 'MANO', 'MARE', 'MELA', 'MESE', 'META', 'MODO', 'MOLE', 'MOLO', 'MOTO', 'NASO', 'NATO', 'NAVE', 'NEVE', 'NIDO', 'NODO', 'NOME', 'NORD', 'NOTA', 'ONDA', 'ORCO', 'ORMA', 'ORSO', 'OSSA', 'OTTO', 'PACE', 'PALO', 'PENA', 'PESO', 'PILA', 'PINO', 'POCO', 'POLO', 'POMO', 'POSA', 'PRATO', 'PRUA', 'RANA', 'RAMO', 'RESA', 'RETE', 'RIMA', 'RISO', 'ROBA', 'ROSA', 'RUGA', 'SALA', 'SALE', 'SANO', 'SEDE', 'SEME', 'SERA', 'SETA', 'SOLE', 'SOLO', 'SOMA', 'SONO', 'STOP', 'SUGO', 'TANA', 'TARA', 'TELA', 'TEMA', 'TIPO', 'TIRO', 'TONO', 'TOPO', 'TORO', 'TRAM', 'TUBO', 'TUTA', 'UOVO', 'URTO', 'VAGO', 'VALE', 'VELA', 'VENA', 'VERO', 'VINO', 'VITE', 'VIVO', 'VOCE', 'VOLO', 'VOTO', 'ZONA'];
DICTIONARY[5].answerList = ['ABITO', 'ACQUA', 'ACETO', 'AGLIO', 'ALITO', 'AMICO', 'AMORE', 'ANIMA', 'APICE', 'ARABO', 'ARARE', 'AROMA', 'ASCIA', 'ASPRO', 'ASTRO', 'BACIO', 'BAGNO', 'BALZA', 'BANCA', 'BANDA', 'BARCA', 'BEATO', 'BELLO', 'BIECO', 'BIMBO', 'BIRRA', 'BOCCA', 'BOLSO', 'BORDO', 'BORGO', 'BOSCO', 'BRACE', 'BRAVO', 'BREVE', 'BRINA', 'BUONO', 'BURRO', 'CALDO', 'CALMO', 'CALVO', 'CAMPO', 'CANNE', 'CANTO', 'CARTA', 'CASCO', 'CAUSA', 'CEDRO', 'CELLO', 'CENTO', 'CERVO', 'CHILO', 'CIELO', 'CIGNO', 'CLERO', 'CLIMA', 'COCCO', 'COLMO', 'COLPO', 'COLTO', 'CONTO', 'COPPA', 'CORPO', 'CORSO', 'CORTO', 'COSMO', 'COTTO', 'CREMA', 'CROCE', 'CRUDO', 'CUORE', 'CURVA', 'DANZA', 'DENTE', 'DENSO', 'DRAGO', 'EDERA', 'ELICA', 'ESAME', 'ESITO', 'FAINA', 'FALCO', 'FARSA', 'FATTO', 'FAUNA', 'FERRO', 'FESTA', 'FIABA', 'FIATO', 'FIBRA', 'FIERO', 'FIORE', 'FISSO', 'FIUME', 'FLORA', 'FORZA', 'FOSCO', 'FRANA', 'FRASE', 'FRENO', 'FRODE', 'FUOCO', 'FURIA', 'GAMBA', 'GARBO', 'GATTO', 'GAZZA', 'GEMMA', 'GENIO', 'GERME', 'GESSO', 'GHIRO', 'GIARA', 'GLOBO', 'GOBBO', 'GOLFO', 'GOMMA', 'GOTTA', 'GRADO', 'GRANA', 'GRIDO', 'GUSTO', 'IDOLO', 'IMAGO', 'IRIDE', 'LAICO', 'LARGO', 'LASER', 'LEGGE', 'LEONE', 'LENTO', 'LEPRE', 'LETTO', 'LIBRO', 'LINFA', 'LIUTO', 'LOTTO', 'LUSSO', 'MAGMA', 'MAGRO', 'MALTO', 'MAPPA', 'MARZO', 'MEDIA', 'MEZZO', 'MIELE', 'MIRTO', 'MOLLE', 'MOLTO', 'MONDO', 'MONTE', 'MORSO', 'MORTO', 'MOSSO', 'MOSTO', 'MUCCA', 'MULTA', 'MUNTO', 'NERVO', 'NETTO', 'NORMA', 'NOTTE', 'NUOVO', 'OPERA', 'ORGIA', 'ORMA', 'ORSO', 'ORZO', 'OVALE', 'OVILE', 'OZONO', 'PALCO', 'PALMO', 'PANDA', 'PANNO', 'PARCO', 'PASTO', 'PAURA', 'PEGNO', 'PENNA', 'PERLA', 'PESCE', 'PIAGA', 'PIANO', 'PIGRO', 'PINNA', 'PIOTA', 'POEMA', 'POMPA', 'PORTA', 'POSTO', 'POVERO', 'POZZA', 'PRATO', 'PRIMA', 'PRIVO', 'PROVA', 'PULCE', 'PULSO', 'PUNTO', 'PUTTO', 'RADIO', 'RATTO', 'REAME', 'REGNO', 'RIBES', 'RICCO', 'RIGHE', 'RIGOR', 'RISSA', 'RITMO', 'RITTO', 'RIUSO', 'ROCCA', 'ROMBO', 'ROSSO', 'ROSTO', 'ROTTO', 'RUOTA', 'RUSSO', 'SACCA', 'SALMO', 'SALSO', 'SALTO', 'SALVO', 'SAMBO', 'SASSO', 'SCAFO', 'SCALO', 'SCEMO', 'SCENA', 'SCOPO', 'SCUDO', 'SERBO', 'SERVO', 'SESTO', 'SIGMA', 'SLAVO', 'SOAVE', 'SOCIO', 'SOGNO', 'SOLCO', 'SOLDO', 'SORDO', 'SORTE', 'SOSTA', 'SPADA', 'SPAGO', 'SPARO', 'SPIGA', 'SPINA', 'SPOSA', 'STAME', 'STATO', 'STIRO', 'SUOLO', 'SUONO', 'SUPER', 'TALCO', 'TANGO', 'TANTO', 'TARDO', 'TARMA', 'TARSO', 'TASSO', 'TAZZA', 'TEMPO', 'TENUE', 'TERSO', 'TESTA', 'TIGRE', 'TINTO', 'TITOLO', 'TONDO', 'TOPPO', 'TORDO', 'TORTO', 'TORVO', 'TROTA', 'TRUCE', 'TURNO', 'TUTTO', 'ULTRA', 'UMIDO', 'URLO', 'USURA', 'UTERI', 'UTILE', 'VANTO', 'VASTO', 'VELLO', 'VENTO', 'VERDE', 'VERGA', 'VERSO', 'VESTE', 'VETRO', 'VETTA', 'VIETO', 'VIGNA', 'VILLA', 'VIOLA', 'VISTA', 'VIVACE', 'VOLPE', 'VOLTO', 'VUOTO', 'ZANNA', 'ZECCA', 'ZINCO', 'ZITTO', 'ZUCCA'];
DICTIONARY[6].answerList = ['ALBERO', 'ALCOVA', 'ALPINO', 'ALTARE', 'AMBITO', 'ANGOLO', 'ANNODO', 'ANSARE', 'ANTRO', 'ARDORE', 'ARGINE', 'ARIOSO', 'ARRIVO', 'ASFALTO', 'ASPIDE', 'ATTORE', 'AUTORE', 'AVORIO', 'BACINO', 'BALCONE', 'BANDIERA', 'BARONE', 'BIANCHI', 'BIANCO', 'BILICO', 'BIRBONE', 'BORBORE', 'BORGATE', 'BRACCIO', 'BRANDO', 'BRONZO', 'BRULLO', 'CALCIO', 'CALICE', 'CANALE', 'CANDIDO', 'CAPIRE', 'CARICO', 'CASETTA', 'CASTORO', 'CAVALLO', 'CELESTE', 'CENTRO', 'CHIODO', 'CILIEGIO', 'CINTURA', 'CIPOLLA', 'CIVILE', 'CODICE', 'COLONIA', 'COLORE', 'COMUNE', 'CONFINE', 'COPERTO', 'COPPOLA', 'CORONA', 'CORRERE', 'CORSIA', 'CORTEO', 'CORVO', 'CREDERE', 'CROLLO', 'CULMINE', 'DANZARE', 'DEBOLE', 'DENARO', 'DENTRO', 'DEVOTO', 'DIFESA', 'DIMORA', 'DISCESA', 'DIVANO', 'DOLORE', 'DOMANI', 'DOMIRE', 'DORATA', 'DORATE', 'DORARE', 'DOVERE', 'DRAMMA', 'DUBBIO', 'EGOISMO', 'ELEGANTE', 'ELMETTO', 'EMIRATO', 'ENORME', 'ERARIO', 'ERESIA', 'ESTATE', 'ESTESO', 'FACCIA', 'FALCONE', 'FANTASIA', 'FASCINO', 'FAVORE', 'FEDERA', 'FERITA', 'FERMATA', 'FIAMMA', 'FIEREZZA', 'FIGURA', 'FINALE', 'FINIRE', 'FINZIONE', 'FIORIRE', 'FISICA', 'FOGLIA', 'FONDARE', 'FONDALE', 'FORESTA', 'FORMOSA', 'FRAGOLA', 'FREDDO', 'FRESCO', 'FRONTE', 'FRUTTO', 'FUGACE', 'FURORE', 'FUTURO', 'GALERA', 'GALLINA', 'GATTINO', 'GELATO', 'GENERE', 'GETTARE', 'GIALLO', 'GIORNO', 'GIUSTO', 'GLORIA', 'GOTICO', 'GRACIA', 'GRAZIA', 'GRIGIO', 'GROTTA', 'GUERRA', 'GUIZZO', 'IGNOTO', 'ILLUSIONE', 'IMPERO', 'INCANTO', 'INTERO', 'INTESA', 'INVIARE', 'INVITO', 'ISOLA', 'LAVORO', 'LEGGERO', 'LEVANTE', 'LIBRO', 'LIMITE', 'LINGUA', 'LOGICA', 'LONTANO', 'LUCENTE', 'LUNARE', 'LUSSUOSO', 'MACCHIA', 'MAGNIFICO', 'MANICO', 'MANIERO', 'MANNARO', 'MARMOTTA', 'MATITA', 'MATTINO', 'MEDUSA', 'MEMORIA', 'MERITO', 'METAFORA', 'MIDOLLO', 'MILITARE', 'MINIERA', 'MIRAGGIO', 'MISTERO', 'MODELLO', 'MORALE', 'MORIRE', 'MORMORIO', 'MOTIVO', 'MUSICA', 'NATURA', 'NEBBIA', 'NEMICO', 'NESSUNO', 'NOBILE', 'NOTTURNO', 'NOVANTA', 'NUMERO', 'NUTRIA', 'OCCHIO', 'OFFERTA', 'OLIMPICO', 'OMBRA', 'ONESTO', 'OPZIONE', 'ORDINE', 'ORGANO', 'ORIZZONTE', 'ORNARE', 'OVUNQUE', 'OZIOSO', 'PALAZZO', 'PALCOSCENICO', 'PALESTRA', 'PANTERA', 'PAROLA', 'PARROCO', 'PASSATO', 'PASTORE', 'PATRIOTA', 'PECORE', 'PENSARE', 'PERCHE', 'PERIODO', 'PERISCOPIO', 'PERTANTO', 'PICCOLO', 'PIOGGIA', 'PISTOLA', 'PITTORE', 'PIAZZA', 'POESIA', 'POLENTA', 'POLLICE', 'POMPIERE', 'POPOLO', 'PORTARE', 'POTERE', 'POVERO', 'PREMURA', 'PRIMATO', 'PROBLEMA', 'PRODURRE', 'PROFONDO', 'PROMESSA', 'PROTETTO', 'PULITO', 'QUADRO', 'RAGIONE', 'RECITARE', 'REGOLA', 'RELAZIONE', 'RESPIRO', 'RIBELLE', 'RICERCA', 'RICORDO', 'RIDOTTO', 'RIFUGIO', 'RINCULO', 'RISCHIO', 'RITORNO', 'RIVISTA', 'ROMANZO', 'RONDINE', 'ROSETO', 'ROTONDO', 'ROVERE', 'RUMORE', 'SABBIA', 'SAGGIO', 'SALOTTO', 'SALVARE', 'SANIAMO', 'SAPERNE', 'SAREMO', 'SAVANA', 'SBOCCO', 'SCADERE', 'SCALATA', 'SCALONE', 'SCARPA', 'SCELTA', 'SCENA', 'SCHERMO', 'SCIAME', 'SCIPPO', 'SCOGNIO', 'SCOLARO', 'SCONFORTO', 'SCUOLA', 'SEDERE', 'SELVATICO', 'SENTIERO', 'SERENO', 'SERPENTE', 'SIEPE', 'SINFONIA', 'SINUOSO', 'SIRENA', 'SISTEMA', 'SOFFITTO', 'SOGNARE', 'SOLDATO', 'SORRISO', 'SOSPIRO', 'SOSTARE', 'SOTTILE', 'SPAVENTO', 'SPECHIO', 'SPETTRO', 'SPIAGGIA', 'SPIRALE', 'SPLENDORE', 'SPRECARE', 'SQUALORA', 'STADIO', 'STAGIONE', 'STAMANE', 'STATUA', 'STRADE', 'STRADA', 'STRETTO', 'STUPORE', 'SUBLIME', 'SUONARE', 'TAGLIENTE', 'TALENTO', 'TAPPETO', 'TARTARO', 'TAVERNA', 'TEATRO', 'TEMERE', 'TERRENO', 'TESORO', 'TIGLIO', 'TINGERE', 'TITUBARE', 'TORNARE', 'TOSCANO', 'TRAMONTO', 'TRATTARE', 'TRISTEZZA', 'TRONO', 'TURBINE', 'ULTIMO', 'UMILTÀ', 'UNIONE', 'URAGANO', 'USANZA', 'VALENTE', 'VALERE', 'VAPORE', 'VARCARE', 'VELOCE', 'VENDERE', 'VENTURA', 'VERACE', 'VERDURE', 'VERITÀ', 'VETRINA', 'VIAGGIO', 'VIGILIA', 'VILLANO', 'VINCERE', 'VISIONE', 'VIVERE', 'VOLARE', 'VOLERE', 'VORTICE', 'VULCANO', 'ZAMPONA', 'ZENZERO', 'ZOTICO'];
DICTIONARY[7].answerList = ['ABITARE', 'ACCORTO', 'AFFETTO', 'AGITARE', 'ALBERGO', 'ALLEGRO', 'ALTEZZA', 'AMOROSO', 'ANDIAMO', 'ANGOSCIA', 'ANNODARE', 'ANTENATO', 'APPETITO', 'ARDENTE', 'ARMONIA', 'ARRIVARE', 'ARTISTA', 'ASCOLTO', 'ASPETTO', 'ASSURDO', 'ATTACCO', 'ATTENTO', 'AUGURARE', 'AVANZARE', 'AVVENTO', 'BALDANZA', 'BAMBINO', 'BASTONE', 'BATTAGLIA', 'BELLEZZA', 'BERSAGLIO', 'BOSCOSO', 'BRILLARE', 'BRUCIARE', 'CADENZA', 'CAMMINO', 'CANDORE', 'CANTARE', 'CAPRICCIO', 'CARDINE', 'CAUSARE', 'CAVERNA', 'CELEBRE', 'CERCATO', 'CHIMERA', 'CHIUNQUE', 'CITARE', 'CODARDO', 'COINCIDERE', 'COLLINA', 'COLMARE', 'COLONNA', 'COMMEDIA', 'COMPITO', 'COMUNITA', 'CONFUSO', 'CONIFERE', 'CONSIGLIO', 'CONTARE', 'CONVITO', 'CORRENTE', 'COSTANTE', 'CREDENZA', 'CREMISI', 'CRESCERE', 'CRIMINE', 'CULTURE', 'CURIOSA', 'DAVVERO', 'DECADERE', 'DECISIVO', 'DEDURRE', 'DELICATO', 'DEMONIO', 'DESOLATO', 'DESTINO', 'DETTARE', 'DIFENDERE', 'DILETTARE', 'DIMENTICARE', 'DISCORSO', 'DOLCEZZA', 'DOMINARE', 'DOVUNQUE', 'DUREVOLE', 'EGEMONIA', 'ELABORARE', 'ELEGANZA', 'EMIGRARE', 'ENERGIA', 'EPPURE', 'ERRANTE', 'ESALTARE', 'ESEMPIO', 'ESPERTO', 'ESSENZA', 'ETERNITA', 'EVITARE', 'FABBRICA', 'FACENDO', 'FALLIRE', 'FANDONIA', 'FANTARCA', 'FASCINARE', 'FATTORIA', 'FAVORIRE', 'FELICITÀ', 'FESTIVO', 'FIDARSI', 'FIDUCIA', 'FISSARE', 'FLUTTUARE', 'FONDAMENTO', 'FORMARE', 'FORNIRE', 'FORTEZZA', 'FRACASSO', 'FRAGILE', 'FRENETICO', 'GALOPPO', 'GARBATO', 'GENEROSO', 'GESTIRE', 'GIOVANE', 'GIRARE', 'GIUDIZIO', 'GLORIOSO', 'GODERE', 'GONDOLA', 'GRANDIOSO', 'GRATUITO', 'GRAVITA', 'GROTTESCO', 'GUARDARE', 'GUIDARE', 'IBERICO', 'IGNOBILE', 'ILLIMITATO', 'IMMOBILE', 'IMPATTO', 'IMPORRE', 'INCANTO', 'INCERTO', 'INCONTRARE', 'INFANZIA', 'INGRESSO', 'INNOCENTE', 'INSIEME', 'INTANTO', 'INTENZIONE', 'INVERNO', 'IRREGOLARE', 'ISPIRATO', 'ISTANTE', 'LAMPANTE', 'LAVORARE', 'LEGGENDA', 'LENIENTE', 'LENTAMENTE', 'LEVATA', 'LINEARE', 'LOTTARE', 'LUMINOSO', 'MALINONIA', 'MANCANZA', 'MANIERO', 'MANTENERE', 'MARCIARE', 'MASCHERA', 'MASSIMO', 'MATTINO', 'MEDITARE', 'MENZIONE', 'MERAVIGLIA', 'MILITIA', 'MINACCIA', 'MIRABILE', 'MIRARE', 'MODERNO', 'MOSTARE', 'MOTIVARE', 'MUOVERE', 'NASCERE', 'NATURALE', 'NESSUNO', 'NITRIRE', 'NOCCOLO', 'NORDESTE', 'NORMALE', 'NOTARE', 'NOTIZIA', 'NUVOLARE', 'ODORATO', 'OFFERTO', 'OPERARE', 'OPPOSTO', 'ORDINARE', 'ORIENTARE', 'ORIGINE', 'ORRIBILE', 'OSCURARE', 'OTTENERE', 'OVVIAMENTE', 'OZIOSO', 'PALAZZO', 'PALCOSCENICO', 'PARLARE', 'PARTIRE', 'PASSARE', 'PAUROSO', 'PENSIERO', 'PERCORSO', 'PERDERE', 'PERFEZIONE', 'PERICOLO', 'PIEDINO', 'PIOVERE', 'PITTORE', 'POLIFONIA', 'PORTARE', 'POSSEDERE', 'POTENTE', 'PRATICO', 'PRIMAVERA', 'PROFONDI', 'PROFONDO', 'PROIBIRE', 'PROMESSA', 'PROSPERARE', 'PROTEGGERE', 'PROVARE', 'PUBBLICO', 'RAGIONARE', 'RECENTE', 'RECUPERARE', 'REGALARE', 'RENDERE', 'RESISTERE', 'RESTARE', 'RICEVERE', 'RIDURRE', 'RIFLESSO', 'RIMPIANTO', 'RISALIRE', 'RISPETTO', 'RITENERE', 'RIVELARE', 'ROMANTICO', 'ROSOLARE', 'ROVESCIARE', 'SAGGEZZA', 'SALDARE', 'SAPIENZA', 'SCHIETTO', 'SCIOGLIERE', 'SCOPRIRE', 'SCORRERE', 'SEGUIRE', 'SEGRETO', 'SEMBRARE', 'SENSIBILE', 'SENTIRSI', 'SERENITÀ', 'SILENZIO', 'SINCERO', 'SOGNATORE', 'SOFFRIRE', 'SOLITUDINE', 'SOPRAVVIVERE', 'SORPRESA', 'SOSPETTO', 'SOSTANZA', 'SOVRANO', 'SPECIALE', 'SPERANZA', 'SPLENDIDO', 'SPOSTARE', 'STAGIONE', 'STENDERE', 'STORCERE', 'STRUMENTO', 'STUDIARE', 'STUPIRE', 'SUPERARE', 'SVELARE', 'TALENTO', 'TEMIBILE', 'TENDENZA', 'TERRIBILE', 'TESTIMONE', 'TIMORE', 'TOLLERARE', 'TORNARE', 'TRADIRE', 'TRAMONTO', 'TRASFORMARE', 'TREMARE', 'TROVARE', 'TURBATO', 'UCCIDERE', 'UFFICIO', 'UNIFICARE', 'UNIVERSO', 'URLARE', 'UTOPIA', 'VALORE', 'VARCARE', 'VASTO', 'VELOCITÀ', 'VENDERE', 'VERAMENTE', 'VERDURA', 'VESTIRE', 'VIAGGIO', 'VINCITORE', 'VISIONE', 'VIVERE', 'VOLONTÀ', 'VORTICE', 'VULNERABILE', 'ZABAIONE', 'ZAMPILLO', 'ZAMPONE'];
DICTIONARY[8].answerList = ['ABBAGLIO', 'ABITUDINE', 'ACCAREZZARE', 'ACCETTARE', 'ACQUISIRE', 'ADEGUATO', 'AFFRONTARE', 'AGITARSI', 'AIUTANTE', 'ALLAGARE', 'ALLETTARE', 'ALLINEATO', 'ALTERNARE', 'AMBIENTE', 'AMICIZIA', 'AMMIRARE', 'ANGOLATO', 'ANNUNCIO', 'APPASSIRE', 'APPARIRE', 'APPETITO', 'ARCHIVIO', 'ARMATURA', 'ARRABBIATO', 'ARRICCHIRE', 'ARRIVATO', 'ARROTARE', 'ASSURDO', 'ATTIRARE', 'ATTORCERE', 'ATTRAENTE', 'ATTUALITÀ', 'AUMENTARE', 'AVVENTURA', 'AZIENDALE', 'BAMBINAIA', 'BANDIERA', 'BARRIERA', 'BELLISSIMO', 'BENEFICIO', 'BRIVIDO', 'BRUCIANTE', 'BRUSCAMENTE', 'CALAMARO', 'CALMANTE', 'CALPESTARE', 'CAPOLAVORO', 'CARATTERE', 'CARICARSI', 'CARREGGIATA', 'CASEGGIATO', 'CAVALCARE', 'CELEBRARE', 'CERCHIARE', 'CERTEZZA', 'CHIAREZZA', 'CHIAMARSI', 'CHIUNQUE', 'CITTADINA', 'CLAMOROSO', 'COLLEGATE', 'COMPAGNIA', 'COMPETERE', 'COMPRENDE', 'COMUNICARE', 'CONCLUDERE', 'CONDURRE', 'CONFESSARE', 'CONQUISTA', 'CONSENTIRE', 'CONTINUARE', 'CONTRATTO', 'CORDIALMENTE', 'CORPORALE', 'CORREGGERE', 'CORRISPONDERE', 'COSTRUIRE', 'CREATIVITÀ', 'CRESCENDO', 'CROLLANTE', 'CUSTODIA', 'DAPPERTUTTO', 'DAVANZALE', 'DECISIONE', 'DEDICARSI', 'DELICATAMENTE', 'DELUDERE', 'DESIDERARE', 'DESTARE', 'DIFFERENTE', 'DIMOSTRARE', 'DIRIGENTE', 'DISCUTERE', 'DIVENTARE', 'DOCILMENTE', 'DOMINANTE', 'DRAMMATICO', 'DURAMENTE', 'ECCENTRICO', 'ELEGANZA', 'EMOZIONE', 'ENTUSIASMO', 'ESAGERARE', 'ESALTARSI', 'ESAMINARE', 'ESEGUIRE', 'ESPLORARE', 'ESPERIENZA', 'ESPLODERE', 'FABBRICARE', 'FACOLTOSO', 'FANTASIOSO', 'FANTASMA', 'FASCINO', 'FELICITÀ', 'FERMEZZA', 'FIEREZZA', 'FILETTARE', 'FIORENTE', 'FISSARSI', 'FONDAMENTALE', 'FORTEMENTE', 'FORTUNATO', 'FRENARE', 'GENEROSO', 'GESTIONE', 'GIOVINEZZA', 'GIROVAGO', 'GLORIOSO', 'GORGOLIO', 'GRACIDARE', 'GRADUALE', 'GRANDEZZA', 'GRAZIOSA', 'GUERRIERO', 'IBRIDARE', 'IDEALISTA', 'ILLUDERE', 'ILLUSTRARE', 'IMMAGINARE', 'IMPEGNARE', 'IMPOSTARE', 'INCANTARE', 'INCURANTE', 'INDAGARE', 'INDOSSARE', 'INFLUENTE', 'INNOVATIVO', 'INQUIETO', 'INSEGNARE', 'INTEGRARE', 'INTREPIDO', 'INVENZIONE', 'IRRITANTE', 'ISOLARSI', 'ISTINTIVO', 'LACRIMOSA', 'LAMBIRE', 'LAVORARE', 'LEGGIADRO', 'LIBERARSI', 'LIMITARSI', 'LOTTATORE', 'LUSINGARE', 'MAGNANIMO', 'MALINCONICO', 'MANDORLA', 'MANIFESTO', 'MANOVRA', 'MERITARE', 'MERAVIGLIARE', 'MISTERIOSO', 'MODERATO', 'MODIFICARE', 'MOSTRARE', 'MOTIVAZIONE', 'MUSCOLOSO', 'NASCONDERE', 'NATURALEZZA', 'NAVIGARE', 'NERVOSAMENTE', 'NOBILMENTE', 'NORMATIVO', 'OCCUPARSI', 'OFFENDERE', 'OPERATIVO', 'OPPORTUNO', 'OTTIMISTA', 'PATTUGLIA', 'PENSIEROSO', 'PERCEPIRE', 'PERCORRERE', 'PERDERSI', 'PERFEZIONARE', 'PERSUADERE', 'PIANIFICARE', 'PIANGERE', 'PLASTIQUE', 'POSSIBILE', 'POTESTÀ', 'PRECISARE', 'PREVENIRE', 'PROCEDERE', 'PROFUMATO', 'PROPORZIONARE', 'PROSPERARE', 'PROTEGGERE', 'PROVVIDENZA', 'PULSANTE', 'RAGGIUNGERE', 'RASSICURARE', 'REALIZZARE', 'RECLAMARE', 'REGALARE', 'REGGERE', 'RESISTENTE', 'RISPETTARE', 'RISOLUTO', 'RIUSCIRE', 'ROMANTICA', 'SABBIARE', 'SACRIFICIO', 'SALUTARE', 'SCOMMETTERE', 'SCRITTORE', 'SEGRETO', 'SELVAGGIO', 'SEMPLICITÀ', 'SENSIBILE', 'SERENARE', 'SFRUTTARE', 'SICUREZZA', 'SINFONIA', 'SISTEMARE', 'SODDISFARE', 'SOGNO', 'SOLCO', 'SOLDO', 'SORDO', 'SORTE', 'SOSTA', 'SPADA', 'SPAGO', 'SPARO', 'SPAZO', 'SPECI', 'SPEME', 'SPIGO', 'SPIGA', 'SPINA', 'SPOLA', 'SPOSA', 'STAME', 'STAMPO', 'STANCO', 'STATO', 'STELO', 'STILETTO', 'STIMOLO', 'STIRO', 'STOICO', 'STOLLO', 'STRANO', 'STREGA', 'STRETTO', 'STUFO', 'SUOLO', 'SUONO', 'SUPER', 'SURCO', 'TAGLIO', 'TALCO', 'TANGO', 'TANTO', 'TARDO', 'TARMA', 'TARSO', 'TASSO', 'TAVOLO', 'TAZZA', 'TEMPIO', 'TEMPO', 'TENSO', 'TENUE', 'TERSO', 'TESTA', 'TIGRE', 'TINTO', 'TIRSO', 'TITOLO', 'TOLTA', 'TONDO', 'TOPPO', 'TORDO', 'TORTO', 'TORVO', 'TOSCO', 'TOTANO', 'TRAGO', 'TRINO', 'TRIPLO', 'TRISTE', 'TRONCO', 'TROTA', 'TRUCE', 'TRULLA', 'TUMULO', 'TURNO', 'TUTTO', 'ULTRA', 'UMIDO', 'URANO', 'URLO', 'USURA', 'UTERI', 'UTILE', 'VANTO', 'VAPORE', 'VASTO', 'VELLO', 'VENTO', 'VERDE', 'VERGA', 'VERSO', 'VESTE', 'VETRO', 'VETTA', 'VIETO', 'VIGNA', 'VILLA', 'VIMBO', 'VIOLA', 'VIRUS', 'VISTA', 'VIZIO', 'VOLTO', 'VUOTO', 'ZAINO', 'ZAMPA', 'ZAPPA', 'ZEBRA', 'ZOLFO', 'ZUCCA', 'ZUPPA'];
DICTIONARY[9].answerList = ['ABBONDANTE', 'ABITUDINE', 'ACQUISITO', 'ALLEVIARE', 'AMBIZIOSO', 'AUTENTICO', 'BENESSERE', 'CAPOLAVORO', 'CARATTERE', 'CELEBRARE', 'CONOSCENZA', 'DECIDERE', 'DIVERSO', 'DOMINANTE', 'EMOZIONE', 'EVOLUZIONE', 'FANTASIOSO', 'FERVENTE', 'FIDUCIOSA', 'GIOIOSO', 'GLORIOSO', 'GRANDIOSO', 'GUADAGNARE', 'ILLUMINARE', 'IMPORTANTE', 'INTUITIVO', 'LIBERTÀ', 'MIGLIORARE', 'MOTIVAZIONE', 'NOBILTÀ', 'OFFRIRE', 'PAZIENZA', 'PICCANTE', 'PREZIOSO', 'PROTEGGERE', 'RAGGIUNGERE', 'RAFFORZARE', 'REALIZZARE', 'RINNOVARE', 'RISOLVERE', 'ROMANTICO', 'SIMBOLICO', 'SINERGICO', 'TRIONFARE', 'VALORIZZARE', 'VITALITÀ'];
DICTIONARY[10].answerList = ['ABBONDANZA', 'ALLEGRIA', 'AMPIAMENTE', 'APPREZZARE', 'CAMBIAMENTO', 'CHIAREZZA', 'CONTINUITÀ', 'DEDICARSI', 'EVOLUZIONE', 'IMPEGNATIVO', 'ISPIRAZIONE', 'LENTAMENTE', 'MIGLIORARE', 'MOTIVAZIONE', 'PROSPERARE', 'REALIZZARE', 'TRASPARENZA', 'UNICITÀ'];

// --- CARICAMENTO DIZIONARIO LOCALE (ULTRA VELOCE CON SET E STREAM) ---
console.log("⏳ Caricamento dizionario ottimizzato in corso...");
const seenWords = new Set();

// Inseriamo prima le nostre parole segrete per non duplicarle
for (let i = 4; i <= 10; i++) {
  DICTIONARY[i].answerList.forEach(w => seenWords.add(w));
}

const dictPath = path.join(__dirname, 'dizionario.txt');

if (fs.existsSync(dictPath)) {
  const fileStream = fs.createReadStream(dictPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  rl.on('line', (line) => {
    const cleanWord = line.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const len = cleanWord.length;
    
    if (len >= 4 && len <= 10) {
      if (!seenWords.has(cleanWord)) {
        seenWords.add(cleanWord);
        DICTIONARY[len].guessList.push(cleanWord);
        count++;
      }
    }
  });

  rl.on('close', () => {
    console.log(`✅ Dizionario caricato a razzo! ${count} parole inserite.`);
    avviaServer();
  });
} else {
  console.log("⚠️ ATTENZIONE: File 'dizionario.txt' non trovato! Avvio server solo con parole base.");
  avviaServer();
}

// Funzione isolata per l'avvio del server, richiamata SOLO dopo il caricamento
function avviaServer() {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server in ascolto su 0.0.0.0:${PORT}`);
  });
}

// --- LOGICA SOCKET.IO E LOBBY ---
const lobbies = {};

const handlePlayerLeave = (socketId) => {
  for (const roomCode in lobbies) {
    const room = lobbies[roomCode];
    const playerIndex = room.players.findIndex(p => p.id === socketId);
    
    if (playerIndex !== -1) {
      const wasHost = room.players[playerIndex].isHost;
      const playerName = room.players[playerIndex].name;
      
      room.players.splice(playerIndex, 1); 
      console.log(`🚪 Rimosso giocatore ${playerName} da lobby ${roomCode}`);
      
      if (room.players.length === 0) {
        delete lobbies[roomCode];
        console.log(`🗑️ Lobby ${roomCode} eliminata per mancanza di giocatori.`);
      } else {
        if (wasHost) {
          room.hostId = room.players[0].id;
          room.players[0].isHost = true;
          console.log(`👑 Nuova corona assegnata a ${room.players[0].name}`);
        }
        if (room.settings.mode === 'coop' && room.currentTurn === socketId) {
           room.currentTurn = room.players[0].id;
        }
        io.to(roomCode).emit('lobby_updated', room);
        io.to(roomCode).emit('error_message', { message: `⚠️ ${playerName} ha abbandonato la stanza.` });
      }
      break; 
    }
  }
};

io.on('connection', (socket) => {
  console.log(`🟢 Un utente si è connesso: ${socket.id}`);

  socket.on('create_lobby', (data) => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    lobbies[roomCode] = {
      hostId: socket.id,
      settings: { mode: 'ffa', wordLength: 5 },
      players: [{ id: socket.id, name: data.name, isHost: true }]
    };
    socket.join(roomCode); 
    socket.emit('lobby_created', { roomCode, lobbyData: lobbies[roomCode] });
  });

  socket.on('join_lobby', (data) => {
    const room = lobbies[data.roomCode];
    if (room) {
      if (room.players.length >= 4) {
        socket.emit('error_message', { message: 'La lobby è piena!' });
        return;
      }
      const newPlayer = { id: socket.id, name: data.name, isHost: false };
      room.players.push(newPlayer);
      socket.join(data.roomCode);
      io.to(data.roomCode).emit('lobby_updated', room);
    } else {
      socket.emit('error_message', { message: 'Lobby inesistente o codice errato!' });
    }
  });

  socket.on('update_settings', (data) => {
    const room = lobbies[data.roomCode];
    if (room && room.hostId === socket.id) {
      room.settings = { ...room.settings, ...data.settings };
      io.to(data.roomCode).emit('lobby_updated', room);
    }
  });

  socket.on('leave_lobby', (data) => {
    socket.leave(data.roomCode); 
    handlePlayerLeave(socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Utente disconnesso: ${socket.id}`);
    handlePlayerLeave(socket.id);
  });

  socket.on('start_game', (data) => {
    const room = lobbies[data.roomCode];
    if (room && room.hostId === socket.id) {
      const length = room.settings.wordLength;

      const dict = DICTIONARY[length];
      const answerList = dict.answerList.length > 0 ? dict.answerList : ['CASA', 'PORTA', 'ALBERO'];
      const secretWord = answerList[Math.floor(Math.random() * answerList.length)];
      
      room.targetWord = secretWord; 
      room.currentTurn = room.players[0].id;
      
      const fullWordList = [...answerList, ...dict.guessList];

      io.to(data.roomCode).emit('game_started', { 
        word: secretWord, 
        currentTurn: room.currentTurn,
        dictionary: fullWordList
      });

      console.log(`🎮 Partita iniziata (Lobby ${data.roomCode}). Lunghezza: ${length}. Parola: ${secretWord}`);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.roomCode).emit('opponent_typing', data.currentGuess);
  });

  socket.on('submit_coop_guess', (data) => {
    const room = lobbies[data.roomCode];
    if (room && room.settings.mode === 'coop') {
      const currentIndex = room.players.findIndex(p => p.id === socket.id);
      const nextIndex = (currentIndex + 1) % room.players.length;
      room.currentTurn = room.players[nextIndex].id;

      io.to(data.roomCode).emit('coop_guess_accepted', {
        guesses: data.guesses,
        currentTurn: room.currentTurn
      });
    }
  });

  socket.on('ffa_guess', (data) => {
    if (lobbies[data.roomCode]) {
      socket.to(data.roomCode).emit('opponent_ffa_guess', {
        playerId: socket.id,
        colors: data.colors
      });
    }
  });

  socket.on('player_finished', (data) => {
    io.to(data.roomCode).emit('go_to_results', {
      isWin: data.isWin,
      winnerName: data.playerName,
      winnerId: socket.id,
      attempts: data.attempts
    });
  });

  socket.on('return_to_lobby', (data) => {
    const room = lobbies[data.roomCode];
    if (room && room.hostId === socket.id) {
      io.to(data.roomCode).emit('back_to_lobby');
    }
  });
});