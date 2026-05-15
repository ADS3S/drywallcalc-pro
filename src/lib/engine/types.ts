// ============================================================
// DrywallCalc Pro — Data-Driven Engine Types
// ============================================================

// ── TIPOS DE CÁLCULO (O coração do sistema) ──
export type TipoCalculo =
  | 'area'         // POR ÁREA — Base: m² (chapas, pintura)
  | 'perimetro'    // POR METRO LINEAR — Base: perímetro/comprimento (guias, banda acústica)
  | 'modulacao'    // POR MODULAÇÃO — Base: espaçamento fixo (montantes, perfis forro)
  | 'proporcao'    // POR PROPORÇÃO — Relação com outro item (parafusos, fixadores)
  | 'peca_fixa'    // POR PEÇA FIXA — Valor constante (acessórios)
  | 'densidade';   // POR DENSIDADE — Consumo técnico kg/m² (massa, gesso)

export const TIPO_CALCULO_LABELS: Record<TipoCalculo, string> = {
  area: 'Por Área (m²)',
  perimetro: 'Por Perímetro (ML)',
  modulacao: 'Por Modulação (espaçamento)',
  proporcao: 'Por Proporção (relação)',
  peca_fixa: 'Por Peça Fixa (constante)',
  densidade: 'Por Densidade (kg/m²)',
};

export const TIPO_CALCULO_DESC: Record<TipoCalculo, string> = {
  area: 'Base: m². Uso: chapas, pintura, isolamento',
  perimetro: 'Base: perímetro ou comprimento. Uso: guias, banda acústica',
  modulacao: 'Base: espaçamento fixo (ex: 600mm). Uso: montantes, perfis de forro',
  proporcao: 'Base: relação com outro item. Uso: parafusos, fixadores',
  peca_fixa: 'Base: valor constante. Uso: acessórios específicos',
  densidade: 'Base: consumo técnico (ex: kg/m²). Uso: massa, gesso',
};

// ── CATEGORIAS ──
export type MaterialCategory =
  | 'estrutura' | 'chapa' | 'parafuso' | 'fixacao'
  | 'isolamento' | 'acabamento' | 'reforco';

export const CATEGORIAS_LABELS: Record<MaterialCategory, string> = {
  estrutura: 'Estrutura',
  chapa: 'Chapas',
  parafuso: 'Parafusos',
  fixacao: 'Fixação',
  isolamento: 'Isolamento',
  acabamento: 'Acabamento',
  reforco: 'Reforços',
};

// ── UNIDADES DE COMPRA ──
export type UnidadeCompra =
  | 'placa' | 'barra_3m' | 'barra_6m' | 'unidade'
  | 'cento' | 'milheiro' | 'kg' | 'litro'
  | 'ml' | 'm2' | 'rolo' | 'saco' | 'balde';

export const UNIDADE_COMPRA_LABELS: Record<UnidadeCompra, string> = {
  placa: 'Placa',
  barra_3m: 'Barra 3m',
  barra_6m: 'Barra 6m',
  unidade: 'Unidade',
  cento: 'Centena',
  milheiro: 'Milheiro',
  kg: 'Quilograma',
  litro: 'Litro',
  ml: 'Metro Linear',
  m2: 'Metro quadrado',
  rolo: 'Saco',
  saco: 'Saco',
  balde: 'Balde',
};

// ── AJUSTE DE QUANTIDADE POR ITEM ──
export interface AjusteItem {
  templateItemId: string;
  quantidadeAdicional: number;
}

// ── INPUT DO AMBIENTE ──
export type TipoChapa = 'ST' | 'RU' | 'RF' | 'FLEX' | 'PERF';
export type TamanhoChapa = '1200x2400' | '1200x1800' | '600x1200';
export type TipoBordaForro = 'tabica' | 'cantoneira_25x30';
export type TipoReforco = 'nenhum' | 'madeira' | 'chapa_aco';

