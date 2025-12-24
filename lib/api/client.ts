export const apiClient = {
  get: async (endpoint: string) => {
    const res = await fetch(`https://api.learninghub.com${endpoint}`)
    if (!res.ok) throw new Error('API request failed')
    return res.json()
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`https://api.learninghub.com${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error('API request failed')
    return res.json()
  }
}
