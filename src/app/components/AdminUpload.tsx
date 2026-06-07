import { useState, useRef } from "react";
import { Upload, X, Image, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Wallpaper } from "./WallpaperCard";

const API = `https://${projectId}.supabase.co/functions/v1/make-server-595c7c29`;

const CATEGORIES = [
  "Nature", "Architecture", "Abstract", "Space", "Technology",
  "Animals", "Cities", "Minimalist", "Landscape", "Underwater",
  "Cars", "Travel", "Sports", "Art", "Dark",
];

interface AdminUploadProps {
  onClose: () => void;
  onUploaded: () => void;
  wallpapers: Wallpaper[];
  onDelete: (id: string) => void;
}

export function AdminUpload({ onClose, onUploaded, wallpapers, onDelete }: AdminUploadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState("");
  const [resolution, setResolution] = useState("3840x2160");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "manage">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("tags", tags);
      form.append("resolution", resolution);
      form.append("image", file);

      const res = await fetch(`${API}/wallpapers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${publicAnonKey}` },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      setStatus("success");
      setTitle(""); setDescription(""); setTags(""); setFile(null); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();

      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-[680px] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-[20px] font-bold text-[#111111]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Admin Panel
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">Upload and manage wallpapers</p>
          </div>
          <button
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {(["upload", "manage"] as const).map((tab) => (
            <button
              key={tab}
              className={`text-[14px] font-semibold py-3 px-4 border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-[#2B6FE8] text-[#2B6FE8]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "upload" ? "Upload New" : `Manage (${wallpapers.length})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "upload" ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Drop zone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
                  preview
                    ? "border-[#2B6FE8] bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-[#2B6FE8] hover:bg-blue-50"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-2xl" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null); setPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                      {file?.name}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <Image className="w-7 h-7 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-[14px] font-semibold text-[#111111]">Drop wallpaper here</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">PNG, JPG, WEBP — max 50MB</p>
                    </div>
                    <span className="text-[12px] font-semibold text-[#2B6FE8] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                      Browse files
                    </span>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Title *</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mountain Sunrise 4K"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:outline-none focus:border-[#2B6FE8] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:outline-none focus:border-[#2B6FE8] focus:bg-white transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Resolution</label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:outline-none focus:border-[#2B6FE8] focus:bg-white transition-colors cursor-pointer"
                  >
                    {["3840x2160", "7680x4320", "2560x1440", "1920x1080", "2560x1600"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Tags (comma separated)</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="nature, mountain, sunrise, landscape"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:outline-none focus:border-[#2B6FE8] focus:bg-white transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Describe this wallpaper..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] focus:outline-none focus:border-[#2B6FE8] focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Status messages */}
              {status === "success" && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-semibold">Wallpaper uploaded successfully!</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-[13px] font-semibold">{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !file || !title}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#111111] text-white font-bold text-[14px] rounded-2xl hover:bg-[#2B6FE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload Wallpaper</>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              {wallpapers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Image className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-[14px]">No wallpapers uploaded yet</p>
                </div>
              ) : (
                wallpapers.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={w.imageUrl}
                      alt={w.title}
                      className="w-16 h-12 object-cover rounded-xl shrink-0 bg-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#111111] truncate">{w.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[#2B6FE8] font-medium">{w.category}</span>
                        <span className="text-[11px] text-gray-400">·</span>
                        <span className="text-[11px] text-gray-400">{w.resolution}</span>
                        <span className="text-[11px] text-gray-400">·</span>
                        <span className="text-[11px] text-gray-400">{w.downloadCount} dl</span>
                      </div>
                    </div>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors shrink-0"
                      onClick={() => onDelete(w.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
