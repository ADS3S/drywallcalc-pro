// ============================================================
// DrywallCalc Pro — Offline-First Database (IndexedDB via Dexie)
// Replaces Prisma/SQLite for client-side storage
// ============================================================
import Dexie, { type EntityTable } from 'dexie'

// ── TYPES ──
export interface MaterialRow {
  id: string
  codigo: string
  nome: string
  variante: string
  categoria: string
  unidadeCompra: string
  qtdPorEmbalagem: number
  precoEmbalagem: number
  unidadeConsumo: string
  fatorPerda: number
  obs: string
  ativo: boolean
}

export interface TemplateRow {
  id: string
  nome: string
  sigla: string
  descricao: string
  configJson: string
  ativo: boolean
  ordem: number
}

export interface TemplateItemRow {
  id: string
  templateId: string
  materialId: string
  materialCodigo: string
  tipoCalculo: string
  coeficiente: number
  parametrosJson: string
  fatorPerda: number
  categoriaUso: string
  obs: string
  condicaoAtivacao: string
  ordem: number
  ativo: boolean
}

export interface ConfigRow {
  id: string
  peDireito: number
  modulacaoMontante: number
  margem: number
  desconto: number
  perda: number
}

// ── DATABASE ──
class DrywallDB extends Dexie {
  materiais!: EntityTable<MaterialRow, 'id'>
  templates!: EntityTable<TemplateRow, 'id'>
  templateItens!: EntityTable<TemplateItemRow, 'id'>
  config!: EntityTable<ConfigRow, 'id'>

  constructor() {
    super('DrywallCalcPro')
    this.version(1).stores({
      materiais: 'id, codigo, categoria, ativo',
      templates: 'id, ativo, ordem',
      templateItens: 'id, templateId, materialCodigo, ordem, ativo',
      config: 'id',
    })
  }
}

export const db = new DrywallDB()

// ── HELPERS ──
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ── SEED ──
import { SEED_MATERIAIS, SEED_TEMPLATES, type SeedMaterial, type SeedTemplate, type SeedTemplateItem } from './engine/seed-data'

export async function seedDatabase(): Promise<{ materiais: number; templates: number; itens: number }> {
  // Clear existing data
  await db.materiais.clear()
  await db.templateItens.clear()
  await db.templates.clear()

  // Seed materials
  const matRows: MaterialRow[] = SEED_MATERIAIS.map((m: SeedMaterial) => ({
    id: `mat_${m.codigo.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    codigo: m.codigo,
    nome: m.nome,
    variante: m.variante,
    categoria: m.categoria,
    unidadeCompra: m.unidadeCompra,
    qtdPorEmbalagem: m.qtdPorEmbalagem,
    precoEmbalagem: m.precoEmbalagem,
    unidadeConsumo: m.unidadeConsumo,
    fatorPerda: m.fatorPerda,
    obs: m.obs,
    ativo: true,
  }))

  // Seed templates
  let totalItens = 0
  const tplRows: TemplateRow[] = []
  const itemRows: TemplateItemRow[] = []

  for (const tpl of SEED_TEMPLATES as SeedTemplate[]) {
    tplRows.push({
      id: tpl.id,
      nome: tpl.nome,
      sigla: tpl.sigla,
      descricao: tpl.descricao,
      configJson: tpl.configJson,
      ativo: true,
      ordem: tpl.ordem,
    })

    for (const item of tpl.itens as SeedTemplateItem[]) {
      const matId = matRows.find(m => m.codigo === item.materialCodigo)?.id || ''
      itemRows.push({
        id: `${tpl.id}_item_${item.ordem}_${uid()}`,
        templateId: tpl.id,
        materialId: matId,
        materialCodigo: item.materialCodigo,
        tipoCalculo: item.tipoCalculo,
        coeficiente: item.coeficiente,
        parametrosJson: item.parametrosJson,
        fatorPerda: item.fatorPerda,
        categoriaUso: item.categoriaUso,
        obs: item.obs,
        condicaoAtivacao: item.condicaoAtivacao,
        ordem: item.ordem,
        ativo: true,
      })
      totalItens++
    }
  }

  // Seed default config
  await db.config.put({
    id: 'global',
    peDireito: 3,
    modulacaoMontante: 600,
    margem: 20,
    desconto: 0,
    perda: 10,
  })

  await db.materiais.bulkPut(matRows)
  await db.templates.bulkPut(tplRows)
  await db.templateItens.bulkPut(itemRows)

  return { materiais: matRows.length, templates: tplRows.length, itens: totalItens }
}

// ── CONVENIENCE QUERIES ──

export async function getAllMateriais(): Promise<MaterialRow[]> {
  const all = await db.materiais.toArray()
  return all.filter(m => m.ativo)
}

export async function getAllTemplatesWithItens(): Promise<(TemplateRow & { itens: TemplateItemRow[] })[]> {
  const all = await db.templates.toArray()
  const tpls = all.filter(t => t.ativo).sort((a, b) => a.ordem - b.ordem)
  const result: (TemplateRow & { itens: TemplateItemRow[] })[] = []
  for (const tpl of tpls) {
    const itens = await db.templateItens
      .where('templateId').equals(tpl.id)
      .sortBy('ordem')
    result.push({ ...tpl, itens: itens.filter(i => i.ativo) })
  }
  return result
}

export async function getConfig(): Promise<ConfigRow> {
  let cfg = await db.config.get('global')
  if (!cfg) {
    cfg = { id: 'global', peDireito: 3, modulacaoMontante: 600, margem: 20, desconto: 0, perda: 10 }
    await db.config.put(cfg)
  }
  return cfg
}

export async function saveConfig(cfg: ConfigRow): Promise<void> {
  await db.config.put({ ...cfg, id: 'global' })
}

export async function saveMaterial(mat: Omit<MaterialRow, 'id'> & { id?: string }): Promise<string> {
  const id = mat.id || `mat_${uid()}`
  await db.materiais.put({ ...mat, id })
  return id
}

export async function deleteMaterial(id: string): Promise<void> {
  await db.materiais.update(id, { ativo: false })
}

export async function saveTemplate(tpl: TemplateRow & { itens: TemplateItemRow[] }): Promise<void> {
  await db.templates.put(tpl)
  // Delete existing items for this template, then re-add
  await db.templateItens.where('templateId').equals(tpl.id).delete()
  await db.templateItens.bulkPut(tpl.itens)
}

export async function createTemplate(tpl: TemplateRow): Promise<void> {
  await db.templates.put(tpl)
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templateItens.where('templateId').equals(id).delete()
  await db.templates.update(id, { ativo: false })
}
