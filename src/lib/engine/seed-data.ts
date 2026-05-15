// ============================================================
// DrywallCalc Pro — Seed Data for Data-Driven Engine
// Exports SEED_MATERIAIS and SEED_TEMPLATES
// Translates ALL calculation logic from original hardcoded
// calc-engine.ts into template items with tipo_calculo +
// coeficiente + parametrosJson
// ============================================================

// ── CONVENTION ──
// Calculators return qtdBruta in CONSUMPTION UNITS (smallest
// natural unit: individual screws, kg, meters, etc.)
// The interpreter then converts to purchase units via:
//   embalagens = qtdComPerda / material.qtdPorEmbalagem
//   custo = embalagens * material.precoEmbalagem

// ────────────────────────────────────────────────────────────
// SEED MATERIAIS
// ────────────────────────────────────────────────────────────

export interface SeedMaterial {
  codigo: string;
  nome: string;
  variante: string;
  categoria: string;       // estrutura|chapa|parafuso|fixacao|isolamento|acabamento|reforco
  unidadeCompra: string;
  qtdPorEmbalagem: number;
  precoEmbalagem: number;
  unidadeConsumo: string;
  fatorPerda: number;
  obs: string;
}

export const SEED_MATERIAIS: SeedMaterial[] = [
  // ── Perfis Metálicos (estrutura) ──
  { codigo: 'M01',    nome: 'Guia (perfil U)',              variante: '48mm',  categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 18.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Piso + teto — barra 3m' },
  { codigo: 'M01-70', nome: 'Guia (perfil U)',              variante: '70mm',  categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 22.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Barra 3m' },
  { codigo: 'M01-90', nome: 'Guia (perfil U)',              variante: '90mm',  categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 28.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Barra 3m' },
  { codigo: 'M02',    nome: 'Montante (perfil C)',          variante: '48mm',  categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 20.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Barra 3m; comprimento = pé-direito' },
  { codigo: 'M02-70', nome: 'Montante (perfil C)',          variante: '70mm',  categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 25.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Barra 3m' },
  { codigo: 'M02-90', nome: 'Montante (perfil C)',          variante: '90mm',  categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 32.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Barra 3m' },
  { codigo: 'M03',    nome: 'Canaleta F530',                variante: '',      categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 18.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Barra de 3m' },
  { codigo: 'M04',    nome: 'Perfil Ômega',                 variante: '',      categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 22.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: '' },
  { codigo: 'M05',    nome: 'Cantoneira L (forro)',         variante: '25x30mm', categoria: 'estrutura', unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 12.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Para borda perimetral de forro' },
  { codigo: 'M06',    nome: 'Tabica Metálica',              variante: '',      categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 20.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Para borda perimetral de forro' },
  { codigo: 'M07',    nome: 'Cantoneira Abas Desiguais',    variante: '',      categoria: 'estrutura',  unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 16.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: '' },
  { codigo: 'M08',    nome: 'Cantoneira Reforço Perfurada', variante: '',      categoria: 'acabamento', unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 15.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: 'Para cantos vivos' },
  { codigo: 'M09',    nome: 'Cantoneira PVC Flexível',      variante: '',      categoria: 'acabamento', unidadeCompra: 'barra_3m', qtdPorEmbalagem: 1,    precoEmbalagem: 18.00, unidadeConsumo: 'm',  fatorPerda: 5,  obs: '' },
  { codigo: 'M10',    nome: 'Perfil H (junção FGA)',        variante: '',      categoria: 'estrutura',  unidadeCompra: 'unidade',  qtdPorEmbalagem: 1,    precoEmbalagem: 8.00,  unidadeConsumo: 'un', fatorPerda: 5,  obs: '' },
  { codigo: 'M11',    nome: 'Pendural/Suporte Nivelador',   variante: 'Simples', categoria: 'estrutura', unidadeCompra: 'unidade',  qtdPorEmbalagem: 1,    precoEmbalagem: 4.50,  unidadeConsumo: 'un', fatorPerda: 3,  obs: '' },
  { codigo: 'M11-M',  nome: 'Pendural/Suporte Nivelador',   variante: 'Mola',   categoria: 'estrutura', unidadeCompra: 'unidade',  qtdPorEmbalagem: 1,    precoEmbalagem: 6.00,  unidadeConsumo: 'un', fatorPerda: 3,  obs: '' },
  { codigo: 'M12',    nome: 'Regulador F530',               variante: '',      categoria: 'estrutura',  unidadeCompra: 'unidade',  qtdPorEmbalagem: 1,    precoEmbalagem: 3.50,  unidadeConsumo: 'un', fatorPerda: 3,  obs: '' },

  // ── Chapas ──
  { codigo: 'C01', nome: 'Chapa Drywall ST',          variante: 'Standard 12,5mm',  categoria: 'chapa', unidadeCompra: 'placa', qtdPorEmbalagem: 1, precoEmbalagem: 45.00, unidadeConsumo: 'm²', fatorPerda: 10, obs: '1,20×2,40m = 2,88m²' },
  { codigo: 'C02', nome: 'Chapa Drywall RU',          variante: 'Úmida 12,5mm',     categoria: 'chapa', unidadeCompra: 'placa', qtdPorEmbalagem: 1, precoEmbalagem: 65.00, unidadeConsumo: 'm²', fatorPerda: 10, obs: '1,20×2,40m = 2,88m²' },
  { codigo: 'C03', nome: 'Chapa Drywall RF',          variante: 'Fogo 12,5mm',      categoria: 'chapa', unidadeCompra: 'placa', qtdPorEmbalagem: 1, precoEmbalagem: 75.00, unidadeConsumo: 'm²', fatorPerda: 10, obs: '1,20×2,40m = 2,88m²' },
  { codigo: 'C04', nome: 'Chapa Flexível',            variante: '6,5mm',             categoria: 'chapa', unidadeCompra: 'placa', qtdPorEmbalagem: 1, precoEmbalagem: 85.00, unidadeConsumo: 'm²', fatorPerda: 10, obs: '1,20×2,40m = 2,88m²' },
  { codigo: 'C05', nome: 'Chapa Perfurada Acústica',  variante: '12,5mm',            categoria: 'chapa', unidadeCompra: 'placa', qtdPorEmbalagem: 1, precoEmbalagem: 95.00, unidadeConsumo: 'm²', fatorPerda: 10, obs: '1,20×2,40m = 2,88m²' },

  // ── Parafusos ──
  // NOTA: qtdPorEmbalagem = unidades por unidade de compra
  // Calculator returns individual units; interpreter converts via qtdPorEmbalagem
  { codigo: 'P01', nome: 'Parafuso SM (metal-metal)', variante: '13mm ponta agulha', categoria: 'parafuso', unidadeCompra: 'milheiro', qtdPorEmbalagem: 1000, precoEmbalagem: 55.00, unidadeConsumo: 'un', fatorPerda: 10, obs: '~4 por montante (2 por extremidade)' },
  { codigo: 'P02', nome: 'Parafuso SP 1ª camada',    variante: '25mm trombeta',      categoria: 'parafuso', unidadeCompra: 'milheiro', qtdPorEmbalagem: 1000, precoEmbalagem: 65.00, unidadeConsumo: 'un', fatorPerda: 10, obs: '~3 por chapa por montante' },
  { codigo: 'P03', nome: 'Parafuso SP 2ª camada',    variante: '35mm trombeta',      categoria: 'parafuso', unidadeCompra: 'milheiro', qtdPorEmbalagem: 1000, precoEmbalagem: 70.00, unidadeConsumo: 'un', fatorPerda: 10, obs: '' },
  { codigo: 'P04', nome: 'Parafuso SP reforçado 2ª cam', variante: '40mm trombeta', categoria: 'parafuso', unidadeCompra: 'milheiro', qtdPorEmbalagem: 1000, precoEmbalagem: 75.00, unidadeConsumo: 'un', fatorPerda: 10, obs: '' },
  { codigo: 'P05', nome: 'Parafuso SD (chapa-chapa)', variante: 'Variável',          categoria: 'parafuso', unidadeCompra: 'milheiro', qtdPorEmbalagem: 1000, precoEmbalagem: 60.00, unidadeConsumo: 'un', fatorPerda: 10, obs: '' },
  { codigo: 'P06', nome: 'Parafuso Ancoragem Perimetral', variante: '6mm',           categoria: 'parafuso', unidadeCompra: 'cento',    qtdPorEmbalagem: 100,  precoEmbalagem: 45.00, unidadeConsumo: 'un', fatorPerda: 5,  obs: '~1 a cada 600mm' },

  // ── Fixação ──
  { codigo: 'A01', nome: 'Bucha Ancoragem',           variante: 'Nylon/borboleta',   categoria: 'fixacao', unidadeCompra: 'cento', qtdPorEmbalagem: 100, precoEmbalagem: 12.00, unidadeConsumo: 'un', fatorPerda: 5, obs: '' },
  { codigo: 'A02', nome: 'Tirante Aço Galvanizado',   variante: 'Arame n°10',        categoria: 'fixacao', unidadeCompra: 'kg',    qtdPorEmbalagem: 1,   precoEmbalagem: 25.00, unidadeConsumo: 'kg', fatorPerda: 10, obs: '~0,10kg/m²' },
  { codigo: 'A03', nome: 'Arame Galvanizado',         variante: 'n°18 forro aramado', categoria: 'fixacao', unidadeCompra: 'kg',    qtdPorEmbalagem: 1,   precoEmbalagem: 28.00, unidadeConsumo: 'kg', fatorPerda: 10, obs: '~0,15kg/m²' },
  { codigo: 'A04', nome: 'Pino de Aço (fincapino)',   variante: '',                   categoria: 'fixacao', unidadeCompra: 'cento', qtdPorEmbalagem: 100, precoEmbalagem: 35.00, unidadeConsumo: 'un', fatorPerda: 5,  obs: '' },
  { codigo: 'A05', nome: 'Presilha/Clipe Fixação',    variante: '',                   categoria: 'fixacao', unidadeCompra: 'cento', qtdPorEmbalagem: 100, precoEmbalagem: 90.00, unidadeConsumo: 'un', fatorPerda: 5,  obs: '' },
  { codigo: 'A06', nome: 'Gesso Cola',                variante: 'Argamassa colagem',  categoria: 'fixacao', unidadeCompra: 'saco',  qtdPorEmbalagem: 20,  precoEmbalagem: 60.00, unidadeConsumo: 'kg', fatorPerda: 5,  obs: '~3kg/m² → ~1 saco 20kg por 6,5m²' },

  // ── Isolamento ──
  { codigo: 'I01', nome: 'Lã de Vidro',  variante: '', categoria: 'isolamento', unidadeCompra: 'm2', qtdPorEmbalagem: 1, precoEmbalagem: 12.00, unidadeConsumo: 'm²', fatorPerda: 5, obs: '' },
  { codigo: 'I02', nome: 'Lã de PET',    variante: '', categoria: 'isolamento', unidadeCompra: 'm2', qtdPorEmbalagem: 1, precoEmbalagem: 18.00, unidadeConsumo: 'm²', fatorPerda: 5, obs: '' },
  { codigo: 'I03', nome: 'Lã de Rocha',  variante: '', categoria: 'isolamento', unidadeCompra: 'm2', qtdPorEmbalagem: 1, precoEmbalagem: 22.00, unidadeConsumo: 'm²', fatorPerda: 5, obs: '' },

  // ── Acabamento ──
  { codigo: 'AC01', nome: 'Massa Drywall (pó)',       variante: 'Saco 20kg',           categoria: 'acabamento', unidadeCompra: 'saco',  qtdPorEmbalagem: 20,  precoEmbalagem: 55.00, unidadeConsumo: 'kg', fatorPerda: 5, obs: '~0,35kg/m² → 1 saco/57m²' },
  { codigo: 'AC02', nome: 'Massa Drywall (pronta)',   variante: 'Balde 30kg',           categoria: 'acabamento', unidadeCompra: 'balde', qtdPorEmbalagem: 30,  precoEmbalagem: 75.00, unidadeConsumo: 'kg', fatorPerda: 5, obs: '~0,70kg/m²' },
  { codigo: 'AC03', nome: 'Fita Papel Microperfurado', variante: '150m/rolo',           categoria: 'acabamento', unidadeCompra: 'rolo',  qtdPorEmbalagem: 150, precoEmbalagem: 45.00, unidadeConsumo: 'm',  fatorPerda: 5, obs: 'Rolo 150m — 1m por ML de junta' },
  { codigo: 'AC04', nome: 'Banda/Borda Acústica',     variante: 'Espuma elastomérica', categoria: 'acabamento', unidadeCompra: 'ml',    qtdPorEmbalagem: 1,   precoEmbalagem: 8.00,  unidadeConsumo: 'm',  fatorPerda: 5, obs: '' },

  // ── Reforços ──
  { codigo: 'R01', nome: 'Reforço Madeira Compensada',   variante: '', categoria: 'reforco', unidadeCompra: 'unidade', qtdPorEmbalagem: 1, precoEmbalagem: 35.00, unidadeConsumo: 'un', fatorPerda: 0, obs: '' },
  { codigo: 'R02', nome: 'Chapa Aço Galvanizado Reforço', variante: '', categoria: 'reforco', unidadeCompra: 'm2',     qtdPorEmbalagem: 1, precoEmbalagem: 45.00, unidadeConsumo: 'm²', fatorPerda: 0, obs: '' },
  { codigo: 'R03', nome: 'Nervura (forro aramado)',       variante: '', categoria: 'reforco', unidadeCompra: 'ml',     qtdPorEmbalagem: 1, precoEmbalagem: 18.00, unidadeConsumo: 'm',  fatorPerda: 5, obs: '' },
];


// ────────────────────────────────────────────────────────────
// SEED TEMPLATES
// ────────────────────────────────────────────────────────────

export interface SeedTemplateItem {
  materialCodigo: string;    // material code (use "__CHAPA__" for dynamic chapa, "__ISOLAMENTO__" for dynamic isolamento)
  tipoCalculo: string;       // area|perimetro|modulacao|proporcao|peca_fixa|densidade
  coeficiente: number;       // multiplier (usually 1)
  parametrosJson: string;    // JSON with calculation parameters
  fatorPerda: number;        // -1 = use material default
  categoriaUso: string;      // override category (empty = use material's)
  obs: string;
  condicaoAtivacao: string;  // JSON condition
  ordem: number;
}

export interface SeedTemplate {
  id: string;                // "S01", "S02", etc.
  nome: string;
  sigla: string;
  descricao: string;
  configJson: string;        // JSON with template config
  ordem: number;
  itens: SeedTemplateItem[];
}

// ════════════════════════════════════════════════════════════
// S01 — Parede de Vedação Simples (PVS)
// nFaces=2, nCamadas=1 (sem camada dupla)
// Original: calc-engine.ts lines 130-196 (sistemaId === 'S01')
// ════════════════════════════════════════════════════════════

const S01_ITENS: SeedTemplateItem[] = [
  // 1. Montantes
  {
    materialCodigo: 'M02',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes — barra 3m',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Montantes duplos (condicional: montantesDuplos && qtdReforco > 0)
  {
    materialCodigo: 'M02',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"multiplicarAltura":true,"dividirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes duplos',
    condicaoAtivacao: '{"e":[{"campo":"montantesDuplos","valor":true},{"campo":"qtdReforco","min":1}]}',
    ordem: 2,
  },
  // 3. Guias (piso + teto)
  {
    materialCodigo: 'M01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Guia piso+teto',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 4. Banda acústica (ML)
  {
    materialCodigo: 'AC04',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Banda acústica piso+teto (ML)',
    condicaoAtivacao: '{}',
    ordem: 4,
  },
  // 5. Parafuso SM (4 por montante)
  {
    materialCodigo: 'P01',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_montante","fatorPorUnidade":4,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SM fixação estrutura guia↔montante',
    condicaoAtivacao: '{}',
    ordem: 5,
  },
  // 6. Parafuso ancoragem perimetral
  {
    materialCodigo: 'P06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'Ancoragem perimetral — 1 a cada 600mm',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 7. Bucha ancoragem
  {
    materialCodigo: 'A01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Buchas ancoragem',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 8. Chapas (2 faces, 1 camada)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: 'Chapas — 2 faces × 1 camada',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 9. Parafuso SP 25mm (1ª camada)
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas 1ª camada',
    condicaoAtivacao: '{}',
    ordem: 9,
  },
  // 10. Fita papel
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_parede","faces":2,"camadas":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas verticais',
    condicaoAtivacao: '{}',
    ordem: 10,
  },
  // 11. Massa drywall (pó)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":2,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m² por face',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 11,
  },
  // 11b. Massa pronta (alternativa)
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":2,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m² por face',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 11,
  },
  // 12. Cantoneira aresta (condicional: arestas > 0)
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — arestas',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 12,
  },
  // 13. Reforço madeira (condicional)
  {
    materialCodigo: 'R01',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"valor":1}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Reforço madeira',
    condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"madeira"},{"campo":"qtdReforco","min":1}]}',
    ordem: 13,
  },
  // 14. Reforço chapa aço (condicional)
  {
    materialCodigo: 'R02',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"areaPorUnidade":0.50}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Reforço chapa aço — ~0,5m² cada',
    condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"chapa_aco"},{"campo":"qtdReforco","min":1}]}',
    ordem: 14,
  },
  // 15. Isolamento (condicional)
  {
    materialCodigo: '__ISOLAMENTO__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}',
    fatorPerda: -1,
    categoriaUso: 'isolamento',
    obs: 'Isolamento térmico/acústico',
    condicaoAtivacao: '{"campo":"isolamento","valor":true}',
    ordem: 15,
  },
];

