import { ItemDef } from './GridEngine';

export const ITEM_CATALOG: Record<string, ItemDef> = {
  // 1x1 Mini Chew
  SNACK_GUMMY_DROP: {
    id: 'SNACK_GUMMY_DROP',
    sku: 'NEON-GUM-01',
    name: 'Sour Star Drops',
    color: '#FF2A85',
    glowColor: 'rgba(255, 42, 133, 0.6)',
    shape: [[0, 0]],
    spriteIndex: 0,
    width: 1,
    height: 1,
  },
  // 1x2 Tall Soda Can
  SODA_CAN_LIME: {
    id: 'SODA_CAN_LIME',
    sku: 'NEON-SODA-02',
    name: 'Cyber Lime Fizz',
    color: '#00FFA3',
    glowColor: 'rgba(0, 255, 163, 0.6)',
    shape: [[0, 0], [1, 0]],
    spriteIndex: 1,
    width: 1,
    height: 2,
  },
  // 1x3 Long Vinyl Roll / Pocky Pack
  RETRO_VINYL_ROLL: {
    id: 'RETRO_VINYL_ROLL',
    sku: 'NEON-VINYL-03',
    name: 'Synthwave Tape Pack',
    color: '#7928CA',
    glowColor: 'rgba(121, 40, 202, 0.6)',
    shape: [[0, 0], [1, 0], [2, 0]],
    spriteIndex: 2,
    width: 1,
    height: 3,
  },
  // 2x2 Bento Box Square
  BENTO_BOX_SPECIAL: {
    id: 'BENTO_BOX_SPECIAL',
    sku: 'NEON-BENTO-04',
    name: 'Midnight Salmon Bento',
    color: '#FF7043',
    glowColor: 'rgba(255, 112, 67, 0.6)',
    shape: [[0, 0], [0, 1], [1, 0], [1, 1]],
    spriteIndex: 3,
    width: 2,
    height: 2,
  },
  // L-Shape Melon Milk Pack
  MILK_CARTON_L: {
    id: 'MILK_CARTON_L',
    sku: 'NEON-MILK-05',
    name: 'Holo-Melon Milk',
    color: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.6)',
    shape: [[0, 0], [1, 0], [2, 0], [2, 1]],
    spriteIndex: 4,
    width: 2,
    height: 3,
  },
  // T-Shape Energy Gel Set
  ENERGY_GEL_T: {
    id: 'ENERGY_GEL_T',
    sku: 'NEON-NRG-06',
    name: 'Overdrive Gel Pack',
    color: '#FFE600',
    glowColor: 'rgba(255, 230, 0, 0.6)',
    shape: [[0, 0], [0, 1], [0, 2], [1, 1]],
    spriteIndex: 5,
    width: 3,
    height: 2,
  },
  // 2x3 Mega Noodle Casserole
  RAMEN_FAMILY_PACK: {
    id: 'RAMEN_FAMILY_PACK',
    sku: 'NEON-RAMEN-07',
    name: 'Neo-Tokyo Pork Ramen',
    color: '#FF0055',
    glowColor: 'rgba(255, 0, 85, 0.6)',
    shape: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
    spriteIndex: 6,
    width: 3,
    height: 2,
  }
};
