import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function App() {
  const ROOT_ID = "98bf821e-7e82-4053-9dbd-c01322ab0ec4"; // root
  const [currentFolder, setCurrentFolder] = useState(ROOT_ID);
  const [refreshTick, setRefreshTick] = useState(0);
  const [nodes, setNodes] = useState([]);
  const [path, setPath] = useState([]);
  const [childCounts, setChildCounts] = useState({});
  const [error, setError] = useState(null);

  const pathString = useMemo(
    () => path.map((p) => p.name).join(" / "),
    [path]
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setError(null);
      try {
        const [nodesRes, pathRes] = await Promise.all([
          fetch(`${API_BASE}/folders/${currentFolder}/children/`, {
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/folders/${currentFolder}/path/`, {
            signal: controller.signal,
          }),
        ]);

        if (!nodesRes.ok || !pathRes.ok) {
          setError("Não foi possível carregar os dados.");
          return;
        }

        const [nodesData, pathData] = await Promise.all([
          nodesRes.json(),
          pathRes.json(),
        ]);

        setNodes(nodesData);
        setPath(pathData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Falha ao buscar dados. Tente novamente.");
        }
      }
    };

    load();
    return () => controller.abort();
  }, [currentFolder, refreshTick]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCounts = async () => {
      const folders = nodes.filter((n) => n.type === "folder");
      const entries = await Promise.all(
        folders.map(async (folder) => {
          try {
            const res = await fetch(
              `${API_BASE}/folders/${folder.id}/children/`,
              { signal: controller.signal }
            );
            if (!res.ok) return [folder.id, null];
            const data = await res.json();
            return [folder.id, data.length];
          } catch {
            return [folder.id, null];
          }
        })
      );

      setChildCounts((prev) => {
        const next = { ...prev };
        entries.forEach(([id, count]) => {
          next[id] = count;
        });
        return next;
      });
    };

    if (nodes.length) fetchCounts();
    return () => controller.abort();
  }, [nodes]);

  const createNode = async (payload) => {
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/folders/${currentFolder}/children/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data && typeof data === "object"
            ? Object.values(data).flat().join(" ")
            : "Erro ao criar item.";
        setError(message || "Erro ao criar item.");
        return;
      }

      setRefreshTick((t) => t + 1);
    } catch (err) {
      setError("Não foi possível criar o item.");
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 720 }}>
      <h2>File Explorer</h2>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 12 }}>
        {path.map((p, i) => (
          <span key={p.id}>
            <a
              href="#"
              onClick={() => setCurrentFolder(p.id)}
              style={{ marginRight: 8 }}
            >
              {p.name}
            </a>
            {i < path.length - 1 && "/ "}
          </span>
        ))}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            background: "#ffecec",
            color: "#a00",
            border: "1px solid #f5c2c2",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {/* Listagem */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {nodes.map((node) => {
          const itemPath = [pathString, node.name]
            .filter(Boolean)
            .join(" / ");
          return (
            <li
              key={node.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                lineHeight: 1.4,
              }}
            >
              <div>
                {node.type === "folder" ? "📁" : "📄"}{" "}
                <span
                  style={{
                    cursor: node.type === "folder" ? "pointer" : "default",
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    node.type === "folder" && setCurrentFolder(node.id)
                  }
                >
                  {node.name}
                </span>
              </div>
              <div style={{ color: "#555", fontSize: 13 }}>
                Caminho: {itemPath || "/"}
              </div>
              <div style={{ color: "#777", fontSize: 13 }}>
                {node.type === "folder"
                  ? `${childCounts[node.id] ?? "…"} item(s) dentro`
                  : `${node.size} bytes`}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Criar pasta/arquivo */}
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => {
            const name = prompt("Nome da pasta");
            if (!name) return;
            createNode({ name, type: "folder" });
          }}
        >
          Nova pasta
        </button>

        <button
          style={{ marginLeft: 8 }}
          onClick={() => {
            const name = prompt("Nome do arquivo");
            if (!name) return;

            const size = prompt("Tamanho do arquivo (em bytes)");
            if (!size || isNaN(size)) {
              setError("Informe um tamanho numérico válido.");
              return;
            }

            createNode({
              name,
              type: "file",
              size: Number(size),
            });
          }}
        >
          Novo arquivo
        </button>
      </div>
    </div>
  );
}
