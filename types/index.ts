export interface Filament {
  id: string
  name: string
  brand: string
  material: 'PLA' | 'PLA Silk' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'Nylon' | 'Resina' | 'Outro'
  color: string
  colorName: string
  diameter: 1.75 | 2.85
  spoolWeightG: number // ex: 1000g
  pricePaid: number // ex: R$ 109.90
  shippingCost: number // frete proporcional
  remainingG: number // estoque restante
  density: number // g/cm³
  notes?: string
}

export interface Printer {
  id: string
  name: string
  brand: string
  model: string
  powerWatts: number // Consumo médio em Watts (ex: 120W a 350W)
  purchaseCost: number // Valor pago na impressora (R$)
  lifespanHours: number // Horas estimadas de vida útil (ex: 4000h)
  maintenancePerHour: number // Custo de bico, correias, lubrificação (R$/h)
  isDefault?: boolean
}

export interface GlobalSettings {
  electricityCostPerKwh: number // R$/kWh (ex: 0.89)
  hourlyLaborRate: number // R$/h de mão de obra técnica
  defaultFailureRate: number // % de margem de falha (ex: 8%)
  defaultProfitMargin: number // % de margem de lucro desejada (ex: 60%)
  taxRatePercent: number // % de imposto (MEI, Simples Nacional, ex: 6%)
  currency: string
}

export interface PlatformFeeConfig {
  id: string
  name: string
  category: 'marketplace' | 'direct' | 'ecommerce'
  badgeColor: string
  commissionPercent: number // Comissão em % (ex: 14% para Shopee ou ML)
  fixedFee: number // Taxa fixa em R$ (ex: 6.75 ou 4.00)
  fixedFeeThreshold: number // Preço máximo em que a taxa fixa se aplica (ex: R$ 79.00 no ML)
  freeShippingCost: number // Custo do frete grátis subsidiado pelo vendedor (ex: R$ 25.00)
  freeShippingThreshold: number // Preço a partir do qual o frete grátis é obrigatório (ex: R$ 79.00)
  paymentProcessingPercent: number // Taxa financeira/parcelamento (ex: 0% ou 2.5%)
  enabled: boolean
  description: string
}

export interface PrintJobFilamentUsage {
  filamentId: string
  grams: number
}

export interface PrintJob {
  id: string
  title: string
  clientName?: string
  printerId: string
  filaments: PrintJobFilamentUsage[]
  printTimeHours: number
  printTimeMinutes: number
  prepTimeMinutes: number // Tempo de fatiamento + suporte + pós-processamento
  customFailureRate?: number // %
  customProfitMargin?: number // %
  packagingCost: number // Caixa, fita, plástico bolha, cartão
  hardwareCost: number // Insumos extras (ímãs, parafusos, cola, LED)
  notes?: string
  createdAt: string
}

export interface JobCostBreakdown {
  filamentCost: number
  energyCost: number
  depreciationCost: number
  maintenanceCost: number
  laborCost: number
  packagingCost: number
  hardwareCost: number
  failureRiskCost: number
  totalProductionCost: number // Custo base real de fabricação
  recommendedDirectPrice: number // Preço de venda direta (PIX / Dinheiro)
  directProfit: number
  directMarginPercent: number
  totalGrams: number
  totalPrintHours: number
}

export interface PlatformSimulation {
  platformId: string
  platformName: string
  category: string
  badgeColor: string
  recommendedPrice: number // Preço para manter o lucro líquido alvo
  salePriceToSimulate: number // Preço digitado na simulação direta
  commissionAmount: number
  fixedFeeAmount: number
  shippingSubsidyAmount: number
  taxAmount: number
  totalFees: number
  netRevenue: number // Valor que entra na conta
  netProfit: number // Lucro líquido após abater custo de fabricação
  netProfitMarginPercent: number
  isAboveThreshold: boolean
}

export interface SavedQuote extends PrintJob {
  breakdown: JobCostBreakdown
  selectedPlatformPrice?: {
    platformName: string
    price: number
    profit: number
  }
}

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
  isAnonymous?: boolean
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export interface UserCloudData {
  filaments: Filament[]
  printers: Printer[]
  platforms: PlatformFeeConfig[]
  settings: GlobalSettings
  quotes: SavedQuote[]
  updatedAt?: string
}

