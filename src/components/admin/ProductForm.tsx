"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, Image, Video, X, Upload, FileArchive } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Variant {
  id?: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  price: number;
}

interface ProductFormData {
  slug: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  categoryPl: string;
  categoryEn: string;
  technologies: string;
  screenshots: string[];
  videoUrl: string;
  fileUrl: string;
  variants: Variant[];
}

interface ProductFormProps {
  initialData?: ProductFormData & { id: string };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newScreenshotUrl, setNewScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [fileName, setFileName] = useState(
    initialData?.fileUrl ? initialData.fileUrl.split("/").pop() || "" : ""
  );
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<ProductFormData>(
    initialData || {
      slug: "",
      namePl: "",
      nameEn: "",
      descriptionPl: "",
      descriptionEn: "",
      categoryPl: "",
      categoryEn: "",
      technologies: "",
      screenshots: [],
      videoUrl: "",
      fileUrl: "",
      variants: [
        {
          namePl: "Licencja Personal",
          nameEn: "Personal License",
          descriptionPl: "Użytek w jednym projekcie osobistym",
          descriptionEn: "Use in one personal project",
          price: 9900,
        },
      ],
    }
  );

  const isEdit = !!initialData;

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(zip|rar)$/i)) {
      setUploadProgress("Dozwolone tylko pliki ZIP i RAR");
      return;
    }

    setUploading(true);
    setUploadProgress("Przesyłanie...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setData({ ...data, fileUrl: result.url });
        setFileName(result.fileName);
        setUploadProgress("");
      } else {
        setUploadProgress(result.error || "Błąd przesyłania");
      }
    } catch {
      setUploadProgress("Błąd przesyłania pliku");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          technologies: data.technologies.split(",").map((t) => t.trim()).filter(Boolean),
          screenshots: data.screenshots,
          videoUrl: data.videoUrl || null,
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setData({
      ...data,
      variants: [
        ...data.variants,
        {
          namePl: "",
          nameEn: "",
          descriptionPl: "",
          descriptionEn: "",
          price: 0,
        },
      ],
    });
  };

  const removeVariant = (index: number) => {
    setData({
      ...data,
      variants: data.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...data.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setData({ ...data, variants: newVariants });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Basic info */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Informacje podstawowe</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Slug (URL)</label>
            <Input
              value={data.slug}
              onChange={(e) => setData({ ...data, slug: e.target.value })}
              placeholder="moj-szablon"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Plik produktu (ZIP/RAR)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : data.fileUrl
                  ? "border-primary/30 bg-primary/5"
                  : "border-white/10 hover:border-white/20 bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,.rar"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-gray-400">{uploadProgress}</span>
                </div>
              ) : data.fileUrl ? (
                <div className="flex items-center gap-3 py-1">
                  <FileArchive className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{fileName}</p>
                    <p className="text-xs text-gray-500 truncate">{data.fileUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setData({ ...data, fileUrl: "" });
                      setFileName("");
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-3">
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Przeciągnij plik lub <span className="text-primary">kliknij, aby wybrać</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">ZIP, RAR — maks. 500MB</p>
                </div>
              )}
              {uploadProgress && !uploading && (
                <p className="text-xs text-red-400 mt-2">{uploadProgress}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Nazwa (PL)</label>
            <Input
              value={data.namePl}
              onChange={(e) => setData({ ...data, namePl: e.target.value })}
              placeholder="Profesjonalna strona firmowa"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Nazwa (EN)</label>
            <Input
              value={data.nameEn}
              onChange={(e) => setData({ ...data, nameEn: e.target.value })}
              placeholder="Professional business website"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Kategoria</label>
            <select
              value={data.categoryPl}
              onChange={(e) => {
                const val = e.target.value;
                const map: Record<string, string> = {
                  "Szablon Strony": "Website Template",
                  "Szablony Strony WordPress": "WordPress Templates",
                  "Wtyczki": "Plugins",
                  "Skrypty": "Scripts",
                  "Narzędzia": "Tools",
                  "Twój Pomysł": "Your Idea",
                };
                setData({ ...data, categoryPl: val, categoryEn: map[val] || val });
              }}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            >
              <option value="" disabled>Wybierz kategorię</option>
              <option value="Szablon Strony">Szablon Strony</option>
              <option value="Szablony Strony WordPress">Szablony Strony WordPress</option>
              <option value="Wtyczki">Wtyczki</option>
              <option value="Skrypty">Skrypty</option>
              <option value="Narzędzia">Narzędzia</option>
              <option value="Twój Pomysł">Twój Pomysł</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">
              Technologie (oddzielone przecinkami)
            </label>
            <Input
              value={data.technologies}
              onChange={(e) => setData({ ...data, technologies: e.target.value })}
              placeholder="Next.js, Tailwind CSS, TypeScript"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Opis (PL)</label>
            <textarea
              value={data.descriptionPl}
              onChange={(e) => setData({ ...data, descriptionPl: e.target.value })}
              placeholder="Szczegółowy opis szablonu..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Opis (EN)</label>
            <textarea
              value={data.descriptionEn}
              onChange={(e) => setData({ ...data, descriptionEn: e.target.value })}
              placeholder="Detailed product description..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Media — Screenshots & Video */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Image className="w-5 h-5 text-primary" />
          Media
        </h3>

        {/* Screenshots */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-3">
            Zrzuty ekranu (URL)
          </label>

          {data.screenshots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {data.screenshots.map((url, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5"
                >
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                      (e.target as HTMLImageElement).className = "w-full h-32 bg-white/5";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        screenshots: data.screenshots.filter((_, idx) => idx !== i),
                      })
                    }
                    className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="px-2 py-1.5 text-xs text-gray-500 truncate">
                    {url}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newScreenshotUrl}
              onChange={(e) => setNewScreenshotUrl(e.target.value)}
              placeholder="https://example.com/screenshot.png"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => {
                if (newScreenshotUrl.trim()) {
                  setData({
                    ...data,
                    screenshots: [...data.screenshots, newScreenshotUrl.trim()],
                  });
                  setNewScreenshotUrl("");
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj
            </button>
          </div>
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Video className="w-4 h-4" />
            Link do wideo (YouTube / Vimeo / bezpośredni)
          </label>
          <Input
            value={data.videoUrl}
            onChange={(e) => setData({ ...data, videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... lub https://vimeo.com/..."
          />
          <p className="text-xs text-gray-600 mt-1.5">
            Wklej link do YouTube, Vimeo lub bezpośredni URL do pliku wideo. Zostanie wyświetlony jako podgląd na stronie produktu.
          </p>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Warianty cenowe</h3>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Dodaj wariant
          </button>
        </div>

        <div className="space-y-6">
          {data.variants.map((variant, i) => (
            <div
              key={i}
              className="p-4 bg-white/[0.02] border border-white/5 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 font-medium">
                  Wariant #{i + 1}
                </span>
                {data.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nazwa (PL)
                  </label>
                  <Input
                    value={variant.namePl}
                    onChange={(e) => updateVariant(i, "namePl", e.target.value)}
                    placeholder="Licencja Personal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nazwa (EN)
                  </label>
                  <Input
                    value={variant.nameEn}
                    onChange={(e) => updateVariant(i, "nameEn", e.target.value)}
                    placeholder="Personal License"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Opis (PL)
                  </label>
                  <Input
                    value={variant.descriptionPl}
                    onChange={(e) =>
                      updateVariant(i, "descriptionPl", e.target.value)
                    }
                    placeholder="Jeden projekt osobisty"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Opis (EN)
                  </label>
                  <Input
                    value={variant.descriptionEn}
                    onChange={(e) =>
                      updateVariant(i, "descriptionEn", e.target.value)
                    }
                    placeholder="One personal project"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Cena (grosze, np. 9900 = 99 zł)
                  </label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(i, "price", parseInt(e.target.value) || 0)
                    }
                    placeholder="9900"
                    required
                    min={0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEdit ? "Zapisz zmiany" : "Utwórz produkt"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/products")}
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}
