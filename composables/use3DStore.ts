import { reactive, watch, computed } from 'vue'
import type { 
  Filament, 
  Printer, 
  GlobalSettings, 
  PlatformFeeConfig, 
  PrintJob, 
  JobCostBreakdown, 
  PlatformSimulation, 
  SavedQuote 
} from '~/types'

const STORAGE_KEYS = {
  FILAMENTS: 'p3d_filaments_v1',
  PRINTERS: 'p3d_printers_v1',
  SETTINGS: 'p3d_settings_v1',
  PLATFORMS: 'p3d_platforms_v1',
  SAVED_QUOTES: 'p3d_quotes_v1'
}

const DEFAULT_FILAMENTS: Filament[] = [
  {
    id: 'f-1',
    name: 'PLA Branco Puro',
    brand: 'Voolt3D',
    material: 'PLA',
    color: '#ffffff',
    colorName: 'Branco Neve',
    diameter: 1.75,
    spoolWeightG: 1000,
    pricePaid: 104.90,
    shippingCost: 12.00,
    remainingG: 820,
    density: 1.24,
    notes: 'Ótima adesão na mesa texturizada, 210°C / mesa 60°C'
  },
  {
    id: 'f-2',
    name: 'PLA Preto Fosco',
    brand: 'PrintaLot',
    material: 'PLA',
    color: '#1e293b',
    colorName: 'Preto Fosco',
    diameter: 1.75,
    spoolWeightG: 1000,
    pricePaid: 119.00,
    shippingCost: 0.00,
    remainingG: 950,
    density: 1.24,
    notes: 'Excelente acabamento e esconde as linhas de camada'
  },
  {
    id: 'f-3',
    name: 'PETG Cristal Translúcido',
    brand: '3D Fila',
    material: 'PETG',
    color: '#94a3b8',
    colorName: 'Transparente',
    diameter: 1.75,
    spoolWeightG: 1000,
    pricePaid: 124.90,
    shippingCost: 15.00,
    remainingG: 640,
    density: 1.27,
    notes: 'Resistente a UV e umidade, 240°C / mesa 75°C'
  },
  {
    id: 'f-4',
    name: 'PLA Silk Dourado Nobre',
    brand: 'Creality',
    material: 'PLA Silk',
    color: '#f59e0b',
    colorName: 'Dourado Brilhante',
    diameter: 1.75,
    spoolWeightG: 1000,
    pricePaid: 149.00,
    shippingCost: 10.00,
    remainingG: 480,
    density: 1.25,
    notes: 'Brilho metálico para troféus e estatuetas decorativas'
  },
  {
    id: 'f-5',
    name: 'ABS Vermelho Carmim',
    brand: 'Voolt3D',
    material: 'ABS',
    color: '#ef4444',
    colorName: 'Vermelho Intenso',
    diameter: 1.75,
    spoolWeightG: 1000,
    pricePaid: 92.00,
    shippingCost: 10.00,
    remainingG: 700,
    density: 1.04,
    notes: 'Ideal para peças mecânicas e automotivas, câmara fechada'
  },
  {
    id: 'f-6',
    name: 'TPU Flexível 95A Azul',
    brand: 'eSun',
    material: 'TPU',
    color: '#3b82f6',
    colorName: 'Azul Elétrico',
    diameter: 1.75,
    spoolWeightG: 1000,
    pricePaid: 165.00,
    shippingCost: 15.00,
    remainingG: 390,
    density: 1.21,
    notes: 'Para protetores, capas, vedações e amortecedores'
  }
]

const DEFAULT_PRINTERS: Printer[] = [
  {
    id: 'p-1',
    name: 'Bambu Lab P1S Combo',
    brand: 'Bambu Lab',
    model: 'P1S',
    powerWatts: 180,
    purchaseCost: 5600.00,
    lifespanHours: 5000,
    maintenancePerHour: 1.50,
    isDefault: true
  },
  {
    id: 'p-2',
    name: 'Creality Ender 3 V3 KE',
    brand: 'Creality',
    model: 'Ender 3 V3 KE',
    powerWatts: 150,
    purchaseCost: 2100.00,
    lifespanHours: 3000,
    maintenancePerHour: 1.20,
    isDefault: false
  },
  {
    id: 'p-3',
    name: 'Creality K1 Max High Speed',
    brand: 'Creality',
    model: 'K1 Max',
    powerWatts: 320,
    purchaseCost: 4800.00,
    lifespanHours: 4500,
    maintenancePerHour: 1.80,
    isDefault: false
  }
]

