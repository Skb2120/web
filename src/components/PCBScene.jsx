import { Float, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'

function seededRandom(seed) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

function CircuitBoardMesh({ mobile }) {
  const groupRef = useRef()
  const traces = useMemo(() => {
    const count = mobile ? 16 : 34
    return Array.from({ length: count }, (_, index) => ({
      x: (seededRandom(index + 1) - 0.5) * 7,
      z: (seededRandom(index + 101) - 0.5) * 4,
      length: 0.45 + seededRandom(index + 201) * 1.6,
      rotate: seededRandom(index + 301) > 0.5 ? Math.PI / 2 : 0,
      color: index % 3 === 0 ? '#34d399' : '#22d3ee',
    }))
  }, [mobile])

  const nodes = useMemo(() => {
    const count = mobile ? 18 : 48
    return Array.from({ length: count }, (_, index) => ({
      x: (seededRandom(index + 401) - 0.5) * 7.2,
      z: (seededRandom(index + 501) - 0.5) * 4.2,
      y: 0.14 + seededRandom(index + 601) * 0.04,
      scale: 0.045 + seededRandom(index + 701) * 0.05,
    }))
  }, [mobile])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.28) * 0.12
      groupRef.current.rotation.x = -0.42 + Math.sin(clock.elapsedTime * 0.18) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.35, 0]} rotation={[-0.42, 0, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[8.4, 0.16, 5.2]} />
        <meshStandardMaterial color="#06251e" metalness={0.3} roughness={0.38} emissive="#021f1c" emissiveIntensity={0.65} />
      </mesh>

      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.7, 0.26, 1.35]} />
        <meshStandardMaterial color="#08111f" metalness={0.65} roughness={0.28} emissive="#0f172a" emissiveIntensity={0.35} />
      </mesh>

      {traces.map((trace, index) => (
        <mesh key={index} position={[trace.x, 0.16, trace.z]} rotation={[0, trace.rotate, 0]}>
          <boxGeometry args={[trace.length, 0.025, 0.035]} />
          <meshStandardMaterial color={trace.color} emissive={trace.color} emissiveIntensity={1.7} />
        </mesh>
      ))}

      {nodes.map((node, index) => (
        <mesh key={index} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[node.scale, 14, 14]} />
          <meshStandardMaterial color="#ccfbf1" emissive="#2dd4bf" emissiveIntensity={2.4} />
        </mesh>
      ))}
    </group>
  )
}

function SceneContent({ mobile }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <pointLight position={[3, 3.4, 3]} intensity={70} color="#22d3ee" />
      <pointLight position={[-4, 2, -2]} intensity={45} color="#34d399" />
      {!mobile && <Stars radius={80} depth={28} count={700} factor={3} fade speed={0.4} />}
      <Float speed={mobile ? 1 : 1.6} rotationIntensity={0.2} floatIntensity={0.35}>
        <CircuitBoardMesh mobile={mobile} />
      </Float>
    </>
  )
}

export default function PCBScene() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="absolute inset-0">
      <Canvas dpr={mobile ? 1 : [1, 1.7]} camera={{ position: [0, 2.8, 7.8], fov: 48 }} gl={{ antialias: !mobile, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}>
          <SceneContent mobile={mobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
