import React, { useState } from "react";
import { Copy, Check, ArrowLeft, Key, Image, Globe, Code, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const API_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/api-analyze`;

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg bg-muted border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button onClick={handleCopy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed"><code className="text-foreground/90">{code}</code></pre>
    </div>
  );
};

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero text-primary-foreground py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/60 hover:text-primary-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            <span className="gold-shimmer bg-clip-text text-transparent">API</span> Documentation
          </h1>
          <p className="text-primary-foreground/60 mt-2 text-sm">Integrate DBH FINDER's AI fabric analysis into your app</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Base URL */}
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" /> API Endpoint
          </h2>
          <CodeBlock code={API_URL} language="url" />
        </section>

        {/* Auth */}
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" /> Authentication
          </h2>
          <p className="text-sm text-muted-foreground">
            All requests require an API key passed via the <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">x-api-key</code> header.
          </p>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-foreground font-medium">🔑 Your API Key</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is the <code className="px-1 py-0.5 bg-muted rounded font-mono">DBH_API_KEY</code> secret you configured. Use it in all requests.
            </p>
          </div>
        </section>

        {/* Request */}
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Image className="w-5 h-5 text-accent" /> Request Format
          </h2>
          <p className="text-sm text-muted-foreground">
            Send a <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">POST</code> request with either a base64 image or an image URL.
          </p>

          <h3 className="text-sm font-semibold text-foreground mt-4">Option 1: Base64 Image</h3>
          <CodeBlock language="json" code={`{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUg..."
}`} />

          <h3 className="text-sm font-semibold text-foreground mt-4">Option 2: Image URL</h3>
          <CodeBlock language="json" code={`{
  "imageUrl": "https://example.com/my-fabric-image.jpg"
}`} />
        </section>

        {/* Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Code className="w-5 h-5 text-accent" /> Code Examples
          </h2>

          <h3 className="text-sm font-semibold text-foreground">cURL</h3>
          <CodeBlock language="bash" code={`curl -X POST "${API_URL}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"imageUrl": "https://example.com/image.jpg"}'`} />

          <h3 className="text-sm font-semibold text-foreground mt-4">JavaScript / Fetch</h3>
          <CodeBlock language="javascript" code={`const response = await fetch("${API_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    imageUrl: "https://example.com/image.jpg"
  })
});

const data = await response.json();
console.log(data.analysis);`} />

          <h3 className="text-sm font-semibold text-foreground mt-4">Python</h3>
          <CodeBlock language="python" code={`import requests

response = requests.post(
    "${API_URL}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY"
    },
    json={"imageUrl": "https://example.com/image.jpg"}
)

data = response.json()
print(data["analysis"])`} />

          <h3 className="text-sm font-semibold text-foreground mt-4">PHP</h3>
          <CodeBlock language="php" code={`$ch = curl_init("${API_URL}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: YOUR_API_KEY"
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "imageUrl" => "https://example.com/image.jpg"
    ])
]);
$response = curl_exec($ch);
$data = json_decode($response, true);
print_r($data["analysis"]);`} />
        </section>

        {/* Response */}
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> Response Format
          </h2>
          <CodeBlock language="json" code={`{
  "success": true,
  "analysis": {
    "fabric_name": "Nida Fabric",
    "fabric_type": "Synthetic - Polyester Crepe, Plain Weave",
    "embellishment": "Stone work with sequin border",
    "color": "Midnight Black",
    "craftsmanship": "Machine stitched, clean finishing...",
    "category": "Front-Open Abaya - Dubai Style",
    "additional_details": "Medium weight (~180 GSM), opaque...",
    "confidence": "high"
  }
}`} />
        </section>

        {/* Errors */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Error Codes</h2>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Code</th>
                  <th className="text-left px-4 py-2 font-medium text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="px-4 py-2 font-mono text-xs">401</td><td className="px-4 py-2 text-muted-foreground">Invalid or missing API key</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs">400</td><td className="px-4 py-2 text-muted-foreground">No image provided (need imageBase64 or imageUrl)</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs">429</td><td className="px-4 py-2 text-muted-foreground">Rate limited — try again later</td></tr>
                <tr><td className="px-4 py-2 font-mono text-xs">500</td><td className="px-4 py-2 text-muted-foreground">Server error</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-xs text-muted-foreground border-t border-border">
        <span className="font-display font-bold text-foreground">DBH FINDER</span> — API v1
      </footer>
    </div>
  );
};

export default ApiDocs;