const DEFAULT_SETTINGS: GlobalSettings = {
  electricityCostPerKwh: 0.92, // R$ por kWh
  hourlyLaborRate: 35.00,      // R$ por hora de trabalho
  defaultFailureRate: 8,       // 8% margem de falha
  defaultProfitMargin: 65,     // 65% de lucro líquido alvo
  taxRatePercent: 5.0,         // 5% imposto MEI / Simples
  currency: 'BRL'
}

const DEFAULT_PLATFORMS: PlatformFeeConfig[] = [
  {
    id: 'plat-ml-classico',
    name: 'Mercado Livre Clássico',
    category: 'marketplace',
    badgeColor: '#FFE600',
    commissionPercent: 13.5,
    fixedFee: 6.75,
    fixedFeeThreshold: 79.00,
    freeShippingCost: 18.50,
    freeShippingThreshold: 79.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: 'Anúncio padrão com comissão de 13.5%. Abaixo de R$79 incide taxa fixa de R$6,75. Acima de R$79 frete grátis obrigatório coparticipado.'
  },
  {
    id: 'plat-ml-premium',
    name: 'Mercado Livre Premium',
    category: 'marketplace',
    badgeColor: '#FFA500',
    commissionPercent: 18.5,
    fixedFee: 6.75,
    fixedFeeThreshold: 79.00,
    freeShippingCost: 18.50,
    freeShippingThreshold: 79.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: 'Anúncio com parcelamento em até 12x sem juros para o comprador. Maior conversão de vendas.'
  },
  {
    id: 'plat-shopee-padrao',
    name: 'Shopee Padrão',
    category: 'marketplace',
    badgeColor: '#EE4D2D',
    commissionPercent: 14.0,
    fixedFee: 4.00,
    fixedFeeThreshold: 99999.00,
    freeShippingCost: 0.00,
    freeShippingThreshold: 99999.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: '14% de comissão + taxa de transação fixa de R$4,00 por item vendido.'
  },
  {
    id: 'plat-shopee-frete-gratis',
    name: 'Shopee Programa Frete Grátis',
    category: 'marketplace',
    badgeColor: '#FF6433',
    commissionPercent: 20.0,
    fixedFee: 4.00,
    fixedFeeThreshold: 99999.00,
    freeShippingCost: 0.00,
    freeShippingThreshold: 99999.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: '20% de comissão (com teto máximo por item de ~R$105) + R$4,00 de transação. Selo de cupom de frete grátis oficial.'
  },
  {
    id: 'plat-elo7',
    name: 'Elo7 Artesanato & 3D',
    category: 'marketplace',
    badgeColor: '#E9573F',
    commissionPercent: 18.0,
    fixedFee: 0.00,
    fixedFeeThreshold: 0,
    freeShippingCost: 0.00,
    freeShippingThreshold: 99999.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: 'Excelente para peças decorativas, cosplay, action figures e presentes personalizados.'
  },
  {
    id: 'plat-amazon-br',
    name: 'Amazon Brasil',
    category: 'marketplace',
    badgeColor: '#FF9900',
    commissionPercent: 15.0,
    fixedFee: 2.00,
    fixedFeeThreshold: 99999.00,
    freeShippingCost: 0.00,
    freeShippingThreshold: 99999.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: '15% de comissão da categoria + taxa por fechamento de pedido de R$ 2,00.'
  },
  {
    id: 'plat-direto',
    name: 'Venda Direta / WhatsApp / PIX',
    category: 'direct',
    badgeColor: '#10B981',
    commissionPercent: 0.0,
    fixedFee: 0.00,
    fixedFeeThreshold: 0,
    freeShippingCost: 0.00,
    freeShippingThreshold: 99999.00,
    paymentProcessingPercent: 0,
    enabled: true,
    description: '100% livre de comissões de marketplace. Máxima rentabilidade direta para o seu negócio.'
  },
  {
    id: 'plat-site-cartao',
    name: 'Loja Própria (Cartão 3x)',
    category: 'ecommerce',
    badgeColor: '#6366F1',
    commissionPercent: 4.2,
    fixedFee: 0.60,
    fixedFeeThreshold: 99999.00,
    freeShippingCost: 0.00,
    freeShippingThreshold: 99999.00,
    paymentProcessingPercent: 1.5,
    enabled: true,
    description: 'Site próprio (Nuvemshop/Shopify/WooCommerce) com taxa de gateway de cartão e antifraude.'
  }
]

