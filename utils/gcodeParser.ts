import JSZip from 'jszip'

export interface ParsedGcodeResult {
  fileName: string
  modelTitle?: string
  slicer: 'Bambu Studio / OrcaSlicer' | 'PrusaSlicer' | 'UltiMaker Cura' | 'Creality Print' | 'Genérico / Outro' | 'Modelo 3D (Sem Fatiamento)'
  printTimeHours: number
  printTimeMinutes: number
  totalGrams: number
  filamentsGrams: number[] // per spool if multicolor AMS
  filamentTypes?: string[] // e.g. ['PLA', 'PETG']
  filamentColors?: string[] // e.g. ['#FFFFFF', '#FF0000']
  layerHeight?: number
  bedTemp?: number
  nozzleTemp?: number
  isSliced: boolean
  warningMessage?: string
}

// Convert diverse time representations (seconds, "HH:MM:SS", "1d 3h 45m 12s", "3h 45m", "45min", "2.5h") into hours and minutes
export function parseTimeString(timeStr: string | number): { hours: number, minutes: number } {
  if (typeof timeStr === 'number') {
    const totalMinutes = Math.round(timeStr / 60)
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    }
  }

  const s = String(timeStr).trim()
  if (!s) return { hours: 0, minutes: 0 }

  // 1. Raw integer seconds (e.g. "7925" or "14400s")
  if (/^\d+\s*s?$/i.test(s)) {
    const secs = parseInt(s, 10)
    if (!isNaN(secs) && secs > 0) {
      const totalMinutes = Math.round(secs / 60)
      return {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60
      }
    }
  }

  // 2. Colon-separated time: "HH:MM:SS" or "H:MM:SS" or "HH:MM" (common in Creality Print, Klipper, Marlin)
  const colonMatch = s.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/)
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10)
    let minutes = parseInt(colonMatch[2], 10)
    if (colonMatch[3] && parseInt(colonMatch[3], 10) >= 30) {
      minutes += 1
    }
    const totalMinutes = hours * 60 + minutes
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    }
  }

  let totalMinutes = 0

  // Check days
  const daysMatch = s.match(/(\d+)\s*(?:d|day|dias?)/i)
  if (daysMatch) {
    totalMinutes += parseInt(daysMatch[1], 10) * 24 * 60
  }

  // Check decimal or integer hours (e.g. "3h", "3 hours", "2.5h")
  const hoursMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|horas?)/i)
  if (hoursMatch) {
    totalMinutes += Math.round(parseFloat(hoursMatch[1]) * 60)
  }

  // Check minutes
  const minMatch = s.match(/(\d+)\s*(?:m|min|minute|minutos?)(?![a-z])/i)
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10)
  }

  // Check seconds
  const secMatch = s.match(/(\d+)\s*(?:s|sec|segundos?)/i)
  if (secMatch && totalMinutes === 0) {
    const secs = parseInt(secMatch[1], 10)
    totalMinutes = Math.ceil(secs / 60)
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return { hours, minutes }
}

