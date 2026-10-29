"use client"

import { motion } from "motion/react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import dynamic from "next/dynamic"
import type { GlobeConfig } from "@/components/ui/globe"

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), { ssr: false })

const globeConfig: GlobeConfig = {
  pointSize: 4,
  globeColor: "#C3A15B",
  showAtmosphere: true,
  atmosphereColor: "#E4C66A",
  atmosphereAltitude: 0.1,
  emissive: "#9D782E",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,226,160,0.85)",
  ambientLight: "#F5D986",
  directionalLeftLight: "#FFF6DB",
  directionalTopLight: "#FFFFFF",
  pointLight: "#FFE6A0",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 22.3193, lng: 114.1694 },
  autoRotate: true,
  autoRotateSpeed: 0.5,
}

const colors = ["#B89E6B", "#E8C576", "#D6A441"]
// Original demo routes, in their original order. Stable colors avoid rebuilding
// the globe's geometry whenever the parent renders.
const routes: [number, number, number, number, number, number][] = [
  [1, -19.885592, -43.951191, -22.9068, -43.1729, 0.1],
  [1, 28.6139, 77.209, 3.139, 101.6869, 0.2],
  [1, -19.885592, -43.951191, -1.303396, 36.852443, 0.5],
  [2, 1.3521, 103.8198, 35.6762, 139.6503, 0.2],
  [2, 51.5072, -0.1276, 3.139, 101.6869, 0.3],
  [2, -15.785493, -47.909029, 36.162809, -115.119411, 0.3],
  [3, -33.8688, 151.2093, 22.3193, 114.1694, 0.3],
  [3, 21.3099, -157.8581, 40.7128, -74.006, 0.3],
  [3, -6.2088, 106.8456, 51.5072, -0.1276, 0.3],
  [4, 11.986597, 8.571831, -15.595412, -56.05918, 0.5],
  [4, -34.6037, -58.3816, 22.3193, 114.1694, 0.7],
  [4, 51.5072, -0.1276, 48.8566, -2.3522, 0.1],
  [5, 14.5995, 120.9842, 51.5072, -0.1276, 0.3],
  [5, 1.3521, 103.8198, -33.8688, 151.2093, 0.2],
  [5, 34.0522, -118.2437, 48.8566, -2.3522, 0.2],
  [6, -15.432563, 28.315853, 1.094136, -63.34546, 0.7],
  [6, 37.5665, 126.978, 35.6762, 139.6503, 0.1],
  [6, 22.3193, 114.1694, 51.5072, -0.1276, 0.3],
  [7, -19.885592, -43.951191, -15.595412, -56.05918, 0.1],
  [7, 48.8566, -2.3522, 52.52, 13.405, 0.1],
  [7, 52.52, 13.405, 34.0522, -118.2437, 0.2],
  [8, -8.833221, 13.264837, -33.936138, 18.436529, 0.2],
  [8, 49.2827, -123.1207, 52.3676, 4.9041, 0.2],
  [8, 1.3521, 103.8198, 40.7128, -74.006, 0.5],
  [9, 51.5072, -0.1276, 34.0522, -118.2437, 0.2],
  [9, 22.3193, 114.1694, -22.9068, -43.1729, 0.7],
  [9, 1.3521, 103.8198, -34.6037, -58.3816, 0.5],
  [10, -22.9068, -43.1729, 28.6139, 77.209, 0.7],
  [10, 34.0522, -118.2437, 31.2304, 121.4737, 0.3],
  [10, -6.2088, 106.8456, 52.3676, 4.9041, 0.3],
  [11, 41.9028, 12.4964, 34.0522, -118.2437, 0.2],
  [11, -6.2088, 106.8456, 31.2304, 121.4737, 0.2],
  [11, 22.3193, 114.1694, 1.3521, 103.8198, 0.2],
  [12, 34.0522, -118.2437, 37.7749, -122.4194, 0.1],
  [12, 35.6762, 139.6503, 22.3193, 114.1694, 0.2],
  [12, 22.3193, 114.1694, 34.0522, -118.2437, 0.3],
  [13, 52.52, 13.405, 22.3193, 114.1694, 0.3],
  [13, 11.986597, 8.571831, 35.6762, 139.6503, 0.3],
  [13, -22.9068, -43.1729, -34.6037, -58.3816, 0.1],
  [14, -33.936138, 18.436529, 21.395643, 39.883798, 0.3],
]
const sampleArcs = routes.map(([order, startLat, startLng, endLat, endLng, arcAlt], i) => ({
  order,
  startLat,
  startLng,
  endLat,
  endLng,
  arcAlt,
  color: colors[i % colors.length]!,
}))

export default function GlobeDemo({ embedded = false }: { embedded?: boolean }) {
  const reduced = usePrefersReducedMotion()
  if (embedded)
    return (
      <div
        data-contact-globe
        role="img"
        aria-label="Interactive globe with golden continents and connection arcs"
        className="relative h-full w-full"
      >
        <World data={sampleArcs} globeConfig={globeConfig} />
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent to-[#F2F1EF] z-40" />
      </div>
    )

  return (
    <div className="flex flex-row items-center justify-center py-20 h-screen md:h-auto dark:bg-black bg-white relative w-full">
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden h-full md:h-[40rem] px-4">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 1 }}
          className="div"
        >
          <h2 className="text-center text-xl md:text-4xl font-bold text-black dark:text-white">
            We sell soap worldwide
          </h2>
          <p className="text-center text-base md:text-lg font-normal text-neutral-700 dark:text-neutral-200 max-w-md mt-2 mx-auto">
            This globe is interactive and customizable. Have fun with it, and don&apos;t forget to
            share it. :)
          </p>
        </motion.div>
        <div className="absolute w-full bottom-0 inset-x-0 h-40 bg-gradient-to-b pointer-events-none select-none from-transparent dark:to-black to-white z-40" />
        <div className="absolute w-full -bottom-20 h-72 md:h-full z-10">
          <World data={sampleArcs} globeConfig={globeConfig} />
        </div>
      </div>
    </div>
  )
}
