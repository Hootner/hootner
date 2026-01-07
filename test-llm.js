const response = await fetch('http://localhost:3100/api/llm/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'hootner', length: 20 })
});

console.log(await response.json());