// Parse Bambu Studio / OrcaSlicer slice_info.config XML
export function parse3mfSliceInfo(xmlText: string, fileName: string): ParsedGcodeResult | null {
  if (!xmlText.includes('prediction') && !xmlText.includes('weight') && !xmlText.includes('filament')) {
    return null
  }

  let printTimeSeconds = 0
  let totalGrams = 0
  const filamentsGrams: number[] = []
  const filamentTypes: string[] = []
  const filamentColors: string[] = []

  // Prediction (seconds) - supports both attribute format and node format
  const predMatch1 = xmlText.match(/key=["']prediction["']\s+value=["']([0-9.]+)["']/i)
  const predMatch2 = xmlText.match(/<prediction>([0-9.]+)<\/prediction>/i)
  if (predMatch1) {
    printTimeSeconds = parseFloat(predMatch1[1])
  } else if (predMatch2) {
    printTimeSeconds = parseFloat(predMatch2[1])
  }

  // Weight (grams)
  const weightMatch1 = xmlText.match(/key=["']weight["']\s+value=["']([0-9.]+)["']/i)
  const weightMatch2 = xmlText.match(/<weight>([0-9.]+)<\/weight>/i)
  if (weightMatch1) {
    totalGrams = parseFloat(weightMatch1[1])
  } else if (weightMatch2) {
    totalGrams = parseFloat(weightMatch2[1])
  }

  // Filaments: <filament id="1" ... used_g="43.5" type="PLA" color="#FFFFFF" .../>
  const filamentAttrRegex = /<filament\b([^>]*)\/?>/gi
  let filMatch: RegExpExecArray | null
  while ((filMatch = filamentAttrRegex.exec(xmlText)) !== null) {
    const attrs = filMatch[1]
    const gMatch = attrs.match(/used_g=["']([0-9.]+)["']/i)
    if (gMatch) {
      const g = parseFloat(gMatch[1])
      if (!isNaN(g) && g > 0) {
        filamentsGrams.push(parseFloat(g.toFixed(1)))
      }
    }
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i)
    if (typeMatch) filamentTypes.push(typeMatch[1])
    const colorMatch = attrs.match(/color=["']([^"']+)["']/i)
    if (colorMatch) filamentColors.push(colorMatch[1])
  }

  // Fallback for node format: <filament><used_g>43.5</used_g></filament>
  if (filamentsGrams.length === 0) {
    const usedGTagRegex = /<used_g>([0-9.]+)<\/used_g>/gi
    let tagMatch: RegExpExecArray | null
    while ((tagMatch = usedGTagRegex.exec(xmlText)) !== null) {
      const g = parseFloat(tagMatch[1])
      if (!isNaN(g) && g > 0) {
        filamentsGrams.push(parseFloat(g.toFixed(1)))
      }
    }
  }

  // Sum filaments if total weight was not explicitly given
  if (totalGrams === 0 && filamentsGrams.length > 0) {
    totalGrams = parseFloat(filamentsGrams.reduce((a, b) => a + b, 0).toFixed(1))
  }

  if (printTimeSeconds > 0 || totalGrams > 0) {
    const timeParsed = parseTimeString(printTimeSeconds)
    return {
      fileName,
      slicer: 'Bambu Studio / OrcaSlicer',
      printTimeHours: timeParsed.hours,
      printTimeMinutes: timeParsed.minutes,
      totalGrams: parseFloat(totalGrams.toFixed(1)),
      filamentsGrams: filamentsGrams.length > 0 ? filamentsGrams : [parseFloat(totalGrams.toFixed(1))],
      filamentTypes: filamentTypes.length > 0 ? filamentTypes : undefined,
      filamentColors: filamentColors.length > 0 ? filamentColors : undefined,
      isSliced: true
    }
  }

  return null
}

// Parse plate JSON (used by some versions of OrcaSlicer / Bambu)
export function parse3mfPlateJson(jsonText: string, fileName: string): ParsedGcodeResult | null {
  try {
    const data = JSON.parse(jsonText)
    const prediction = data.prediction || data.print_time || data.estimated_time || 0
    let weight = data.weight || data.filament_weight || data.total_weight || 0
    const filamentsGrams: number[] = []

    if (Array.isArray(data.filaments)) {
      for (const f of data.filaments) {
        const g = f.used_g || f.weight || f.grams || 0
        if (g > 0) filamentsGrams.push(parseFloat(Number(g).toFixed(1)))
      }
    }

    if (weight === 0 && filamentsGrams.length > 0) {
      weight = filamentsGrams.reduce((a, b) => a + b, 0)
    }

    if (prediction > 0 || weight > 0) {
      const timeParsed = parseTimeString(prediction)
      return {
        fileName,
        slicer: 'Bambu Studio / OrcaSlicer',
        printTimeHours: timeParsed.hours,
        printTimeMinutes: timeParsed.minutes,
        totalGrams: parseFloat(Number(weight).toFixed(1)),
        filamentsGrams: filamentsGrams.length > 0 ? filamentsGrams : [parseFloat(Number(weight).toFixed(1))],
        isSliced: true
      }
    }
  } catch {}
  return null
}

// Extract model / object title from 3MF metadata (3D/3dmodel.model or model_settings.config)
export function extractModelTitleFrom3mf(modelXml: string): string | undefined {
  // Try <metadata name="Title">My Model Title</metadata>
  const titleMatch = modelXml.match(/<metadata[^>]+name=["']Title["'][^>]*>([^<]+)<\/metadata>/i)
  if (titleMatch && titleMatch[1].trim()) {
    return titleMatch[1].trim()
  }

  // Try <object ... name="My Object Name" ...>
  const objectNameMatch = modelXml.match(/<object\b[^>]*\bname=["']([^"']+)["']/i)
  if (objectNameMatch && objectNameMatch[1].trim() && !objectNameMatch[1].toLowerCase().includes('plate')) {
    return objectNameMatch[1].trim()
  }

  return undefined
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
  } else if (/PrusaSlicer|SuperSlicer|Slic3r/i.test(content)) {
    slicer = 'PrusaSlicer'
  } else if (/Cura/i.test(content)) {
    slicer = 'UltiMaker Cura'
  } else if (/Creality/i.test(content)) {
    slicer = 'Creality Print'
  } else if (/Simplify3D/i.test(content)) {
    slicer = 'Genérico / Outro'
  }

  // 2. Parse Filament Weight (grams)
  // Prusa/Bambu/Orca multi-filament: ; filament used [g] = 45.2, 80.5 or ; filament used [g] : 45.2, 80.5
  const multiFilamentMatch = content.match(/;\s*filament used \[g\]\s*[:=]\s*([0-9.,\s]+)/i)
  if (multiFilamentMatch) {
    const parts = multiFilamentMatch[1]
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n) && n > 0)
    if (parts.length > 0) {
      filamentsGrams = parts
      totalGrams = parseFloat(parts.reduce((a, b) => a + b, 0).toFixed(1))
    }
  }

  // Total filament used fallback (Bambu/Orca/Prusa)
  // ; total filament used [g] = 48.50 or ; total filament used [g] : 48.50
  if (totalGrams === 0) {
    const totalMatch = content.match(/;\s*(?:total filament used \[g\]|total filament weight|filament_weight_total)\s*[:=]\s*([0-9.]+)/i)
    if (totalMatch) {
      totalGrams = parseFloat(parseFloat(totalMatch[1]).toFixed(1))
      filamentsGrams = [totalGrams]
    }
  }

  // Creality Print / Simplify3D fallback: ;Filament weight: 45.2g
  if (totalGrams === 0) {
    const weightMatch = content.match(/;\s*Filament weight\s*[:=]\s*([0-9.]+)\s*g?/i)
    if (weightMatch) {
      totalGrams = parseFloat(parseFloat(weightMatch[1]).toFixed(1))
      filamentsGrams = [totalGrams]
    }
  }

  // PrusaSlicer cm3 fallback: ; filament used [cm3] = 34.8 (approx 1.24 g/cm3 for PLA)
  if (totalGrams === 0) {
    const cm3Match = content.match(/;\s*filament used \[cm3\]\s*[:=]\s*([0-9.]+)/i)
    if (cm3Match) {
      const cm3 = parseFloat(cm3Match[1])
      totalGrams = parseFloat((cm3 * 1.24).toFixed(1))
      filamentsGrams = [totalGrams]
    }
  }

  // Cura fallback: ;Filament used: 12.34m (convert meters to grams: ~2.98g per meter of 1.75mm PLA)
  if (totalGrams === 0) {
    const metersMatch = content.match(/;\s*Filament used:\s*([0-9.]+)m/i)
    if (metersMatch) {
      const meters = parseFloat(metersMatch[1])
      totalGrams = parseFloat((meters * 2.98).toFixed(1))
      filamentsGrams = [totalGrams]
    }
  }

  // 3. Parse Estimated Print Time
  // Bambu Studio & OrcaSlicer:
  // ; total estimated time: 2h 12m 5s OR ; total estimated time = 2h 12m 5s
  // ; model printing time: 2h 5m 0s OR ; model printing time = 2h 5m 0s
  const bambuTotalTime = content.match(/;\s*(?:total estimated time|model printing time)\s*[:=]\s*([^\r\n]+)/i)
  if (bambuTotalTime) {
    const parsed = parseTimeString(bambuTotalTime[1])
    if (parsed.hours > 0 || parsed.minutes > 0) {
      printTimeHours = parsed.hours
      printTimeMinutes = parsed.minutes
    }
  }

  // Prusa / Orca: ; estimated printing time (normal mode) = 3h 45m 12s or ; estimated printing time = ...
  if (printTimeHours === 0 && printTimeMinutes === 0) {
    const estTimeMatch = content.match(/;\s*estimated printing time[^:=]*[:=]\s*([^\r\n]+)/i)
    if (estTimeMatch) {
      const parsed = parseTimeString(estTimeMatch[1])
      printTimeHours = parsed.hours
      printTimeMinutes = parsed.minutes
    }
  }

  // Creality Print / Klipper: ;Estimated Print Time: 02:45:30
  if (printTimeHours === 0 && printTimeMinutes === 0) {
    const crealityTimeMatch = content.match(/;\s*Estimated Print Time\s*[:=]\s*([^\r\n]+)/i)
    if (crealityTimeMatch) {
      const parsed = parseTimeString(crealityTimeMatch[1])
      printTimeHours = parsed.hours
      printTimeMinutes = parsed.minutes
    }
  }

  // Cura format: ;TIME:14400 (seconds) or ;TIME_ELAPSED:14400
  if (printTimeHours === 0 && printTimeMinutes === 0) {
    const curaTimeMatch = content.match(/;\s*TIME(?:_ELAPSED)?\s*:\s*(\d+)/i)
    if (curaTimeMatch) {
      const parsed = parseTimeString(parseInt(curaTimeMatch[1], 10))
      printTimeHours = parsed.hours
      printTimeMinutes = parsed.minutes
    }
  }

  // Generic fallback: Print time = 2h 30m or print_time: 14400
  if (printTimeHours === 0 && printTimeMinutes === 0) {
    const genericTimeMatch = content.match(/(?:Print time|print_time|build_time)\s*[:=]\s*([^\r\n]+)/i)
    if (genericTimeMatch) {
      const parsed = parseTimeString(genericTimeMatch[1])
      printTimeHours = parsed.hours
      printTimeMinutes = parsed.minutes
    }
  }

  // 4. Layer height
  let layerHeight: number | undefined
  const layerMatch = content.match(/;\s*(?:layer_height|Layer height)\s*[:=]\s*([0-9.]+)/i)
  if (layerMatch) {
    layerHeight = parseFloat(layerMatch[1])
  }

  // 5. Nozzle and Bed Temperature
  let nozzleTemp: number | undefined
  const nozzleMatch = content.match(/;\s*(?:nozzle_temperature|temperature|hotend_temp)\s*[:=]\s*([0-9]+)/i)
  if (nozzleMatch) nozzleTemp = parseInt(nozzleMatch[1], 10)

  let bedTemp: number | undefined
  const bedMatch = content.match(/;\s*(?:bed_temperature|bed_temp)\s*[:=]\s*([0-9]+)/i)
  if (bedMatch) bedTemp = parseInt(bedMatch[1], 10)

  const isSliced = totalGrams > 0 || printTimeHours > 0 || printTimeMinutes > 0

  return {
    fileName,
    slicer: isSliced ? slicer : 'Modelo 3D (Sem Fatiamento)',
    printTimeHours,
    printTimeMinutes,
    totalGrams,
    filamentsGrams: filamentsGrams.length > 0 ? filamentsGrams : [totalGrams],
    layerHeight,
    bedTemp,
    nozzleTemp,
    isSliced
  }
}

// Parse a File (either .gcode, .gcode.3mf, or .3mf)
export async function parseSlicerFile(file: File): Promise<ParsedGcodeResult> {
  const name = file.name.toLowerCase()

  // Handle .3MF / .gcode.3mf archives
  if (name.endsWith('.3mf') || name.endsWith('.zip')) {
    try {
      const zip = await JSZip.loadAsync(file)

      let extractedTitle: string | undefined

      // Step 1: Check 3D model XML for project / model name
      for (const relativePath in zip.files) {
        if (relativePath.includes('3dmodel.model') || relativePath.includes('model_settings')) {
          try {
            const modelXml = await zip.files[relativePath].async('text')
            const title = extractModelTitleFrom3mf(modelXml)
            if (title) {
              extractedTitle = title
              break
            }
          } catch {}
        }
      }

      // Step 2: Check for Bambu Studio / OrcaSlicer slice_info.config (Authoritative XML)
      for (const relativePath in zip.files) {
        if (relativePath.endsWith('slice_info.config') || relativePath.includes('slice_info')) {
          try {
            const configText = await zip.files[relativePath].async('text')
            const result = parse3mfSliceInfo(configText, file.name)
            if (result && result.isSliced) {
              if (extractedTitle) result.modelTitle = extractedTitle
              return result
            }
          } catch (err) {
            console.warn('Error parsing slice_info.config:', err)
          }
        }
      }

      // Step 3: Check for plate_*.json (OrcaSlicer / Bambu JSON metadata)
      for (const relativePath in zip.files) {
        if (relativePath.endsWith('.json') && (relativePath.includes('plate') || relativePath.includes('slice'))) {
          try {
            const jsonText = await zip.files[relativePath].async('text')
            const result = parse3mfPlateJson(jsonText, file.name)
            if (result && result.isSliced) {
              if (extractedTitle) result.modelTitle = extractedTitle
              return result
            }
          } catch {}
        }
      }

      // Step 4: Check for embedded G-code files inside 3MF (e.g. Metadata/plate_1.gcode or plate_*.gcode)
      for (const relativePath in zip.files) {
        if (relativePath.endsWith('.gcode')) {
          try {
            const gcodeFile = zip.files[relativePath]
            const gcodeText = await gcodeFile.async('text')

            // Sample head (first 65KB) and tail (last 120KB) to capture Bambu header and Prusa footer comments
            const sample = gcodeText.length > 200000
              ? gcodeText.slice(0, 65000) + '\n' + gcodeText.slice(-120000)
              : gcodeText

            const result = extractGcodeMetadata(sample, file.name)
            if (result.isSliced) {
              if (extractedTitle) result.modelTitle = extractedTitle
              return result
            }
          } catch (err) {
            console.warn('Error reading embedded gcode from 3MF:', err)
          }
        }
      }

      // Step 5: Check PrusaSlicer configuration file inside 3MF (Metadata/Slic3r_PE.config)
      for (const relativePath in zip.files) {
        if (relativePath.includes('Slic3r_PE.config') || relativePath.includes('PrusaSlicer.config')) {
          try {
            const configText = await zip.files[relativePath].async('text')
            const result = extractGcodeMetadata(configText, file.name)
            if (result.isSliced) {
              if (extractedTitle) result.modelTitle = extractedTitle
              return result
            }
          } catch {}
        }
      }

      // If it's a 3MF file without sliced gcode/metadata (pure 3D model)
      return {
        fileName: file.name,
        modelTitle: extractedTitle,
        slicer: 'Modelo 3D (Sem Fatiamento)',
        printTimeHours: 0,
        printTimeMinutes: 0,
        totalGrams: 0,
        filamentsGrams: [],
        isSliced: false,
        warningMessage: 'Arquivo .3MF contém apenas o modelo 3D (geometria). Para carregar tempo e peso automaticamente, exporte o arquivo após fatiar no Bambu Studio, OrcaSlicer ou PrusaSlicer.'
      }
    } catch (err) {
      console.warn('Error processing 3MF archive with JSZip:', err)
    }
  }

  // Standard .gcode or fallback: Read first 100KB and last 150KB of the file
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const sliceSize = Math.min(file.size, 100000)

    // Read first slice
    const blobStart = file.slice(0, sliceSize)
    reader.onload = (e) => {
      const startText = (e.target?.result as string) || ''

      // If file is small, just parse it directly
      if (file.size <= 250000) {
        resolve(extractGcodeMetadata(startText, file.name))
        return
      }

      // Read last slice for Prusa/Cura which put summary statistics at the end
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
