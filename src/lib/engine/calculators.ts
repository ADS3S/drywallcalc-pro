// ============================================================
// DrywallCalc Pro — Calculadores por Tipo
// Cada tipo_calculo tem sua própria função de cálculo
// ============================================================
import type { Geometria, TipoCalculo, TamanhoChapa } from './types';
import { TAMANHO_CHAPA_MAP, CHAPA_CODIGO_MAP } from './types';

// ── Interface do contexto de cálculo ──
export interface CalcContext {
  geometria: Geometria;
  // Opções do ambiente
  tipoChapa: string;
  tamanhoChapa: TamanhoChapa;
  modulacaoMM: number;          // modulação de montantes
  modF530MM: number;            // modulação de forro
  camadaDupla: boolean;
  isolamento: boolean;
  isolamentoTipo: string;
  tipoBordaForro: string;
  montantesDuplos: boolean;
  tipoReforco: string;
  qtdReforco: number;
  areaUmida: boolean;
  // Parâmetros extras do item
  parametros: Record<string, unknown>;
  // Resultados intermediários (para tipo "proporcao")
  intermediarios: Record<string, number>;
}

// ── Resultado de um cálculo individual ──
export interface CalcResult {
  qtdBruta: number;
  obs: string;
  intermediarios?: Record<string, number>;  // valores para outros itens usarem
}

// ── BARRA DE 3M (constante física) ──
const BARRA_M = 3.0;

// ============================================================
// CALCULADORES — UM POR TIPO_CALCULO
// ============================================================

/**
 * POR ÁREA — Base: m²
 * Uso: chapas, isolamento, pintura
 * Parâmetros:
 *   - faces: number (1 ou 2, default 1)
 *   - camadas: number (1 ou 2, default 1)
 *   - usarCamadaDupla: boolean (se true, camadas = ctx.camadaDupla ? 2 : 1)
 *   - divisorArea: boolean (dividir pela área da chapa?)
 *   - consumoM2: number (consumo por m², ex: 3 kg/m² para gesso cola, 0.10 kg/m² para tirante)
 */
function calcArea(ctx: CalcContext): CalcResult {
  const G = ctx.geometria;
  const faces = (ctx.parametros.faces as number) || 1;
  const usarCamadaDupla = ctx.parametros.usarCamadaDupla as boolean;
  const camadas = usarCamadaDupla
    ? (ctx.camadaDupla ? 2 : 1)
    : ((ctx.parametros.camadas as number) || 1);
  const divisorArea = ctx.parametros.divisorArea !== false;
  const consumoM2 = (ctx.parametros.consumoM2 as number) || 0;

  let qtdBruta: number;

  if (consumoM2 > 0) {
    // Ex: gesso cola — consumo por m² direto
    qtdBruta = G.areaEfetiva * faces * camadas * consumoM2;
  } else if (divisorArea) {
    // Ex: chapas — área / área_placa × faces × camadas
    const chapaInfo = TAMANHO_CHAPA_MAP[ctx.tamanhoChapa];
    qtdBruta = (G.areaEfetiva / chapaInfo.area) * faces * camadas;
  } else {
    // Ex: isolamento — área simples
    qtdBruta = G.areaEfetiva * faces * camadas;
  }

  return {
    qtdBruta,
    obs: `${G.areaEfetiva.toFixed(2)}m² × ${faces} faces × ${camadas} cam`,
  };
}

/**
 * POR PERÍMETRO — Base: perímetro ou comprimento (ML)
 * Uso: guias, banda acústica, tabica, cantoneira perimetral
 * Parâmetros:
 *   - multiplicador: number (ex: 2 para piso+teto)
 *   - dividirBarra: boolean (dividir ML por 3m para barras?)
 *   - base: 'comprimento' | 'perimetro' | 'perimetroForro' | 'arestas' (default: 'comprimento')
 *   - espaçamento: number (ex: 0.60 para ancoragem a cada 600mm)
 */