// ════════════════════════════════════════════════════════════
// S02 — Parede de Vedação Dupla (PVD)
// nFaces=2, nCamadas=camadaDupla?2:1
// Original: same block as S01 but with camadaDupla support
// ════════════════════════════════════════════════════════════

const S02_ITENS: SeedTemplateItem[] = [
  // 1. Montantes
  {
    materialCodigo: 'M02',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes — barra 3m',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Montantes duplos (condicional)
  {
    materialCodigo: 'M02',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"multiplicarAltura":true,"dividirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes duplos',
    condicaoAtivacao: '{"e":[{"campo":"montantesDuplos","valor":true},{"campo":"qtdReforco","min":1}]}',
    ordem: 2,
  },
  // 3. Guias (piso + teto)
  {
    materialCodigo: 'M01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Guia piso+teto',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 4. Banda acústica
  {
    materialCodigo: 'AC04',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Banda acústica piso+teto (ML)',
    condicaoAtivacao: '{}',
    ordem: 4,
  },
  // 5. Parafuso SM (4 por montante)
  {
    materialCodigo: 'P01',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_montante","fatorPorUnidade":4,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SM fixação estrutura',
    condicaoAtivacao: '{}',
    ordem: 5,
  },
  // 6. Parafuso ancoragem perimetral
  {
    materialCodigo: 'P06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'Ancoragem perimetral',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 7. Bucha ancoragem
  {
    materialCodigo: 'A01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Buchas ancoragem',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 8. Chapas (2 faces, camadas dinâmicas: usarCamadaDupla)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":2,"usarCamadaDupla":true,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: 'Chapas — 2 faces (camada dupla dinâmica)',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 9. SP 25mm — 1ª camada (sempre)
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas 1ª camada',
    condicaoAtivacao: '{}',
    ordem: 9,
  },
  // 10. SP 35mm — 2ª camada (condicional: camadaDupla)
  {
    materialCodigo: 'P03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP35mm — fixação chapas 2ª camada',
    condicaoAtivacao: '{"campo":"camadaDupla","valor":true}',
    ordem: 10,
  },
  // 11. SD — chapa-chapa (condicional: camadaDupla)
  {
    materialCodigo: 'P05',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.40,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SD — metal-metal chapa↔chapa',
    condicaoAtivacao: '{"campo":"camadaDupla","valor":true}',
    ordem: 11,
  },
  // 12. Fita papel (camadas dinâmicas)
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_parede","faces":2,"usarCamadaDupla":true,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas verticais',
    condicaoAtivacao: '{}',
    ordem: 12,
  },
  // 13. Massa pó (camadas dinâmicas)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":2,"usarCamadaDupla":true,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m² por face/camada',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 13,
  },
  // 13b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":2,"usarCamadaDupla":true,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m² por face/camada',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 13,
  },
  // 14. Cantoneira aresta
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — arestas',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 14,
  },
  // 15. Reforço madeira
  {
    materialCodigo: 'R01',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"valor":1}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Reforço madeira',
    condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"madeira"},{"campo":"qtdReforco","min":1}]}',
    ordem: 15,
  },
  // 16. Reforço chapa aço
  {
    materialCodigo: 'R02',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"areaPorUnidade":0.50}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Reforço chapa aço — ~0,5m² cada',
    condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"chapa_aco"},{"campo":"qtdReforco","min":1}]}',
    ordem: 16,
  },
  // 17. Isolamento
  {
    materialCodigo: '__ISOLAMENTO__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}',
    fatorPerda: -1,
    categoriaUso: 'isolamento',
    obs: 'Isolamento térmico/acústico',
    condicaoAtivacao: '{"campo":"isolamento","valor":true}',
    ordem: 17,
  },
];

