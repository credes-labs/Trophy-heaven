"use client"

// Adapted from the Aceternity UI Globe supplied with this task.
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Color,
  Scene,
  Fog,
  PerspectiveCamera,
  Vector3,
  type Group,
  type MeshPhongMaterial,
} from "three"
import ThreeGlobe from "three-globe"
import { useThree, Canvas, extend } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import countries from "@/data/globe.json"

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElements["mesh"] & { new (): ThreeGlobe }
  }
}
extend({ ThreeGlobe })

const RING_PROPAGATION_SPEED = 3
const aspect = 1.2
const cameraZ = 300

type Position = {
  order: number
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  arcAlt: number
  color: string
}

export type GlobeConfig = {
  pointSize?: number
  globeColor?: string
  showAtmosphere?: boolean
  atmosphereColor?: string
  atmosphereAltitude?: number
  emissive?: string
  emissiveIntensity?: number
  shininess?: number
  polygonColor?: string
  ambientLight?: string
  directionalLeftLight?: string
  directionalTopLight?: string
  pointLight?: string
  arcTime?: number
  arcLength?: number
  rings?: number
  maxRings?: number
  initialPosition?: { lat: number; lng: number }
  autoRotate?: boolean
  autoRotateSpeed?: number
}

interface WorldProps {
  globeConfig: GlobeConfig
  data: Position[]
}

export function Globe({ globeConfig, data }: WorldProps) {
  const globeRef = useRef<ThreeGlobe | null>(null)
  const groupRef = useRef<Group>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const reduced = usePrefersReducedMotion()
  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  }

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    const globe = new ThreeGlobe({ animateIn: !reduced })
    globeRef.current = globe
    const object = globe as unknown as Parameters<Group["add"]>[0]
    group.add(object)
    setIsInitialized(true)
    return () => {
      group.remove(object)
      globe.pauseAnimation()
      globe._destructor()
      globeRef.current = null
    }
  }, [reduced])

  useEffect(() => {
    if (!globeRef.current || !isInitialized) return
    const material = globeRef.current.globeMaterial() as MeshPhongMaterial
    material.color = new Color(defaultProps.globeColor)
    material.emissive = new Color(defaultProps.emissive)
    material.emissiveIntensity = defaultProps.emissiveIntensity
    material.shininess = defaultProps.shininess
  }, [
    isInitialized,
    reduced,
    defaultProps.globeColor,
    defaultProps.emissive,
    defaultProps.emissiveIntensity,
    defaultProps.shininess,
  ])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !isInitialized) return
    const points = data.flatMap((arc) => [
      {
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.startLat,
        lng: arc.startLng,
      },
      {
        size: defaultProps.pointSize,
        order: arc.order,
        color: arc.color,
        lat: arc.endLat,
        lng: arc.endLng,
      },
    ])
    const filteredPoints = points.filter(
      (v, i, a) => a.findIndex((v2) => v2.lat === v.lat && v2.lng === v.lng) === i
    )

    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(defaultProps.showAtmosphere)
      .atmosphereColor(defaultProps.atmosphereColor)
      .atmosphereAltitude(defaultProps.atmosphereAltitude)
      .hexPolygonColor(() => defaultProps.polygonColor)

    globe
      .arcsData(data)
      .arcStartLat((d) => (d as Position).startLat * 1)
      .arcStartLng((d) => (d as Position).startLng * 1)
      .arcEndLat((d) => (d as Position).endLat * 1)
      .arcEndLng((d) => (d as Position).endLng * 1)
      .arcColor((d: object) => (d as Position).color)
      .arcAltitude((d) => (d as Position).arcAlt * 1)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(reduced ? 1 : defaultProps.arcLength)
      .arcDashInitialGap((d) => (reduced ? 0 : (d as Position).order * 1))
      .arcDashGap(15)
      .arcDashAnimateTime(() => (reduced ? 0 : defaultProps.arcTime))

    globe
      .pointsData(filteredPoints)
      .pointColor((d) => (d as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0)
      .pointRadius(2)

    globe
      .ringsData([])
      .ringColor(() => defaultProps.polygonColor)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod(
        (defaultProps.arcTime * defaultProps.arcLength) / Math.max(1, defaultProps.rings)
      )

    if (reduced) globe.pauseAnimation()
    else globe.resumeAnimation()
  }, [
    isInitialized,
    reduced,
    data,
    defaultProps.pointSize,
    defaultProps.showAtmosphere,
    defaultProps.atmosphereColor,
    defaultProps.atmosphereAltitude,
    defaultProps.polygonColor,
    defaultProps.arcLength,
    defaultProps.arcTime,
    defaultProps.rings,
    defaultProps.maxRings,
  ])

  useEffect(() => {
    if (!globeRef.current || !isInitialized || reduced) return
    const interval = setInterval(() => {
      if (!globeRef.current) return
      const numbersOfRings = genRandomNumbers(0, data.length, Math.floor((data.length * 4) / 5))
      globeRef.current.ringsData(
        data
          .filter((_, i) => numbersOfRings.includes(i))
          .map((d) => ({ lat: d.startLat, lng: d.startLng, color: d.color }))
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [isInitialized, reduced, data])

  return <group ref={groupRef} />
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree()
  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio)
    gl.setSize(size.width, size.height)
    gl.setClearColor(0xffaaff, 0)
  }, [gl, size.width, size.height])
  return null
}

export function World(props: WorldProps) {
  const { globeConfig } = props
  const reduced = usePrefersReducedMotion()
  const scene = useMemo(() => {
    const value = new Scene()
    value.fog = new Fog(0xffffff, 400, 2000)
    return value
  }, [])
  const camera = useMemo(() => {
    const value = new PerspectiveCamera(50, aspect, 180, 1800)
    value.position.set(0, 0, cameraZ)
    return value
  }, [])
  return (
    <Canvas scene={scene} camera={camera} data-globe-world data-reduced-motion={reduced}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight
        color={globeConfig.directionalLeftLight}
        position={new Vector3(-400, 100, 400)}
      />
      <directionalLight
        color={globeConfig.directionalTopLight}
        position={new Vector3(-200, 500, 200)}
      />
      <pointLight
        color={globeConfig.pointLight}
        position={new Vector3(-200, 500, 200)}
        intensity={0.8}
      />
      <Globe {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping={!reduced}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 1}
        autoRotate={!reduced && (globeConfig.autoRotate ?? true)}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  )
}

export function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (_, r: string, g: string, b: string) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null
}

export function genRandomNumbers(min: number, max: number, count: number) {
  if (![min, max, count].every(Number.isFinite) || max <= min) return []
  const arr: number[] = []
  const target = Math.min(
    Math.max(0, Math.floor(count)),
    Math.max(0, Math.floor(max) - Math.ceil(min))
  )
  while (arr.length < target) {
    const r = Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) + Math.ceil(min)
    if (!arr.includes(r)) arr.push(r)
  }
  return arr
}
