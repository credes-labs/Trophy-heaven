"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { localizeImageUrl } from "@/lib/images"
import "./image-gallery.css"

export type GalleryImage = { id: string; url: string; alt?: string }

export function ImageGallery({
  images,
  title,
}: {
  images: GalleryImage[]
  title: string
}) {
  const list = images.length ? images : [{ id: "placeholder", url: "", alt: title }]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%")
  const current = list[active] ?? list[0]
  const thumbs = list.slice(0, 5)
  const hasMany = list.length > 1

  const prev = useCallback(
    () => setActive((a) => (a - 1 + list.length) % list.length),
    [list.length]
  )
  const next = useCallback(
    () => setActive((a) => (a + 1) % list.length),
    [list.length]
  )

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
      else if (e.key === "Escape") setLightbox(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [lightbox, prev, next])

  return (
    <div>
      <div
        className="pdp-gallery-well"
        style={{ aspectRatio: "1 / 1", backgroundColor: "#D9D9D9" }}
      >
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
          className="pdp-gallery-open group"
          aria-label="Open image lightbox"
        >
          <span className="pdp-gallery-frame">
            <span className="pdp-gallery-frame-inner relative block h-full w-full">
              <AnimatePresence mode="wait">
                {current.url ? (
                  <motion.span
                    key={current.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 block"
                  >
                    <Image
                      src={localizeImageUrl(current.url)}
                      alt={current.alt ?? title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      style={{ transformOrigin: zoomOrigin }}
                      className="pdp-gallery-img object-contain transition-transform duration-300 ease-out group-hover:scale-[1.75] motion-reduce:group-hover:scale-100"
                      priority
                    />
                  </motion.span>
                ) : (
                  <span className="pdp-gallery-placeholder">LC</span>
                )}
              </AnimatePresence>
            </span>
          </span>
        </button>

        {hasMany ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="pdp-gallery-arrow pdp-gallery-arrow--prev"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="pdp-gallery-arrow pdp-gallery-arrow--next"
            >
              ›
            </button>
            <p className="pdp-gallery-counter">
              <strong>{String(active + 1).padStart(2, "0")}</strong>
              <span aria-hidden> / </span>
              {String(list.length).padStart(2, "0")}
            </p>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <div className="pdp-thumbs">
          {thumbs.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={i === active ? "pdp-thumb is-active" : "pdp-thumb"}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active}
            >
              <span className="pdp-thumb-pad">
                <span className="relative block h-full w-full">
                  {img.url ? (
                    <Image
                      src={localizeImageUrl(img.url)}
                      alt=""
                      fill
                      sizes="140px"
                      className="object-contain"
                    />
                  ) : null}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          size="fullscreen"
          className="m-0 flex items-center justify-center border-0 bg-[#131111]/95 p-0"
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
            {hasMany ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute top-1/2 left-4 -translate-y-1/2 border-0 bg-transparent p-0 font-outfit text-[2em] text-[#F2F1EF]/70 hover:text-[#F2F1EF]"
                  onClick={prev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute top-1/2 right-4 -translate-y-1/2 border-0 bg-transparent p-0 font-outfit text-[2em] text-[#F2F1EF]/70 hover:text-[#F2F1EF]"
                  onClick={next}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