// ════════════════════════════════════════════════════════════
// S03 — Parede Curva (PC)
// Same logic as S01 but modFixa=300mm, no camadaDupla, no montantesDuplos
// ════════════════════════════════════════════════════════════

const S03_ITENS: SeedTemplateItem[] = [
  // 1. Montantes (modulação 300mm fixa — será forçada pelo configJson/frontend)
  {
    materialCodigo: 'M02',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes (300mm) — barra 3m',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Guias (piso + teto)
  {
    materialCodigo: 'M01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Guia piso+teto',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 3. Banda acústica
  {
    materialCodigo: 'AC04',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Banda acústica piso+teto (ML)',
    condicaoAtivacao: '{}',
    ordem: 4,
  },
  // 4. Parafuso SM
  {
    materialCodigo: 'P01',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_montante","fatorPorUnidade":4,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SM fixação estrutura',
    condicaoAtivacao: '{}',
    ordem: 5,
  },
  // 5. Parafuso ancoragem
  {
    materialCodigo: 'P06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'Ancoragem perimetral',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 6. Bucha ancoragem
  {
    materialCodigo: 'A01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Buchas ancoragem',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 7. Chapas (2 faces, 1 camada)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: 'Chapas — 2 faces × 1 camada',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 8. SP 25mm
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas',
    condicaoAtivacao: '{}',
    ordem: 9,
  },
  // 9. Fita papel
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_parede","faces":2,"camadas":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas verticais',
    condicaoAtivacao: '{}',
    ordem: 10,
  },
  // 10. Massa pó
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":2,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m² por face',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 11,
  },
  // 10b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":2,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m² por face',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 11,
  },
  // 11. Cantoneira aresta
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — arestas',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 12,
  },
];

