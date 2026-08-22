"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { localizeImageUrl } from "@/lib/images"

export type GalleryImage = { id: string; url: string; alt?: string }

export function ImageGallery({
  images,
  title,
  accentClass = "border-trophy",
}: {
  images: GalleryImage[]
  title: string
  accentClass?: string
}) {
  const list = images.length
    ? images
    : [{ id: "placeholder", url: "", alt: title }]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%")
  const current = list[active] ?? list[0]

  // Lightbox keyboard navigation: arrows cycle, Escape closes.
  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActive((a) => (a - 1 + list.length) % list.length)
      } else if (e.key === "ArrowRight") {
        setActive((a) => (a + 1) % list.length)
      } else if (e.key === "Escape") {
        setLightbox(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightbox, list.length])

  return (
    <div className="space-y-3">
      {/* Desktop main image (hover-zoom follows the cursor) */}
      <button
        type="button"
        onClick={() => current.url && setLightbox(true)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * 100
          const y = ((e.clientY - rect.top) / rect.height) * 100
          setZoomOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`)
        }}
        onMouseLeave={() => setZoomOrigin("50% 50%")}
        className="group relative hidden aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted lg:block"
        aria-label="Open image lightbox"
      >
        <AnimatePresence mode="wait">
          {current.url ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={localizeImageUrl(current.url)}
                alt={current.alt ?? title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ transformOrigin: zoomOrigin }}
                className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.75] motion-reduce:group-hover:scale-100"
                priority
              />
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center font-serif text-4xl text-muted-foreground opacity-40">
              LC
            </div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile swipe carousel */}
      <div className="lg:hidden">
        <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-xl">
          {list.map((img, i) => (
            <div
              key={img.id}
              className="relative aspect-square w-full shrink-0 snap-center bg-muted"
              onClick={() => {
                setActive(i)
                if (img.url) setLightbox(true)
              }}
            >
              {img.url ? (
                <Image
                  src={localizeImageUrl(img.url)}
                  alt={img.alt ?? `${title} ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              ) : (
                <div className="flex h-full items-center justify-center font-serif text-4xl text-muted-foreground opacity-40">
                  LC
                </div>
              )}
            </div>
          ))}
        </div>
        {list.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {list.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === active ? "bg-foreground" : "bg-muted-foreground/40"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && list[0]?.url && (
        <div className="hidden gap-2 overflow-x-auto lg:flex">
          {list.slice(0, 8).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition-colors",
                i === active ? accentClass : "border-transparent"
              )}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active}
            >
              {img.url ? (
                <Image src={localizeImageUrl(img.url)} alt="" fill sizes="64px" className="object-cover" />
              ) : null}
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          size="fullscreen"
          className="m-0 flex items-center justify-center border-0 bg-foreground/95 p-0"
        >
          <div className="relative flex h-full w-full items-center justify-center px-12">
            {current.url && (
              <Image
                src={localizeImageUrl(current.url)}
                alt={current.alt ?? title}
                width={1200}
                height={1200}
                className="max-h-[90dvh] w-auto object-contain"
              />
            )}
            {list.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-card/90 px-3 py-2 text-sm"
                  onClick={() => setActive((a) => (a - 1 + list.length) % list.length)}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/90 px-3 py-2 text-sm"
                  onClick={() => setActive((a) => (a + 1) % list.length)}
                >
                  →
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
