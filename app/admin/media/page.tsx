"use client";
import { useState, useEffect } from "react";

export default function MediaLibrary() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/media?v=" + Date.now());
            if (res.ok) {
                const data = await res.json();
                setImages(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(publicId: string) {
        if (!confirm("Are you sure you want to delete this image? This action cannot be undone and will remove it from Cloudinary.")) return;

        setDeleting(publicId);
        try {
            const res = await fetch("/api/admin/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId })
            });

            if (res.ok) {
                setImages(images.filter(img => img.public_id !== publicId));
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setDeleting(null);
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="admin-media-library">
            <div className="admin-header">
                <div>
                    <h1>Media Library</h1>
                    <p style={{ color: "var(--grey-500)", fontSize: "0.85rem", marginTop: 4 }}>
                        Manage all files uploaded to <code>nodflo/content</code>
                    </p>
                </div>
                <button className="btn btn--outline" onClick={load} disabled={loading}>
                    {loading ? "Refreshing..." : "↻ Refresh"}
                </button>
            </div>

            {loading && images.length === 0 ? (
                <div style={{ padding: "100px 0", textAlign: "center", color: "var(--grey-400)" }}>
                    Loading your gallery...
                </div>
            ) : (
                <div className="admin-card" style={{ padding: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
                        {images.map((img) => (
                            <div key={img.public_id} style={{
                                background: "white",
                                border: "1px solid var(--grey-100)",
                                borderRadius: 8,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                position: "relative"
                            }} className="media-item-hover">
                                <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#f8f8f8" }}>
                                    <img
                                        src={img.secure_url.replace('/upload/', '/upload/w_400,c_limit/')}
                                        alt={img.public_id}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>
                                <div style={{ padding: 12, fontSize: "0.75rem" }}>
                                    <div style={{ fontWeight: 600, color: "var(--grey-800)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {img.public_id.split('/').pop()}
                                    </div>
                                    <div style={{ color: "var(--grey-500)", display: "flex", justifyContent: "space-between" }}>
                                        <span>{img.format.toUpperCase()} • {formatSize(img.bytes)}</span>
                                        <span>{new Date(img.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div style={{
                                    padding: "8px 12px",
                                    borderTop: "1px solid var(--grey-50)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "var(--cream)"
                                }}>
                                    <a href={img.secure_url} target="_blank" rel="noreferrer" style={{ color: "var(--grey-600)", textDecoration: "none", fontSize: "0.7rem", fontWeight: 500 }}>
                                        VIEW ↑
                                    </a>
                                    <button
                                        onClick={() => handleDelete(img.public_id)}
                                        disabled={deleting === img.public_id}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#e74c3c",
                                            cursor: "pointer",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                            opacity: deleting === img.public_id ? 0.5 : 1
                                        }}
                                    >
                                        {deleting === img.public_id ? "..." : "DELETE"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {images.length === 0 && !loading && (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--grey-400)" }}>
                            No images found in Cloudinary folder <code>nodflo/content</code>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .media-item-hover:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.05);
                }
            `}</style>
        </div>
    );
}