function calcPerimetro(ctx: CalcContext): CalcResult {
  const G = ctx.geometria;
  const multiplicador = (ctx.parametros.multiplicador as number) || 1;
  const dividirBarra = ctx.parametros.divirBarra !== false;
  const base = (ctx.parametros.base as string) || 'comprimento';
  const espacamento = (ctx.parametros.espacamento as number) || 0;

  let ml: number;
  let baseDesc: string;

  switch (base) {
    case 'perimetro':
      ml = G.perim * multiplicador;
      baseDesc = `perim=${G.perim.toFixed(2)}m`;
      break;
    case 'perimetroForro':
      ml = G.perimForro * multiplicador;
      baseDesc = `perim_forro=${G.perimForro.toFixed(2)}m`;
      break;
    case 'arestas':
      ml = G.arestas * multiplicador;
      baseDesc = `arestas=${G.arestas.toFixed(2)}m`;
      break;
    case 'comprimento':
    default:
      ml = G.comp * multiplicador;
      baseDesc = `comp=${G.comp.toFixed(2)}m`;
      break;
  }

  let qtdBruta: number;
  let obsExtra = '';

  if (espacamento > 0) {
    // Ex: ancoragem — 1 a cada X metros
    const unidades = Math.ceil(ml / espacamento);
    qtdBruta = unidades;
    obsExtra = ` → ${unidades} un a cada ${espacamento}m`;
  } else if (dividirBarra) {
    qtdBruta = ml / BARRA_M;
    obsExtra = ` → ${ml.toFixed(2)}ML / ${BARRA_M}m`;
  } else {
    qtdBruta = ml;
  }

  return {
    qtdBruta,
    obs: `${baseDesc} × ${multiplicador}${obsExtra}`,
  };
}

/**
 * POR MODULAÇÃO — Base: espaçamento fixo
 * Uso: montantes, canaletas F530, pendurais
 * Parâmetros:
 *   - tipoModulacao: 'montante' | 'forro' | 'forro_aramado' | 'mobiliario' | 'omega'
 *   - considerarAltura: boolean (multiplicar ML por altura)
 *   - dividirBarra: boolean
 *   - pendurais: boolean (calcular pendurais junto?)
 *   - espacamentoPendural: number (ex: 1.20)
 */
function calcModulacao(ctx: CalcContext): CalcResult {
  const G = ctx.geometria;
  const tipoMod = (ctx.parametros.tipoModulacao as string) || 'montante';
  const dividirBarra = ctx.parametros.divirBarra !== false;
  const intermediarios: Record<string, number> = {};

  let qtdBruta: number;
  let obs: string;

  if (tipoMod === 'forro') {
    // Canaletas F530: linhas primárias
    const modM = ctx.modF530MM / 1000;
    const nLinhas = Math.ceil(G.largForro / modM) + 1;
    const mlCanaleta = nLinhas * G.compForro;

    intermediarios.nLinhas = nLinhas;
    intermediarios.mlCanaleta = mlCanaleta;

    if (ctx.parametros.pendurais as boolean) {
      const espacamentoPendural = (ctx.parametros.espacamentoPendural as number) || 1.20;
      const nPendurais = nLinhas * Math.ceil(G.compForro / espacamentoPendural);
      intermediarios.nPendurais = nPendurais;
    }

    qtdBruta = dividirBarra ? mlCanaleta / BARRA_M : mlCanaleta;
    obs = `${nLinhas} linhas × ${G.compForro.toFixed(2)}m = ${mlCanaleta.toFixed(2)}ML`;
  } else if (tipoMod === 'forro_aramado') {
    // Forro aramado: nervuras a cada 600mm
    const modM = 0.60;
    const nLinhas = Math.ceil(G.largForro / modM) + 1;
    const mlNervuras = nLinhas * G.compForro;

    intermediarios.nLinhas = nLinhas;
    intermediarios.mlNervuras = mlNervuras;

    qtdBruta = dividirBarra ? mlNervuras / BARRA_M : mlNervuras;
    obs = `${nLinhas} nervuras × ${G.compForro.toFixed(2)}m = ${mlNervuras.toFixed(2)}ML`;
  } else if (tipoMod === 'mobiliario') {
    // Mobiliário: modulação fixa 400mm
    const modM = 0.40;
    const nMontantes = Math.floor(G.comp / modM) + 1;
    const mlMontantes = nMontantes * G.alt;
    qtdBruta = dividirBarra ? mlMontantes / BARRA_M : mlMontantes;
    intermediarios.nMontantes = nMontantes;
    intermediarios.mlMontantes = mlMontantes;
    obs = `${nMontantes} montantes (400mm) × ${G.alt.toFixed(2)}m = ${mlMontantes.toFixed(1)}ML`;
  } else {
    // Montantes padrão (parede / revestimento / ômega)
    const modM = ctx.modulacaoMM / 1000;
    const nMontantes = Math.floor(G.comp / modM) + 1;
    const mlMontantes = nMontantes * G.alt;
    qtdBruta = dividirBarra ? mlMontantes / BARRA_M : mlMontantes;
    intermediarios.nMontantes = nMontantes;
    intermediarios.mlMontantes = mlMontantes;
    obs = `${nMontantes} montantes × ${G.alt.toFixed(2)}m = ${mlMontantes.toFixed(1)}ML`;
  }

  return { qtdBruta, obs, intermediarios };
}

