"use client";

import { useState, useRef } from "react";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"];

// Types
interface HistoryEntry {
  id: number;
  method: string;
  url: string;
  requestBody?: string;
  responseBody?: string;
  responseStatus?: string;
  createdAt: string;
  headers?: string; // Added headers to the interface
}
interface ResponseData {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
}

export default function Home() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;
  const responseSectionRef = useRef<HTMLDivElement>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch history
  async function fetchHistory(pageNum = 1, append = false) {
    try {
      setHistoryError(null);
      const res = await fetch(`/api/history?page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setHistory(prev => append ? [...prev, ...data.items] : data.items);
        setTotal(data.total);
        setPage(data.page);
        setHasMore((data.page * data.limit) < data.total);
      } else {
        if (!append) setHistory([]);
        setTotal(0);
        setPage(1);
        setHasMore(false);
        setHistoryError(data.error || 'Failed to fetch history.');
      }
    } catch (err) {
      if (!append) setHistory([]);
      setTotal(0);
      setPage(1);
      setHasMore(false);
      setHistoryError('Failed to fetch history.');
    }
  }

  // On mount, fetch history
  useState(() => {
    fetchHistory();
  });

  // Send HTTP request
  async function sendRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setResponseError(null);
    try {
      const fetchOptions: RequestInit = {
        method,
        headers: headers
          ? Object.fromEntries(
              headers
                .split("\n")
                .map((h) => h.split(":").map((s) => s.trim()))
                .filter(([k, v]) => k && v)
            )
          : undefined,
        body: ["POST", "PUT"].includes(method) && body ? body : undefined,
      };
      const res = await fetch(url, fetchOptions);
      const resText = await res.text();
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Array.from(res.headers.entries()),
        body: resText,
      });
      // Save to history
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          url,
          requestBody: body,
          responseBody: resText,
          responseStatus: `${res.status} ${res.statusText}`,
          headers: headers, // always send the textarea value
        }),
      });
      fetchHistory(page);
      setTimeout(() => {
        responseSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResponseError(err.message);
      } else {
        setResponseError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "sans-serif", color: '#222' }}>
      {/* Main REST Client UI */}
      <div style={{ color: '#fff' }}>
        <h1>Minimal REST Client</h1>
        <form onSubmit={sendRequest} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={method} onChange={e => setMethod(e.target.value)}>
              {HTTP_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
            <input
              type="text"
              placeholder="Request URL"
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={{ flex: 1 }}
              required
            />
          </div>
          <textarea
            placeholder="Headers (do not use curly braces)"
            value={headers}
            onChange={e => setHeaders(e.target.value)}
            rows={4}
          />
          { ["POST", "PUT"].includes(method) && (
            <textarea
              placeholder="Request body (raw)"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
            />
          )}
          <button type="submit" disabled={loading} style={{ width: 120 }}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        {/* Response Section */}
        <div ref={responseSectionRef} style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 4, background: "#fff", color: "#111" }}>
          <h2 style={{ color: '#222' }}>Response</h2>
          {responseError && <div style={{ color: "#b00020" }}>{responseError}</div>}
          {response ? (
            <>
              <div>Status: <b style={{ color: '#005a00' }}>{response.status} {response.statusText}</b></div>
              <details>
                <summary style={{ color: '#333' }}>Headers</summary>
                <pre style={{ whiteSpace: "pre-wrap", color: '#222' }}>{response.headers.map(([k, v]) => `${k}: ${v}`).join("\n")}</pre>
              </details>
              <div style={{ marginTop: 8 }}>
                <b style={{ color: '#333' }}>Body:</b>
                <pre style={{ background: "#f4f4f4", color: '#111', padding: 8, borderRadius: 4, maxHeight: 200, overflow: "auto" }}>{response.body}</pre>
              </div>
            </>
          ) : (
            <div style={{ color: "#888" }}>No response yet.</div>
          )}
        </div>

        {/* History Section */}
        <div style={{ marginTop: 32, maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 4, background: '#fff', padding: 16, color: '#111' }}>
          <h2>History</h2>
          {historyError && <div style={{ color: 'red' }}>{historyError}</div>}
          {(!history || history.length === 0) ? (
            <div style={{ color: "#888" }}>No history yet.</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {history.map((h, i) => (
                <li key={h.id} style={{ marginBottom: 12, padding: 8, border: "1px solid #eee", borderRadius: 4 }}>
                  <div><b style={{ color: '#005a00' }}>{h.method}</b> <span style={{ color: "#222" }}>{h.url}</span></div>
                  {/* Robustly display headers, show N/A if empty or whitespace */}
                  <div style={{ fontSize: 12, color: "#444" }}>
                    Headers: <pre style={{ display: 'inline', background: '#f4f4f4', padding: '2px 4px', borderRadius: '2px' }}>{typeof h.headers === 'string' && h.headers.trim() ? h.headers : 'N/A'}</pre>
                  </div>
                  <div style={{ fontSize: 12, color: "#444" }}>Request Body: <pre style={{ display: 'inline', background: '#f4f4f4', padding: '2px 4px', borderRadius: '2px' }}>{h.requestBody || 'N/A'}</pre></div>
                  <div style={{ fontSize: 12, color: "#444" }}>Status: {h.responseStatus}</div>
                  <div style={{ fontSize: 12, color: "#444" }}>{new Date(h.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
          {/* Lazy Load Button */}
          {hasMore && !historyError && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => fetchHistory(page + 1, true)} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Combined User Manual and Request Examples Section */}
      <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001', marginTop: 48, color: '#222' }}>
      <hr style={{ margin: '10px 0' }} />
        <div style={{ fontSize: 14, color: '#111', marginTop: 8 }}>
          <b>Author:</b> Vikrant Chauhan<br/>
          <b>Contact:</b> 7618840128
        </div>
        <hr style={{ margin: '10px 0' }} />
        <h2>User Manual</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li>Enter the <b>Request URL</b> you want to test.</li>
          <li>Select the <b>HTTP method</b> (GET, POST, PUT, DELETE).</li>
          <li>Optionally, add <b>headers</b> (one per line: <code>Key: Value</code>).</li>
          <li>For POST/PUT, enter the <b>request body</b> (raw JSON or text).</li>
          <li>Click <b>Send</b> to make the request.</li>
          <li>The <b>Response</b> section will show the status, headers, and body.</li>
          <li>All requests and responses are saved in the <b>History</b> section below.</li>
        </ol>
        <p style={{ fontSize: 13, color: '#666', marginTop: 16 }}>
          <b>Note:</b> History is session-based and will reset after a server restart or redeploy.
        </p>
        <hr style={{ margin: '24px 0' }} />
        <h3 style={{ marginTop: 0 }}>Technologies Used</h3>
        <ul style={{ fontSize: 14, color: '#333', margin: 0, paddingLeft: 20 }}>
          <li><b>Next.js</b> (React framework for SSR and API routes)</li>
          <li><b>React</b> (UI library)</li>
          <li><b>MikroORM</b> (TypeScript ORM for SQLite)</li>
          <li><b>SQLite</b> (lightweight database)</li>
          <li><b>Vercel</b> (deployment platform)</li>
        </ul>
        <hr style={{ margin: '24px 0' }} />
        <h2>API Request Examples</h2>
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          <b>Base URL:</b><br/>
          <code>https://web-dev-projects-l97ov86w8-githubvikrants-projects.vercel.app/api/history</code>
        </div>
        <div style={{ marginTop: 12 }}>
          <b>GET (Fetch History)</b>
          <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, fontSize: 13, margin: 0 }}>{`GET /api/history?page=1&limit=10
Content-Type: application/json`}</pre>
        </div>
        <div style={{ marginTop: 12 }}>
          <b>POST (Create Entry)</b>
          <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, fontSize: 13, margin: 0 }}>{`POST /api/history
Content-Type: application/json

{
  "method": "POST",
  "url": "https://example.com/api/data",
  "requestBody": "{\"param\":\"value\"}",
  "responseBody": "{\"result\":\"ok\"}",
  "responseStatus": "200 OK",
  "headers": "Content-Type: application/json\nAuthorization: Bearer testtoken"
}`}</pre>
        </div>
        <div style={{ marginTop: 12 }}>
          <b>PUT (Update Entry)</b>
          <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, fontSize: 13, margin: 0 }}>{`PUT /api/history
Content-Type: application/json

{
  "id": 1,
  "method": "PUT",
  "url": "https://example.com/api/data/updated",
  "requestBody": "{\"param\":\"new value\"}",
  "responseBody": "{\"result\":\"updated\"}",
  "responseStatus": "201 Created",
  "headers": "Content-Type: application/json"
}`}</pre>
        </div>
        <div style={{ marginTop: 12 }}>
          <b>DELETE (Delete Entry)</b>
          <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4, fontSize: 13, margin: 0 }}>{`DELETE /api/history?id=1
Content-Type: application/json`}</pre>
        </div>
      </div>
    </div>
  );
}
