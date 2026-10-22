import JSZip from 'jszip'

export interface ParsedGcodeResult {
  fileName: string
  slicer: 'Bambu Studio / OrcaSlicer' | 'PrusaSlicer' | 'UltiMaker Cura' | 'Creality Print' | 'Genérico / Outro'
  printTimeHours: number
  printTimeMinutes: number
  totalGrams: number
  filamentsGrams: number[] // per spool if multicolor AMS
  layerHeight?: number
  bedTemp?: number
  nozzleTemp?: number
}

// Convert "1d 3h 45m 12s", "3h 45m", "45m 10s", "120s" into hours and minutes
function parseTimeString(timeStr: string): { hours: number, minutes: number } {
  let totalMinutes = 0

  // Check days
  const daysMatch = timeStr.match(/(\d+)\s*d/i)
  if (daysMatch) {
    totalMinutes += parseInt(daysMatch[1], 10) * 24 * 60
  }

  // Check hours
  const hoursMatch = timeStr.match(/(\d+)\s*h/i)
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60
  }

  // Check minutes
  const minMatch = timeStr.match(/(\d+)\s*m(?:in)?(?![a-z])/i)
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10)
  }

  // Check seconds
  const secMatch = timeStr.match(/(\d+)\s*s/i)
  if (secMatch && totalMinutes === 0) {
    const secs = parseInt(secMatch[1], 10)
    totalMinutes = Math.ceil(secs / 60)
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return { hours, minutes }
}

// Extract metadata from raw text snippet of G-code
export function extractGcodeMetadata(content: string, fileName: string): ParsedGcodeResult {
  let slicer: ParsedGcodeResult['slicer'] = 'Genérico / Outro'
  let printTimeHours = 0
  let printTimeMinutes = 0
  let totalGrams = 0
  let filamentsGrams: number[] = []

  // 1. Identify Slicer
  if (/BambuStudio|OrcaSlicer/i.test(content)) {
    slicer = 'Bambu Studio / OrcaSlicer'
  } else if (/PrusaSlicer/i.test(content)) {
    slicer = 'PrusaSlicer'
  } else if (/Cura/i.test(content)) {
    slicer = 'UltiMaker Cura'
  } else if (/Creality/i.test(content)) {
    slicer = 'Creality Print'
  }

  // 2. Parse Filament Weight (grams)
  // Prusa/Bambu/Orca: ; filament used [g] = 45.2, 80.5
  const multiFilamentMatch = content.match(/;\s*filament used \[g\]\s*=\s*([0-9.,\s]+)/i)
  if (multiFilamentMatch) {
    const parts = multiFilamentMatch[1].split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    if (parts.length > 0) {
      filamentsGrams = parts
      totalGrams = parseFloat(parts.reduce((a, b) => a + b, 0).toFixed(1))
    }
  }

  // Total filament used fallback
  if (totalGrams === 0) {
    const totalMatch = content.match(/;\s*(?:total filament used \[g\]|Filament weight)\s*[:=]\s*([0-9.]+)/i)
    if (totalMatch) {
      totalGrams = parseFloat(parseFloat(totalMatch[1]).toFixed(1))
      filamentsGrams = [totalGrams]
    }
  }

  // Cura fallback: ;Filament used: 12.34m (convert meters to grams assuming ~3g per meter of 1.75mm PLA)
  if (totalGrams === 0) {
    const metersMatch = content.match(/;\s*Filament used:\s*([0-9.]+)m/i)
    if (metersMatch) {
      const meters = parseFloat(metersMatch[1])
      // 1m of 1.75mm PLA is approx 2.98g (volume = pi * r^2 * h = 3.14159 * 0.0875^2 * 100 * 1.24 = ~2.98g)
      totalGrams = parseFloat((meters * 2.98).toFixed(1))
      filamentsGrams = [totalGrams]
    }
  }

  // 3. Parse Estimated Print Time
  // Prusa / Bambu / Orca: ; estimated printing time (normal mode) = 3h 45m 12s
  const estTimeMatch = content.match(/;\s*estimated printing time[^=]*=\s*([^\r\n]+)/i)
  if (estTimeMatch) {
    const parsed = parseTimeString(estTimeMatch[1])
    printTimeHours = parsed.hours
    printTimeMinutes = parsed.minutes
  }

  // Cura format: ;TIME:14400 (seconds)
  if (printTimeHours === 0 && printTimeMinutes === 0) {
    const curaTimeMatch = content.match(/;\s*TIME\s*:\s*(\d+)/i)
    if (curaTimeMatch) {
      const totalSeconds = parseInt(curaTimeMatch[1], 10)
      printTimeHours = Math.floor(totalSeconds / 3600)
      printTimeMinutes = Math.floor((totalSeconds % 3600) / 60)
    }
  }

  // Creality / Simplify3D fallback: Print time = 2h 30m or Print Time: 1 hour(s) 20 minute(s)
  if (printTimeHours === 0 && printTimeMinutes === 0) {
    const genericTimeMatch = content.match(/(?:Print time|print_time)\s*[:=]\s*([^\r\n]+)/i)
    if (genericTimeMatch) {
      const parsed = parseTimeString(genericTimeMatch[1])
      printTimeHours = parsed.hours
      printTimeMinutes = parsed.minutes
    }
  }

  // Layer height
  let layerHeight: number | undefined
  const layerMatch = content.match(/;\s*(?:layer_height|Layer height)\s*[:=]\s*([0-9.]+)/i)
  if (layerMatch) {
    layerHeight = parseFloat(layerMatch[1])
  }

  return {
    fileName,
    slicer,
    printTimeHours,
    printTimeMinutes,
    totalGrams,
    filamentsGrams: filamentsGrams.length > 0 ? filamentsGrams : [totalGrams],
    layerHeight
  }
}