export interface AmbienteInput {
  id: string;
  nome: string;
  sistemaId: string;
  comprimento: number;
  altura: number;
  area: number;
  perimetro: number;
  arestas: number;
  nVaos: number;
  areaVaos: number;
  tipoChapa: TipoChapa;
  tamanhoChapa: TamanhoChapa;
  modulacaoMM: number;
  modF530MM: number;
  camadaDupla: boolean;
  isolamento: boolean;
  isolamentoTipo: 'vidro' | 'pet' | 'rocha';
  areaUmida: boolean;
  tipoBordaForro: TipoBordaForro;
  tipoMassa: 'po' | 'pronta';
  montantesDuplos: boolean;
  tipoReforco: TipoReforco;
  qtdReforco: number;
  maoDeObra: number;
  margem: number;
  desconto: number;
  itensManuais: ItemManual[];
  ajustesItens: AjusteItem[];
  resultado?: ResultadoCalculo;
}

export interface ItemManual {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  valor: number;
}

// ── GEOMETRIA NORMALIZADA ──
export interface Geometria {
  comp: number;
  alt: number;
  area: number;
  perim: number;
  arestas: number;
  areaEfetiva: number;
  compForro: number;
  largForro: number;
  perimForro: number;
}

// ── RESULTADO DO CÁLCULO ──
export interface ItemCalculado {
  templateItemId: string;
  materialCodigo: string;
  nome: string;
  categoria: MaterialCategory;
  unidadeCompra: UnidadeCompra;
  qtdPorEmbalagem: number;
  precoEmbalagem: number;
  qtdBruta: number;
  fatorPerda: number;
  qtdComPerda: number;
  embalagensNecessarias: number;
  custoProporcional: number;
  obs: string;
  tipoCalculo: TipoCalculo;
  quantidadeAdicional: number;
  quantidadeFinal: number;
}

export interface ResultadoCalculo {
  itens: ItemCalculado[];
  custoMateriais: number;
  maoDeObra: number;
  margemPct: number;
  lucro: number;
  descontoPct: number;
  valorDesconto: number;
  total: number;
  custoItensManuais: number;
  area: number;
  areaEfetiva: number;
  perimetro: number;
  sistemaId: string;
  opcoes: {
    tipoChapa: TipoChapa;
    tamanhoChapa: TamanhoChapa;
    modulacao: number;
    modF530: number;
    camadaDupla: boolean;
    isolamento: boolean;
    isolamentoTipo: string;
    tipoBordaForro: TipoBordaForro;
    tipoMassa: 'po' | 'pronta';
    montantesDuplos: boolean;
    tipoReforco: TipoReforco;
  };
}

// ── CONFIG GLOBAL ──
export interface ConfigGlobal {
  peDireito: number;
  modulacaoMontante: number;
  margem: number;
  desconto: number;
  perda: number;
}

// ── ORÇAMENTO ──
export interface Orcamento {
  id: string;
  cliente: { nome: string; telefone: string; validade: string };
  configGlobal: ConfigGlobal;
  ambientes: AmbienteInput[];
  data: string;
}

// ── CHAPA INFO ──
export const TAMANHO_CHAPA_MAP: Record<TamanhoChapa, { area: number; largura: number; comprimento: number; label: string }> = {
  '1200x2400': { area: 2.88, largura: 1.20, comprimento: 2.40, label: '1,20 × 2,40m (2,88m²)' },
  '1200x1800': { area: 2.16, largura: 1.20, comprimento: 1.80, label: '1,20 × 1,80m (2,16m²)' },
  '600x1200':  { area: 0.72, largura: 0.60, comprimento: 1.20, label: '0,60 × 1,20m (0,72m²)' },
};

export const CHAPA_CODIGO_MAP: Record<TipoChapa, string> = {
  ST: 'C01', RU: 'C02', RF: 'C03', FLEX: 'C04', PERF: 'C05',
};
