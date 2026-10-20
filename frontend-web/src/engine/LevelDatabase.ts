import { LevelConfig } from '../store/useGameStore';

export const LEVEL_DATABASE: LevelConfig[] = [
  {
    levelNumber: 1,
    rows: 4,
    cols: 4,
    obstacles: [],
    availableItems: [
      'BENTO_BOX_SPECIAL',
      'BENTO_BOX_SPECIAL',
      'SODA_CAN_LIME',
      'SODA_CAN_LIME',
      'SNACK_GUMMY_DROP',
      'SNACK_GUMMY_DROP',
      'SNACK_GUMMY_DROP',
      'SNACK_GUMMY_DROP'
    ],
    targetStars: 1,
    movesAllowed: 12,
    timeLimitSec: 120
  },
  {
    levelNumber: 2,
    rows: 5,
    cols: 4,
    obstacles: [[2, 1], [2, 2]],
    availableItems: [
      'MILK_CARTON_L',
      'MILK_CARTON_L',
      'RETRO_VINYL_ROLL',
      'RETRO_VINYL_ROLL',
      'SODA_CAN_LIME',
      'SODA_CAN_LIME',
      'SNACK_GUMMY_DROP',
      'SNACK_GUMMY_DROP'
    ],
    targetStars: 1,
    movesAllowed: 15,
    timeLimitSec: 100
  },
  {
    levelNumber: 3,
    rows: 6,
    cols: 5,
    obstacles: [[0, 0], [0, 4], [5, 0], [5, 4]],
    availableItems: [
      'RAMEN_FAMILY_PACK',
      'RAMEN_FAMILY_PACK',
      'ENERGY_GEL_T',
      'ENERGY_GEL_T',
      'BENTO_BOX_SPECIAL',
      'MILK_CARTON_L',
      'SODA_CAN_LIME',
      'SNACK_GUMMY_DROP'
    ],
    targetStars: 2,
    movesAllowed: 18,
    timeLimitSec: 90
  }
];
