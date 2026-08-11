"use client"

import { useMemo } from "react"
import { Text } from "@react-three/drei"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { MATERIALS_3D, getBase, type Editor3DValues } from "@/lib/design-3d"

/** Loads the logo as a texture on a small plane anchored to the plinth face. */
function LogoDecal({ url }: { url: string }) {
  const texture = useTexture(url)
  return (
    <mesh position={[0, 0.15, 0.63]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

/**
 * Procedural trophy geometry for each base (FR-3D-2). Renders the selected PBR
 * material (FR-3D-4), 3D engraving text (FR-3D-5) and an optional logo (FR-3D-6).
 * `segments` drives the LOD (FR-3D-11).
 */
export function TrophyModel({
  values,
  segments,
}: {
  values: Editor3DValues
  segments: number
}) {
  const base = getBase(values.baseModelId)
  const mat = MATERIALS_3D[values.material]

  const material = useMemo(() => {
    if (mat.transmission) {
      return new THREE.MeshPhysicalMaterial({
        color: mat.color,
        metalness: mat.metalness,
        roughness: mat.roughness,
        transmission: mat.transmission,
        thickness: 0.8,
        ior: 1.5,
      })
    }
    return new THREE.MeshStandardMaterial({
      color: mat.color,
      metalness: mat.metalness,
      roughness: mat.roughness,
    })
  }, [mat])

  return (
    <group>
      {/* Plinth / base shared by all shapes */}
      <mesh position={[0, -0.85, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[1.3, 0.4, 1.3]} />
      </mesh>

      {/* Shape-specific body */}
      <group position={[0, 0.1, 0]}>
        {base.shape === "cup" && (
          <>
            <mesh material={material} castShadow>
              <cylinderGeometry args={[0.45, 0.28, 0.9, segments]} />
            </mesh>
            <mesh position={[0, -0.6, 0]} material={material}>
              <cylinderGeometry args={[0.08, 0.08, 0.35, segments]} />
            </mesh>
          </>
        )}
        {base.shape === "star" && (
          <mesh material={material} castShadow rotation={[0, 0, 0]}>
            <dodecahedronGeometry args={[0.55, 0]} />
          </mesh>
        )}
        {base.shape === "column" && (
          <mesh material={material} castShadow>
            <cylinderGeometry args={[0.28, 0.32, 1.4, segments]} />
          </mesh>
        )}
        {base.shape === "obelisk" && (
          <mesh material={material} castShadow>
            <coneGeometry args={[0.5, 1.5, 4]} />
          </mesh>
        )}
        {base.shape === "plaque" && (
          <mesh material={material} castShadow>
            <boxGeometry args={[1.1, 1.4, 0.12]} />
          </mesh>
        )}
        {base.shape === "globe" && (
          <mesh material={material} castShadow>
            <sphereGeometry args={[0.55, segments, segments]} />
          </mesh>
        )}
      </group>

      {/* Engraving plate on the plinth front */}
      <mesh position={[0, -0.85, 0.66]}>
        <planeGeometry args={[1.0, 0.22]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.6} roughness={0.4} />
      </mesh>

      {values.engravingText.trim() && (
        <Text
          position={[0, -0.85, 0.671]}
          fontSize={0.11}
          maxWidth={0.95}
          color="#e8c86a"
          anchorX="center"
          anchorY="middle"
        >
          {values.engravingText}
        </Text>
      )}

      {values.logoUrl && <LogoDecal url={values.logoUrl} />}
    </group>
  )
}
