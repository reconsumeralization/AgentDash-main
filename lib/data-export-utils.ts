/**
 * Data Export Utilities
 * Utility functions for converting data to various formats
 */

export function convertToCSV(data: any[]): string {
  if (!data.length) return ''

  const headers = Object.keys(data[0])
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}

export function convertToXML(data: any): string {
  function objectToXML(obj: any, rootName = 'item'): string {
    if (obj === null || obj === undefined) return `<${rootName}></${rootName}>`

    if (typeof obj !== 'object') {
      return `<${rootName}>${obj}</${rootName}>`
    }

    if (Array.isArray(obj)) {
      return obj.map(item => objectToXML(item, 'item')).join('')
    }

    let xml = `<${rootName}>`
    for (const [key, value] of Object.entries(obj)) {
      xml += objectToXML(value, key)
    }
    xml += `</${rootName}>`

    return xml
  }

  if (Array.isArray(data)) {
    return `<?xml version="1.0" encoding="UTF-8"?><data>${data.map(item => objectToXML(item)).join('')}</data>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?><data>${objectToXML(data)}</data>`
}
