import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const BUCKET_NAME = "make-595c7c29-wallpapers";

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function ensureBucket() {
  const supabase = getSupabase();
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: false });
  }
}

// Health check
app.get("/make-server-595c7c29/health", (c) => {
  return c.json({ status: "ok" });
});

// GET /wallpapers — list all wallpapers with optional category/search filter
app.get("/make-server-595c7c29/wallpapers", async (c) => {
  try {
    const category = c.req.query("category");
    const search = c.req.query("search")?.toLowerCase();

    const indexData = await kv.get("wallpapers:index");
    const ids: string[] = indexData ? JSON.parse(indexData) : [];

    const wallpapers = await Promise.all(
      ids.map(async (id) => {
        const data = await kv.get(`wallpaper:${id}`);
        return data ? JSON.parse(data) : null;
      })
    );

    let result = wallpapers.filter(Boolean);

    if (category && category !== "All") {
      result = result.filter((w) => w.category === category);
    }

    if (search) {
      result = result.filter(
        (w) =>
          w.title?.toLowerCase().includes(search) ||
          w.description?.toLowerCase().includes(search) ||
          w.tags?.some((t: string) => t.toLowerCase().includes(search)) ||
          w.category?.toLowerCase().includes(search)
      );
    }

    // Sort by uploadedAt descending
    result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Refresh signed URLs
    const supabase = getSupabase();
    result = await Promise.all(
      result.map(async (w) => {
        if (w.storagePath) {
          const { data } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(w.storagePath, 3600);
          return { ...w, imageUrl: data?.signedUrl || w.imageUrl };
        }
        return w;
      })
    );

    return c.json({ wallpapers: result });
  } catch (err) {
    console.log("Error listing wallpapers:", err);
    return c.json({ error: `Failed to list wallpapers: ${err}` }, 500);
  }
});

// GET /wallpapers/:id — get single wallpaper
app.get("/make-server-595c7c29/wallpapers/:id", async (c) => {
  try {
    const id = c.params.id;
    const data = await kv.get(`wallpaper:${id}`);
    if (!data) return c.json({ error: "Wallpaper not found" }, 404);

    const wallpaper = JSON.parse(data);

    if (wallpaper.storagePath) {
      const supabase = getSupabase();
      const { data: signed } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(wallpaper.storagePath, 7200);
      wallpaper.imageUrl = signed?.signedUrl || wallpaper.imageUrl;
    }

    // Increment views
    wallpaper.views = (wallpaper.views || 0) + 1;
    await kv.set(`wallpaper:${id}`, JSON.stringify(wallpaper));

    return c.json({ wallpaper });
  } catch (err) {
    console.log("Error getting wallpaper:", err);
    return c.json({ error: `Failed to get wallpaper: ${err}` }, 500);
  }
});

// POST /wallpapers — upload new wallpaper
app.post("/make-server-595c7c29/wallpapers", async (c) => {
  try {
    await ensureBucket();
    const supabase = getSupabase();
    const formData = await c.req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const tags = (formData.get("tags") as string || "").split(",").map((t) => t.trim()).filter(Boolean);
    const resolution = formData.get("resolution") as string;
    const file = formData.get("image") as File;

    if (!title || !file) {
      return c.json({ error: "Title and image are required" }, 400);
    }

    const id = crypto.randomUUID();
    const ext = file.name.split(".").pop() || "jpg";
    const storagePath = `wallpapers/${id}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, arrayBuffer, { contentType: file.type });

    if (uploadError) {
      console.log("Storage upload error:", uploadError);
      return c.json({ error: `Storage upload failed: ${uploadError.message}` }, 500);
    }

    const { data: signed } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 3600);

    const wallpaper = {
      id,
      title,
      description: description || "",
      category: category || "Uncategorized",
      tags,
      resolution: resolution || "3840x2160",
      storagePath,
      imageUrl: signed?.signedUrl || "",
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      downloadCount: 0,
      views: 0,
      uploadedAt: new Date().toISOString(),
    };

    await kv.set(`wallpaper:${id}`, JSON.stringify(wallpaper));

    const indexData = await kv.get("wallpapers:index");
    const ids: string[] = indexData ? JSON.parse(indexData) : [];
    ids.unshift(id);
    await kv.set("wallpapers:index", JSON.stringify(ids));

    return c.json({ wallpaper }, 201);
  } catch (err) {
    console.log("Error uploading wallpaper:", err);
    return c.json({ error: `Upload failed: ${err}` }, 500);
  }
});

// POST /wallpapers/:id/download — increment download count
app.post("/make-server-595c7c29/wallpapers/:id/download", async (c) => {
  try {
    const id = c.params.id;
    const data = await kv.get(`wallpaper:${id}`);
    if (!data) return c.json({ error: "Wallpaper not found" }, 404);

    const wallpaper = JSON.parse(data);
    wallpaper.downloadCount = (wallpaper.downloadCount || 0) + 1;
    await kv.set(`wallpaper:${id}`, JSON.stringify(wallpaper));

    // Return fresh signed URL for download
    if (wallpaper.storagePath) {
      const supabase = getSupabase();
      const { data: signed } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(wallpaper.storagePath, 300);
      return c.json({ downloadUrl: signed?.signedUrl || "", wallpaper });
    }

    return c.json({ downloadUrl: wallpaper.imageUrl, wallpaper });
  } catch (err) {
    console.log("Error processing download:", err);
    return c.json({ error: `Download failed: ${err}` }, 500);
  }
});

// DELETE /wallpapers/:id
app.delete("/make-server-595c7c29/wallpapers/:id", async (c) => {
  try {
    const id = c.params.id;
    const data = await kv.get(`wallpaper:${id}`);
    if (!data) return c.json({ error: "Wallpaper not found" }, 404);

    const wallpaper = JSON.parse(data);

    if (wallpaper.storagePath) {
      const supabase = getSupabase();
      await supabase.storage.from(BUCKET_NAME).remove([wallpaper.storagePath]);
    }

    await kv.del(`wallpaper:${id}`);

    const indexData = await kv.get("wallpapers:index");
    const ids: string[] = indexData ? JSON.parse(indexData) : [];
    const updated = ids.filter((i) => i !== id);
    await kv.set("wallpapers:index", JSON.stringify(updated));

    return c.json({ success: true });
  } catch (err) {
    console.log("Error deleting wallpaper:", err);
    return c.json({ error: `Delete failed: ${err}` }, 500);
  }
});

// GET /categories — distinct categories
app.get("/make-server-595c7c29/categories", async (c) => {
  try {
    const indexData = await kv.get("wallpapers:index");
    const ids: string[] = indexData ? JSON.parse(indexData) : [];

    const wallpapers = await Promise.all(
      ids.map(async (id) => {
        const data = await kv.get(`wallpaper:${id}`);
        return data ? JSON.parse(data) : null;
      })
    );

    const categories = ["All", ...new Set(wallpapers.filter(Boolean).map((w) => w.category))];
    return c.json({ categories });
  } catch (err) {
    console.log("Error fetching categories:", err);
    return c.json({ error: `Failed to fetch categories: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