// ==========================================
// MODULE-LEVEL SINGLETON REACTIVE STATE
// Guarantees all components share the exact same arrays & state
// ==========================================
const filaments = reactive<Filament[]>(JSON.parse(JSON.stringify(DEFAULT_FILAMENTS)))
const printers = reactive<Printer[]>(JSON.parse(JSON.stringify(DEFAULT_PRINTERS)))
const settings = reactive<GlobalSettings>({ ...DEFAULT_SETTINGS })
const platforms = reactive<PlatformFeeConfig[]>(JSON.parse(JSON.stringify(DEFAULT_PLATFORMS)))
const savedQuotes = reactive<SavedQuote[]>([])
const manualSalePrice = reactive<{ [platformId: string]: number }>({})

const activeJob = reactive<PrintJob>({
  id: 'job-active',
  title: 'Suporte Articulado para Fone & Celular',
  clientName: 'Cliente Balcão / Exemplo',
  printerId: 'p-1',
  filaments: [
    { filamentId: 'f-1', grams: 95 }
  ],
  printTimeHours: 4,
  printTimeMinutes: 30,
  prepTimeMinutes: 20,
  customFailureRate: undefined,
  customProfitMargin: undefined,
  packagingCost: 4.50,
  hardwareCost: 2.00,
  notes: 'Preenchimento 20% Gyroid, 3 paredes, suporte orgânico.',
  createdAt: new Date().toISOString()
})

let isInitialized = false

// Initialize from LocalStorage or defaults
const initStore = () => {
  if (typeof window === 'undefined') return
  if (isInitialized) return

  try {
    const storedFilaments = localStorage.getItem(STORAGE_KEYS.FILAMENTS)
    if (storedFilaments) {
      const parsed = JSON.parse(storedFilaments)
      if (Array.isArray(parsed) && parsed.length > 0) {
        filaments.splice(0, filaments.length, ...parsed)
      }
    }

    const storedPrinters = localStorage.getItem(STORAGE_KEYS.PRINTERS)
    if (storedPrinters) {
      const parsed = JSON.parse(storedPrinters)
      if (Array.isArray(parsed) && parsed.length > 0) {
        printers.splice(0, printers.length, ...parsed)
      }
    }

    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (storedSettings) {
      Object.assign(settings, JSON.parse(storedSettings))
    }

    const storedPlatforms = localStorage.getItem(STORAGE_KEYS.PLATFORMS)
    if (storedPlatforms) {
      const parsed = JSON.parse(storedPlatforms)
      if (Array.isArray(parsed) && parsed.length > 0) {
        platforms.splice(0, platforms.length, ...parsed)
      }
    }

    const storedQuotes = localStorage.getItem(STORAGE_KEYS.SAVED_QUOTES)
    if (storedQuotes) {
      const parsed = JSON.parse(storedQuotes)
      if (Array.isArray(parsed)) {
        savedQuotes.splice(0, savedQuotes.length, ...parsed)
      }
    }

    // Sync activeJob printer if current is invalid
    if (!printers.some(p => p.id === activeJob.printerId) && printers.length > 0) {
      activeJob.printerId = printers[0].id
    }
    if (activeJob.filaments.length > 0 && !filaments.some(f => f.id === activeJob.filaments[0].filamentId) && filaments.length > 0) {
      activeJob.filaments[0].filamentId = filaments[0].id
    }

    isInitialized = true
  } catch (e) {
    console.error('Error loading 3D Store from localStorage', e)
  }
}

