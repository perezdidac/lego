export interface CatalanPhrase {
  id: string;
  text: string;
  spokenText?: string; // Phonetic or optimized for TTS
  category: 'color' | 'direction' | 'train' | 'praise' | 'mission' | 'ui';
}

export const CATALAN_COLORS: Record<string, { name: string; hex: string; phrase: string; description: string }> = {
  vermell: {
    name: 'Vermell',
    hex: '#D11A2A',
    phrase: 'Bloc vermell!',
    description: 'Com una maduixa madura!'
  },
  blau: {
    name: 'Blau',
    hex: '#0055BF',
    phrase: 'Bloc blau!',
    description: 'Com el mar i el cel!'
  },
  groc: {
    name: 'Groc',
    hex: '#FAC80A',
    phrase: 'Bloc groc!',
    description: 'Com el sol que brilla!'
  },
  verd: {
    name: 'Verd',
    hex: '#237841',
    phrase: 'Bloc verd!',
    description: 'Com els arbres del bosc!'
  },
  blanc: {
    name: 'Blanc',
    hex: '#F4F4F4',
    phrase: 'Bloc blanc!',
    description: 'Com un núvol esponjós!'
  },
  negre: {
    name: 'Negre',
    hex: '#1B1B1B',
    phrase: 'Bloc negre!',
    description: 'Com el carbó de la locomotora!'
  },
  gris: {
    name: 'Gris',
    hex: '#8A9299',
    phrase: 'Bloc gris!',
    description: 'Com les pedres del camí!'
  },
  taronja: {
    name: 'Taronja',
    hex: '#FF7E14',
    phrase: 'Bloc taronja!',
    description: 'Com una mandarina dolça!'
  },
  lila: {
    name: 'Lila',
    hex: '#8E44AD',
    phrase: 'Bloc lila!',
    description: 'Com una flor silvestre!'
  }
};

export const CATALAN_SPATIAL: Record<string, { name: string; phrase: string }> = {
  a_sobre: { name: 'A sobre', phrase: 'Molt bé, posat a sobre!' },
  a_sota: { name: 'A sota', phrase: 'A sota del bloc!' },
  al_costat: { name: 'Al costat', phrase: 'Just al costat!' },
  endavant: { name: 'Endavant', phrase: 'Endavant, maquinista! Xiu-xiu!' },
  enrere: { name: 'Enrere', phrase: 'Marxa enrere amb compte!' },
  atura: { name: 'Atura', phrase: 'Fre de mà! El tren s\'ha aturat!' }
};

export const CATALAN_TRAIN_PARTS: Record<string, { name: string; phrase: string; icon: string }> = {
  xiulet: { name: 'Xiulet', phrase: 'TUUUT TUUUT! El xiulet de vapor!', icon: '🎺' },
  xemeneia: { name: 'Xemeneia', phrase: 'Mira el fum blanc que surt de la xemeneia!', icon: '💨' },
  rodes: { name: 'Rodes', phrase: 'Les grans rodes de ferro giren xip-xap!', icon: '⚙️' },
  lleva_obstacles: { name: 'Lleva-obstacles', phrase: 'El lleva-obstacles neteja les vies!', icon: '🛡️' },
  caldera: { name: 'Caldera de vapor', phrase: 'L\'aigua bull i fa moure els pistons!', icon: '🔥' },
  vies: { name: 'Vies de tren', phrase: 'Les vies uneixen pobles i muntanyes!', icon: '🛤️' },
  pont: { name: 'Pont sobre el riu', phrase: 'Un pont sòlid i fort per creuar el riu!', icon: '🌉' }
};

export const CATALAN_PRAISES = [
  'Molt bé!',
  'Fantàstic!',
  'Ets un gran maquinista!',
  'Bravo! Quina bona feina!',
  'Increïble! Ho has aconseguit!',
  'Visca! El tren està molt content!'
];