/**
 * POR PROPORÇÃO — Relação com outro item
 * Uso: parafusos (SM, SP, SD), buchas, presilhas, fita, reguladores
 * Parâmetros:
 *   - referencia: string (nome do intermediário a usar)
 *   - formula: 'por_montante' | 'por_area_chapa' | 'por_pendural' | 'por_linha'
 *              | 'juntas_parede' | 'juntas_forro' | 'por_area_quadra' | 'custom'
 *   - fatorPorUnidade: number (ex: 4 parafusos SM por montante)
 *   - espacamento: number (ex: 0.25 para SP a cada 25cm)
 *   - divisor: number (divisor final, ex: 1000 para milheiro)
 *   - faces: number (para juntas_parede, por_area_chapa)
 *   - camadas: number (para juntas_parede)
 *   - usarCamadaDupla: boolean (para juntas_parede e por_area_chapa)
 */
function calcProporcao(ctx: CalcContext): CalcResult {
  const G = ctx.geometria;
  const formula = (ctx.parametros.formula as string) || 'custom';
  const fatorPorUnidade = (ctx.parametros.fatorPorUnidade as number) || 1;
  const espacamento = (ctx.parametros.espacamento as number) || 0;
  const divisor = (ctx.parametros.divisor as number) || 1;
  const intermediarios = ctx.intermediarios;
  const usarCamadaDupla = ctx.parametros.usarCamadaDupla as boolean;

  let qtdBruta: number;
  let obs: string;

  switch (formula) {
    case 'por_montante': {
      // SM: 4 por montante, ou presilhas: 3 por ômega
      const nMontantes = intermediarios.nMontantes || Math.floor(G.comp / (ctx.modulacaoMM / 1000)) + 1;
      const total = nMontantes * fatorPorUnidade;
      qtdBruta = total / divisor;
      obs = `${total} un → ${fatorPorUnidade} por montante (${nMontantes} montantes)`;
      break;
    }
    case 'por_area_chapa': {
      // SP/SD: nMontantes × faces × ceil(alt / espacamento)
      const nMontantes = intermediarios.nMontantes || Math.floor(G.comp / (ctx.modulacaoMM / 1000)) + 1;
      const faces = (ctx.parametros.faces as number) || 2;
      const nSP = nMontantes * faces * Math.ceil(G.alt / (espacamento || 0.25));
      qtdBruta = nSP / divisor;
      obs = `${nSP} un → ${nMontantes} mont × ${faces} faces × esp${espacamento || 0.25}m`;
      break;
    }
    case 'por_pendural': {
      const nPendurais = intermediarios.nPendurais || 0;
      const total = nPendurais * fatorPorUnidade;
      qtdBruta = total / divisor;
      obs = `${total} un → ${fatorPorUnidade} por pendural (${nPendurais} pendurais)`;
      break;
    }
    case 'por_linha': {
      const nLinhas = intermediarios.nLinhas || 0;
      const nSP = nLinhas * Math.ceil(G.compForro / (espacamento || 0.25));
      qtdBruta = nSP / divisor;
      obs = `${nSP} un → ${nLinhas} linhas × esp${espacamento || 0.25}m`;
      break;
    }
    case 'juntas_parede': {
      // Fita papel para paredes/revestimentos
      // nJuntas = max(0, ceil(comp / chapaLargura) - 1) * faces * camadas
      // mlFita = nJuntas * alt
      const chapaInfo = TAMANHO_CHAPA_MAP[ctx.tamanhoChapa];
      const faces = (ctx.parametros.faces as number) || 2;
      const camadas = usarCamadaDupla
        ? (ctx.camadaDupla ? 2 : 1)
        : ((ctx.parametros.camadas as number) || 1);
      const nJuntas = Math.max(0, Math.ceil(G.comp / chapaInfo.largura) - 1) * faces * camadas;
      const mlFita = nJuntas * G.alt;
      qtdBruta = mlFita / divisor;
      obs = `${nJuntas} juntas × ${G.alt.toFixed(2)}m = ${mlFita.toFixed(1)}ML`;
      break;
    }
    case 'juntas_forro': {
      // Fita papel para forros (transversal + longitudinal + perimetral)
      const chapaInfo = TAMANHO_CHAPA_MAP[ctx.tamanhoChapa];
      // Juntas transversais: entre fileiras de chapas na largura
      const nJuntasTransv = Math.max(0, Math.ceil(G.largForro / chapaInfo.largura) - 1);
      const mlJuntasTransv = nJuntasTransv * G.compForro;
      // Juntas longitudinais: entre chapas no comprimento
      const nFileirasLarg = Math.max(1, Math.ceil(G.largForro / chapaInfo.largura));
      const placasPorFileira = Math.ceil(G.compForro / chapaInfo.comprimento);
      const mlJuntasLongit = (nFileirasLarg - 1) > 0 ? (nFileirasLarg - 1) * placasPorFileira * chapaInfo.largura : 0;
      // Junta perimetral (interface chapa ↔ borda perimetral)
      const mlJuntaPerimetral = G.perimForro;
      const mlFitaForro = mlJuntasTransv + mlJuntasLongit + mlJuntaPerimetral;
      qtdBruta = mlFitaForro / divisor;
      obs = `Transv:${mlJuntasTransv.toFixed(1)}ML + Longit:${mlJuntasLongit.toFixed(1)}ML + Perim:${mlJuntaPerimetral.toFixed(1)}ML = ${mlFitaForro.toFixed(1)}ML`;
      break;
    }
    case 'por_area_quadra': {
      // Regulador FWA: ceil(areaEfetiva / espacamento)
      const esp = espacamento || 0.60;
      const nUnidades = Math.ceil(G.areaEfetiva / esp);
      qtdBruta = nUnidades / divisor;
      obs = `${nUnidades} un → ceil(${G.areaEfetiva.toFixed(2)}m² / ${esp}m²)`;
      break;
    }
    default: {
      // Custom: usar valor de referência direto
      const refValue = intermediarios[ctx.parametros.referencia as string] || 0;
      qtdBruta = (refValue * fatorPorUnidade) / divisor;
      obs = `ref=${ctx.parametros.referencia}(${refValue}) × ${fatorPorUnidade} / ${divisor}`;
      break;
    }
  }

  return { qtdBruta, obs };
}