// ════════════════════════════════════════════════════════════
// S04 — Revestimento Estruturado (Contra-parede)
// 1 face, perfis ômega, presilhas
// Original: calc-engine.ts lines 205-226
// ════════════════════════════════════════════════════════════

const S04_ITENS: SeedTemplateItem[] = [
  // 1. Perfil ômega (mesma lógica de modulação que montante)
  {
    materialCodigo: 'M04',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Perfis ômega',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Presilhas (3 por ômega)
  {
    materialCodigo: 'A05',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_montante","fatorPorUnidade":3,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Presilhas fixação ômega',
    condicaoAtivacao: '{}',
    ordem: 2,
  },
  // 3. Parafuso ancoragem perimetral
  {
    materialCodigo: 'P06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'Ancoragem perimetral',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 4. Bucha ancoragem
  {
    materialCodigo: 'A01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Buchas ancoragem',
    condicaoAtivacao: '{}',
    ordem: 4,
  },
  // 5. SM (2 por ômega)
  {
    materialCodigo: 'P01',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_montante","fatorPorUnidade":2,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SM — fixação estrutura',
    condicaoAtivacao: '{}',
    ordem: 5,
  },
  // 6. Chapas (1 face, 1 camada)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: '1 face — revestimento',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 7. SP 25mm (1 face)
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":1,"espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 8. Fita papel (1 face)
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_parede","faces":1,"camadas":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas verticais',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 9. Massa pó (1 face)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m²',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 9,
  },
  // 9b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m²',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 9,
  },
  // 10. Cantoneira aresta
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — arestas',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 10,
  },
];

