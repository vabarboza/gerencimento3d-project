import QRCode from 'qrcode'

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'

export interface PixConfig {
  pixKey: string
  pixKeyType?: PixKeyType
  beneficiaryName: string
  beneficiaryCity?: string
  amount?: number
  txId?: string
  description?: string
}

// EMV format helper: ID (2 digits) + Length (2 digits) + Value
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

// CRC16-CCITT (0xFFFF polynomial 0x1021) standard required by Banco Central do Brasil
function crc16(str: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF
      } else {
        crc = (crc << 1) & 0xFFFF
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Clean and normalize strings (remove accents, max lengths)
function sanitizeText(str: string, maxLen: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .slice(0, maxLen)
    .trim()
}

/**
 * Normalizes Pix keys according to BACEN strict rules:
 * - CPF: exactly 11 digits
 * - CNPJ: exactly 14 digits
 * - Phone: international format starting with +55 (e.g. +5511999999999)
 * - Email: trimmed lowercase
 * - Random: trimmed lowercase UUID
 */
export function normalizePixKey(key: string, type?: PixKeyType): string {
  if (!key) return ''
  const trimmed = key.trim()

  let detectedType = type
  if (!detectedType) {
    if (trimmed.includes('@')) detectedType = 'email'
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) detectedType = 'random'
    else {
      const digits = trimmed.replace(/\D/g, '')
      if (digits.length === 11 && (trimmed.startsWith('+') || trimmed.includes('('))) detectedType = 'phone'
      else if (digits.length === 14) detectedType = 'cnpj'
      else if (digits.length === 11) detectedType = 'cpf'
    }
  }

  switch (detectedType) {
    case 'cpf':
      return trimmed.replace(/\D/g, '').slice(0, 11)
    case 'cnpj':
      return trimmed.replace(/\D/g, '').slice(0, 14)
    case 'phone': {
      const digits = trimmed.replace(/\D/g, '')
      if (digits.startsWith('55') && digits.length >= 12) {
        return `+${digits}`
      }
      return `+55${digits}`
    }
    case 'email':
      return trimmed.toLowerCase()
    case 'random':
      return trimmed.toLowerCase()
    default:
      return trimmed
  }
}

/**
 * Generates the official BACEN Pix "Copia e Cola" (BR Code) string
 */
export function generatePixPayload(config: PixConfig): string {
  const {
    pixKey,
    pixKeyType,
    beneficiaryName,
    beneficiaryCity = 'SAO PAULO',
    amount,
    txId = '***',
    description
  } = config

  const normKey = normalizePixKey(pixKey, pixKeyType)
  const normName = sanitizeText(beneficiaryName, 25) || 'RECEBEDOR'
  const normCity = sanitizeText(beneficiaryCity, 15) || 'SAO PAULO'
  const normTxId = (txId || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***'

  // Merchant Account Info (ID 26)
  let accountInfo = formatEMV('00', 'br.gov.bcb.pix')
  accountInfo += formatEMV('01', normKey)
  if (description) {
    accountInfo += formatEMV('02', sanitizeText(description, 40))
  }

  let payload = ''
  payload += formatEMV('00', '01') // Payload Format Indicator
  payload += formatEMV('26', accountInfo) // Merchant Account Information
  payload += formatEMV('52', '0000') // Merchant Category Code
  payload += formatEMV('53', '986') // Transaction Currency (986 = BRL)

  if (amount && amount > 0) {
    payload += formatEMV('54', amount.toFixed(2)) // Transaction Amount
  }

  payload += formatEMV('58', 'BR') // Country Code
  payload += formatEMV('59', normName) // Merchant Name
  payload += formatEMV('60', normCity) // Merchant City

  // Additional Data Field Template (ID 62)
  const additionalData = formatEMV('05', normTxId)
  payload += formatEMV('62', additionalData)

  // CRC16 placeholder (ID 63, length 04)
  payload += '6304'
  const crc = crc16(payload)

  return payload + crc
}

/**
 * Generates a high-quality QR Code as Base64 Data URL
 */
export async function generatePixQrCodeDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('Error generating PIX QR Code:', err)
    return ''
  }
}