// Parse a File (either .gcode, .gcode.3mf, or .3mf)
export async function parseSlicerFile(file: File): Promise<ParsedGcodeResult> {
  const name = file.name.toLowerCase()

  // Handle .3MF / .gcode.3mf archives
  if (name.endsWith('.3mf') || name.endsWith('.zip')) {
    try {
      const zip = await JSZip.loadAsync(file)
      
      // Check for Bambu/Orca metadata plate gcode: Metadata/plate_1.gcode or plate_*.gcode
      let gcodeContent = ''
      for (const relativePath in zip.files) {
        if (relativePath.endsWith('.gcode')) {
          // Read the first found gcode
          gcodeContent = await zip.files[relativePath].async('text')
          break
        }
      }

      // If plate_*.gcode found inside 3MF
      if (gcodeContent) {
        // Sample head & tail to avoid performance lag
        const sampleText = gcodeContent.slice(0, 50000) + '\n' + gcodeContent.slice(-100000)
        return extractGcodeMetadata(sampleText, file.name)
      }

      // Check for config files inside 3MF (slice_info.config or plate_1.json)
      for (const relativePath in zip.files) {
        if (relativePath.includes('slice_info') || relativePath.includes('project_settings') || relativePath.includes('plate_1.json')) {
          const configText = await zip.files[relativePath].async('text')
          return extractGcodeMetadata(configText, file.name)
        }
      }
    } catch (err) {
      console.warn('Error reading 3MF archive with JSZip:', err)
    }
  }

  // Standard .gcode or fallback: Read first 64KB and last 128KB of the file
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const sliceSize = Math.min(file.size, 150000)

    // Read first slice
    const blobStart = file.slice(0, sliceSize)
    reader.onload = (e) => {
      const startText = (e.target?.result as string) || ''

      // If file is small, just parse it directly
      if (file.size <= 250000) {
        resolve(extractGcodeMetadata(startText, file.name))
        return
      }

      // Read last slice for Prusa/Cura which often put summary at the end
      const readerEnd = new FileReader()
      const blobEnd = file.slice(Math.max(0, file.size - 150000), file.size)
      readerEnd.onload = (eEnd) => {
        const endText = (eEnd.target?.result as string) || ''
        const fullSample = startText + '\n' + endText
        resolve(extractGcodeMetadata(fullSample, file.name))
      }
      readerEnd.onerror = () => resolve(extractGcodeMetadata(startText, file.name))
      readerEnd.readAsText(blobEnd)
    }

    reader.onerror = (err) => reject(err)
    reader.readAsText(blobStart)
  })
}