// ════════════════════════════════════════════════════════════
// S05 — Revestimento Direto (Colado)
// Sem estrutura metálica, colagem direta com gesso cola
// Original: calc-engine.ts lines 228-235
// ════════════════════════════════════════════════════════════

const S05_ITENS: SeedTemplateItem[] = [
  // 1. Chapas (1 face, 1 camada)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: '1 face colada',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Gesso cola (3 kg/m²)
  {
    materialCodigo: 'A06',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false,"consumoM2":3}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Gesso cola — 3kg/m²',
    condicaoAtivacao: '{}',
    ordem: 2,
  },
  // 3. Fita papel (1 face)
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_parede","faces":1,"camadas":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas verticais',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 4. Massa pó (1 face)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m²',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 4,
  },
  // 4b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m²',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 4,
  },
];

// ════════════════════════════════════════════════════════════
// S06 — Forro Estruturado (FDE)
// Canaletas F530, pendurais, reguladores, tabica/cantoneira
// Original: calc-engine.ts lines 237-306
// ════════════════════════════════════════════════════════════

const S06_ITENS: SeedTemplateItem[] = [
  // 1. Canaleta F530 (com cálculo de pendurais intermediário)
  {
    materialCodigo: 'M03',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"forro","divirBarra":true,"pendurais":true,"espacamentoPendural":1.20}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Canaletas F530 — barra 3m',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Cantoneira 25x30 perimetral (condicional: tipoBordaForro = cantoneira_25x30)
  {
    materialCodigo: 'M05',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"perimetroForro","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Cantoneira 25×30 perimetral',
    condicaoAtivacao: '{"campo":"tipoBordaForro","valor":"cantoneira_25x30"}',
    ordem: 2,
  },
  // 3. Tabica perimetral (condicional: tipoBordaForro = tabica)
  {
    materialCodigo: 'M06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"perimetroForro","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Tabica perimetral',
    condicaoAtivacao: '{"campo":"tipoBordaForro","valor":"tabica"}',
    ordem: 3,
  },
  // 4. Pendurais/Suportes (1 por pendural)
  {
    materialCodigo: 'M11',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_pendural","fatorPorUnidade":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Pendurais/Suportes nivelador',
    condicaoAtivacao: '{}',
    ordem: 4,
  },
  // 5. Reguladores F530 (1 por pendural)
  {
    materialCodigo: 'M12',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_pendural","fatorPorUnidade":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Reguladores F530',
    condicaoAtivacao: '{}',
    ordem: 5,
  },
  // 6. Tirante arame n°10 (~0.10 kg/m²)
  {
    materialCodigo: 'A02',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false,"consumoM2":0.10}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Tirante — 0,10kg/m²',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 7. Parafuso ancoragem perimetral (forro)
  {
    materialCodigo: 'P06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"perimetroForro","multiplicador":1,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'Ancoragem perimetral forro',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 8. Bucha ancoragem (forro)
  {
    materialCodigo: 'A01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"perimetroForro","multiplicador":1,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Buchas ancoragem forro',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 9. SM (2 por pendural — fixação pendural↔canaleta)
  {
    materialCodigo: 'P01',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_pendural","fatorPorUnidade":2,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SM — fixação pendural↔canaleta',
    condicaoAtivacao: '{}',
    ordem: 9,
  },
  // 10. Chapas forro (1 face, 1 camada)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: 'Forro 1 face',
    condicaoAtivacao: '{}',
    ordem: 10,
  },
  // 11. SP 25mm (1 a cada 25cm por canaleta)
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_linha","espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas forro',
    condicaoAtivacao: '{}',
    ordem: 11,
  },
  // 12. Fita papel (forro: transv + longit + perimetral)
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_forro","divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas forro (transv+longit+perim)',
    condicaoAtivacao: '{}',
    ordem: 12,
  },
  // 13. Massa pó (1 face, 1 camada)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m² forro',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 13,
  },
  // 13b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m² forro',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 13,
  },
  // 14. Cantoneira aresta (cantos vivos no forro)
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — cantos vivos',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 14,
  },
  // 15. Isolamento (condicional)
  {
    materialCodigo: '__ISOLAMENTO__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}',
    fatorPerda: -1,
    categoriaUso: 'isolamento',
    obs: 'Isolamento térmico/acústico',
    condicaoAtivacao: '{"campo":"isolamento","valor":true}',
    ordem: 15,
  },
];

