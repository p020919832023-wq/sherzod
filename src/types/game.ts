export interface UserProfile {
  uid: string;
  displayName: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  crystals: number;
  equippedPet: string;
  unlockedAvatars: string[];
  unlockedPets: string[];
  unlockedGear: string[];
  achievements: string[];
  updatedAt: string;
}

export interface GameScore {
  id?: string;
  userId: string;
  playerName: string;
  avatar: string;
  gameMode: 'interceptor' | 'math' | 'trivia' | 'memory';
  score: number;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  cost: number;
  bonus: string;
  color: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  title: string;
  emoji: string;
  description: string;
  cost: number;
  bgGradient: string;
}

export interface GearItem {
  id: string;
  name: string;
  slot: 'weapon' | 'shield' | 'engine' | 'helmet';
  emoji: string;
  description: string;
  cost: number;
  bonus: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  rewardCrystals: number;
}