/**
 * POR PEÇA FIXA — Valor constante
 * Uso: acessórios específicos, reforços, pendurais
 * Parâmetros:
 *   - valor: number (quantidade fixa, ou fator por qtdReforco)
 *   - porReforco: boolean (multiplicar por qtdReforco?)
 *   - areaPorUnidade: number (m² por unidade, ex: chapa aço ~0.5m²)
 *   - multiplicarAltura: boolean (multiplicar por altura?)
 *   - dividirBarra: boolean (dividir ML por 3m?)
 */
function calcPecaFixa(ctx: CalcContext): CalcResult {
  const G = ctx.geometria;
  const valor = (ctx.parametros.valor as number) || 1;
  const porReforco = ctx.parametros.porReforco as boolean;
  const areaPorUnidade = (ctx.parametros.areaPorUnidade as number) || 0;
  const multiplicarAltura = ctx.parametros.multiplicarAltura as boolean;
  const dividirBarra = ctx.parametros.divirBarra as boolean;

  let qtdBruta: number;
  let obs: string;

  if (porReforco) {
    let qtd = ctx.qtdReforco * (areaPorUnidade > 0 ? areaPorUnidade : valor);
    if (multiplicarAltura) {
      const ml = ctx.qtdReforco * G.alt;
      qtd = dividirBarra ? ml / 3.0 : ml;
      obs = `${ctx.qtdReforco} reforços × ${G.alt.toFixed(2)}m${dividirBarra ? ' / 3m' : ''}`;
    } else {
      obs = `${ctx.qtdReforco} reforços × ${areaPorUnidade > 0 ? areaPorUnidade + 'm²' : valor}`;
    }
    qtdBruta = qtd;
  } else {
    qtdBruta = valor;
    obs = `Fixo: ${valor}`;
  }

  return { qtdBruta, obs };
}