// ════════════════════════════════════════════════════════════
// S07 — Forro Aramado (FWA)
// Arame galvanizado, nervuras, reguladores
// Original: calc-engine.ts lines 308-338
// ════════════════════════════════════════════════════════════

const S07_ITENS: SeedTemplateItem[] = [
  // 1. Arame galvanizado (~0.15 kg/m²)
  {
    materialCodigo: 'A03',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false,"consumoM2":0.15}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Arame n°18 — 0,15kg/m²',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Pinos de aço (1 a cada 600mm perimetral)
  {
    materialCodigo: 'A04',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"perimetroForro","multiplicador":1,"espacamento":0.60,"divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'fixacao',
    obs: 'Pinos de aço perimetral',
    condicaoAtivacao: '{}',
    ordem: 2,
  },
  // 3. Reguladores (1 a cada 0.60m²)
  {
    materialCodigo: 'M12',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_quadra","espacamento":0.60,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Reguladores — 1 a cada 0,60m²',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 4. Nervuras (forro aramado: linhas a cada 600mm)
  {
    materialCodigo: 'R03',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"forro_aramado","divirBarra":false}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Nervuras forro aramado',
    condicaoAtivacao: '{}',
    ordem: 4,
  },
  // 5. Tabica perimetral (FWA sempre usa tabica)
  {
    materialCodigo: 'M06',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"perimetroForro","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Tabica perimetral',
    condicaoAtivacao: '{}',
    ordem: 5,
  },
  // 6. Chapas forro (1 face)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: 'Forro aramado 1 face',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 7. SP 25mm (por linha de nervura a cada 25cm)
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_linha","espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas forro aramado',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 8. Fita papel (forro aramado: transv + longit + perimetral)
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_forro","divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas forro aramado',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 9. Massa pó (1 face)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m²',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 9,
  },
  // 9b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":1,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m²',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 9,
  },
  // 10. Isolamento (condicional)
  {
    materialCodigo: '__ISOLAMENTO__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}',
    fatorPerda: -1,
    categoriaUso: 'isolamento',
    obs: 'Isolamento térmico/acústico',
    condicaoAtivacao: '{"campo":"isolamento","valor":true}',
    ordem: 10,
  },
];

