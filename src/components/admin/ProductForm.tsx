"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, Image, Video, X, Upload, FileArchive, GripVertical, Link as LinkIcon, ImagePlus, Tag, Eye, Globe } from "lucide-react";
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

interface AddonItem {
  id?: string;
  namePl: string;
  nameEn: string;
  descriptionPl: string;
  descriptionEn: string;
  price: number;
  originalPrice: number;
  required: boolean;
  badgePl: string;
  badgeEn: string;
  active: boolean;
  sortOrder: number;
  _saving?: boolean;
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
  previewUrl: string;
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
  // Image upload state
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadQueue, setImageUploadQueue] = useState<File[]>([]);
  const [imageUploadProgress, setImageUploadProgress] = useState("");
  const [imageDragOver, setImageDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // Image reorder state
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);
  const isProcessingQueue = useRef(false);
  // Preview upload state
  const [previewUploading, setPreviewUploading] = useState(false);
  const [previewUploadProgress, setPreviewUploadProgress] = useState("");
  const [previewDragOver, setPreviewDragOver] = useState(false);
  const previewInputRef = useRef<HTMLInputElement>(null);
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
      previewUrl: "",
      fileUrl: "",
      variants: [
        {
          namePl: "Licencja Personal",
          nameEn: "Personal License",
          descriptionPl: "Użytek w jednym projekcie osobistym",
          descriptionEn: "Use in one personal project",
          price: 99,
        },
      ],
    }
  );

  const isEdit = !!initialData;

  // Addons state (edit mode only)
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [addonsLoaded, setAddonsLoaded] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/products/${initialData.id}/addons`)
      .then((r) => r.json())
      .then((data) => {
        setAddons(
          data.map((a: AddonItem & { price: number; originalPrice: number | null }) => ({
            id: a.id,
            namePl: a.namePl,
            nameEn: a.nameEn,
            descriptionPl: a.descriptionPl || "",
            descriptionEn: a.descriptionEn || "",
            price: a.price / 100,
            originalPrice: a.originalPrice ? a.originalPrice / 100 : 0,
            required: a.required,
            badgePl: a.badgePl || "",
            badgeEn: a.badgeEn || "",
            active: a.active,
            sortOrder: a.sortOrder,
          }))
        );
        setAddonsLoaded(true);
      })
      .catch(() => setAddonsLoaded(true));
  }, [isEdit, initialData?.id]);

  const addAddonRow = () => {
    setAddons([
      ...addons,
      {
        namePl: "",
        nameEn: "",
        descriptionPl: "",
        descriptionEn: "",
        price: 0,
        originalPrice: 0,
        required: false,
        badgePl: "",
        badgeEn: "",
        active: true,
        sortOrder: addons.length,
      },
    ]);
  };

  const updateAddonField = (index: number, field: keyof AddonItem, value: string | number | boolean) => {
    const updated = [...addons];
    updated[index] = { ...updated[index], [field]: value };
    setAddons(updated);
  };

  const saveAddon = async (index: number) => {
    const addon = addons[index];
    const updated = [...addons];
    updated[index] = { ...addon, _saving: true };
    setAddons(updated);

    const payload = {
      namePl: addon.namePl,
      nameEn: addon.nameEn,
      descriptionPl: addon.descriptionPl || null,
      descriptionEn: addon.descriptionEn || null,
      price: Math.round(addon.price * 100),
      originalPrice: addon.originalPrice ? Math.round(addon.originalPrice * 100) : null,
      required: addon.required,
      badgePl: addon.badgePl || null,
      badgeEn: addon.badgeEn || null,
      active: addon.active,
      sortOrder: addon.sortOrder,
    };

    const res = addon.id
      ? await fetch(`/api/admin/addons/${addon.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/admin/products/${initialData!.id}/addons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      const saved = await res.json();
      const refreshed = [...addons];
      refreshed[index] = {
        ...addon,
        id: saved.id,
        _saving: false,
      };
      setAddons(refreshed);
    } else {
      const refreshed = [...addons];
      refreshed[index] = { ...addon, _saving: false };
      setAddons(refreshed);
    }
  };

  const deleteAddon = async (index: number) => {
    const addon = addons[index];
    if (addon.id) {
      await fetch(`/api/admin/addons/${addon.id}`, { method: "DELETE" });
    }
    setAddons(addons.filter((_, i) => i !== index));
  };

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

  // Upload a single image file to the server
  const uploadSingleImage = useCallback(async (file: File): Promise<string | null> => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return null;

    const result = await res.json();
    return result.url;
  }, []);

  // Process image upload queue sequentially
  const processImageQueue = useCallback(async (files: File[]) => {
    if (isProcessingQueue.current || files.length === 0) return;
    isProcessingQueue.current = true;
    setImageUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setImageUploadProgress(`Przesyłanie ${i + 1} z ${files.length}: ${file.name}`);

      const url = await uploadSingleImage(file);
      if (url) {
        setData(prev => ({ ...prev, screenshots: [...prev.screenshots, url] }));
      }
    }

    setImageUploading(false);
    setImageUploadProgress("");
    setImageUploadQueue([]);
    isProcessingQueue.current = false;
  }, [uploadSingleImage]);

  // Handle image files dropped or selected
  const handleImageFiles = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter(f =>
      ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(f.type)
    );
    if (imageFiles.length === 0) return;
    setImageUploadQueue(imageFiles);
    processImageQueue(imageFiles);
  }, [processImageQueue]);

  // Image drag & drop handlers
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImageDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  // Screenshot reorder via drag
  const handleScreenshotDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleScreenshotDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverImageIndex(index);
  };

  const handleScreenshotDragEnd = () => {
    if (draggedImageIndex !== null && dragOverImageIndex !== null && draggedImageIndex !== dragOverImageIndex) {
      const newScreenshots = [...data.screenshots];
      const [dragged] = newScreenshots.splice(draggedImageIndex, 1);
      newScreenshots.splice(dragOverImageIndex, 0, dragged);
      setData({ ...data, screenshots: newScreenshots });
    }
    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  // Preview ZIP upload
  const handlePreviewUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setPreviewUploadProgress("Dozwolone tylko pliki ZIP");
      return;
    }
    if (!data.slug) {
      setPreviewUploadProgress("Najpierw ustaw slug produktu");
      return;
    }

    setPreviewUploading(true);
    setPreviewUploadProgress("Rozpakowywanie i przesyłanie plików...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", data.slug);

      const res = await fetch("/api/admin/upload-preview", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setData((prev) => ({ ...prev, previewUrl: result.previewUrl }));
        setPreviewUploadProgress(`Przesłano ${result.fileCount} plików`);
        setTimeout(() => setPreviewUploadProgress(""), 3000);
      } else {
        setPreviewUploadProgress(result.error || "Błąd przesyłania");
      }
    } catch {
      setPreviewUploadProgress("Błąd przesyłania preview");
    } finally {
      setPreviewUploading(false);
    }
  };

  const handlePreviewDelete = async () => {
    if (!data.slug) return;

    setPreviewUploading(true);
    setPreviewUploadProgress("Usuwanie preview...");

    try {
      const res = await fetch("/api/admin/upload-preview", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: data.slug }),
      });

      if (res.ok) {
        setData((prev) => ({ ...prev, previewUrl: "" }));
        setPreviewUploadProgress("");
      } else {
        setPreviewUploadProgress("Błąd usuwania preview");
      }
    } catch {
      setPreviewUploadProgress("Błąd usuwania preview");
    } finally {
      setPreviewUploading(false);
    }
  };

  const handlePreviewDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPreviewDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePreviewUpload(file);
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
          variants: data.variants.map((v) => ({
            ...v,
            price: Math.round(v.price * 100),
          })),
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
              <option value="" disabled className="bg-[#1a1a1a] text-white">Wybierz kategorię</option>
              <option value="Szablon Strony" className="bg-[#1a1a1a] text-white">Szablon Strony</option>
              <option value="Szablony Strony WordPress" className="bg-[#1a1a1a] text-white">Szablony Strony WordPress</option>
              <option value="Wtyczki" className="bg-[#1a1a1a] text-white">Wtyczki</option>
              <option value="Skrypty" className="bg-[#1a1a1a] text-white">Skrypty</option>
              <option value="Narzędzia" className="bg-[#1a1a1a] text-white">Narzędzia</option>
              <option value="Twój Pomysł" className="bg-[#1a1a1a] text-white">Twój Pomysł</option>
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
            Zrzuty ekranu
          </label>

          {/* Image grid with reorder */}
          {data.screenshots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {data.screenshots.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  draggable
                  onDragStart={() => handleScreenshotDragStart(i)}
                  onDragOver={(e) => handleScreenshotDragOver(e, i)}
                  onDragEnd={handleScreenshotDragEnd}
                  className={`relative group rounded-xl overflow-hidden border bg-white/5 cursor-grab active:cursor-grabbing transition-all ${
                    draggedImageIndex === i
                      ? "opacity-40 scale-95 border-primary/50"
                      : dragOverImageIndex === i
                      ? "border-primary border-2 scale-[1.02]"
                      : "border-white/10"
                  }`}
                >
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 p-1 bg-black/60 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>
                  {/* Order badge */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/60 rounded-full text-[10px] text-gray-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    #{i + 1}
                  </div>
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
                    className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
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

          {data.screenshots.length > 1 && (
            <p className="text-xs text-gray-600 mb-4">
              Przeciągnij zdjęcia, aby zmienić kolejność wyświetlania.
            </p>
          )}

          {/* Image upload drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
            onDragLeave={() => setImageDragOver(false)}
            onDrop={handleImageDrop}
            onClick={() => imageInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
              imageDragOver
                ? "border-primary bg-primary/5"
                : "border-white/10 hover:border-white/20 bg-white/[0.02]"
            }`}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleImageFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />
            {imageUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-sm text-gray-400">{imageUploadProgress}</span>
              </div>
            ) : (
              <div className="py-2">
                <ImagePlus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Przeciągnij zdjęcia lub{" "}
                  <span className="text-primary">kliknij, aby wybrać</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  JPEG, PNG, WebP, GIF, AVIF — maks. 10MB / zdjęcie — można wrzucić kilka na raz
                </p>
              </div>
            )}
          </div>

          {/* URL input for screenshots */}
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-xs text-gray-500">lub dodaj z URL:</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={newScreenshotUrl}
              onChange={(e) => setNewScreenshotUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newScreenshotUrl.trim()) {
                    setData({
                      ...data,
                      screenshots: [...data.screenshots, newScreenshotUrl.trim()],
                    });
                    setNewScreenshotUrl("");
                  }
                }
              }}
              placeholder="https://example.com/screenshot.png"
              className="flex-1 min-w-0 w-auto"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-primary/20 border border-primary/30 rounded-xl text-primary hover:bg-primary/30 hover:text-white active:scale-95 transition-all cursor-pointer whitespace-nowrap"
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

      {/* Live Preview */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          Live Preview
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Wgraj plik ZIP ze statycznym HTML (wyeksportowanym z WordPress). Musi zawierać index.html w głównym folderze.
        </p>

        {data.previewUrl ? (
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
            <Globe className="w-6 h-6 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">Preview aktywny</p>
              <a
                href={data.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate block"
              >
                {data.previewUrl}
              </a>
            </div>
            <button
              type="button"
              onClick={handlePreviewDelete}
              disabled={previewUploading}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        <div
          onDragOver={(e) => { e.preventDefault(); setPreviewDragOver(true); }}
          onDragLeave={() => setPreviewDragOver(false)}
          onDrop={handlePreviewDrop}
          onClick={() => previewInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            previewDragOver
              ? "border-primary bg-primary/5"
              : "border-white/10 hover:border-white/20 bg-white/[0.02]"
          }`}
        >
          <input
            ref={previewInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePreviewUpload(file);
              e.target.value = "";
            }}
          />
          {previewUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm text-gray-400">{previewUploadProgress}</span>
            </div>
          ) : (
            <div className="py-2">
              <FileArchive className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {data.previewUrl ? "Przeciągnij ZIP, aby zastąpić preview" : "Przeciągnij plik ZIP lub"}{" "}
                <span className="text-primary">kliknij, aby wybrać</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                ZIP z index.html + CSS/JS/obrazki — maks. 50MB
              </p>
            </div>
          )}
          {previewUploadProgress && !previewUploading && (
            <p className={`text-xs mt-2 ${previewUploadProgress.startsWith("Przesłano") ? "text-green-400" : "text-red-400"}`}>
              {previewUploadProgress}
            </p>
          )}
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
                    Cena (PLN)
                  </label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(i, "price", parseFloat(e.target.value) || 0)
                    }
                    placeholder="99.00"
                    required
                    min={0}
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Addons — only in edit mode */}
      {isEdit && (
        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Usługi dodatkowe (Addony)
            </h3>
            <button
              type="button"
              onClick={addAddonRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj addon
            </button>
          </div>

          {!addonsLoaded ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ładowanie...
            </div>
          ) : addons.length === 0 ? (
            <p className="text-sm text-gray-600 py-2">
              Brak addonów. Kliknij &quot;Dodaj addon&quot;, aby stworzyć pierwszy.
            </p>
          ) : (
            <div className="space-y-4">
              {addons.map((addon, i) => (
                <div key={addon.id || `new-${i}`} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400 font-medium">
                      Addon #{i + 1} {!addon.id && <span className="text-yellow-500 text-xs">(niezapisany)</span>}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveAddon(i)}
                        disabled={addon._saving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/20 border border-primary/30 rounded-lg text-primary hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {addon._saving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Zapisz
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddon(i)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nazwa (PL)</label>
                      <Input value={addon.namePl} onChange={(e) => updateAddonField(i, "namePl", e.target.value)} placeholder="Instalacja szablonu" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nazwa (EN)</label>
                      <Input value={addon.nameEn} onChange={(e) => updateAddonField(i, "nameEn", e.target.value)} placeholder="Template installation" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Opis (PL)</label>
                      <Input value={addon.descriptionPl} onChange={(e) => updateAddonField(i, "descriptionPl", e.target.value)} placeholder="Krótki opis usługi" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Opis (EN)</label>
                      <Input value={addon.descriptionEn} onChange={(e) => updateAddonField(i, "descriptionEn", e.target.value)} placeholder="Short service description" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cena (PLN)</label>
                      <Input type="number" min={0} step="0.01" value={addon.price} onChange={(e) => updateAddonField(i, "price", parseFloat(e.target.value) || 0)} placeholder="184.00" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cena oryginalna (PLN) — przekreślona</label>
                      <Input type="number" min={0} step="0.01" value={addon.originalPrice} onChange={(e) => updateAddonField(i, "originalPrice", parseFloat(e.target.value) || 0)} placeholder="222.00" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Badge (PL) — np. Usługa Dnia</label>
                      <Input value={addon.badgePl} onChange={(e) => updateAddonField(i, "badgePl", e.target.value)} placeholder="Usługa Dnia" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Badge (EN)</label>
                      <Input value={addon.badgeEn} onChange={(e) => updateAddonField(i, "badgeEn", e.target.value)} placeholder="Service of the Day" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Kolejność</label>
                      <Input type="number" min={0} value={addon.sortOrder} onChange={(e) => updateAddonField(i, "sortOrder", parseInt(e.target.value) || 0)} placeholder="0" />
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addon.required}
                          onChange={(e) => updateAddonField(i, "required", e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-xs text-gray-400">Wymagany (pre-selected)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addon.active}
                          onChange={(e) => updateAddonField(i, "active", e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-xs text-gray-400">Aktywny</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
