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
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
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
          placeholder="Headers (one per line: Key: Value)"
          value={headers}
          onChange={e => setHeaders(e.target.value)}
          rows={2}
        />
        { ["POST", "PUT"].includes(method) && (
          <textarea
            placeholder="Request body (raw)"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
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
  );
}