// ════════════════════════════════════════════════════════════
// S08 — Mobiliário (Nichos/Estantes/Closets)
// Modulação 400mm fixa, 2 faces, cantoneira abas desiguais
// Original: calc-engine.ts lines 340-369
// ════════════════════════════════════════════════════════════

const S08_ITENS: SeedTemplateItem[] = [
  // 1. Montantes (modulação 400mm fixa)
  {
    materialCodigo: 'M02',
    tipoCalculo: 'modulacao',
    coeficiente: 1,
    parametrosJson: '{"tipoModulacao":"mobiliario","divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes (400mm) — barra 3m',
    condicaoAtivacao: '{}',
    ordem: 1,
  },
  // 2. Montantes duplos (condicional)
  {
    materialCodigo: 'M02',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"multiplicarAltura":true,"dividirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Montantes duplos',
    condicaoAtivacao: '{"e":[{"campo":"montantesDuplos","valor":true},{"campo":"qtdReforco","min":1}]}',
    ordem: 2,
  },
  // 3. Guias (piso + teto)
  {
    materialCodigo: 'M01',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Guias piso+teto',
    condicaoAtivacao: '{}',
    ordem: 3,
  },
  // 4. Cantoneira abas desiguais — com arestas (condicional: arestas > 0)
  {
    materialCodigo: 'M07',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Cantoneira abas desiguais — arestas',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 4,
  },
  // 5. Cantoneira abas desiguais — sem arestas (condicional: arestas = 0)
  // Original: comp * 0.5 / BARRA_M
  {
    materialCodigo: 'M07',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":0.5,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'estrutura',
    obs: 'Cantoneira abas desiguais — estimativa',
    condicaoAtivacao: '{"campo":"arestas","max":0}',
    ordem: 5,
  },
  // 6. SM (4 por montante)
  {
    materialCodigo: 'P01',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_montante","fatorPorUnidade":4,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SM — fixação estrutura',
    condicaoAtivacao: '{}',
    ordem: 6,
  },
  // 7. Chapas (2 faces, 1 camada)
  {
    materialCodigo: '__CHAPA__',
    tipoCalculo: 'area',
    coeficiente: 1,
    parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}',
    fatorPerda: -1,
    categoriaUso: 'chapa',
    obs: '2 faces — mobiliário',
    condicaoAtivacao: '{}',
    ordem: 7,
  },
  // 8. SP 25mm (2 faces)
  {
    materialCodigo: 'P02',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'parafuso',
    obs: 'SP25mm — fixação chapas',
    condicaoAtivacao: '{}',
    ordem: 8,
  },
  // 9. Cantoneira aresta — com arestas (condicional)
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — arestas',
    condicaoAtivacao: '{"campo":"arestas","min":0.01}',
    ordem: 9,
  },
  // 10. Cantoneira aresta — sem arestas: comp*2 (condicional)
  // Original: arestasEst = arestas > 0 ? arestas : comp * 2
  {
    materialCodigo: 'M08',
    tipoCalculo: 'perimetro',
    coeficiente: 1,
    parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Cantoneira perfurada — estimativa',
    condicaoAtivacao: '{"campo":"arestas","max":0}',
    ordem: 10,
  },
  // 11. Fita papel (2 faces)
  {
    materialCodigo: 'AC03',
    tipoCalculo: 'proporcao',
    coeficiente: 1,
    parametrosJson: '{"formula":"juntas_parede","faces":2,"camadas":1,"divisor":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Fita papel — juntas verticais',
    condicaoAtivacao: '{}',
    ordem: 11,
  },
  // 12. Massa pó (2 faces)
  {
    materialCodigo: 'AC01',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.50,"faces":2,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa — 0,50kg/m² × 2 faces',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}',
    ordem: 12,
  },
  // 12b. Massa pronta
  {
    materialCodigo: 'AC02',
    tipoCalculo: 'densidade',
    coeficiente: 1,
    parametrosJson: '{"consumoKgM2":0.70,"faces":2,"camadas":1,"divisorEmbalagem":1}',
    fatorPerda: -1,
    categoriaUso: 'acabamento',
    obs: 'Massa pronta — 0,70kg/m² × 2 faces',
    condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}',
    ordem: 12,
  },
  // 13. Reforço madeira
  {
    materialCodigo: 'R01',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"valor":1}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Reforço madeira',
    condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"madeira"},{"campo":"qtdReforco","min":1}]}',
    ordem: 13,
  },
  // 14. Reforço chapa aço
  {
    materialCodigo: 'R02',
    tipoCalculo: 'peca_fixa',
    coeficiente: 1,
    parametrosJson: '{"porReforco":true,"areaPorUnidade":0.50}',
    fatorPerda: -1,
    categoriaUso: 'reforco',
    obs: 'Reforço chapa aço — ~0,5m² cada',
    condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"chapa_aco"},{"campo":"qtdReforco","min":1}]}',
    ordem: 14,
  },
];