// Auto-save helpers with cloud synchronization
let cloudSyncTimeout: any = null

const triggerCloudSync = () => {
  if (typeof window === 'undefined') return
  try {
    const { currentUser, saveUserCloudData } = useFirebase()
    if (!currentUser.value) return

    if (cloudSyncTimeout) clearTimeout(cloudSyncTimeout)
    cloudSyncTimeout = setTimeout(() => {
      saveUserCloudData({
        filaments,
        printers,
        platforms,
        settings,
        quotes: savedQuotes
      })
    }, 600)
  } catch (err) {
    console.error('Cloud sync error:', err)
  }
}

const saveFilaments = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.FILAMENTS, JSON.stringify(filaments))
  }
  triggerCloudSync()
}

const savePrinters = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify(printers))
  }
  triggerCloudSync()
}

const saveSettings = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }
  triggerCloudSync()
}

const savePlatforms = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms))
  }
  triggerCloudSync()
}

const saveQuotes = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SAVED_QUOTES, JSON.stringify(savedQuotes))
  }
  triggerCloudSync()
}

// Load cloud data for specific logged-in user
const loadUserSpecificData = async (uid: string) => {
  try {
    const { loadUserCloudData, saveUserCloudData } = useFirebase()
    const cloudData = await loadUserCloudData(uid)
    if (cloudData) {
      if (Array.isArray(cloudData.filaments)) {
        filaments.splice(0, filaments.length, ...cloudData.filaments)
      }
      if (Array.isArray(cloudData.printers)) {
        printers.splice(0, printers.length, ...cloudData.printers)
      }
      if (Array.isArray(cloudData.platforms)) {
        platforms.splice(0, platforms.length, ...cloudData.platforms)
      }
      if (cloudData.settings) {
        Object.assign(settings, cloudData.settings)
      }
      if (Array.isArray(cloudData.quotes)) {
        savedQuotes.splice(0, savedQuotes.length, ...cloudData.quotes)
      }
    } else {
      // First-time user in Firebase: seed their cloud profile with current state
      await saveUserCloudData({
        filaments,
        printers,
        platforms,
        settings,
        quotes: savedQuotes
      })
    }

    if (!printers.some(p => p.id === activeJob.printerId) && printers.length > 0) {
      activeJob.printerId = printers[0].id
    }
    if (activeJob.filaments.length > 0 && !filaments.some(f => f.id === activeJob.filaments[0].filamentId) && filaments.length > 0) {
      activeJob.filaments[0].filamentId = filaments[0].id
    }
  } catch (err) {
    console.error('Error loading user-specific data from cloud:', err)
  }
}

const resetToGuestData = () => {
  isInitialized = false
  initStore()
}