export const CATALAN_MISSIONS = {
  mission1: {
    id: 'bridge_repair',
    title: 'Missió 1: Repara el Pont',
    subtitle: 'Ajuda l\'Antoni a connectar les vies!',
    badge: '🌉',
    introPrompt: 'El tren no pot passar! Falten tres blocs grocs per acabar el pont. Pots posar-los?',
    step1Prompt: 'Molt bé! Un bloc groc col·locat. En falten dos!',
    step2Prompt: 'Genial! Ja en portes dos, només en falta un!',
    completedPrompt: 'Bravo! Has acabat el pont! Ara les vies estan unides i el tren pot creuar el riu!',
    targetColor: 'groc',
    requiredCount: 3
  },
  mission2: {
    id: 'whistle_and_drive',
    title: 'Missió 2: Fes xiular el tren!',
    subtitle: 'Fes sonar el xiulet i creua el pont!',
    badge: '🚂',
    introPrompt: 'Digues "Xiulet" o prem el cordill per avisar els passatgers!',
    whistleDonePrompt: 'TUUUUT! Quin xiulet més potent! Ara digues "Endavant" o empeny la palanca per començar el viatge!',
    drivingPrompt: 'Xiu-xiu! Mireu com corre el tren de vapor per damunt del pont nou!',
    completedPrompt: 'Fantàstic! Has creuat el pont amb èxit! Ets un maquinista de primera!',
    targetActions: ['whistle', 'drive']
  },
  mission3: {
    id: 'flower_station',
    title: 'Missió 3: L\'Estació Florida',
    subtitle: 'Decora l\'estació amb flors i arbres!',
    badge: '🌸',
    introPrompt: 'Hem arribat a l\'Estació del Bosc! Posa dues flors i un arbre per fer-la ben alegre!',
    completedPrompt: 'Quina estació més bonica! Tots els viatgers baixen contents a respirar la primavera!',
    targetItems: ['flor', 'flor', 'arbre']
  },
  mission4: {
    id: 'cozy_cottage',
    title: 'Missió 4: La Caseta del Maquinista',
    subtitle: 'Posa una porta, finestra i teulada!',
    badge: '🏠',
    introPrompt: 'L\'Antoni vol construir una caseta! Tria la pestanya "Casa" i posa una porta, una finestra i una teulada.',
    doorDonePrompt: 'Molt bé! Una porta de fusta amb pom daurat!',
    windowDonePrompt: 'Quina finestra més lluminosa!',
    roofDonePrompt: 'La teulada està posada!',
    completedPrompt: 'Fantàstic! Quina caseta tan acollidora! L\'Antoni hi podrà descansar!',
    targetItems: ['porta', 'finestra', 'teulada']
  },
  mission5: {
    id: 'lay_tracks',
    title: 'Missió 5: Construeix Vies de Tren',
    subtitle: 'Col·loca tres vies Lego City per fer un circuit nou!',
    badge: '🛤️',
    introPrompt: 'Ampliïm la via del tren! Tria la pestanya "Vies" i col·loca tres trossos de via Lego City a terra.',
    step1Prompt: 'Molt bé! Una via col·locada!',
    step2Prompt: 'Dues vies a terra! En falta una!',
    completedPrompt: 'Bravo! Has creat un circuit de vies nou! Ara el tren pot circular per les teves vies!',
    requiredCount: 3
  },
  mission6: {
    id: 'town_festival',
    title: 'Missió 6: Benvinguts Viatgers!',
    subtitle: 'Posa dos passatgers i un fanal a l\'estació!',
    badge: '🧑',
    introPrompt: 'L\'estació s\'omple de vida! Tria "Natura" per posar dos passatgers minifigura i "Casa" per posar un fanal de llum.',
    passengerPrompt: 'Hola viatger! Benvingut al tren de joguina!',
    lampPrompt: 'El fanal il·lumina l\'andana de l\'estació!',
    completedPrompt: 'Visca! Quina gran festa a l\'estació! Tots els passatgers estan a punt per viatjar!',
    requiredPassengers: 2,
    requiredLamps: 1
  },
  mission7: {
    id: 'farm_animals',
    title: 'Missió 7: Els Animals de Granja',
    subtitle: 'Posa una vaca, una ovella i un ànec!',
    badge: '🐄',
    introPrompt: 'Visitem els animals de la granja! Tria "Natura" i posa una vaca, una ovelleta i un ànec!',
    cowDonePrompt: 'Muuuu! La vaca de la granja diu hola!',
    sheepDonePrompt: 'Beeee! Quina ovelleta de llana tan suau!',
    duckDonePrompt: 'Quac-quac! L\'ànec neda content pel riu!',
    completedPrompt: 'Visca la granja! Tots els animals estan feliços al costat de les vies del tren!',
    targetItems: ['vaca', 'ovella', 'anec']
  }
};

export const VOICE_COMMANDS = {
  whistle: ['xiulet', 'xiula', 'tuut', 'xiular', 'pito', 'sonar'],
  forward: ['endavant', 'avançar', 'arrenca', 'corre', 'marxa', 'va', 'go'],
  stop: ['para', 'atura', 'frena', 'stop', 'aturat', 'prou'],
  reverse: ['enrere', 'marxa enrere', 'recua', 'recular'],
  colors: {
    groc: ['groc', 'groga', 'yellow'],
    vermell: ['vermell', 'vermella', 'red'],
    blau: ['blau', 'blava', 'blue'],
    verd: ['verd', 'verda', 'green'],
    blanc: ['blanc', 'blanca', 'white'],
    negre: ['negre', 'negra', 'black']
  }
};