// ────────────────────────────────────────────────────────────
// ASSEMBLE ALL TEMPLATES
// ────────────────────────────────────────────────────────────

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    id: 'S01',
    nome: 'Parede de Vedação Simples',
    sigla: 'PVS',
    descricao: 'Camada única de chapa em cada face. Modulação selecionável (600/400mm).',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: true, temCamadaDupla: false,
      temIsolamento: true, temAreaUmida: true, temF530: false,
      temTamanhoChapa: true, temTabicaCantoneira: false,
      temMontantesDuplos: true, modFixa: null,
    }),
    ordem: 1,
    itens: S01_ITENS,
  },
  {
    id: 'S02',
    nome: 'Parede de Vedação Dupla (2+2)',
    sigla: 'PVD',
    descricao: 'Duas camadas de chapa em cada face. Maior desempenho acústico e ao fogo.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: true, temCamadaDupla: true,
      temIsolamento: true, temAreaUmida: true, temF530: false,
      temTamanhoChapa: true, temTabicaCantoneira: false,
      temMontantesDuplos: true, modFixa: null,
    }),
    ordem: 2,
    itens: S02_ITENS,
  },
  {
    id: 'S03',
    nome: 'Parede Curva',
    sigla: 'PC',
    descricao: 'Guias flexíveis com montantes a 300mm fixo. Usa chapa flexível ou ST.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: true, temCamadaDupla: false,
      temIsolamento: false, temAreaUmida: false, temF530: false,
      temTamanhoChapa: false, temTabicaCantoneira: false,
      temMontantesDuplos: false, modFixa: 300,
    }),
    ordem: 3,
    itens: S03_ITENS,
  },
  {
    id: 'S04',
    nome: 'Revestimento Estruturado (Contra-parede)',
    sigla: 'RE',
    descricao: 'Uma face apenas, perfis ômega ou F530. Para revestimento de paredes existentes.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: true, temCamadaDupla: false,
      temIsolamento: false, temAreaUmida: false, temF530: true,
      temTamanhoChapa: true, temTabicaCantoneira: false,
      temMontantesDuplos: false, modFixa: null,
    }),
    ordem: 4,
    itens: S04_ITENS,
  },
  {
    id: 'S05',
    nome: 'Revestimento Direto (Colado)',
    sigla: 'RD',
    descricao: 'Sem estrutura metálica, colagem direta com gesso cola.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: false, temCamadaDupla: false,
      temIsolamento: false, temAreaUmida: true, temF530: false,
      temTamanhoChapa: true, temTabicaCantoneira: false,
      temMontantesDuplos: false, modFixa: null,
    }),
    ordem: 5,
    itens: S05_ITENS,
  },
  {
    id: 'S06',
    nome: 'Forro Estruturado (FDE)',
    sigla: 'FDE',
    descricao: 'Canaletas F530, pendurais, reguladores. Tabica ou cantoneira 25x30. Modulação 600/400/300mm.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: false, temCamadaDupla: false,
      temIsolamento: true, temAreaUmida: false, temF530: true,
      temTamanhoChapa: true, temTabicaCantoneira: true,
      temMontantesDuplos: false, modFixa: null,
    }),
    ordem: 6,
    itens: S06_ITENS,
  },
  {
    id: 'S07',
    nome: 'Forro Aramado (FWA)',
    sigla: 'FWA',
    descricao: 'Arame galvanizado nº18, nervuras, reguladores.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: false, temCamadaDupla: false,
      temIsolamento: true, temAreaUmida: false, temF530: false,
      temTamanhoChapa: false, temTabicaCantoneira: false,
      temMontantesDuplos: false, modFixa: null,
    }),
    ordem: 7,
    itens: S07_ITENS,
  },
  {
    id: 'S08',
    nome: 'Mobiliário (Nichos/Estantes/Closets)',
    sigla: 'MOB',
    descricao: 'Volumetria interna com alto consumo de estrutura.',
    configJson: JSON.stringify({
      temChapa: true, temModulacao: false, temCamadaDupla: false,
      temIsolamento: false, temAreaUmida: false, temF530: false,
      temTamanhoChapa: true, temTabicaCantoneira: false,
      temMontantesDuplos: true, modFixa: null,
    }),
    ordem: 8,
    itens: S08_ITENS,
  },
];
