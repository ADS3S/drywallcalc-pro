// ============================================================
// DrywallCalc Pro — Interpretador de Template
// Carrega itens do template, avalia condições, executa calculadores
// ============================================================
import type { AmbienteInput, ConfigGlobal, ItemCalculado, MaterialCategory, ResultadoCalculo, TipoCalculo, UnidadeCompra } from './types';
import { CHAPA_CODIGO_MAP } from './types';
import { normalizarGeometria } from './normalizer';
import { calcularItem, type CalcContext } from './calculators';

// ── Interface para dados do banco ──
export interface TemplateItemData {
  id: string;
  templateId: string;
  materialCodigo: string;
  materialId: string;
  tipoCalculo: string;
  coeficiente: number;
  parametrosJson: string;
  fatorPerda: number;
  categoriaUso: string;
  obs: string;
  condicaoAtivacao: string;
  ordem: number;
  ativo: boolean;
  // Material data (joined)
  materialNome?: string;
  materialVariante?: string;
  materialCategoria?: string;
  materialUnidadeCompra?: string;
  materialQtdPorEmbalagem?: number;
  materialPrecoEmbalagem?: number;
  materialUnidadeConsumo?: string;
  materialFatorPerda?: number;
  materialObs?: string;
}

export interface MaterialData {
  id: string;
  codigo: string;
  nome: string;
  variante: string;
  categoria: string;
  unidadeCompra: string;
  qtdPorEmbalagem: number;
  precoEmbalagem: number;
  unidadeConsumo: string;
  fatorPerda: number;
  obs: string;
}

// ── Helpers ──
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function parseJson<T>(json: string, fallback: T): T {
  try { return JSON.parse(json || '{}') as T; } catch { return fallback; }
}

/**
 * Avalia condição de ativação de um item
 * Ex: {"campo":"camadaDupla","valor":true}
 * Ex: {"campo":"montantesDuplos","valor":true,"subCampo":"qtdReforco","min":1}
 * Ex: {"ou":[{"campo":"arestas","min":1},{"campo":"tipoReforco","valor":"madeira"}]}
 */
function avaliarCondicao(condicao: string, amb: AmbienteInput): boolean {
  if (!condicao || condicao === '{}') return true;

  const c = parseJson<Record<string, unknown>>(condicao, {});
  if (!c || Object.keys(c).length === 0) return true;

  // Composed condition (OR)
  if (c.ou && Array.isArray(c.ou)) {
    return (c.ou as Record<string, unknown>[]).some(sub => avaliarCondicaoObj(sub, amb));
  }

  // Composed condition (AND)
  if (c.e && Array.isArray(c.e)) {
    return (c.e as Record<string, unknown>[]).every(sub => avaliarCondicaoObj(sub, amb));
  }

  return avaliarCondicaoObj(c, amb);
}

function avaliarCondicaoObj(c: Record<string, unknown>, amb: AmbienteInput): boolean {
  const campo = c.campo as string;
  if (!campo) return true;

  const valorAmbiente = (amb as unknown as Record<string, unknown>)[campo];

  if (c.valor !== undefined) {
    return valorAmbiente === c.valor;
  }
  if (c.min !== undefined) {
    return typeof valorAmbiente === 'number' && valorAmbiente >= (c.min as number);
  }
  if (c.max !== undefined) {
    return typeof valorAmbiente === 'number' && valorAmbiente <= (c.max as number);
  }
  if (c.diferente !== undefined) {
    return valorAmbiente !== c.diferente;
  }

  return true;
}

/**
 * Resolve o código do material dinâmico
 * Ex: materialCodigo = "__CHAPA__" → resolve para C01/C02/C03 baseado em tipoChapa
 */
function resolverCodigoMaterial(codigo: string, amb: AmbienteInput): string {
  if (codigo === '__CHAPA__') {
    return CHAPA_CODIGO_MAP[amb.tipoChapa] || 'C01';
  }
  if (codigo === '__ISOLAMENTO__') {
    const isoMap: Record<string, string> = { vidro: 'I01', pet: 'I02', rocha: 'I03' };
    return isoMap[amb.isolamentoTipo] || 'I01';
  }
  return codigo;
}

/**
 * MOTOR PRINCIPAL — Interpreta template e calcula ambiente
 */
