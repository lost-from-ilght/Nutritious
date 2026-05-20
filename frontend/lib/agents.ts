export interface Agent {
  id: string;
  name: string;
  role: 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel';
  avatar: string;
}

export const VALORANT_AGENTS: Agent[] = [
  { id: 'jett', name: 'Jett', role: 'Duelist', avatar: '/agents/jett.png' },
  { id: 'phoenix', name: 'Phoenix', role: 'Duelist', avatar: '/agents/phoenix.png' },
  { id: 'reyna', name: 'Reyna', role: 'Duelist', avatar: '/agents/reyna.png' },
  { id: 'raze', name: 'Raze', role: 'Duelist', avatar: '/agents/raze.png' },
  { id: 'neon', name: 'Neon', role: 'Duelist', avatar: '/agents/neon.png' },
  { id: 'yoru', name: 'Yoru', role: 'Duelist', avatar: '/agents/yoru.png' },
  { id: 'iso', name: 'Iso', role: 'Duelist', avatar: '/agents/iso.png' },
  { id: 'sage', name: 'Sage', role: 'Sentinel', avatar: '/agents/sage.png' },
  { id: 'cypher', name: 'Cypher', role: 'Sentinel', avatar: '/agents/cypher.png' },
  { id: 'killjoy', name: 'Killjoy', role: 'Sentinel', avatar: '/agents/killjoy.png' },
  { id: 'chamber', name: 'Chamber', role: 'Sentinel', avatar: '/agents/chamber.png' },
  { id: 'deadlock', name: 'Deadlock', role: 'Sentinel', avatar: '/agents/deadlock.png' },
  { id: 'omen', name: 'Omen', role: 'Controller', avatar: '/agents/omen.png' },
  { id: 'brimstone', name: 'Brimstone', role: 'Controller', avatar: '/agents/brimstone.png' },
  { id: 'viper', name: 'Viper', role: 'Controller', avatar: '/agents/viper.png' },
  { id: 'astra', name: 'Astra', role: 'Controller', avatar: '/agents/astra.png' },
  { id: 'harbor', name: 'Harbor', role: 'Controller', avatar: '/agents/harbor.png' },
  { id: 'clove', name: 'Clove', role: 'Controller', avatar: '/agents/clove.png' },
  { id: 'sova', name: 'Sova', role: 'Initiator', avatar: '/agents/sova.png' },
  { id: 'breach', name: 'Breach', role: 'Initiator', avatar: '/agents/breach.png' },
  { id: 'skye', name: 'Skye', role: 'Initiator', avatar: '/agents/skye.png' },
  { id: 'kayo', name: 'KAY/O', role: 'Initiator', avatar: '/agents/kayo.png' },
  { id: 'fade', name: 'Fade', role: 'Initiator', avatar: '/agents/fade.png' },
  { id: 'gekko', name: 'Gekko', role: 'Initiator', avatar: '/agents/gekko.png' }
];
