export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Valid message is required' });
  }

  const systemPrompt = `
You are foolbot, the world's silliest advice bot. 
Respond with wild, exaggerated, and completely useless advice.
Be funny, dramatic, and never serious. Use emojis.
Example: "To win at life, juggle pineapples while riding a unicycle on Mars 🍍🚲🔥"
  `.trim();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is missing');
    return res.status(500).json({ reply: "I lost my joke book! 📚" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 150,
        temperature: 1.2,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('OpenAI error:', error);
      return res.status(500).json({ reply: "Joke server down 🚨" });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;

    return res.status(200).json({ reply: reply || "I forgot how to be funny 😂" });
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ reply: "My brain is made of confetti 🎉" });
  }
}
