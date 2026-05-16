'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Package, Layers, Calculator, Plus, Pencil, Trash2, Save, X, Download,
  Database, Search, ChevronDown, ChevronUp, Info, Building2, FileText,
  Ruler, Square, CircleDot, Settings2, DollarSign, Copy, RefreshCw,
  BoxSelect, Shield, Check, AlertCircle, Eye, Edit3
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { usePWAInstall } from '@/hooks/use-pwa-install'

import type {
  MaterialCategory, TipoCalculo, TipoChapa, TamanhoChapa, TipoBordaForro,
  TipoReforco, AmbienteInput, ConfigGlobal, ItemManual, ResultadoCalculo, ItemCalculado,
  AjusteItem,
} from '@/lib/engine/types'
import {
  CATEGORIAS_LABELS, UNIDADE_COMPRA_LABELS, TIPO_CALCULO_LABELS,
  TAMANHO_CHAPA_MAP, CHAPA_CODIGO_MAP,
} from '@/lib/engine/types'
import { fmtBRL, agruparPorCategoria } from '@/lib/engine/interpreter'
import { interpretarTemplate, type MaterialData, type TemplateItemData } from '@/lib/engine/interpreter'
import { db, seedDatabase, saveConfig as dbSaveConfig, saveMaterial as dbSaveMaterial, deleteMaterial as dbDeleteMaterial, saveTemplate as dbSaveTemplate, createTemplate as dbCreateTemplate, deleteTemplate as dbDeleteTemplate, getAllMateriais, getAllTemplatesWithItens, getConfig } from '@/lib/db-offline'

// ── HELPERS ──
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const CATEGORIAS: MaterialCategory[] = ['estrutura', 'chapa', 'parafuso', 'fixacao', 'isolamento', 'acabamento', 'reforco']

const CAT_COLORS: Record<MaterialCategory, string> = {
  estrutura: 'bg-amber-100 text-amber-800 border-amber-300',
  chapa: 'bg-sky-100 text-sky-800 border-sky-300',
  parafuso: 'bg-violet-100 text-violet-800 border-violet-300',
  fixacao: 'bg-rose-100 text-rose-800 border-rose-300',
  isolamento: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  acabamento: 'bg-orange-100 text-orange-800 border-orange-300',
  reforco: 'bg-gray-100 text-gray-800 border-gray-300',
}

const TIPO_CHAPA_OPTIONS: { value: TipoChapa; label: string }[] = [
  { value: 'ST', label: 'ST - Standard' },
  { value: 'RU', label: 'RU - Resistência Umidade' },
  { value: 'RF', label: 'RF - Resistência Fogo' },
  { value: 'FLEX', label: 'FLEX - Flexível' },
  { value: 'PERF', label: 'PERF - Perfurada' },
]

const TAMANHO_CHAPA_OPTIONS: { value: TamanhoChapa; label: string }[] = Object.entries(TAMANHO_CHAPA_MAP).map(
  ([k, v]) => ({ value: k as TamanhoChapa, label: v.label })
)

const ISOLAMENTO_TIPO_OPTIONS = [
  { value: 'vidro', label: 'Lã de Vidro' },
  { value: 'pet', label: 'PET / Reciclado' },
  { value: 'rocha', label: 'Lã de Rocha' },
]

