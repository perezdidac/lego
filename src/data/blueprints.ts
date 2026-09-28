import type { BrickShape } from '../engine/BrickFactory';

export interface BlueprintItem {
  shape: BrickShape;
  colorHex: string;
  gridX: number;
  gridY: number; // layer
  gridZ: number;
  rotationY: number;
}

export interface BlueprintDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  bricks: BlueprintItem[];
}

export const BLUEPRINTS: BlueprintDefinition[] = [
  {
    id: 'village_farm',
    title: '🏡 Poble Català i Granja',
    description: 'Caseta amb xemeneia i fum, tanca amb vaca i ovella, ànecs al riu, fanal i la Senyera!',
    icon: '🏡',
    bricks: [
      // 1. Caseta del poble (x = -8, z = -8)
      // Base walls
      { shape: '2x4', colorHex: '#FAC80A', gridX: -8, gridY: 0, gridZ: -10, rotationY: 0 },
      { shape: '2x4', colorHex: '#FAC80A', gridX: -8, gridY: 0, gridZ: -6, rotationY: 0 },
      { shape: 'porta', colorHex: '#D11A2A', gridX: -8, gridY: 0, gridZ: -5, rotationY: 0 },
      { shape: 'finestra', colorHex: '#0055BF', gridX: -11, gridY: 0, gridZ: -8, rotationY: Math.PI / 2 },
      { shape: '2x4', colorHex: '#FAC80A', gridX: -5, gridY: 0, gridZ: -8, rotationY: Math.PI / 2 },
      // Second floor walls
      { shape: '2x4', colorHex: '#FAC80A', gridX: -8, gridY: 1, gridZ: -10, rotationY: 0 },
      { shape: '2x4', colorHex: '#FAC80A', gridX: -8, gridY: 1, gridZ: -6, rotationY: 0 },
      // Red Roof
      { shape: 'slope2x4', colorHex: '#D11A2A', gridX: -8, gridY: 2, gridZ: -8, rotationY: 0 },
      { shape: 'xemeneia', colorHex: '#8D6E63', gridX: -6, gridY: 2, gridZ: -9, rotationY: 0 },

      // 2. Granja amb animals
      // Wooden fences around farm meadow
      { shape: 'tanca', colorHex: '#F4F4F4', gridX: 6, gridY: 0, gridZ: -12, rotationY: 0 },
      { shape: 'tanca', colorHex: '#F4F4F4', gridX: 10, gridY: 0, gridZ: -12, rotationY: 0 },
      { shape: 'tanca', colorHex: '#F4F4F4', gridX: 12, gridY: 0, gridZ: -10, rotationY: Math.PI / 2 },
      { shape: 'tanca', colorHex: '#F4F4F4', gridX: 12, gridY: 0, gridZ: -6, rotationY: Math.PI / 2 },
      { shape: 'tanca', colorHex: '#F4F4F4', gridX: 6, gridY: 0, gridZ: -4, rotationY: 0 },
      { shape: 'tanca', colorHex: '#F4F4F4', gridX: 10, gridY: 0, gridZ: -4, rotationY: 0 },

      // Animals inside meadow
      { shape: 'vaca', colorHex: '#F4F4F4', gridX: 8, gridY: 0, gridZ: -8, rotationY: 0 },
      { shape: 'ovella', colorHex: '#F4F4F4', gridX: 10, gridY: 0, gridZ: -6, rotationY: -Math.PI / 3 },
      { shape: 'tree_apple', colorHex: '#237841', gridX: 16, gridY: 0, gridZ: -8, rotationY: 0 },
      { shape: 'tree_pine', colorHex: '#2E7D32', gridX: 16, gridY: 0, gridZ: -2, rotationY: 0 },

      // Flowers around garden
      { shape: 'flower', colorHex: '#D11A2A', gridX: 4, gridY: 0, gridZ: -4, rotationY: 0 },
      { shape: 'flower', colorHex: '#FAC80A', gridX: 4, gridY: 0, gridZ: -6, rotationY: 0 },
      { shape: 'flower', colorHex: '#F472B6', gridX: 4, gridY: 0, gridZ: -8, rotationY: 0 },

      // 3. Ducks in the river canal (Z = 15)
      { shape: 'anec', colorHex: '#FAC80A', gridX: -8, gridY: 0, gridZ: 15, rotationY: Math.PI / 4 },
      { shape: 'anec', colorHex: '#FAC80A', gridX: 8, gridY: 0, gridZ: 15, rotationY: -Math.PI / 3 },

      // 4. Plaça de la Vila & Station
      { shape: 'senyera', colorHex: '#FAC80A', gridX: 0, gridY: 0, gridZ: -2, rotationY: 0 },
      { shape: 'rellotge', colorHex: '#1B1B1B', gridX: -4, gridY: 0, gridZ: 2, rotationY: 0 },
      { shape: 'banc', colorHex: '#8D6E63', gridX: -4, gridY: 0, gridZ: 5, rotationY: Math.PI / 2 },
      { shape: 'fanal', colorHex: '#1B1B1B', gridX: -2, gridY: 0, gridZ: 2, rotationY: 0 },
      { shape: 'hidrant', colorHex: '#D11A2A', gridX: -2, gridY: 0, gridZ: 6, rotationY: 0 },
      { shape: 'minifigure', colorHex: '#0055BF', gridX: -3, gridY: 0, gridZ: 4, rotationY: 0 },
      { shape: 'caixa', colorHex: '#8D6E63', gridX: 2, gridY: 0, gridZ: 4, rotationY: 0 },
      { shape: 'barril', colorHex: '#8D6E63', gridX: 2, gridY: 0, gridZ: 6, rotationY: 0 }
    ]
  },
  {
    id: 'railway_circuit',
    title: '🛤️ Circuit de Tren Lego City',
    description: 'Vies connectades, andana d\'estació, creuament, senyals de pas a nivell i topall de via!',
    icon: '🛤️',
    bricks: [
      // Station along x = -6, z = 0
      { shape: 'track_station', colorHex: '#8A9299', gridX: -6, gridY: 0, gridZ: 0, rotationY: 0 },
      { shape: 'track_straight', colorHex: '#475569', gridX: -6, gridY: 0, gridZ: 4, rotationY: 0 },
      { shape: 'track_curve_right', colorHex: '#475569', gridX: -4, gridY: 0, gridZ: 8, rotationY: Math.PI / 2 },
      { shape: 'track_straight', colorHex: '#475569', gridX: 0, gridY: 0, gridZ: 10, rotationY: Math.PI / 2 },
      { shape: 'track_curve_right', colorHex: '#475569', gridX: 4, gridY: 0, gridZ: 8, rotationY: Math.PI },
      { shape: 'track_straight_long', colorHex: '#475569', gridX: 6, gridY: 0, gridZ: 2, rotationY: 0 },
      { shape: 'track_straight', colorHex: '#475569', gridX: 6, gridY: 0, gridZ: -4, rotationY: 0 },
      { shape: 'track_curve_right', colorHex: '#475569', gridX: 4, gridY: 0, gridZ: -8, rotationY: (3 * Math.PI) / 2 },
      { shape: 'track_straight', colorHex: '#475569', gridX: 0, gridY: 0, gridZ: -10, rotationY: Math.PI / 2 },
      { shape: 'track_curve_right', colorHex: '#475569', gridX: -4, gridY: 0, gridZ: -8, rotationY: 0 },
      { shape: 'track_straight', colorHex: '#475569', gridX: -6, gridY: 0, gridZ: -4, rotationY: 0 },

      // Siding with buffer
      { shape: 'track_buffer', colorHex: '#475569', gridX: 6, gridY: 0, gridZ: 14, rotationY: 0 },

      // Crossing sign & benches & lights
      { shape: 'senyal_tren', colorHex: '#F4F4F4', gridX: 2, gridY: 0, gridZ: 8, rotationY: 0 },
      { shape: 'senyal_tren', colorHex: '#F4F4F4', gridX: -2, gridY: 0, gridZ: 8, rotationY: 0 },
      { shape: 'fanal', colorHex: '#1B1B1B', gridX: -8, gridY: 0, gridZ: 0, rotationY: 0 },
      { shape: 'banc', colorHex: '#8D6E63', gridX: -8, gridY: 0, gridZ: 2, rotationY: Math.PI / 2 },
      { shape: 'rellotge', colorHex: '#1B1B1B', gridX: -8, gridY: 0, gridZ: -2, rotationY: 0 }
    ]
  }
];
