/**
 * Fachada de geração de jogos - barrel file.
 * Re-exporta do novo módulo modularizado em src/domain/generate-modules/
 */

export {
  generateGames,
  parseRequest,
  type Game,
  type GameRequest,
  type ProgressCallback,
} from './generate-modules';
