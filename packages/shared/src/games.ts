/**
 * Canonical catalogue of games ForgeLink can support.
 *
 * A game being listed here does NOT mean an adapter is implemented for it — it
 * only reserves a stable identifier so that projects, manifests and the adapter
 * registry all speak the same language. Implemented adapters register themselves
 * against one of these ids in `@forgelink/adapters`.
 */
export const GAME_IDS = [
  'seven-days-to-die',
  'minecraft',
  'project-zomboid',
  'ark',
  'rust',
  'valheim',
  'palworld',
  'terraria',
  'sons-of-the-forest',
] as const;

export type GameId = (typeof GAME_IDS)[number];

/** Human-readable metadata for a game, independent of any adapter implementation. */
export interface GameCatalogEntry {
  id: GameId;
  /** Display name shown in the Builder UI. */
  name: string;
  /** Short marketing/description line. */
  tagline: string;
  /** Whether a working adapter currently ships for this game. */
  implemented: boolean;
}

export const GAME_CATALOG: Record<GameId, GameCatalogEntry> = {
  'seven-days-to-die': {
    id: 'seven-days-to-die',
    name: '7 Days To Die',
    tagline: 'Survival horde crafting. The first fully supported game.',
    implemented: true,
  },
  minecraft: {
    id: 'minecraft',
    name: 'Minecraft',
    tagline: 'Block sandbox. Reference adapter included.',
    implemented: true,
  },
  'project-zomboid': {
    id: 'project-zomboid',
    name: 'Project Zomboid',
    tagline: 'Isometric zombie survival. Adapter planned.',
    implemented: false,
  },
  ark: {
    id: 'ark',
    name: 'ARK: Survival',
    tagline: 'Dinosaur survival. Adapter planned.',
    implemented: false,
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    tagline: 'Hardcore survival PvP. Adapter planned.',
    implemented: false,
  },
  valheim: {
    id: 'valheim',
    name: 'Valheim',
    tagline: 'Viking co-op survival. Adapter planned.',
    implemented: false,
  },
  palworld: {
    id: 'palworld',
    name: 'Palworld',
    tagline: 'Creature-collecting survival. Adapter planned.',
    implemented: false,
  },
  terraria: {
    id: 'terraria',
    name: 'Terraria',
    tagline: '2D sandbox adventure. Adapter planned.',
    implemented: false,
  },
  'sons-of-the-forest': {
    id: 'sons-of-the-forest',
    name: 'Sons of the Forest',
    tagline: 'Cannibal-island survival. Adapter planned.',
    implemented: false,
  },
};

export function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && (GAME_IDS as readonly string[]).includes(value);
}
