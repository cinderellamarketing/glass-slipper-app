export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, num = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!process.env.SERPER_API_KEY) {
      return res.status(500).json({ error: 'Serper API key not configured' });
    }

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: num
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Serper API Error:', errorText);
      throw new Error(`Search API failed: ${response.status}`);
    }

    const data = await response.json();
    res.json({ 
      success: true, 
      data: data 
    });

  } catch (error) {
    console.error('Search API request failed:', error);
    res.status(500).json({ 
      error: 'Search API request failed', 
      details: error.message 
    });
  }
}