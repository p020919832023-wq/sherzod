import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserProfile, GameScore } from '../types/game';
import { ACHIEVEMENTS, AVATARS, PETS } from '../data/gameData';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import {
  auth,
  db,
  isFirebaseConfigured,
  loginWithGoogle,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from '../firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface GameContextType {
  profile: UserProfile;
  firebaseUser: User | null;
  isFirebaseAvailable: boolean;
  isLoading: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  addRewards: (xp: number, coins: number, crystals: number, gameMode?: 'interceptor' | 'math' | 'trivia' | 'memory', score?: number) => void;
  equipAvatar: (avatarId: string) => void;
  unlockAvatar: (avatarId: string) => boolean;
  equipPet: (petId: string) => void;
  unlockPet: (petId: string) => boolean;
  unlockGear: (gearId: string) => boolean;
  claimAchievement: (achId: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  leaderboards: Record<string, GameScore[]>;
  fetchLeaderboards: () => Promise<void>;
  recentNotice: string | null;
  clearNotice: () => void;
}

const LOCAL_STORAGE_KEY = 'cosmo_heroes_profile_v1';
const LOCAL_LEADERBOARDS_KEY = 'cosmo_heroes_leaderboard_v1';

const DEFAULT_PROFILE: UserProfile = {
  uid: 'cadet_guest_' + Math.random().toString(36).substring(2, 8),
  displayName: 'Юный Кадет',
  avatar: 'cadet_leo',
  level: 1,
  xp: 0,
  coins: 100,
  crystals: 10,
  equippedPet: 'pet_cat',
  unlockedAvatars: ['cadet_leo', 'cyber_eva'],
  unlockedPets: ['pet_cat'],
  unlockedGear: [],
  achievements: [],
  updatedAt: new Date().toISOString(),
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [leaderboards, setLeaderboards] = useState<Record<string, GameScore[]>>({});
  const [recentNotice, setRecentNotice] = useState<string | null>(null);

  const clearNotice = () => setRecentNotice(null);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  // Sync to local storage whenever profile updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [profile]);

  // Auth observer
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && db) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
          } else {
            // First time login for this user: save their existing progress under their UID
            const newCloudProfile: UserProfile = {
              ...profile,
              uid: user.uid,
              displayName: user.displayName || profile.displayName,
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newCloudProfile);
            setProfile(newCloudProfile);
          }
        } catch (err) {
          console.error('Error fetching cloud profile:', err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save profile to Firestore if user logged in
  const syncToCloud = async (updated: UserProfile) => {
    if (firebaseUser && db) {
      const path = `users/${firebaseUser.uid}`;
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  };

  const login = async () => {
    try {
      sound.playClick();
      const user = await loginWithGoogle();
      if (user) {
        sound.playVictory();
        setRecentNotice(`Приветствуем, ${user.displayName || 'Пилот'}! Прогресс синхронизирован с облаком.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRecentNotice(`Ошибка входа: ${msg}`);
    }
  };

  const logout = async () => {
    try {
      sound.playClick();
      await logoutUser();
      setFirebaseUser(null);
      setRecentNotice('Вы вышли из учетной записи.');
    } catch (err) {
      console.error(err);
    }
  };

  const addRewards = (
    earnedXp: number,
    earnedCoins: number,
    earnedCrystals: number,
    gameMode?: 'interceptor' | 'math' | 'trivia' | 'memory',
    score?: number
  ) => {
    // Companion bonuses
    let multiplierXP = 1.0;
    let multiplierCoins = 1.0;
    if (profile.equippedPet === 'pet_fox') multiplierXP = 1.2;
    if (profile.equippedPet === 'pet_dragon') multiplierCoins = 1.25;

    const finalXp = Math.round(earnedXp * multiplierXP);
    const finalCoins = Math.round(earnedCoins * multiplierCoins);

    setProfile((prev) => {
      let nextXp = prev.xp + finalXp;
      let nextLevel = prev.level;
      const requiredXp = nextLevel * 150;

      let leveledUp = false;
      while (nextXp >= requiredXp && nextLevel < 50) {
        nextXp -= requiredXp;
        nextLevel += 1;
        leveledUp = true;
      }

      if (leveledUp) {
        sound.playVictory();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setRecentNotice(`Ура! Новый ранг: Уровень ${nextLevel}! Получена космическая награда!`);
      } else {
        sound.playCoin();
      }

      // Check "first_flight" achievement
      const newAch = [...prev.achievements];
      if (!newAch.includes('first_flight')) {
        newAch.push('first_flight');
      }
      if (nextLevel >= 5 && !newAch.includes('rank_commander')) {
        newAch.push('rank_commander');
      }

      const updated: UserProfile = {
        ...prev,
        level: nextLevel,
        xp: nextXp,
        coins: prev.coins + finalCoins,
        crystals: prev.crystals + earnedCrystals,
        achievements: newAch,
        updatedAt: new Date().toISOString(),
      };

      syncToCloud(updated);
      return updated;
    });

    if (gameMode && score && score > 0) {
      saveScore(gameMode, score);
    }
  };

  const saveScore = async (gameMode: 'interceptor' | 'math' | 'trivia' | 'memory', score: number) => {
    const newEntry: GameScore = {
      userId: profile.uid,
      playerName: profile.displayName,
      avatar: profile.avatar,
      gameMode,
      score,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore if available
    if (firebaseUser && db) {
      const path = 'scores';
      try {
        await addDoc(collection(db, path), newEntry);
      } catch (e) {
        console.warn('Firestore score write skipped:', e);
      }
    }

    // Save to local storage leaderboards
    try {
      const raw = localStorage.getItem(LOCAL_LEADERBOARDS_KEY);
      const data: Record<string, GameScore[]> = raw ? JSON.parse(raw) : {};
      const currentList = data[gameMode] || [];
      currentList.push(newEntry);
      currentList.sort((a, b) => b.score - a.score);
      data[gameMode] = currentList.slice(0, 15);
      localStorage.setItem(LOCAL_LEADERBOARDS_KEY, JSON.stringify(data));
      setLeaderboards(data);
    } catch (e) {
      console.warn('Leaderboard save error:', e);
    }
  };

  const fetchLeaderboards = async () => {
    // If firestore is available, attempt to query
    if (db) {
      try {
        const scoresRef = collection(db, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'), limit(30));
        const snap = await getDocs(q);
        const grouped: Record<string, GameScore[]> = {};
        snap.forEach((docSnap) => {
          const item = docSnap.data() as GameScore;
          if (!grouped[item.gameMode]) grouped[item.gameMode] = [];
          if (grouped[item.gameMode].length < 10) {
            grouped[item.gameMode].push({ ...item, id: docSnap.id });
          }
        });
        setLeaderboards(grouped);
        return;
      } catch (e) {
        console.info('Using local leaderboards:', e);
      }
    }

    // Fallback to local
    try {
      const raw = localStorage.getItem(LOCAL_LEADERBOARDS_KEY);
      if (raw) {
        setLeaderboards(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const equipAvatar = (avatarId: string) => {
    sound.playClick();
    setProfile((prev) => {
      const updated = { ...prev, avatar: avatarId, updatedAt: new Date().toISOString() };
      syncToCloud(updated);
      return updated;
    });
  };

  const unlockAvatar = (avatarId: string): boolean => {
    const item = AVATARS.find((a) => a.id === avatarId);
    if (!item || profile.coins < item.cost) {
      sound.playWrong();
      setRecentNotice('Не хватает звездных монет для этого героя!');
      return false;
    }
    sound.playVictory();
    confetti({ particleCount: 50, spread: 60 });
    setProfile((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins - item.cost,
        unlockedAvatars: [...prev.unlockedAvatars, avatarId],
        avatar: avatarId,
        updatedAt: new Date().toISOString(),
      };
      syncToCloud(updated);
      return updated;
    });
    setRecentNotice(`Герой "${item.name}" разблокирован!`);
    return true;
  };

  const equipPet = (petId: string) => {
    sound.playClick();
    setProfile((prev) => {
      const updated = { ...prev, equippedPet: petId, updatedAt: new Date().toISOString() };
      syncToCloud(updated);
      return updated;
    });
  };

  const unlockPet = (petId: string): boolean => {
    const pet = PETS.find((p) => p.id === petId);
    if (!pet || profile.coins < pet.cost) {
      sound.playWrong();
      setRecentNotice('Не хватает монет для приручения питомца!');
      return false;
    }
    sound.playVictory();
    confetti({ particleCount: 60, spread: 70 });
    setProfile((prev) => {
      const newAch = [...prev.achievements];
      if (!newAch.includes('pet_collector')) newAch.push('pet_collector');

      const updated = {
        ...prev,
        coins: prev.coins - pet.cost,
        unlockedPets: [...prev.unlockedPets, petId],
        equippedPet: petId,
        achievements: newAch,
        updatedAt: new Date().toISOString(),
      };
      syncToCloud(updated);
      return updated;
    });
    setRecentNotice(`Питомец "${pet.name}" стал твоим верным другом!`);
    return true;
  };

  const unlockGear = (gearId: string): boolean => {
    sound.playVictory();
    setProfile((prev) => {
      const updated = {
        ...prev,
        unlockedGear: [...prev.unlockedGear, gearId],
        updatedAt: new Date().toISOString(),
      };
      syncToCloud(updated);
      return updated;
    });
    return true;
  };

  const claimAchievement = (achId: string) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!ach || !profile.achievements.includes(achId)) return;

    sound.playVictory();
    confetti({ particleCount: 75, spread: 80 });
    setProfile((prev) => {
      const updated = {
        ...prev,
        coins: prev.coins + ach.rewardCoins,
        crystals: prev.crystals + ach.rewardCrystals,
        updatedAt: new Date().toISOString(),
      };
      syncToCloud(updated);
      return updated;
    });
    setRecentNotice(`Награда за достижение "${ach.title}" получена! +${ach.rewardCoins} монет, +${ach.rewardCrystals} кристаллов!`);
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        firebaseUser,
        isFirebaseAvailable: isFirebaseConfigured,
        isLoading,
        soundEnabled,
        toggleSound,
        addRewards,
        equipAvatar,
        unlockAvatar,
        equipPet,
        unlockPet,
        unlockGear,
        claimAchievement,
        login,
        logout,
        leaderboards,
        fetchLeaderboards,
        recentNotice,
        clearNotice,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
