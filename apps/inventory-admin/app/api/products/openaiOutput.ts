export function extractOutputText(data: any): string | null {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim()
  }

  const outputItems = Array.isArray(data?.output) ? data.output : []

  for (const item of outputItems) {
    const contents = Array.isArray(item?.content) ? item.content : []

    for (const content of contents) {
      if (typeof content?.text === 'string' && content.text.trim()) {
        return content.text.trim()
      }

      if (typeof content?.output_text === 'string' && content.output_text.trim()) {
        return content.output_text.trim()
      }

      if (typeof content?.value === 'string' && content.value.trim()) {
        return content.value.trim()
      }

      if (typeof content?.json === 'string' && content.json.trim()) {
        return content.json.trim()
      }
    }
  }

  return null
}
