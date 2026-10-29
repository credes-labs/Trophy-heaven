"use client"

import { Component, useCallback, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { RotateCcw, RotateCw, Scan } from "lucide-react"
import { studioPiece, type AwardId } from "@/lib/configurator/studio-pieces"
import type { PlaqueConfig } from "@/lib/configurator/plaque"

const AwardScene = dynamic(() => import("../three/award-scene"), { ssr: false })
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFailure()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function AwardStage({
  award,
  config,
  layoutImage,
}: {
  award: AwardId
  config: PlaqueConfig
  layoutImage: string | null
}) {
  const [view, setView] = useState({ yaw: 0, reset: 0 })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => {
    setFailed(true)
    setReady(false)
  }, [])
  const piece = studioPiece(award)
  return (
    <div
      data-award-stage
      className="relative h-full w-full bg-[radial-gradient(ellipse_at_50%_42%,#FBFBF7_0%,#F2F1EF_48%,#E6E0D3_100%)]"
    >
      <div
        role="img"
        aria-label={`${piece.label}, ${config.plate} finish, personalised base engraving`}
        className="absolute inset-0"
      >
        {!failed ? (
          <div className="absolute inset-x-0 top-12 bottom-12 sm:inset-0">
            <SceneBoundary onFailure={onFailure}>
              <AwardScene
                award={award}
                config={config}
                layoutImage={layoutImage}
                view={view}
                onReady={onReady}
                onFailure={onFailure}
              />
            </SceneBoundary>
          </div>
        ) : null}
        {!ready ? (
          <div className="absolute inset-0 px-[20%] pt-16 pb-16">
            <Image
              src={piece.cutout}
              alt={piece.label}
              fill
              sizes="70vw"
              className="object-contain p-20"
            />
            {failed ? (
              <p className="absolute inset-x-0 bottom-4 m-0 text-center text-xs text-[#6B635C]">
                3D unavailable. Use 2D design for a live engraving proof.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="absolute right-4 bottom-4 flex gap-2">
        {[
          {
            label: "Turn left",
            icon: RotateCcw,
            action: () => setView((v) => ({ ...v, yaw: v.yaw - Math.PI / 4 })),
          },
          {
            label: "Turn right",
            icon: RotateCw,
            action: () => setView((v) => ({ ...v, yaw: v.yaw + Math.PI / 4 })),
          },
          {
            label: "Reset view",
            icon: Scan,
            action: () => setView((v) => ({ yaw: 0, reset: v.reset + 1 })),
          },
        ].map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={action}
            disabled={failed}
            className="flex size-10 items-center justify-center rounded-full border border-[#331207]/20 bg-[#FBFBF7]/90 text-[#331207] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  )
}
