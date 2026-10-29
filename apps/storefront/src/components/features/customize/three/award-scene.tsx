"use client"

import { Suspense, useEffect, type ComponentRef } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Environment, Lightformer, OrbitControls, ContactShadows } from "@react-three/drei"
import { AwardModel } from "./award-model"
import type { AwardId } from "@/lib/configurator/studio-pieces"
import type { PlaqueConfig } from "@/lib/configurator/plaque"

type OrbitControlsImpl = ComponentRef<typeof OrbitControls>

function Camera({ reset }: { reset: number }) {
  const { camera, size, controls, invalidate } = useThree()
  useEffect(() => {
    const distance = Math.max(5.6, 3.1 / Math.max(0.3, size.width / size.height))
    camera.position.set(0.35, 1.65, distance)
    camera.lookAt(0, 1.25, 0)
    const orbit = controls as OrbitControlsImpl | null
    if (orbit) {
      orbit.target.set(0, 1.25, 0)
      orbit.minDistance = 3.2
      orbit.maxDistance = 10
      orbit.update()
    }
    invalidate()
  }, [camera, controls, size.width, size.height, reset, invalidate])
  return null
}

function Ready({ onReady, onFailure }: { onReady: () => void; onFailure: () => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const raf = requestAnimationFrame(onReady)
    const canvas = gl.domElement
    canvas.addEventListener("webglcontextlost", onFailure)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener("webglcontextlost", onFailure)
    }
  }, [gl, onReady, onFailure])
  return null
}

export default function AwardScene({
  award,
  config,
  layoutImage,
  view,
  onReady,
  onFailure,
}: {
  award: AwardId
  config: PlaqueConfig
  layoutImage: string | null
  view: { yaw: number; reset: number }
  onReady: () => void
  onFailure: () => void
}) {
  return (
    <Canvas
      camera={{ position: [0.35, 1.65, 5.6], fov: 32 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0, 0)}
    >
      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer position={[0, 5, 2]} scale={[8, 4, 1]} intensity={4} />
          <Lightformer
            position={[-4, 2, 3]}
            rotation-y={Math.PI / 3}
            scale={[4, 6, 1]}
            intensity={3}
            color="#ffe2b5"
          />
          <Lightformer
            position={[4, 2, 3]}
            rotation-y={-Math.PI / 3}
            scale={[3, 6, 1]}
            intensity={2.5}
          />
          <Lightformer position={[0, 2, -4]} rotation-y={Math.PI} scale={[5, 5, 1]} intensity={3} />
          <Lightformer position={[0, 2, 6]} rotation-y={Math.PI} scale={[7, 5, 1]} intensity={2} />
        </Environment>
        <hemisphereLight args={["#ffffff", "#8a7760", 0.5]} />
        <directionalLight position={[3, 5, 4]} intensity={1.3} />
        <group rotation-y={view.yaw}>
          <AwardModel award={award} config={config} layoutImage={layoutImage} />
        </group>
        <ContactShadows
          key={`${award}-${config.wood}`}
          position={[0, -0.005, 0]}
          scale={4}
          opacity={0.3}
          blur={2.8}
          far={3}
          frames={1}
        />
        <Ready onReady={onReady} onFailure={onFailure} />
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        minPolarAngle={0.5}
        maxPolarAngle={Math.PI / 2}
      />
      <Camera reset={view.reset} />
    </Canvas>
  )
}