export const use3DStore = () => {
  // Auto-initialize when used on client-side
  if (typeof window !== 'undefined' && !isInitialized) {
    initStore()
  }

  // Cost per gram helper
  const getFilamentCostPerGram = (f: Filament): number => {
    const totalCost = (Number(f.pricePaid) || 0) + (Number(f.shippingCost) || 0)
    const weight = Number(f.spoolWeightG) || 1000
    return weight > 0 ? totalCost / weight : 0
  }

  // Calculations for current active job
  const jobCostBreakdown = computed<JobCostBreakdown>(() => {
    const printer = printers.find(p => p.id === activeJob.printerId) || printers[0] || {
      powerWatts: 150,
      purchaseCost: 2500,
      lifespanHours: 3500,
      maintenancePerHour: 1.2
    }

    // 1. Filament cost
    let filamentCost = 0
    let totalGrams = 0
    for (const item of activeJob.filaments) {
      const f = filaments.find(fil => fil.id === item.filamentId)
      const grams = Number(item.grams) || 0
      totalGrams += grams
      if (f) {
        filamentCost += getFilamentCostPerGram(f) * grams
      }
    }

    // 2. Printing Time (hours)
    const printHours = (Number(activeJob.printTimeHours) || 0) + ((Number(activeJob.printTimeMinutes) || 0) / 60)

    // 3. Energy cost: (Watts / 1000) * hours * R$/kWh
    const energyCost = ((printer.powerWatts || 150) / 1000) * printHours * (Number(settings.electricityCostPerKwh) || 0.92)

    // 4. Machine depreciation: (Purchase Cost / Lifespan Hours) * print hours
    const depreciationPerHour = (printer.purchaseCost || 0) / Math.max(printer.lifespanHours || 3000, 1)
    const depreciationCost = depreciationPerHour * printHours

    // 5. Maintenance / nozzle wear
    const maintenanceCost = (Number(printer.maintenancePerHour) || 0) * printHours

    // 6. Labor cost: (Prep minutes / 60) * hourlyLaborRate
    const prepHours = (Number(activeJob.prepTimeMinutes) || 0) / 60
    const laborCost = prepHours * (Number(settings.hourlyLaborRate) || 35.00)

    // 7. Extra packaging and hardware
    const packagingCost = Number(activeJob.packagingCost) || 0
    const hardwareCost = Number(activeJob.hardwareCost) || 0

    // Direct operational subtotal before failure margin
    const subtotal = filamentCost + energyCost + depreciationCost + maintenanceCost + laborCost + packagingCost + hardwareCost

    // 8. Failure risk margin
    const failurePercent = activeJob.customFailureRate !== undefined 
      ? Number(activeJob.customFailureRate) 
      : Number(settings.defaultFailureRate || 8)
    const failureRiskCost = subtotal * (failurePercent / 100)

    // Total Base Production Cost
    const totalProductionCost = subtotal + failureRiskCost

    // Target Profit Margin (Markup)
    const profitMarginPercent = activeJob.customProfitMargin !== undefined 
      ? Number(activeJob.customProfitMargin) 
      : Number(settings.defaultProfitMargin || 65)

    // Recommended direct sale price (e.g. 65% markup on production cost)
    const directProfit = totalProductionCost * (profitMarginPercent / 100)
    const recommendedDirectPrice = totalProductionCost + directProfit
    const directMarginPercent = recommendedDirectPrice > 0 ? (directProfit / recommendedDirectPrice) * 100 : 0

    return {
      filamentCost,
      energyCost,
      depreciationCost,
      maintenanceCost,
      laborCost,
      packagingCost,
      hardwareCost,
      failureRiskCost,
      totalProductionCost,
      recommendedDirectPrice,
      directProfit,
      directMarginPercent,
      totalGrams,
      totalPrintHours: printHours
    }
  })

  // Solve recommended selling price for a platform
  const solvePlatformPrice = (
    productionCost: number, 
    targetProfit: number, 
    platform: PlatformFeeConfig, 
    taxRatePercent: number
  ): number => {
    const comRate = (Number(platform.commissionPercent) || 0) / 100
    const payRate = (Number(platform.paymentProcessingPercent) || 0) / 100
    const taxRate = (Number(taxRatePercent) || 0) / 100
    const totalPercentageDeduction = comRate + payRate + taxRate

    if (totalPercentageDeduction >= 0.98) {
      return (productionCost + targetProfit) * 2
    }

    const divisor = 1 - totalPercentageDeduction
    const fixedFee = Number(platform.fixedFee) || 0
    const priceWithFixed = (productionCost + targetProfit + fixedFee) / divisor
    const shippingFee = Number(platform.freeShippingCost) || 0
    const priceWithShipping = (productionCost + targetProfit + shippingFee) / divisor

    const fixedThreshold = Number(platform.fixedFeeThreshold) || 99999
    const shipThreshold = Number(platform.freeShippingThreshold) || 99999

    if (platform.fixedFeeThreshold > 0 && platform.fixedFeeThreshold < 99999) {
      if (priceWithFixed < platform.fixedFeeThreshold) {
        return Math.max(priceWithFixed, 5)
      } else {
        return Math.max(priceWithShipping, 5)
      }
    }

    return Math.max((productionCost + targetProfit + fixedFee + (priceWithShipping >= shipThreshold ? shippingFee : 0)) / divisor, 5)
  }

  // Calculate platform simulation details given a selling price
  const simulatePlatformDetail = (
    platform: PlatformFeeConfig, 
    salePrice: number, 
    productionCost: number
  ): PlatformSimulation => {
    const price = Math.max(Number(salePrice) || 0, 0)
    const comPercent = Number(platform.commissionPercent) || 0
    const payPercent = Number(platform.paymentProcessingPercent) || 0
    const taxPercent = Number(settings.taxRatePercent) || 0

    const commissionAmount = price * (comPercent / 100)
    const paymentProcessingAmount = price * (payPercent / 100)

    let fixedFeeAmount = 0
    if (price > 0) {
      if (!platform.fixedFeeThreshold || platform.fixedFeeThreshold >= 99999) {
        fixedFeeAmount = Number(platform.fixedFee) || 0
      } else if (price < platform.fixedFeeThreshold) {
        fixedFeeAmount = Number(platform.fixedFee) || 0
      }
    }

    let shippingSubsidyAmount = 0
    const isAboveThreshold = platform.freeShippingThreshold > 0 && price >= platform.freeShippingThreshold
    if (isAboveThreshold && platform.freeShippingCost > 0) {
      shippingSubsidyAmount = Number(platform.freeShippingCost) || 0
    }

    const taxAmount = price * (taxPercent / 100)
    const totalFees = commissionAmount + paymentProcessingAmount + fixedFeeAmount + shippingSubsidyAmount + taxAmount
    const netRevenue = Math.max(price - totalFees, 0)
    const netProfit = netRevenue - productionCost
    const netProfitMarginPercent = price > 0 ? (netProfit / price) * 100 : 0

    return {
      platformId: platform.id,
      platformName: platform.name,
      category: platform.category,
      badgeColor: platform.badgeColor,
      recommendedPrice: 0,
      salePriceToSimulate: price,
      commissionAmount: commissionAmount + paymentProcessingAmount,
      fixedFeeAmount,
      shippingSubsidyAmount,
      taxAmount,
      totalFees,
      netRevenue,
      netProfit,
      netProfitMarginPercent,
      isAboveThreshold
    }
  }

  // Platform simulation array for current active job
  const platformSimulations = computed<PlatformSimulation[]>(() => {
    const breakdown = jobCostBreakdown.value
    const targetProfit = breakdown.directProfit
    const cost = breakdown.totalProductionCost

    return platforms
      .filter(p => p.enabled)
      .map(platform => {
        const recommended = solvePlatformPrice(cost, targetProfit, platform, settings.taxRatePercent)
        const currentSimPrice = manualSalePrice[platform.id] !== undefined 
          ? manualSalePrice[platform.id] 
          : recommended

        const sim = simulatePlatformDetail(platform, currentSimPrice, cost)
        sim.recommendedPrice = recommended
        return sim
      })
  })

  // Filament Actions
  const addFilament = (filament: Omit<Filament, 'id'>) => {
    const newFilament: Filament = {
      ...filament,
      id: 'f-' + Date.now()
    }
    filaments.unshift(newFilament)
    saveFilaments()
    return newFilament
  }

  const updateFilament = (id: string, updated: Partial<Filament>) => {
    const index = filaments.findIndex(f => f.id === id)
    if (index !== -1) {
      Object.assign(filaments[index], updated)
      saveFilaments()
    }
  }

  const deleteFilament = (id: string) => {
    const index = filaments.findIndex(f => f.id === id)
    if (index !== -1) {
      filaments.splice(index, 1)
      saveFilaments()
    }
  }

  // Printer Actions
  const addPrinter = (printer: Omit<Printer, 'id'>) => {
    const newPrinter: Printer = {
      ...printer,
      id: 'p-' + Date.now()
    }
    printers.push(newPrinter)
    savePrinters()
    return newPrinter
  }

  const updatePrinter = (id: string, updated: Partial<Printer>) => {
    const index = printers.findIndex(p => p.id === id)
    if (index !== -1) {
      Object.assign(printers[index], updated)
      savePrinters()
    }
  }

  const deletePrinter = (id: string) => {
    if (printers.length <= 1) return
    const index = printers.findIndex(p => p.id === id)
    if (index !== -1) {
      printers.splice(index, 1)
      savePrinters()
    }
  }

  // Platform Actions
  const addPlatform = (platform: Omit<PlatformFeeConfig, 'id'>) => {
    const newPlatform: PlatformFeeConfig = {
      ...platform,
      id: 'plat-' + Date.now()
    }
    platforms.push(newPlatform)
    savePlatforms()
    return newPlatform
  }

  const updatePlatform = (id: string, updated: Partial<PlatformFeeConfig>) => {
    const index = platforms.findIndex(p => p.id === id)
    if (index !== -1) {
      Object.assign(platforms[index], updated)
      savePlatforms()
    }
  }

  const deletePlatform = (id: string) => {
    const index = platforms.findIndex(p => p.id === id)
    if (index !== -1) {
      platforms.splice(index, 1)
      savePlatforms()
    }
  }

  const resetPlatformsToDefault = () => {
    platforms.splice(0, platforms.length, ...JSON.parse(JSON.stringify(DEFAULT_PLATFORMS)))
    savePlatforms()
  }

  const resetFilamentsToDefault = () => {
    filaments.splice(0, filaments.length, ...JSON.parse(JSON.stringify(DEFAULT_FILAMENTS)))
    saveFilaments()
  }

  const resetPrintersToDefault = () => {
    printers.splice(0, printers.length, ...JSON.parse(JSON.stringify(DEFAULT_PRINTERS)))
    savePrinters()
  }

  // Quotes Actions
  const saveCurrentQuote = (selectedPlatformName?: string, finalPrice?: number, finalProfit?: number) => {
    const quote: SavedQuote = {
      ...JSON.parse(JSON.stringify(activeJob)),
      id: 'quote-' + Date.now(),
      createdAt: new Date().toISOString(),
      breakdown: JSON.parse(JSON.stringify(jobCostBreakdown.value)),
      selectedPlatformPrice: selectedPlatformName && finalPrice ? {
        platformName: selectedPlatformName,
        price: finalPrice,
        profit: finalProfit || 0
      } : undefined
    }
    savedQuotes.unshift(quote)
    saveQuotes()
    return quote
  }

  const deleteQuote = (quoteId: string) => {
    const index = savedQuotes.findIndex(q => q.id === quoteId)
    if (index !== -1) {
      savedQuotes.splice(index, 1)
      saveQuotes()
    }
  }

  const loadQuoteIntoActive = (quote: SavedQuote) => {
    activeJob.title = quote.title
    activeJob.clientName = quote.clientName || ''
    activeJob.printerId = quote.printerId
    activeJob.filaments = JSON.parse(JSON.stringify(quote.filaments))
    activeJob.printTimeHours = quote.printTimeHours
    activeJob.printTimeMinutes = quote.printTimeMinutes
    activeJob.prepTimeMinutes = quote.prepTimeMinutes
    activeJob.packagingCost = quote.packagingCost
    activeJob.hardwareCost = quote.hardwareCost
    activeJob.notes = quote.notes || ''
    if (quote.customFailureRate !== undefined) activeJob.customFailureRate = quote.customFailureRate
    if (quote.customProfitMargin !== undefined) activeJob.customProfitMargin = quote.customProfitMargin
  }

  return {
    filaments,
    printers,
    settings,
    platforms,
    savedQuotes,
    activeJob,
    manualSalePrice,
    jobCostBreakdown,
    platformSimulations,
    initStore,
    getFilamentCostPerGram,
    solvePlatformPrice,
    simulatePlatformDetail,
    // CRUD
    addFilament,
    updateFilament,
    deleteFilament,
    resetFilamentsToDefault,
    addPrinter,
    updatePrinter,
    deletePrinter,
    resetPrintersToDefault,
    addPlatform,
    updatePlatform,
    deletePlatform,
    resetPlatformsToDefault,
    saveSettings,
    saveCurrentQuote,
    deleteQuote,
    loadQuoteIntoActive,
    loadUserSpecificData,
    resetToGuestData,
    triggerCloudSync
  }
}