export function interpretarTemplate(
  amb: AmbienteInput,
  materiais: MaterialData[],
  templateItens: TemplateItemData[],
  config: ConfigGlobal
): ResultadoCalculo {
  const G = normalizarGeometria(amb, config);

  if (!G.area || G.area <= 0) {
    throw new Error('Informe a área do ambiente');
  }

  // Ordenar itens por ordem
  const itensOrdenados = [...templateItens]
    .filter(i => i.ativo)
    .sort((a, b) => a.ordem - b.ordem);

  // Intermediários acumulados (para cálculos de proporção)
  const intermediarios: Record<string, number> = {};

  // Resultados
  const itens: ItemCalculado[] = [];
  let custoMateriais = 0;

  for (const ti of itensOrdenados) {
    // Avaliar condição de ativação
    if (!avaliarCondicao(ti.condicaoAtivacao, amb)) continue;

    // Resolver código dinâmico
    const codigoResolvido = resolverCodigoMaterial(ti.materialCodigo, amb);

    // Buscar material
    let mat = materiais.find(m => m.codigo === codigoResolvido);
    if (!mat) {
      const base = codigoResolvido.split('-')[0];
      mat = materiais.find(m => m.codigo === base || m.codigo.startsWith(base + '-'));
    }
    if (!mat) continue;

    // Montar contexto de cálculo
    const parametros = parseJson<Record<string, unknown>>(ti.parametrosJson, {});
    const ctx: CalcContext = {
      geometria: G,
      tipoChapa: amb.tipoChapa,
      tamanhoChapa: amb.tamanhoChapa,
      modulacaoMM: amb.modulacaoMM || config.modulacaoMontante || 600,
      modF530MM: amb.modF530MM || 600,
      camadaDupla: amb.camadaDupla,
      isolamento: amb.isolamento,
      isolamentoTipo: amb.isolamentoTipo,
      tipoBordaForro: amb.tipoBordaForro,
      montantesDuplos: amb.montantesDuplos,
      tipoReforco: amb.tipoReforco,
      qtdReforco: amb.qtdReforco,
      areaUmida: amb.areaUmida,
      parametros,
      intermediarios,
    };

    // Calcular
    const result = calcularItem(ti.tipoCalculo as TipoCalculo, ctx);

    // Acumular intermediários
    if (result.intermediarios) {
      Object.assign(intermediarios, result.intermediarios);
    }

    // Aplicar coeficiente
    const qtdBruta = result.qtdBruta * ti.coeficiente;

    // Determinar fator de perda (item override > material default > global)
    const fatorPerda = ti.fatorPerda >= 0 ? ti.fatorPerda : (mat.fatorPerda >= 0 ? mat.fatorPerda : config.perda);

    // Calcular custo proporcional
    const qtdComPerda = qtdBruta * (1 + fatorPerda / 100);
    const embalagens = mat.qtdPorEmbalagem > 0
      ? qtdComPerda / mat.qtdPorEmbalagem
      : qtdComPerda;
    const custoProporcional = embalagens * mat.precoEmbalagem;

    // Categoria de uso (override do template ou do material)
    const categoria = (ti.categoriaUso || mat.categoria) as MaterialCategory;

    // Aplicar ajuste de quantidade adicional (se houver)
    const ajuste = amb.ajustesItens?.find(a => a.templateItemId === ti.id);
    const qtdAdicional = ajuste?.quantidadeAdicional || 0;
    const qtdFinal = qtdComPerda + qtdAdicional;

    // Recalcular custo com quantidade final (incluindo ajuste)
    const embalagensFinal = mat.qtdPorEmbalagem > 0
      ? qtdFinal / mat.qtdPorEmbalagem
      : qtdFinal;
    const custoProporcionalFinal = embalagensFinal * mat.precoEmbalagem;

    const itemCalc: ItemCalculado = {
      templateItemId: ti.id,
      materialCodigo: codigoResolvido,
      nome: mat.nome + (mat.variante ? ` — ${mat.variante}` : ''),
      categoria,
      unidadeCompra: mat.unidadeCompra as UnidadeCompra,
      qtdPorEmbalagem: mat.qtdPorEmbalagem,
      precoEmbalagem: mat.precoEmbalagem,
      qtdBruta: parseFloat(qtdBruta.toFixed(3)),
      fatorPerda,
      qtdComPerda: parseFloat(qtdComPerda.toFixed(3)),
      embalagensNecessarias: parseFloat(embalagensFinal.toFixed(3)),
      custoProporcional: parseFloat(custoProporcionalFinal.toFixed(2)),
      obs: (ti.obs || result.obs || mat.obs) + (qtdAdicional > 0 ? ` (+${qtdAdicional} un extra)` : ''),
      tipoCalculo: ti.tipoCalculo as TipoCalculo,
      quantidadeAdicional: qtdAdicional,
      quantidadeFinal: parseFloat(qtdFinal.toFixed(3)),
    };

    custoMateriais += itemCalc.custoProporcional;
    itens.push(itemCalc);
  }

  // Itens manuais
  const custoItensManuais = (amb.itensManuais || []).reduce((sum, item) => sum + item.valor, 0);

  // Financeiro — sempre usar config global (simplificado)
  const margem = config.margem;
  const desconto = config.desconto;
  const lucro = custoMateriais * (margem / 100);
  const subtotal = custoMateriais + amb.maoDeObra + lucro + custoItensManuais;
  const valorDesconto = subtotal * (desconto / 100);
  const total = subtotal - valorDesconto;

  return {
    itens,
    custoMateriais,
    maoDeObra: amb.maoDeObra,
    margemPct: margem,
    lucro,
    descontoPct: desconto,
    valorDesconto,
    total,
    custoItensManuais,
    area: G.area,
    areaEfetiva: G.areaEfetiva,
    perimetro: G.perim,
    sistemaId: amb.sistemaId,
    opcoes: {
      tipoChapa: amb.tipoChapa,
      tamanhoChapa: amb.tamanhoChapa,
      modulacao: amb.modulacaoMM,
      modF530: amb.modF530MM,
      camadaDupla: amb.camadaDupla,
      isolamento: amb.isolamento,
      isolamentoTipo: amb.isolamentoTipo,
      tipoBordaForro: amb.tipoBordaForro,
      tipoMassa: amb.tipoMassa,
      montantesDuplos: !!amb.montantesDuplos,
      tipoReforco: amb.tipoReforco,
    },
  };
}

// ── Agregador de resultados ──
export function agruparPorCategoria(itens: ItemCalculado[]): Record<string, { itens: ItemCalculado[]; subtotal: number }> {
  const grupos: Record<string, { itens: ItemCalculado[]; subtotal: number }> = {};
  for (const item of itens) {
    const cat = item.categoria;
    if (!grupos[cat]) grupos[cat] = { itens: [], subtotal: 0 };
    grupos[cat].itens.push(item);
    grupos[cat].subtotal += item.custoProporcional;
  }
  return grupos;
}

// ── Formatter ──
export function fmtBRL(n: number): string {
  return 'R$ ' + (parseFloat(String(n)) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
