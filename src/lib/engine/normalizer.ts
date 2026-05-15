// ============================================================
// DrywallCalc Pro — Normalizador de Entrada
// Converte AmbienteInput em Geometria normalizada
// ============================================================
import type { AmbienteInput, Geometria, ConfigGlobal } from './types';

export function normalizarGeometria(amb: AmbienteInput, config: ConfigGlobal): Geometria {
  const comp = amb.comprimento || 0;
  const alt = amb.altura || config.peDireito || 3.0;
  const area = amb.area || (comp > 0 && alt > 0 ? comp * alt : 0);
  const perim = amb.perimetro || (comp > 0 && alt > 0 ? 2 * (comp + alt) : 0);
  const arestas = amb.arestas || 0;
  const areaVaos = amb.areaVaos || 0;
  const areaEfetiva = Math.max(0, area - areaVaos);
  const compEfetivo = comp > 0 ? comp : (alt > 0 ? areaEfetiva / alt : Math.sqrt(areaEfetiva));

  // Forro dimensions
  const largForro = compEfetivo > 0 ? areaEfetiva / compEfetivo : Math.sqrt(areaEfetiva);
  const compForro = compEfetivo > 0 ? compEfetivo : Math.sqrt(areaEfetiva);
  const perimForro = perim > 0 ? perim : 2 * (compForro + largForro);

  return { comp: compEfetivo, alt, area, perim, arestas, areaEfetiva, compForro, largForro, perimForro };
}