/**
 * POR DENSIDADE — Consumo técnico (kg/m²)
 * Uso: massa, gesso
 * Parâmetros:
 *   - consumoKgM2: number (ex: 0.50 kg/m² para massa)
 *   - faces: number (1 ou 2)
 *   - camadas: number
 *   - usarCamadaDupla: boolean (se true, camadas = ctx.camadaDupla ? 2 : 1)
 *   - divisorEmbalagem: number (ex: 20 para saco 20kg → resultado em sacos)
 *     NOTA: para o novo engine, use divisorEmbalagem=1 para retornar kg
 *           e deixe qtdPorEmbalagem do material fazer a conversão
 */
function calcDensidade(ctx: CalcContext): CalcResult {
  const G = ctx.geometria;
  const consumoKgM2 = (ctx.parametros.consumoKgM2 as number) || 0;
  const faces = (ctx.parametros.faces as number) || 1;
  const usarCamadaDupla = ctx.parametros.usarCamadaDupla as boolean;
  const camadas = usarCamadaDupla
    ? (ctx.camadaDupla ? 2 : 1)
    : ((ctx.parametros.camadas as number) || 1);
  const divisorEmbalagem = (ctx.parametros.divisorEmbalagem as number) || 1;

  const m2Total = G.areaEfetiva * faces * camadas;
  const kgTotal = m2Total * consumoKgM2;
  const qtdBruta = kgTotal / divisorEmbalagem;

  return {
    qtdBruta,
    obs: `${m2Total.toFixed(2)}m² × ${consumoKgM2}kg/m² = ${kgTotal.toFixed(2)}kg${divisorEmbalagem > 1 ? ` / ${divisorEmbalagem}kg` : ''}`,
  };
}

// ============================================================
// DISPATCHER — seleciona o calculador pelo tipo
// ============================================================
export function calcularItem(tipoCalculo: TipoCalculo, ctx: CalcContext): CalcResult {
  switch (tipoCalculo) {
    case 'area': return calcArea(ctx);
    case 'perimetro': return calcPerimetro(ctx);
    case 'modulacao': return calcModulacao(ctx);
    case 'proporcao': return calcProporcao(ctx);
    case 'peca_fixa': return calcPecaFixa(ctx);
    case 'densidade': return calcDensidade(ctx);
    default:
      return { qtdBruta: 0, obs: `Tipo desconhecido: ${tipoCalculo}` };
  }
}