// ── TYPES (local) ──
interface MaterialRecord {
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

interface TemplateItemRecord {
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
  material?: MaterialRecord
}

interface TemplateRecord {
  id: string
  nome: string
  sigla: string
  descricao: string
  configJson: string
  ordem: number
  ativo: boolean
  itens: TemplateItemRecord[]
}

// ── EMPTY MATERIAL ──
function emptyMaterial(): Omit<MaterialRecord, 'id' | 'ativo'> {
  return {
    codigo: '', nome: '', variante: '', categoria: 'estrutura',
    unidadeCompra: 'unidade', qtdPorEmbalagem: 1, precoEmbalagem: 0,
    unidadeConsumo: 'un', fatorPerda: 10, obs: '',
  }
}

// ── DEFAULT AMBIENTE ──
function defaultAmbiente(): AmbienteInput {
  return {
    id: uid(), nome: '', sistemaId: '', comprimento: 0, altura: 0, area: 0,
    perimetro: 0, arestas: 0, nVaos: 0, areaVaos: 0,
    tipoChapa: 'ST', tamanhoChapa: '1200x2400', modulacaoMM: 600, modF530MM: 600,
    camadaDupla: false, isolamento: false, isolamentoTipo: 'vidro',
    areaUmida: false, tipoBordaForro: 'tabica', tipoMassa: 'po', montantesDuplos: false,
    tipoReforco: 'nenhum', qtdReforco: 0, maoDeObra: 0,
    margem: -1, desconto: -1, itensManuais: [], ajustesItens: [], resultado: undefined,
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function Home() {
  const { isInstallable, install } = usePWAInstall()
  const [activeTab, setActiveTab] = useState('materiais')

  // ── MATERIAL STATE ──
  const [materiais, setMateriais] = useState<MaterialRecord[]>([])
  const [matLoading, setMatLoading] = useState(false)
  const [matFilter, setMatFilter] = useState<string>('todos')
  const [matDialogOpen, setMatDialogOpen] = useState(false)
  const [editingMat, setEditingMat] = useState<MaterialRecord | null>(null)
  const [matForm, setMatForm] = useState(emptyMaterial())
  const [matSearch, setMatSearch] = useState('')

  // ── TEMPLATE STATE ──
  const [templates, setTemplates] = useState<TemplateRecord[]>([])
  const [tplLoading, setTplLoading] = useState(false)
  const [tplDialogOpen, setTplDialogOpen] = useState(false)
  const [editingTpl, setEditingTpl] = useState<TemplateRecord | null>(null)
  const [tplForm, setTplForm] = useState<{ nome: string; sigla: string; descricao: string; configJson: string; itens: TemplateItemRecord[] }>({
    nome: '', sigla: '', descricao: '', configJson: '{}', itens: [],
  })
  const [newTplDialogOpen, setNewTplDialogOpen] = useState(false)
  const [newTplForm, setNewTplForm] = useState({ id: '', nome: '', sigla: '', descricao: '', configJson: '{}' })

  // ── ORÇAMENTO STATE ──
  const [orcPhase, setOrcPhase] = useState<1 | 2 | 3>(1)
  const [cliente, setCliente] = useState({ nome: '', telefone: '', validade: '' })
  const [config, setConfig] = useState<ConfigGlobal>({ peDireito: 3, modulacaoMontante: 600, margem: 20, desconto: 0, perda: 10 })
  const [ambientes, setAmbientes] = useState<AmbienteInput[]>([])
  const [ambDialogOpen, setAmbDialogOpen] = useState(false)
  const [editingAmb, setEditingAmb] = useState<AmbienteInput | null>(null)
  const [ambForm, setAmbForm] = useState<AmbienteInput>(defaultAmbiente())
  const [ambCalculando, setAmbCalculando] = useState(false)

  // ════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ════════════════════════════════════════════════════════════════
  const loadMateriais = useCallback(async () => {
    setMatLoading(true)
    try {
      const data = await getAllMateriais()
      setMateriais(data.sort((a, b) => a.categoria.localeCompare(b.categoria) || a.codigo.localeCompare(b.codigo)))
    } catch { toast.error('Erro ao carregar materiais') }
    finally { setMatLoading(false) }
  }, [])

  const loadTemplates = useCallback(async () => {
    setTplLoading(true)
    try {
      const data = await getAllTemplatesWithItens()
      // Precisamos carregar materiais primeiro para fazer o join
      const matsData = await getAllMateriais()
      setTemplates(data.map(t => ({
        ...t,
        itens: t.itens.map(i => ({
          ...i,
          material: matsData.find(m => m.id === i.materialId) as MaterialRecord | undefined,
        })),
      })))
    } catch { toast.error('Erro ao carregar templates') }
    finally { setTplLoading(false) }
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const data = await getConfig()
      setConfig({
        peDireito: data.peDireito ?? 3,
        modulacaoMontante: data.modulacaoMontante ?? 600,
        margem: data.margem ?? 20,
        desconto: data.desconto ?? 0,
        perda: data.perda ?? 10,
      })
    } catch { /* silent */ }
  }, [])

  useEffect(() => { loadMateriais() }, [loadMateriais])
  useEffect(() => { loadTemplates() }, [loadTemplates])
  useEffect(() => { loadConfig() }, [loadConfig])

  // ════════════════════════════════════════════════════════════════
  // MATERIAL CRUD
  // ════════════════════════════════════════════════════════════════
  const handleSeed = async () => {
    try {
      const stats = await seedDatabase()
      toast.success(`Base carregada: ${stats.materiais} materiais, ${stats.templates} sistemas`)
      loadMateriais()
      loadTemplates()
      loadConfig()
    } catch { toast.error('Erro ao carregar base') }
  }

  const handleSaveMat = async () => {
    if (!matForm.codigo || !matForm.nome) {
      toast.error('Código e Nome são obrigatórios')
      return
    }
    try {
      if (editingMat) {
        await dbSaveMaterial({ ...matForm, id: editingMat.id, ativo: true })
        toast.success('Material atualizado')
      } else {
        await dbSaveMaterial({ ...matForm, ativo: true })
        toast.success('Material criado')
      }
      setMatDialogOpen(false)
      setEditingMat(null)
      setMatForm(emptyMaterial())
      loadMateriais()
    } catch { toast.error('Erro ao salvar material') }
  }

  const handleDeleteMat = async (id: string) => {
    if (!confirm('Excluir este material?')) return
    try {
      await dbDeleteMaterial(id)
      toast.success('Material excluído')
      loadMateriais()
    } catch { toast.error('Erro ao excluir') }
  }

  const openNewMat = () => {
    setEditingMat(null)
    setMatForm(emptyMaterial())
    setMatDialogOpen(true)
  }

  const openEditMat = (m: MaterialRecord) => {
    setEditingMat(m)
    setMatForm({
      codigo: m.codigo, nome: m.nome, variante: m.variante, categoria: m.categoria,
      unidadeCompra: m.unidadeCompra, qtdPorEmbalagem: m.qtdPorEmbalagem,
      precoEmbalagem: m.precoEmbalagem, unidadeConsumo: m.unidadeConsumo,
      fatorPerda: m.fatorPerda, obs: m.obs,
    })
    setMatDialogOpen(true)
  }

  // ── FILTERED MATERIAIS ──
  const filteredMateriais = materiais.filter(m => {
    if (matFilter !== 'todos' && m.categoria !== matFilter) return false
    if (matSearch) {
      const s = matSearch.toLowerCase()
      return m.codigo.toLowerCase().includes(s) || m.nome.toLowerCase().includes(s) || m.variante.toLowerCase().includes(s)
    }
    return true
  })

  // ════════════════════════════════════════════════════════════════
  // TEMPLATE CRUD
  // ════════════════════════════════════════════════════════════════
  const openEditTpl = (t: TemplateRecord) => {
    setEditingTpl(t)
    setTplForm({
      nome: t.nome, sigla: t.sigla, descricao: t.descricao,
      configJson: t.configJson,
      itens: t.itens.map(i => ({ ...i })),
    })
    setTplDialogOpen(true)
  }

  const handleSaveTpl = async () => {
    if (!editingTpl) return
    try {
      await dbSaveTemplate({
        id: editingTpl.id,
        nome: tplForm.nome,
        sigla: tplForm.sigla,
        descricao: tplForm.descricao,
        configJson: tplForm.configJson,
        ativo: true,
        ordem: editingTpl.ordem || 0,
        itens: tplForm.itens.map((item, idx) => ({
          id: item.id || `${editingTpl.id}_item_${idx}_${uid()}`,
          templateId: editingTpl.id,
          materialId: item.materialId,
          materialCodigo: item.materialCodigo,
          tipoCalculo: item.tipoCalculo,
          coeficiente: item.coeficiente,
          parametrosJson: item.parametrosJson,
          fatorPerda: item.fatorPerda,
          categoriaUso: item.categoriaUso,
          obs: item.obs,
          condicaoAtivacao: item.condicaoAtivacao,
          ordem: idx,
          ativo: item.ativo,
        })),
      })
      toast.success('Template salvo')
      loadTemplates()
      setTplDialogOpen(false)
      setEditingTpl(null)
    } catch { toast.error('Erro ao salvar template') }
  }

  const handleCreateTpl = async () => {
    if (!newTplForm.id || !newTplForm.nome || !newTplForm.sigla) {
      toast.error('ID, Nome e Sigla são obrigatórios')
      return
    }
    try {
      await dbCreateTemplate({
        id: newTplForm.id,
        nome: newTplForm.nome,
        sigla: newTplForm.sigla,
        descricao: newTplForm.descricao,
        configJson: newTplForm.configJson,
        ativo: true,
        ordem: (await db.templates.count()) + 1,
      })
      toast.success('Sistema criado')
      loadTemplates()
      setNewTplDialogOpen(false)
      setNewTplForm({ id: '', nome: '', sigla: '', descricao: '', configJson: '{}' })
    } catch { toast.error('Erro ao criar sistema') }
  }

  const handleDeleteTpl = async (id: string) => {
    if (!confirm('Excluir este sistema e todos os seus itens?')) return
    try {
      await dbDeleteTemplate(id)
      toast.success('Sistema excluído')
      loadTemplates()
    } catch { toast.error('Erro ao excluir') }
  }

  // ── DEFAULTS POR MATERIAL (auto-fill ao selecionar) ──
  const MATERIAL_DEFAULTS: Record<string, { tipoCalculo: string; parametrosJson: string; categoriaUso: string; condicaoAtivacao: string; obs: string }> = {
    // Chapas
    'C01': { tipoCalculo: 'area', parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}', categoriaUso: 'chapa', condicaoAtivacao: '{}', obs: 'Chapas — 2 faces × 1 camada' },
    'C02': { tipoCalculo: 'area', parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}', categoriaUso: 'chapa', condicaoAtivacao: '{}', obs: 'Chapas — 2 faces × 1 camada' },
    'C03': { tipoCalculo: 'area', parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}', categoriaUso: 'chapa', condicaoAtivacao: '{}', obs: 'Chapas — 2 faces × 1 camada' },
    'C04': { tipoCalculo: 'area', parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}', categoriaUso: 'chapa', condicaoAtivacao: '{}', obs: 'Chapas — 2 faces × 1 camada' },
    'C05': { tipoCalculo: 'area', parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}', categoriaUso: 'chapa', condicaoAtivacao: '{}', obs: 'Chapas — 2 faces × 1 camada' },
    // Perfis de Estrutura
    'M01':   { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Guia piso+teto' },
    'M01-70': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Guia piso+teto' },
    'M01-90': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Guia piso+teto' },
    'M02':   { tipoCalculo: 'modulacao', parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Montantes — barra 3m' },
    'M02-70': { tipoCalculo: 'modulacao', parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Montantes — barra 3m' },
    'M02-90': { tipoCalculo: 'modulacao', parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Montantes — barra 3m' },
    'M03': { tipoCalculo: 'modulacao', parametrosJson: '{"tipoModulacao":"forro","divirBarra":true,"pendurais":true,"espacamentoPendural":1.20}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Canaletas F530 — barra 3m' },
    'M04': { tipoCalculo: 'modulacao', parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Perfis ômega' },
    'M05': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"perimetroForro","multiplicador":1,"divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Cantoneira 25×30 perimetral' },
    'M06': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"perimetroForro","multiplicador":1,"divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Tabica perimetral' },
    'M07': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":1,"divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Cantoneira abas desiguais' },
    'M08': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}', categoriaUso: 'acabamento', condicaoAtivacao: '{}', obs: 'Cantoneira perfurada — arestas' },
    'M09': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"arestas","multiplicador":1,"divirBarra":true}', categoriaUso: 'acabamento', condicaoAtivacao: '{}', obs: 'Cantoneira PVC flexível — arestas' },
    'M10': { tipoCalculo: 'peca_fixa', parametrosJson: '{"valor":1}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Perfil H (junção)' },
    'M11': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_pendural","fatorPorUnidade":1,"divisor":1}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Pendurais/Suportes nivelador' },
    'M11-M': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_pendural","fatorPorUnidade":1,"divisor":1}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Pendurais/Suportes mola' },
    'M12': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_pendural","fatorPorUnidade":1,"divisor":1}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: 'Reguladores F530' },
    // Parafusos
    'P01': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_montante","fatorPorUnidade":4,"divisor":1}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: 'SM fixação estrutura guia↔montante' },
    'P02': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: 'SP25mm — fixação chapas 1ª camada' },
    'P03': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: 'SP35mm — fixação chapas 2ª camada' },
    'P04': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.25,"divisor":1}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: 'SP40mm reforçado — fixação chapas 2ª camada' },
    'P05': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_area_chapa","faces":2,"espacamento":0.40,"divisor":1}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: 'SD — chapa↔chapa' },
    'P06': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: 'Ancoragem perimetral — 1 a cada 600mm' },
    // Fixação
    'A01': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"espacamento":0.60,"divirBarra":false}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: 'Buchas ancoragem' },
    'A02': { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false,"consumoM2":0.10}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: 'Tirante — 0,10kg/m²' },
    'A03': { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false,"consumoM2":0.15}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: 'Arame — 0,15kg/m²' },
    'A04': { tipoCalculo: 'peca_fixa', parametrosJson: '{"valor":1}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: 'Pino de aço (fincapino)' },
    'A05': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_montante","fatorPorUnidade":3,"divisor":1}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: 'Presilhas fixação ômega' },
    'A06': { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false,"consumoM2":3}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: 'Gesso cola — 3kg/m²' },
    // Isolamento
    'I01': { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}', categoriaUso: 'isolamento', condicaoAtivacao: '{}', obs: 'Isolamento térmico/acústico' },
    'I02': { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}', categoriaUso: 'isolamento', condicaoAtivacao: '{}', obs: 'Isolamento térmico/acústico' },
    'I03': { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}', categoriaUso: 'isolamento', condicaoAtivacao: '{}', obs: 'Isolamento térmico/acústico' },
    // Acabamento
    'AC01': { tipoCalculo: 'densidade', parametrosJson: '{"consumoKgM2":0.50,"faces":2,"camadas":1,"divisorEmbalagem":1}', categoriaUso: 'acabamento', condicaoAtivacao: '{"campo":"tipoMassa","valor":"po"}', obs: 'Massa — 0,50kg/m² por face' },
    'AC02': { tipoCalculo: 'densidade', parametrosJson: '{"consumoKgM2":0.70,"faces":2,"camadas":1,"divisorEmbalagem":1}', categoriaUso: 'acabamento', condicaoAtivacao: '{"campo":"tipoMassa","valor":"pronta"}', obs: 'Massa pronta — 0,70kg/m² por face' },
    'AC03': { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"juntas_parede","faces":2,"camadas":1,"divisor":1}', categoriaUso: 'acabamento', condicaoAtivacao: '{}', obs: 'Fita papel — juntas verticais' },
    'AC04': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":false}', categoriaUso: 'acabamento', condicaoAtivacao: '{}', obs: 'Banda acústica piso+teto (ML)' },
    // Reforços
    'R01': { tipoCalculo: 'peca_fixa', parametrosJson: '{"porReforco":true,"valor":1}', categoriaUso: 'reforco', condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"madeira"},{"campo":"qtdReforco","min":1}]}', obs: 'Reforço madeira' },
    'R02': { tipoCalculo: 'peca_fixa', parametrosJson: '{"porReforco":true,"areaPorUnidade":0.50}', categoriaUso: 'reforco', condicaoAtivacao: '{"e":[{"campo":"tipoReforco","valor":"chapa_aco"},{"campo":"qtdReforco","min":1}]}', obs: 'Reforço chapa aço — ~0,5m² cada' },
    'R03': { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":1,"divirBarra":true}', categoriaUso: 'reforco', condicaoAtivacao: '{}', obs: 'Nervura (forro aramado)' },
  }

  // Fallback por categoria de material
  const CATEGORY_DEFAULTS: Record<string, { tipoCalculo: string; parametrosJson: string; categoriaUso: string; condicaoAtivacao: string; obs: string }> = {
    'chapa':       { tipoCalculo: 'area', parametrosJson: '{"faces":2,"camadas":1,"divisorArea":true}', categoriaUso: 'chapa', condicaoAtivacao: '{}', obs: '' },
    'estrutura':   { tipoCalculo: 'modulacao', parametrosJson: '{"tipoModulacao":"montante","divirBarra":true}', categoriaUso: 'estrutura', condicaoAtivacao: '{}', obs: '' },
    'parafuso':    { tipoCalculo: 'proporcao', parametrosJson: '{"formula":"por_montante","fatorPorUnidade":4,"divisor":1}', categoriaUso: 'parafuso', condicaoAtivacao: '{}', obs: '' },
    'fixacao':     { tipoCalculo: 'perimetro', parametrosJson: '{"base":"comprimento","multiplicador":2,"divirBarra":true}', categoriaUso: 'fixacao', condicaoAtivacao: '{}', obs: '' },
    'isolamento':  { tipoCalculo: 'area', parametrosJson: '{"faces":1,"camadas":1,"divisorArea":false}', categoriaUso: 'isolamento', condicaoAtivacao: '{}', obs: '' },
    'acabamento':  { tipoCalculo: 'densidade', parametrosJson: '{"consumoKgM2":0.50,"faces":2,"camadas":1,"divisorEmbalagem":1}', categoriaUso: 'acabamento', condicaoAtivacao: '{}', obs: '' },
    'reforco':     { tipoCalculo: 'peca_fixa', parametrosJson: '{"valor":1}', categoriaUso: 'reforco', condicaoAtivacao: '{}', obs: '' },
  }

  /** Retorna os defaults para um material (código → categoria fallback) */
  const getDefaultsForMaterial = (mat: MaterialRecord) => {
    const byCode = MATERIAL_DEFAULTS[mat.codigo]
    if (byCode) return byCode
    const byCategory = CATEGORY_DEFAULTS[mat.categoria]
    if (byCategory) return byCategory
    // Ultimo fallback
    return { tipoCalculo: 'area', parametrosJson: '{}', categoriaUso: mat.categoria || '', condicaoAtivacao: '{}', obs: '' }
  }

  const addTplItem = () => {
    if (materiais.length === 0) { toast.error('Carregue materiais primeiro'); return }
    const firstMat = materiais[0]
    const defaults = getDefaultsForMaterial(firstMat)
    setTplForm(prev => ({
      ...prev,
      itens: [...prev.itens, {
        id: `new_${uid()}`, templateId: editingTpl?.id || '', materialId: firstMat.id,
        materialCodigo: firstMat.codigo,
        tipoCalculo: defaults.tipoCalculo, coeficiente: 1,
        parametrosJson: defaults.parametrosJson, fatorPerda: -1,
        categoriaUso: defaults.categoriaUso, obs: defaults.obs,
        condicaoAtivacao: defaults.condicaoAtivacao, ordem: prev.itens.length, ativo: true, material: firstMat,
      }],
    }))
  }

  const removeTplItem = (idx: number) => {
    setTplForm(prev => ({ ...prev, itens: prev.itens.filter((_, i) => i !== idx) }))
  }

  const updateTplItem = (idx: number, field: string, value: unknown) => {
    setTplForm(prev => {
      const itens = [...prev.itens]
      itens[idx] = { ...itens[idx], [field]: value }
      if (field === 'materialId') {
        const mat = materiais.find(m => m.id === value)
        if (mat) {
          itens[idx].materialCodigo = mat.codigo
          itens[idx].material = mat
          // Auto-fill: carregar defaults do material
          const defaults = getDefaultsForMaterial(mat)
          itens[idx].tipoCalculo = defaults.tipoCalculo
          itens[idx].parametrosJson = defaults.parametrosJson
          itens[idx].categoriaUso = defaults.categoriaUso
          itens[idx].condicaoAtivacao = defaults.condicaoAtivacao
          itens[idx].obs = defaults.obs
        }
      }
      return { ...prev, itens }
    })
  }

  // ── PARSE TEMPLATE CONFIG ──
  function parseTplConfig(json: string): Record<string, boolean> {
    try { return JSON.parse(json || '{}') } catch { return {} }
  }

  // ════════════════════════════════════════════════════════════════
  // ORÇAMENTO LOGIC
  // ════════════════════════════════════════════════════════════════
  const startOrc = () => {
    if (!cliente.nome) { toast.error('Informe o nome do cliente'); return }
    setOrcPhase(2)
  }

  /** Cálculo local usando o motor diretamente (sem API) */
  const calcularLocal = (amb: AmbienteInput, cfg: ConfigGlobal): ResultadoCalculo => {
    // Preparar materiais
    const mats: MaterialData[] = materiais.map(m => ({
      id: m.id, codigo: m.codigo, nome: m.nome, variante: m.variante,
      categoria: m.categoria, unidadeCompra: m.unidadeCompra,
      qtdPorEmbalagem: m.qtdPorEmbalagem, precoEmbalagem: m.precoEmbalagem,
      unidadeConsumo: m.unidadeConsumo, fatorPerda: m.fatorPerda, obs: m.obs,
    }))

    // Preparar template itens
    const tpl = templates.find(t => t.id === amb.sistemaId)
    if (!tpl) throw new Error('Sistema não encontrado')

    const tplItens: TemplateItemData[] = tpl.itens.map(i => ({
      id: i.id, templateId: i.templateId, materialCodigo: i.materialCodigo,
      materialId: i.materialId, tipoCalculo: i.tipoCalculo, coeficiente: i.coeficiente,
      parametrosJson: i.parametrosJson, fatorPerda: i.fatorPerda, categoriaUso: i.categoriaUso,
      obs: i.obs, condicaoAtivacao: i.condicaoAtivacao, ordem: i.ordem, ativo: i.ativo,
      materialNome: i.material?.nome, materialVariante: i.material?.variante,
      materialCategoria: i.material?.categoria, materialUnidadeCompra: i.material?.unidadeCompra,
      materialQtdPorEmbalagem: i.material?.qtdPorEmbalagem, materialPrecoEmbalagem: i.material?.precoEmbalagem,
      materialUnidadeConsumo: i.material?.unidadeConsumo, materialFatorPerda: i.material?.fatorPerda,
      materialObs: i.material?.obs,
    }))

    return interpretarTemplate(amb, mats, tplItens, cfg)
  }

  const saveConfig = async (newConfig: ConfigGlobal) => {
    try {
      await dbSaveConfig({ id: 'global', ...newConfig })
      setConfig(newConfig)
      // Recalcular todos os ambientes com a nova config (local engine)
      if (ambientes.length > 0) {
        toast.info('Recalculando ambientes...')
        const recalculados = ambientes.map((amb) => {
          if (!amb.sistemaId || !amb.resultado) return amb
          try {
            const resultado = calcularLocal(amb, newConfig)
            return { ...amb, resultado, margem: -1, desconto: -1 }
          } catch { return amb }
        })
        setAmbientes(recalculados)
        toast.success('Ambientes recalculados')
      }
    } catch { toast.error('Erro ao salvar config') }
  }

  const openNewAmb = () => {
    setEditingAmb(null)
    setAmbForm(defaultAmbiente())
    setAmbDialogOpen(true)
  }

  const openEditAmb = (amb: AmbienteInput) => {
    setEditingAmb(amb)
    setAmbForm({ ...amb })
    setAmbDialogOpen(true)
  }

  const handleCalcular = async () => {
    if (!ambForm.sistemaId) { toast.error('Selecione um sistema'); return }
    if (!ambForm.area || ambForm.area <= 0) { toast.error('Informe a área'); return }
    setAmbCalculando(true)
    try {
      const resultado = calcularLocal(ambForm, config)
      setAmbForm(prev => ({ ...prev, resultado }))
      toast.success('Cálculo realizado')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro no cálculo')
    }
    finally { setAmbCalculando(false) }
  }

  const saveAmbiente = () => {
    if (!ambForm.nome) { toast.error('Nome do ambiente é obrigatório'); return }
    if (!ambForm.resultado) { toast.error('Calcule antes de salvar'); return }
    const exists = ambientes.find(a => a.id === ambForm.id)
    if (exists) {
      setAmbientes(prev => prev.map(a => a.id === ambForm.id ? { ...ambForm } : a))
    } else {
      setAmbientes(prev => [...prev, { ...ambForm }])
    }
    setAmbDialogOpen(false)
    toast.success('Ambiente salvo')
  }

  const removeAmbiente = (id: string) => {
    if (!confirm('Remover este ambiente?')) return
    setAmbientes(prev => prev.filter(a => a.id !== id))
  }

  const addItemManual = () => {
    setAmbForm(prev => ({
      ...prev,
      itensManuais: [...prev.itensManuais, { id: uid(), descricao: '', unidade: 'un', quantidade: 1, precoUnitario: 0, valor: 0 }],
    }))
  }

  const updateItemManual = (idx: number, field: string, value: unknown) => {
    setAmbForm(prev => {
      const itens = [...prev.itensManuais]
      itens[idx] = { ...itens[idx], [field]: value }
      if (field === 'quantidade' || field === 'precoUnitario') {
        const q = field === 'quantidade' ? Number(value) : itens[idx].quantidade
        const p = field === 'precoUnitario' ? Number(value) : itens[idx].precoUnitario
        itens[idx].valor = q * p
      }
      return { ...prev, itensManuais: itens }
    })
  }

  const removeItemManual = (idx: number) => {
    setAmbForm(prev => ({ ...prev, itensManuais: prev.itensManuais.filter((_, i) => i !== idx) }))
  }

  const updateAjusteItem = (templateItemId: string, qtdAdicional: number) => {
    setAmbForm(prev => {
      const ajustes = [...(prev.ajustesItens || [])]
      const idx = ajustes.findIndex(a => a.templateItemId === templateItemId)
      if (idx >= 0) {
        if (qtdAdicional <= 0) {
          ajustes.splice(idx, 1)  // remove se zero ou negativo
        } else {
          ajustes[idx] = { ...ajustes[idx], quantidadeAdicional: qtdAdicional }
        }
      } else if (qtdAdicional > 0) {
        ajustes.push({ templateItemId, quantidadeAdicional: qtdAdicional })
      }
      return { ...prev, ajustesItens: ajustes }
    })
  }

  const getAjusteItem = (templateItemId: string): number => {
    return ambForm.ajustesItens?.find(a => a.templateItemId === templateItemId)?.quantidadeAdicional || 0
  }

  const finishOrc = () => setOrcPhase(3)
  const newOrc = () => { setOrcPhase(1); setCliente({ nome: '', telefone: '', validade: '' }); setAmbientes([]) }

  // ── TOTALS ──
  const orcTotals = ambientes.reduce((acc, amb) => {
    const r = amb.resultado
    if (!r) return acc
    return {
      custoMateriais: acc.custoMateriais + r.custoMateriais + r.custoItensManuais,
      maoDeObra: acc.maoDeObra + r.maoDeObra,
      lucro: acc.lucro + r.lucro,
      desconto: acc.desconto + r.valorDesconto,
      total: acc.total + r.total,
    }
  }, { custoMateriais: 0, maoDeObra: 0, lucro: 0, desconto: 0, total: 0 })

  // ── SHARED PDF STYLE ──
  const pdfBaseStyle = `
    body{font-family:Arial,sans-serif;margin:40px;color:#1a1a1a;font-size:13px}
    h1{color:#ea580c;font-size:22px;margin-bottom:4px}
    h2{color:#ea580c;font-size:16px;border-bottom:2px solid #ea580c;padding-bottom:4px;margin-top:24px}
    h3{font-size:14px;margin-bottom:8px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:12px;table-layout:fixed}
    th{background:#f97316;color:white;padding:6px 8px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
    .col-material{width:44%}
    .col-qtd{width:12%;text-align:center}
    .col-perda{width:10%;text-align:center}
    .col-qtd-perda{width:14%;text-align:center}
    .col-custo{width:20%;text-align:right}
    tr:nth-child(even){background:#fef3c7}
    .right{text-align:right}
    .total-row{font-weight:bold;background:#fff7ed}
    .info-box{background:#fff7ed;border:1px solid #fed7aa;padding:12px;border-radius:6px;margin-bottom:20px}
    .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;margin-right:4px}
    .badge-estrutura{background:#fef3c7;color:#92400e}
    .badge-chapa{background:#e0f2fe;color:#075985}
    .badge-parafuso{background:#ede9fe;color:#5b21b6}
    .badge-fixacao{background:#ffe4e6;color:#9f1239}
    .badge-isolamento{background:#d1fae5;color:#065f46}
    .badge-acabamento{background:#ffedd5;color:#9a3412}
    .badge-reforco{background:#f3f4f6;color:#374151}
    @media print{body{margin:20px}}
  `

  const pdfHeader = (now: string) => {
    let h = `<h1>DrywallCalc Pro</h1><p style="color:#666;margin:0">Proposta de Orçamento</p>`
    h += `<div class="info-box"><strong>Cliente:</strong> ${cliente.nome}<br>`
    if (cliente.telefone) h += `<strong>Telefone:</strong> ${cliente.telefone}<br>`
    h += `<strong>Data:</strong> ${now}`
    if (cliente.validade) h += ` &nbsp;|&nbsp; <strong>Validade:</strong> ${cliente.validade}`
    h += `</div>`
    return h
  }

  const openPrintWindow = (html: string) => {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 500)
    }
  }

  // ── PDF COMPLETO (interna) ──
  const generatePDF = () => {
    const now = new Date().toLocaleDateString('pt-BR')
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Orçamento Completo - ${cliente.nome}</title>
    <style>${pdfBaseStyle}</style></head><body>`

    html += pdfHeader(now)

    html += `<div class="info-box">
      <strong>Pé-direito:</strong> ${config.peDireito}m &nbsp;|&nbsp;
      <strong>Modulação:</strong> ${config.modulacaoMontante}mm &nbsp;|&nbsp;
      <strong>Margem:</strong> ${config.margem}% &nbsp;|&nbsp;
      <strong>Desconto:</strong> ${config.desconto}% &nbsp;|&nbsp;
      <strong>Perda:</strong> ${config.perda}%
    </div>
    <p style="font-size:11px;color:#999;margin-bottom:16px"><em>Documento interno — detalhamento completo</em></p>`

    for (const amb of ambientes) {
      const r = amb.resultado
      if (!r) continue
      const tpl = templates.find(t => t.id === amb.sistemaId)
      html += `<h2>${amb.nome} ${tpl ? `(${tpl.sigla})` : ''}</h2>`
      html += `<p>Área: ${r.area.toFixed(2)}m² | Perímetro: ${r.perimetro.toFixed(2)}m</p>`

      const grupos = agruparPorCategoria(r.itens)
      for (const [cat, grupo] of Object.entries(grupos)) {
        const catLabel = CATEGORIAS_LABELS[cat as MaterialCategory] || cat
        html += `<h3><span class="badge badge-${cat}">${catLabel}</span></h3>`
        html += `<table><thead><tr><th class="col-material">Material</th><th class="col-qtd">Qtd Bruta</th><th class="col-perda">Perda</th><th class="col-qtd-perda">Qtd c/ Perda</th><th class="col-custo">Custo</th></tr></thead><tbody>`
        for (const item of grupo.itens) {
          html += `<tr><td class="col-material">${item.nome}</td><td class="col-qtd">${item.qtdBruta}</td><td class="col-perda">${item.fatorPerda}%</td><td class="col-qtd-perda">${item.qtdComPerda}</td><td class="col-custo">${fmtBRL(item.custoProporcional)}</td></tr>`
        }
        html += `<tr class="total-row"><td colspan="4">Subtotal ${catLabel}</td><td class="col-custo">${fmtBRL(grupo.subtotal)}</td></tr></tbody></table>`
      }

      if (amb.itensManuais.length > 0) {
        html += `<h3>Itens Manuais</h3>`
        html += `<table><thead><tr><th>Descrição</th><th>Qtd</th><th>Un</th><th class="right">Preço Un.</th><th class="right">Valor</th></tr></thead><tbody>`
        for (const im of amb.itensManuais) {
          html += `<tr><td>${im.descricao}</td><td>${im.quantidade}</td><td>${im.unidade}</td><td class="right">${fmtBRL(im.precoUnitario)}</td><td class="right">${fmtBRL(im.valor)}</td></tr>`
        }
        html += `</tbody></table>`
      }

      html += `<table><tbody>
        <tr><td colspan="4"><strong>Custo Materiais</strong></td><td class="right"><strong>${fmtBRL(r.custoMateriais + r.custoItensManuais)}</strong></td></tr>
        <tr><td colspan="4">Mão de Obra</td><td class="right">${fmtBRL(r.maoDeObra)}</td></tr>
        <tr><td colspan="4">Lucro (${r.margemPct}%)</td><td class="right">${fmtBRL(r.lucro)}</td></tr>
        <tr><td colspan="4">Desconto (${r.descontoPct}%)</td><td class="right">-${fmtBRL(r.valorDesconto)}</td></tr>
        <tr class="total-row"><td colspan="4"><strong>TOTAL</strong></td><td class="right"><strong>${fmtBRL(r.total)}</strong></td></tr>
      </tbody></table>`
    }

    html += `<h2>Resumo Geral</h2>`
    html += `<table><thead><tr><th></th><th class="right">Valor</th></tr></thead><tbody>
      <tr><td>Custo Materiais</td><td class="right">${fmtBRL(orcTotals.custoMateriais)}</td></tr>
      <tr><td>Mão de Obra</td><td class="right">${fmtBRL(orcTotals.maoDeObra)}</td></tr>
      <tr><td>Lucro</td><td class="right">${fmtBRL(orcTotals.lucro)}</td></tr>
      <tr><td>Desconto</td><td class="right">-${fmtBRL(orcTotals.desconto)}</td></tr>
      <tr class="total-row"><td><strong>TOTAL GERAL</strong></td><td class="right"><strong>${fmtBRL(orcTotals.total)}</strong></td></tr>
    </tbody></table>`

    html += `<p style="margin-top:32px;color:#999;font-size:11px">Gerado por DrywallCalc Pro em ${now}</p>`
    html += `</body></html>`
    openPrintWindow(html)
  }

  // ── PDF CLIENTE (simplificado) ──
  const generateClientPDF = () => {
    const now = new Date().toLocaleDateString('pt-BR')
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposta Comercial - ${cliente.nome}</title>
    <style>
      ${pdfBaseStyle}
      .mat-list{columns:2;column-gap:24px;margin-bottom:12px}
      .mat-list li{padding:3px 0;font-size:12px;break-inside:avoid}
      .ambient-block{margin-bottom:28px}
      .ambient-title{font-size:15px;font-weight:600;color:#ea580c;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #fed7aa}
      .client-total{font-size:16px;font-weight:bold;background:#fff7ed;border:2px solid #ea580c;padding:12px;border-radius:6px;margin-top:20px}
      .client-total-row{display:flex;justify-content:space-between;padding:4px 0}
      .client-total-row.final{border-top:2px solid #ea580c;margin-top:8px;padding-top:8px;font-size:18px}
    </style></head><body>`

    html += pdfHeader(now)

    for (const amb of ambientes) {
      const r = amb.resultado
      if (!r) continue
      const tpl = templates.find(t => t.id === amb.sistemaId)
      html += `<div class="ambient-block">`
      html += `<div class="ambient-title">${amb.nome} ${tpl ? `— ${tpl.nome}` : ''}</div>`

      // Lista simples de materiais por ambiente
      html += `<ul class="mat-list">`
      for (const item of r.itens) {
        html += `<li>${item.nome}</li>`
      }
      html += `</ul>`

      html += `</div>`
    }

    // Resumo financeiro consolidado — valor total (materiais + mão de obra) sem discriminar
    // O orcTotals.total já inclui: materiais + mão de obra + margem - desconto
    // Para mostrar o subtotal antes do desconto: total + desconto (pois desconto já foi subtraído)
    const subtotalComMargem = orcTotals.total + orcTotals.desconto
    
    html += `<div class="client-total">`
    html += `<div style="font-size:13px;color:#92400e;margin-bottom:8px;font-weight:600;">RESUMO FINANCEIRO</div>`
    
    // Linha única: materiais + mão de obra consolidados (sem discriminar)
    html += `<div class="client-total-row">`
    html += `<span>Valor Total (materiais e mão de obra)</span>`
    html += `<span>${fmtBRL(subtotalComMargem)}</span>`
    html += `</div>`
    
    // Se houver desconto, mostra a linha de desconto
    if (orcTotals.desconto > 0) {
      html += `<div class="client-total-row">`
      html += `<span>Desconto</span>`
      html += `<span style="color:#dc2626">-${fmtBRL(orcTotals.desconto)}</span>`
      html += `</div>`
      
      // Total final após desconto
      html += `<div class="client-total-row final">`
      html += `<span>TOTAL FINAL</span>`
      html += `<span>${fmtBRL(orcTotals.total)}</span>`
      html += `</div>`
    } else {
      // Sem desconto: o total já é o subtotal
      html += `<div class="client-total-row final">`
      html += `<span>TOTAL</span>`
      html += `<span>${fmtBRL(orcTotals.total)}</span>`
      html += `</div>`
    }
    
    html += `</div>`

    html += `<div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb">
      <p style="font-size:12px;color:#666">Proposta válida${cliente.validade ? ` por ${cliente.validade}` : ''} a partir de ${now}.</p>
    </div>`
    html += `<p style="margin-top:16px;color:#999;font-size:11px">Gerado por DrywallCalc Pro em ${now}</p>`
    html += `</body></html>`
    openPrintWindow(html)
  }

  // ── GET TEMPLATE CONFIG FLAGS ──
  const getTplConfig = (sistemaId: string): Record<string, boolean> => {
    const tpl = templates.find(t => t.id === sistemaId)
    return tpl ? parseTplConfig(tpl.configJson) : {}
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">DrywallCalc Pro</h1>
                <p className="text-[10px] text-gray-400 leading-tight">Motor de Cálculo Data-Driven</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {isInstallable && (
                <Button variant="outline" size="sm" onClick={install}>
                  <Download className="w-4 h-4 mr-1" /> Instalar App
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSeed}>
                <Database className="w-4 h-4 mr-1" /> Carregar Base
              </Button>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="materiais" className="gap-1"><Package className="w-4 h-4" /> Materiais</TabsTrigger>
              <TabsTrigger value="sistemas" className="gap-1"><Layers className="w-4 h-4" /> Sistemas</TabsTrigger>
              <TabsTrigger value="orcamento" className="gap-1"><FileText className="w-4 h-4" /> Orçamento</TabsTrigger>
            </TabsList>

            {/* ══════════ TAB: MATERIAIS ══════════ */}
            <TabsContent value="materiais">
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={openNewMat} size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-1" /> Novo
                  </Button>
                  <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar material..." value={matSearch} onChange={e => setMatSearch(e.target.value)} className="pl-8 h-9" />
                  </div>
                </div>

                {/* Category Filter Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={matFilter === 'todos' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setMatFilter('todos')}>Todos</Badge>
                  {CATEGORIAS.map(cat => (
                    <Badge key={cat} variant={matFilter === cat ? 'default' : 'outline'} className={`cursor-pointer ${matFilter === cat ? 'bg-orange-600' : ''}`} onClick={() => setMatFilter(cat)}>
                      {CATEGORIAS_LABELS[cat]}
                    </Badge>
                  ))}
                </div>

                {/* Materials Table */}
                <Card>
                  <CardContent className="p-0">
                    {matLoading ? (
                      <div className="p-8 text-center text-gray-400">Carregando...</div>
                    ) : filteredMateriais.length === 0 ? (
                      <div className="p-8 text-center text-gray-400">Nenhum material encontrado. Clique em &quot;Carregar Base&quot; ou &quot;Novo&quot;.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-20">Código</TableHead>
                              <TableHead>Nome / Variante</TableHead>
                              <TableHead className="w-28">Categoria</TableHead>
                              <TableHead className="w-28 text-right">Embalagem</TableHead>
                              <TableHead className="w-28 text-right">Preço Emb.</TableHead>
                              <TableHead className="w-20 text-right">Perda %</TableHead>
                              <TableHead className="w-28 text-right">Custo Un.</TableHead>
                              <TableHead className="w-24 text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMateriais.map(m => (
                              <TableRow key={m.id} className="hover:bg-orange-50/50">
                                <TableCell className="font-mono font-semibold text-orange-700">{m.codigo}</TableCell>
                                <TableCell>
                                  <div className="font-medium">{m.nome}</div>
                                  {m.variante && <div className="text-xs text-gray-500">{m.variante}</div>}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-[10px] ${CAT_COLORS[m.categoria as MaterialCategory] || ''}`}>
                                    {CATEGORIAS_LABELS[m.categoria as MaterialCategory] || m.categoria}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right text-xs">
                                  {m.qtdPorEmbalagem} {UNIDADE_COMPRA_LABELS[m.unidadeCompra as keyof typeof UNIDADE_COMPRA_LABELS] || m.unidadeCompra}
                                </TableCell>
                                <TableCell className="text-right">{fmtBRL(m.precoEmbalagem)}</TableCell>
                                <TableCell className="text-right">{m.fatorPerda}%</TableCell>
                                <TableCell className="text-right">
                                  {fmtBRL(m.qtdPorEmbalagem > 0 ? m.precoEmbalagem / m.qtdPorEmbalagem : 0)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMat(m)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDeleteMat(m.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="text-xs text-gray-400">{filteredMateriais.length} material(is)</div>
              </div>

              {/* Material Dialog */}
              <Dialog open={matDialogOpen} onOpenChange={setMatDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingMat ? 'Editar Material' : 'Novo Material'}</DialogTitle>
                    <DialogDescription>Preencha os dados do material</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Código *</Label>
                      <Input value={matForm.codigo} onChange={e => setMatForm(p => ({ ...p, codigo: e.target.value }))} placeholder="Ex: M01" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nome *</Label>
                      <Input value={matForm.nome} onChange={e => setMatForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Guia" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Variante</Label>
                      <Input value={matForm.variante} onChange={e => setMatForm(p => ({ ...p, variante: e.target.value }))} placeholder="Ex: 48mm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Categoria</Label>
                      <Select value={matForm.categoria} onValueChange={v => setMatForm(p => ({ ...p, categoria: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{CATEGORIAS_LABELS[c]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unidade Compra</Label>
                      <Select value={matForm.unidadeCompra} onValueChange={v => setMatForm(p => ({ ...p, unidadeCompra: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(UNIDADE_COMPRA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Qtd por Embalagem</Label>
                      <Input type="number" step="0.01" value={matForm.qtdPorEmbalagem} onChange={e => setMatForm(p => ({ ...p, qtdPorEmbalagem: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Preço Embalagem (R$)</Label>
                      <Input type="number" step="0.01" value={matForm.precoEmbalagem} onChange={e => setMatForm(p => ({ ...p, precoEmbalagem: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unidade Consumo</Label>
                      <Input value={matForm.unidadeConsumo} onChange={e => setMatForm(p => ({ ...p, unidadeConsumo: e.target.value }))} placeholder="Ex: m, m², un, kg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fator Perda (%)</Label>
                      <Input type="number" step="1" value={matForm.fatorPerda} onChange={e => setMatForm(p => ({ ...p, fatorPerda: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Observação</Label>
                      <Textarea value={matForm.obs} onChange={e => setMatForm(p => ({ ...p, obs: e.target.value }))} rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMatDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveMat} className="bg-orange-600 hover:bg-orange-700"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ══════════ TAB: SISTEMAS ══════════ */}
            <TabsContent value="sistemas">
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center gap-2">
                  <Button onClick={() => setNewTplDialogOpen(true)} size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-1" /> Novo Sistema
                  </Button>
                </div>

                {/* Info Panel */}
                <Alert className="border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-xs text-orange-800">
                    <strong>Regras de Cálculo:</strong> Cada sistema contém itens com tipo de cálculo (área, perímetro, modulação, proporção, peça fixa, densidade).
                    O motor interpreta os itens dinamicamente — sem lógica hardcoded por ID. Itens condicionais ativam conforme as opções do ambiente.
                  </AlertDescription>
                </Alert>

                {/* Templates Grid */}
                {tplLoading ? (
                  <div className="p-8 text-center text-gray-400">Carregando...</div>
                ) : templates.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">Nenhum sistema cadastrado. Clique em &quot;Carregar Base&quot; para importar os sistemas padrão.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map(tpl => {
                      const cfg = parseTplConfig(tpl.configJson)
                      return (
                        <Card
                          key={tpl.id}
                          className="cursor-pointer hover:shadow-lg hover:border-orange-300 transition-all group"
                          onClick={() => openEditTpl(tpl)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-orange-600 text-white text-xs">{tpl.id}</Badge>
                              <Badge variant="outline" className="font-bold">{tpl.sigla}</Badge>
                            </div>
                            <CardTitle className="text-sm mt-1 group-hover:text-orange-700 transition-colors">{tpl.nome}</CardTitle>
                            {tpl.descricao && <CardDescription className="text-[11px]">{tpl.descricao}</CardDescription>}
                          </CardHeader>
                          <CardContent className="pt-0 pb-3">
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                              <BoxSelect className="w-3 h-3" /> {tpl.itens.length} itens
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {cfg.temChapa && <Badge variant="outline" className="text-[9px] py-0">Chapa</Badge>}
                              {cfg.temModulacao && <Badge variant="outline" className="text-[9px] py-0">Modulação</Badge>}
                              {cfg.temIsolamento && <Badge variant="outline" className="text-[9px] py-0">Isolamento</Badge>}
                              {cfg.temCamadaDupla && <Badge variant="outline" className="text-[9px] py-0">Camada Dupla</Badge>}
                              {cfg.temF530 && <Badge variant="outline" className="text-[9px] py-0">F530</Badge>}
                              {cfg.temTabicaCantoneira && <Badge variant="outline" className="text-[9px] py-0">Borda Forro</Badge>}
                              {cfg.temMontantesDuplos && <Badge variant="outline" className="text-[9px] py-0">Mont. Duplos</Badge>}
                              {cfg.temReforco && <Badge variant="outline" className="text-[9px] py-0">Reforço</Badge>}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Template Edit Dialog */}
              <Dialog open={tplDialogOpen} onOpenChange={setTplDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Sistema: {editingTpl?.id} — {editingTpl?.sigla}</DialogTitle>
                    <DialogDescription>Edite as informações e itens do sistema</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Basic info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <Label>Nome</Label>
                        <Input value={tplForm.nome} onChange={e => setTplForm(p => ({ ...p, nome: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Sigla</Label>
                        <Input value={tplForm.sigla} onChange={e => setTplForm(p => ({ ...p, sigla: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Descrição</Label>
                        <Input value={tplForm.descricao} onChange={e => setTplForm(p => ({ ...p, descricao: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Config JSON</Label>
                      <Textarea value={tplForm.configJson} onChange={e => setTplForm(p => ({ ...p, configJson: e.target.value }))} rows={2} className="font-mono text-xs" />
                    </div>

                    <Separator />

                    {/* Items */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Itens do Template ({tplForm.itens.length})</h3>
                      <Button size="sm" variant="outline" onClick={addTplItem}><Plus className="w-3.5 h-3.5 mr-1" /> Item</Button>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead className="w-10">#</TableHead>
                            <TableHead className="w-40">Material</TableHead>
                            <TableHead className="w-40">Tipo Cálculo</TableHead>
                            <TableHead className="w-20">Coef.</TableHead>
                            <TableHead className="w-20">Perda %</TableHead>
                            <TableHead className="w-40">Cat. Uso</TableHead>
                            <TableHead className="w-20">Ativo</TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tplForm.itens.map((item, idx) => (
                            <TableRow key={item.id} className="text-xs">
                              <TableCell className="text-gray-400">{idx + 1}</TableCell>
                              <TableCell>
                                <Select value={item.materialId} onValueChange={v => updateTplItem(idx, 'materialId', v)}>
                                  <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {materiais.map(m => (
                                      <SelectItem key={m.id} value={m.id}>{m.codigo} — {m.nome}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select value={item.tipoCalculo} onValueChange={v => updateTplItem(idx, 'tipoCalculo', v)}>
                                  <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(TIPO_CALCULO_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input type="number" step="0.01" value={item.coeficiente} onChange={e => updateTplItem(idx, 'coeficiente', parseFloat(e.target.value) || 0)} className="h-7 text-xs" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" step="1" value={item.fatorPerda} onChange={e => updateTplItem(idx, 'fatorPerda', parseFloat(e.target.value) || -1)} className="h-7 text-xs" />
                              </TableCell>
                              <TableCell>
                                <Select value={item.categoriaUso || '_auto'} onValueChange={v => updateTplItem(idx, 'categoriaUso', v === '_auto' ? '' : v)}>
                                  <SelectTrigger className="h-7 text-xs w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="_auto">Auto</SelectItem>
                                    {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{CATEGORIAS_LABELS[c]}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Checkbox checked={item.ativo} onCheckedChange={v => updateTplItem(idx, 'ativo', !!v)} />
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => removeTplItem(idx)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {tplForm.itens.length === 0 && (
                            <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-4">Nenhum item</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Expandable params/condition for each item */}
                    {tplForm.itens.length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-orange-600 mb-2">Parâmetros e Condições Avançados</summary>
                        <div className="space-y-2">
                          {tplForm.itens.map((item, idx) => (
                            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-gray-50 rounded">
                              <div>
                                <Label className="text-[10px]">Item {idx + 1}: {item.materialCodigo}</Label>
                                <Input value={item.parametrosJson} onChange={e => updateTplItem(idx, 'parametrosJson', e.target.value)} placeholder='{}' className="h-6 text-[10px] font-mono" />
                              </div>
                              <div>
                                <Label className="text-[10px]">Condição Ativação</Label>
                                <Input value={item.condicaoAtivacao} onChange={e => updateTplItem(idx, 'condicaoAtivacao', e.target.value)} placeholder='{}' className="h-6 text-[10px] font-mono" />
                              </div>
                              <div>
                                <Label className="text-[10px]">Obs</Label>
                                <Input value={item.obs} onChange={e => updateTplItem(idx, 'obs', e.target.value)} className="h-6 text-[10px]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTplDialogOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" size="sm" onClick={() => { handleDeleteTpl(editingTpl?.id || ''); setTplDialogOpen(false) }}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir
                    </Button>
                    <Button onClick={handleSaveTpl} className="bg-orange-600 hover:bg-orange-700"><Save className="w-4 h-4 mr-1" /> Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* New Template Dialog */}
              <Dialog open={newTplDialogOpen} onOpenChange={setNewTplDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Novo Sistema</DialogTitle>
                    <DialogDescription>Crie um novo sistema de cálculo</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>ID *</Label>
                      <Input value={newTplForm.id} onChange={e => setNewTplForm(p => ({ ...p, id: e.target.value }))} placeholder="Ex: S09" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nome *</Label>
                      <Input value={newTplForm.nome} onChange={e => setNewTplForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Parede Dupla" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sigla *</Label>
                      <Input value={newTplForm.sigla} onChange={e => setNewTplForm(p => ({ ...p, sigla: e.target.value }))} placeholder="Ex: PD" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Descrição</Label>
                      <Input value={newTplForm.descricao} onChange={e => setNewTplForm(p => ({ ...p, descricao: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Config JSON</Label>
                      <Textarea value={newTplForm.configJson} onChange={e => setNewTplForm(p => ({ ...p, configJson: e.target.value }))} rows={2} className="font-mono text-xs" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewTplDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateTpl} className="bg-orange-600 hover:bg-orange-700"><Save className="w-4 h-4 mr-1" /> Criar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ══════════ TAB: ORÇAMENTO ══════════ */}
            <TabsContent value="orcamento">
              {/* ── PHASE 1: START ── */}
              {orcPhase === 1 && (
                <Card className="max-w-lg mx-auto mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-orange-600" /> Novo Orçamento</CardTitle>
                    <CardDescription>Informe os dados do cliente para iniciar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Nome do Cliente *</Label>
                      <Input value={cliente.nome} onChange={e => setCliente(p => ({ ...p, nome: e.target.value }))} placeholder="Nome do cliente" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Telefone</Label>
                      <Input value={cliente.telefone} onChange={e => setCliente(p => ({ ...p, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Validade</Label>
                      <Input value={cliente.validade} onChange={e => setCliente(p => ({ ...p, validade: e.target.value }))} placeholder="15 dias" />
                    </div>
                    <Button onClick={startOrc} className="w-full bg-orange-600 hover:bg-orange-700">
                      <Calculator className="w-4 h-4 mr-1" /> Iniciar Orçamento
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* ── PHASE 2: EDITING ── */}
              {orcPhase === 2 && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-orange-600" />
                        Orçamento: {cliente.nome}
                      </h2>
                      {cliente.telefone && <p className="text-xs text-gray-500">{cliente.telefone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setOrcPhase(1)}><ChevronUp className="w-4 h-4 mr-1" /> Voltar</Button>
                      <Button size="sm" onClick={finishOrc} disabled={ambientes.length === 0} className="bg-orange-600 hover:bg-orange-700">
                        <Check className="w-4 h-4 mr-1" /> Finalizar
                      </Button>
                    </div>
                  </div>

                  {/* Global Config Card */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2"><Settings2 className="w-4 h-4 text-orange-600" /> Configuração Global</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Pé-direito (m)</Label>
                          <Input type="number" step="0.1" value={config.peDireito} onChange={e => {
                            const v = parseFloat(e.target.value) || 3
                            const nc = { ...config, peDireito: v }
                            setConfig(nc)
                            saveConfig(nc)
                          }} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Modulação (mm)</Label>
                          <Input type="number" step="50" value={config.modulacaoMontante} onChange={e => {
                            const v = parseInt(e.target.value) || 600
                            const nc = { ...config, modulacaoMontante: v }
                            setConfig(nc)
                            saveConfig(nc)
                          }} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Margem (%)</Label>
                          <Input type="number" step="1" value={config.margem} onChange={e => {
                            const v = parseFloat(e.target.value) || 0
                            const nc = { ...config, margem: v }
                            setConfig(nc)
                            saveConfig(nc)
                          }} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Desconto (%)</Label>
                          <Input type="number" step="1" value={config.desconto} onChange={e => {
                            const v = parseFloat(e.target.value) || 0
                            const nc = { ...config, desconto: v }
                            setConfig(nc)
                            saveConfig(nc)
                          }} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Perda (%)</Label>
                          <Input type="number" step="1" value={config.perda} onChange={e => {
                            const v = parseFloat(e.target.value) || 0
                            const nc = { ...config, perda: v }
                            setConfig(nc)
                            saveConfig(nc)
                          }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add Ambiente */}
                  <Button onClick={openNewAmb} size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-1" /> Adicionar Ambiente
                  </Button>

                  {/* Ambientes Grid */}
                  {ambientes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhum ambiente adicionado</p>
                      <p className="text-xs">Clique em &quot;Adicionar Ambiente&quot; para começar</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ambientes.map(amb => {
                        const tpl = templates.find(t => t.id === amb.sistemaId)
                        const r = amb.resultado
                        return (
                          <Card key={amb.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">{amb.nome}</CardTitle>
                                <div className="flex gap-1">
                                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditAmb(amb)}><Pencil className="w-3.5 h-3.5" /></Button></TooltipTrigger><TooltipContent>Editar</TooltipContent></Tooltip>
                                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeAmbiente(amb.id)}><Trash2 className="w-3.5 h-3.5" /></Button></TooltipTrigger><TooltipContent>Remover</TooltipContent></Tooltip>
                                </div>
                              </div>
                              {tpl && <Badge variant="outline" className="w-fit text-[10px]">{tpl.sigla} — {tpl.nome}</Badge>}
                            </CardHeader>
                            <CardContent className="pt-0 space-y-1">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-gray-500">Área:</span><span>{amb.area.toFixed(2)}m²</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Perím.:</span><span>{amb.perimetro.toFixed(2)}m</span></div>
                              </div>
                              {r && (
                                <>
                                  <Separator className="my-2" />
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">Materiais:</span><span className="font-medium">{fmtBRL(r.custoMateriais + r.custoItensManuais)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Mão Obra:</span><span>{fmtBRL(r.maoDeObra)}</span></div>
                                  </div>
                                  <div className="flex justify-between text-sm font-bold mt-1 text-orange-700">
                                    <span>Total:</span><span>{fmtBRL(r.total)}</span>
                                  </div>
                                </>
                              )}
                              {!r && <p className="text-xs text-amber-600 mt-1">⚠ Não calculado</p>}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {/* Running Total */}
                  {ambientes.length > 0 && (
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="py-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="font-semibold text-sm">Total Parcial ({ambientes.length} ambiente{ambientes.length > 1 ? 's' : ''})</span>
                          <span className="text-lg font-bold text-orange-700">{fmtBRL(orcTotals.total)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ── PHASE 3: DONE ── */}
              {orcPhase === 3 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" /> Orçamento Finalizado
                    </h2>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button size="sm" onClick={generatePDF} className="bg-orange-600 hover:bg-orange-700 text-white"><Download className="w-4 h-4 mr-1" /> PDF Completo</Button>
                      <Button size="sm" onClick={generateClientPDF} className="bg-amber-600 hover:bg-amber-700 text-white"><FileText className="w-4 h-4 mr-1" /> PDF Cliente</Button>
                      <Button size="sm" variant="outline" onClick={() => setOrcPhase(2)}><Edit3 className="w-4 h-4 mr-1" /> Voltar</Button>
                      <Button size="sm" variant="outline" onClick={newOrc}><RefreshCw className="w-4 h-4 mr-1" /> Novo Orçamento</Button>
                    </div>
                  </div>

                  {/* Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Resumo — {cliente.nome}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ambientes.map(amb => {
                        const tpl = templates.find(t => t.id === amb.sistemaId)
                        const r = amb.resultado
                        return (
                          <div key={amb.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="font-medium text-sm">{amb.nome}</span>
                                {tpl && <span className="text-xs text-gray-500 ml-2">({tpl.sigla})</span>}
                              </div>
                              {r && <span className="font-bold text-orange-700">{fmtBRL(r.total)}</span>}
                            </div>
                            {r && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs text-gray-500">
                                <span>Materiais: {fmtBRL(r.custoMateriais + r.custoItensManuais)}</span>
                                <span>Mão Obra: {fmtBRL(r.maoDeObra)}</span>
                                <span>Lucro: {fmtBRL(r.lucro)}</span>
                                <span>Desc: -{fmtBRL(r.valorDesconto)}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  {/* Grand Total */}
                  <Card className="bg-orange-600 text-white">
                    <CardContent className="py-4">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <div className="text-orange-200 text-xs">Custo Materiais</div>
                          <div className="font-bold">{fmtBRL(orcTotals.custoMateriais)}</div>
                        </div>
                        <div>
                          <div className="text-orange-200 text-xs">Mão de Obra</div>
                          <div className="font-bold">{fmtBRL(orcTotals.maoDeObra)}</div>
                        </div>
                        <div>
                          <div className="text-orange-200 text-xs">Lucro</div>
                          <div className="font-bold">{fmtBRL(orcTotals.lucro)}</div>
                        </div>
                        <div>
                          <div className="text-orange-200 text-xs">Desconto</div>
                          <div className="font-bold">-{fmtBRL(orcTotals.desconto)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-200 text-xs">TOTAL GERAL</div>
                          <div className="text-2xl font-black">{fmtBRL(orcTotals.total)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ═══ AMBIENTE DIALOG ═══ */}
              <Dialog open={ambDialogOpen} onOpenChange={setAmbDialogOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAmb ? 'Editar' : 'Novo'} Ambiente</DialogTitle>
                    <DialogDescription>Preencha os dados do ambiente e calcule</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <Label>Nome *</Label>
                        <Input value={ambForm.nome} onChange={e => setAmbForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Sala de Estar" />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Sistema *</Label>
                        <Select value={ambForm.sistemaId} onValueChange={v => setAmbForm(p => ({ ...p, sistemaId: v }))}>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Selecione o sistema" /></SelectTrigger>
                          <SelectContent>
                            {templates.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.id} — {t.sigla} ({t.nome})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Mão de Obra (R$)</Label>
                        <Input type="number" step="0.01" value={ambForm.maoDeObra} onChange={e => setAmbForm(p => ({ ...p, maoDeObra: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <Label>Comprimento (m)</Label>
                        <Input type="number" step="0.01" value={ambForm.comprimento || ''} onChange={e => {
                          const v = parseFloat(e.target.value) || 0
                          setAmbForm(p => ({ ...p, comprimento: v, area: v * p.altura, perimetro: 2 * (v + p.altura) }))
                        }} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Altura (m)</Label>
                        <Input type="number" step="0.01" value={ambForm.altura || ''} onChange={e => {
                          const v = parseFloat(e.target.value) || 0
                          setAmbForm(p => ({ ...p, altura: v, area: p.comprimento * v, perimetro: 2 * (p.comprimento + v) }))
                        }} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Área (m²)</Label>
                        <Input type="number" step="0.01" value={ambForm.area || ''} onChange={e => setAmbForm(p => ({ ...p, area: parseFloat(e.target.value) || 0 }))} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Perímetro (m)</Label>
                        <Input type="number" step="0.01" value={ambForm.perimetro || ''} onChange={e => setAmbForm(p => ({ ...p, perimetro: parseFloat(e.target.value) || 0 }))} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label>Arestas (m)</Label>
                        <Input type="number" step="0.01" value={ambForm.arestas || ''} onChange={e => setAmbForm(p => ({ ...p, arestas: parseFloat(e.target.value) || 0 }))} />
                      </div>
                    </div>

                    {/* Dynamic Options based on template config */}
                    {ambForm.sistemaId && (() => {
                      const cfg = getTplConfig(ambForm.sistemaId)
                      return (
                        <Card className="bg-gray-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xs flex items-center gap-1"><Settings2 className="w-3.5 h-3.5 text-orange-600" /> Opções do Sistema</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {/* Tipo Chapa */}
                              {cfg.temChapa && (
                                <div className="space-y-1 min-w-0">
                                  <Label className="text-xs">Tipo Chapa</Label>
                                  <Select value={ambForm.tipoChapa} onValueChange={v => setAmbForm(p => ({ ...p, tipoChapa: v as TipoChapa }))}>
                                    <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {TIPO_CHAPA_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Tamanho Chapa */}
                              {cfg.temTamanhoChapa && (
                                <div className="space-y-1 min-w-0">
                                  <Label className="text-xs">Tamanho Chapa</Label>
                                  <Select value={ambForm.tamanhoChapa} onValueChange={v => setAmbForm(p => ({ ...p, tamanhoChapa: v as TamanhoChapa }))}>
                                    <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      {TAMANHO_CHAPA_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Modulação */}
                              {cfg.temModulacao && (
                                <div className="space-y-1 min-w-0">
                                  <Label className="text-xs">Modulação (mm)</Label>
                                  <Input type="number" step="50" value={ambForm.modulacaoMM} onChange={e => setAmbForm(p => ({ ...p, modulacaoMM: parseInt(e.target.value) || 600 }))} className="h-8 text-xs" />
                                </div>
                              )}

                              {/* Modulação F530 */}
                              {cfg.temF530 && (
                                <div className="space-y-1 min-w-0">
                                  <Label className="text-xs">Mod. F530 (mm)</Label>
                                  <Input type="number" step="50" value={ambForm.modF530MM} onChange={e => setAmbForm(p => ({ ...p, modF530MM: parseInt(e.target.value) || 600 }))} className="h-8 text-xs" />
                                </div>
                              )}

                              {/* Camada Dupla */}
                              {cfg.temCamadaDupla && (
                                <div className="flex items-center gap-2 pt-4">
                                  <Switch checked={ambForm.camadaDupla} onCheckedChange={v => setAmbForm(p => ({ ...p, camadaDupla: v }))} />
                                  <Label className="text-xs">Camada Dupla</Label>
                                </div>
                              )}

                              {/* Isolamento */}
                              {cfg.temIsolamento && (
                                <>
                                  <div className="flex items-center gap-2 pt-4">
                                    <Switch checked={ambForm.isolamento} onCheckedChange={v => setAmbForm(p => ({ ...p, isolamento: v }))} />
                                    <Label className="text-xs">Isolamento</Label>
                                  </div>
                                  {ambForm.isolamento && (
                                    <div className="space-y-1 min-w-0">
                                      <Label className="text-xs">Tipo Isolamento</Label>
                                      <Select value={ambForm.isolamentoTipo} onValueChange={v => setAmbForm(p => ({ ...p, isolamentoTipo: v as 'vidro' | 'pet' | 'rocha' }))}>
                                        <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {ISOLAMENTO_TIPO_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Tipo Borda Forro */}
                              {cfg.temTabicaCantoneira && (
                                <div className="space-y-1 min-w-0">
                                  <Label className="text-xs">Borda Forro</Label>
                                  <Select value={ambForm.tipoBordaForro} onValueChange={v => setAmbForm(p => ({ ...p, tipoBordaForro: v as TipoBordaForro }))}>
                                    <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="tabica">Tábica</SelectItem>
                                      <SelectItem value="cantoneira_25x30">Cantoneira 25x30</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Tipo de Massa */}
                              <div className="space-y-1 min-w-0">
                                <Label className="text-xs">Tipo de Massa</Label>
                                <Select value={ambForm.tipoMassa} onValueChange={v => setAmbForm(p => ({ ...p, tipoMassa: v as 'po' | 'pronta' }))}>
                                  <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="po">Massa em Pó (0,50kg/m²)</SelectItem>
                                    <SelectItem value="pronta">Massa Pronta (0,70kg/m²)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Montantes Duplos */}
                              {cfg.temMontantesDuplos && (
                                <div className="flex items-center gap-2 pt-4">
                                  <Switch checked={ambForm.montantesDuplos} onCheckedChange={v => setAmbForm(p => ({ ...p, montantesDuplos: v }))} />
                                  <Label className="text-xs">Montantes Duplos</Label>
                                </div>
                              )}

                              {/* Reforço */}
                              {cfg.temReforco && (
                                <>
                                  <div className="space-y-1 min-w-0">
                                    <Label className="text-xs">Tipo Reforço</Label>
                                    <Select value={ambForm.tipoReforco} onValueChange={v => setAmbForm(p => ({ ...p, tipoReforco: v as TipoReforco }))}>
                                      <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="nenhum">Nenhum</SelectItem>
                                        <SelectItem value="madeira">Madeira</SelectItem>
                                        <SelectItem value="chapa_aco">Chapa Aço</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {ambForm.tipoReforco !== 'nenhum' && (
                                    <div className="space-y-1 min-w-0">
                                      <Label className="text-xs">Qtd Reforço</Label>
                                      <Input type="number" step="1" value={ambForm.qtdReforco} onChange={e => setAmbForm(p => ({ ...p, qtdReforco: parseInt(e.target.value) || 0 }))} className="h-8 text-xs" />
                                    </div>
                                  )}
                                </>
                              )}

                              {/* Area Umida toggle (always available) */}
                              <div className="flex items-center gap-2 pt-4">
                                <Switch checked={ambForm.areaUmida} onCheckedChange={v => setAmbForm(p => ({ ...p, areaUmida: v }))} />
                                <Label className="text-xs">Área Úmida</Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })()}

                    {/* Margem / Desconto Override */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <Label className="text-xs">Margem Override % (-1 = global)</Label>
                        <Input type="number" step="1" value={ambForm.margem} onChange={e => setAmbForm(p => ({ ...p, margem: parseFloat(e.target.value) || -1 }))} />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <Label className="text-xs">Desconto Override % (-1 = global)</Label>
                        <Input type="number" step="1" value={ambForm.desconto} onChange={e => setAmbForm(p => ({ ...p, desconto: parseFloat(e.target.value) || -1 }))} />
                      </div>
                    </div>

                    {/* Calculate Button */}
                    <Button onClick={handleCalcular} disabled={ambCalculando} className="w-full bg-orange-600 hover:bg-orange-700">
                      {ambCalculando ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Calculator className="w-4 h-4 mr-1" />}
                      {ambCalculando ? 'Calculando...' : 'Calcular'}
                    </Button>

                    {/* Recalcular com ajustes (só aparece se já tem resultado e tem ajustes) */}
                    {ambForm.resultado && ambForm.ajustesItens && ambForm.ajustesItens.length > 0 && (
                      <Button onClick={handleCalcular} disabled={ambCalculando} variant="outline" className="w-full mt-2">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        {ambCalculando ? 'Recalculando...' : 'Recalcular com Ajustes'}
                      </Button>
                    )}

                    {/* Results */}
                    {ambForm.resultado && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /> Resultado do Cálculo</h3>
                        {(() => {
                          const r = ambForm.resultado
                          const grupos = agruparPorCategoria(r.itens)
                          return (
                            <>
                              {Object.entries(grupos).map(([cat, grupo]) => {
                                const catLabel = CATEGORIAS_LABELS[cat as MaterialCategory] || cat
                                const catColor = CAT_COLORS[cat as MaterialCategory] || 'bg-gray-100 text-gray-800'
                                return (
                                  <div key={cat} className="border rounded-lg overflow-hidden">
                                    <div className={`px-3 py-1.5 text-xs font-semibold ${catColor}`}>
                                      {catLabel} — Subtotal: {fmtBRL(grupo.subtotal)}
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="text-[11px]">
                                          <TableHead>Material</TableHead>
                                          <TableHead className="text-right">Qtd Bruta</TableHead>
                                          <TableHead className="text-right">Perda</TableHead>
                                          <TableHead className="text-right">Qtd c/ Perda</TableHead>
                                          <TableHead className="text-right w-20">+ Extra</TableHead>
                                          <TableHead className="text-right">Qtd Final</TableHead>
                                          <TableHead className="text-right">Custo</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {grupo.itens.map((item: ItemCalculado, idx: number) => (
                                          <TableRow key={idx} className="text-xs">
                                            <TableCell>
                                              <div className="font-medium">{item.nome}</div>
                                              {item.obs && <div className="text-[10px] text-gray-400">{item.obs}</div>}
                                            </TableCell>
                                            <TableCell className="text-right">{item.qtdBruta}</TableCell>
                                            <TableCell className="text-right">{item.fatorPerda}%</TableCell>
                                            <TableCell className="text-right">{item.qtdComPerda}</TableCell>
                                            <TableCell className="text-right">
                                              <Input
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={getAjusteItem(item.templateItemId) || ''}
                                                onChange={e => updateAjusteItem(item.templateItemId, parseFloat(e.target.value) || 0)}
                                                className="h-6 text-xs w-16 text-right ml-auto"
                                                placeholder="0"
                                              />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{item.quantidadeFinal}</TableCell>
                                            <TableCell className="text-right font-medium">{fmtBRL(item.custoProporcional)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )
                              })}

                              {/* Summary */}
                              <Card className="bg-orange-50 border-orange-200">
                                <CardContent className="py-3">
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                                    <div><span className="text-gray-500">Materiais:</span><br /><strong>{fmtBRL(r.custoMateriais)}</strong></div>
                                    <div><span className="text-gray-500">Itens Manuais:</span><br /><strong>{fmtBRL(r.custoItensManuais)}</strong></div>
                                    <div><span className="text-gray-500">Mão Obra:</span><br /><strong>{fmtBRL(r.maoDeObra)}</strong></div>
                                    <div><span className="text-gray-500">Lucro ({r.margemPct}%):</span><br /><strong>{fmtBRL(r.lucro)}</strong></div>
                                    <div><span className="text-gray-500">Desc ({r.descontoPct}%):</span><br /><strong>-{fmtBRL(r.valorDesconto)}</strong></div>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between text-sm font-bold text-orange-700">
                                    <span>TOTAL:</span><span>{fmtBRL(r.total)}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </>
                          )
                        })()}
                      </div>
                    )}

                    {/* Itens Manuais */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex items-center gap-2"><Copy className="w-4 h-4 text-gray-500" /> Itens Manuais</h3>
                        <Button size="sm" variant="outline" onClick={addItemManual}><Plus className="w-3.5 h-3.5 mr-1" /> Item</Button>
                      </div>
                      {ambForm.itensManuais.length > 0 && (
                        <div className="overflow-x-auto border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow className="text-xs">
                                <TableHead>Descrição</TableHead>
                                <TableHead className="w-16">Un</TableHead>
                                <TableHead className="w-20">Qtd</TableHead>
                                <TableHead className="w-24">Preço Un.</TableHead>
                                <TableHead className="w-24">Valor</TableHead>
                                <TableHead className="w-10"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ambForm.itensManuais.map((im, idx) => (
                                <TableRow key={im.id} className="text-xs">
                                  <TableCell><Input value={im.descricao} onChange={e => updateItemManual(idx, 'descricao', e.target.value)} className="h-7 text-xs" /></TableCell>
                                  <TableCell><Input value={im.unidade} onChange={e => updateItemManual(idx, 'unidade', e.target.value)} className="h-7 text-xs" /></TableCell>
                                  <TableCell><Input type="number" step="0.01" value={im.quantidade} onChange={e => updateItemManual(idx, 'quantidade', parseFloat(e.target.value) || 0)} className="h-7 text-xs" /></TableCell>
                                  <TableCell><Input type="number" step="0.01" value={im.precoUnitario} onChange={e => updateItemManual(idx, 'precoUnitario', parseFloat(e.target.value) || 0)} className="h-7 text-xs" /></TableCell>
                                  <TableCell className="font-medium">{fmtBRL(im.valor)}</TableCell>
                                  <TableCell><Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => removeItemManual(idx)}><X className="w-3 h-3" /></Button></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <Button onClick={saveAmbiente} className="w-full bg-orange-600 hover:bg-orange-700" disabled={!ambForm.resultado}>
                      <Save className="w-4 h-4 mr-1" /> Salvar Ambiente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </main>

        {/* ── FOOTER ── */}
        <footer className="mt-auto bg-white border-t py-3">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
            <span>DrywallCalc Pro — Motor de Cálculo Data-Driven</span>
            <span>{materiais.length} materiais · {templates.length} sistemas</span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  )
}
