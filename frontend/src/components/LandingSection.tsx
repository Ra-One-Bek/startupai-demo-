import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

function HeadFollowMouse({
  pivotRef,
  maxYawDeg = 45,
  maxPitchDeg = 35,
  sensitivity = 500,
  lerp = 0.18,
}: {
  pivotRef: React.RefObject<THREE.Object3D | null>;
  maxYawDeg?: number;
  maxPitchDeg?: number;
  sensitivity?: number;
  lerp?: number;
}) {
  const { gl } = useThree();
  const mousePx = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePx.current.x = e.clientX;
      mousePx.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    const bounds = gl.domElement.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    const dx = mousePx.current.x - centerX;
    const dy = mousePx.current.y - centerY;

    const nx = THREE.MathUtils.clamp(dx / sensitivity, -1, 1);
    const ny = THREE.MathUtils.clamp(dy / sensitivity, -2, 2);

    const targetYaw = THREE.MathUtils.degToRad(nx * maxYawDeg);
    const targetPitch = THREE.MathUtils.degToRad(ny * maxPitchDeg);

    pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, targetYaw, lerp);
    pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, targetPitch, lerp);
  });

  return null;
}

function RobotHead() {
  const { scene } = useGLTF("/models/Robot.glb");

  const pivotRef = useRef<THREE.Group>(null);
  const modelHolderRef = useRef<THREE.Group>(null);

  // Центрируем модель относительно pivot, чтобы вращалась "на месте"
  useLayoutEffect(() => {
    if (!modelHolderRef.current) return;

    // bbox всей модели (scene)
    const box = new THREE.Box3().setFromObject(modelHolderRef.current);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // сдвигаем модель так, чтобы центр оказался в (0,0,0) pivot-группы
    modelHolderRef.current.position.sub(center);

    // важно: обновить матрицы
    modelHolderRef.current.updateMatrixWorld(true);
  }, []);

  return (
    <group position={[0, 0, 0]} scale={2.4}>
      {/* pivot — это то, что вращаем */}
      <group ref={pivotRef}>
        {/* modelHolder — это то, что сдвигаем, чтобы ось вращения была по центру */}
        <group ref={modelHolderRef}>
          <primitive object={scene} />
        </group>

        <HeadFollowMouse pivotRef={pivotRef} />
      </group>
    </group>
  );
}

export default function LandingSection() {
  const navigate = useNavigate();

  const infoCard = [
    { id: 1, title: "AI analyze", translateX: "450px", translateY: "-150px" },
    { id: 2, title: "Vacancy", translateX: "500px", translateY: "-80px" },
    { id: 3, title: "Courses", translateX: "530px", translateY: "-10px" },
    { id: 4, title: "AI help", translateX: "80px", translateY: "100px" },
    { id: 5, title: "AI recommendation", translateX: "120px", translateY: "170px" },
  ];

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-t from-white to-[#407BA7] overflow-hidden flex lg:flex-row flex-col items-center justify-center px-6">
      <div className="relative z-10 max-w-xl w-full">
        <h1 className="lg:text-5xl text-7xl font-extrabold leading-tight text-white">
          Work AI
          <span className="block text-white lg:text-8xl text-3xl mt-3 font-black">
            <span className="lg:text-[120px] text-[30px] bg-gradient-to-r from-blue-400 to-slate-300 text-transparent bg-clip-text">HR AI</span> 
            <span className="bg-gradient-to-t from-purple-200 to-slate-300 text-transparent bg-clip-text"> Navigator </span> 
            application
          </span>
          <span className="w-100 block text-slate-800/70 lg:text-xl text-2xl mt-10 font-semibold">
            Build your learning track from real market requirements
          </span>
        </h1>

        <p className="mt-6 lg:text-black/80 text-black/50 bg-sky-200/50 rounded-2xl p-10 lg:text-lg text-md leading-relaxed">
          Fill a simple resume template, and AI will show your skill gaps and generate a weekly
          learning plan.
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 rounded-2xl bg-gradient-to-t from-slate-900 to-slate-700  text-white font-semibold shadow-lg hover:to-purple-200 hover:scale-105 transition duration-300"
          >
            Start
          </button>

          <button
            onClick={() => navigate("/resume")}
            className="px-6 py-3 rounded-2xl bg-gradient-to-t from-white to-white text-black font-semibold shadow-lg hover:from-blue-200 hover:scale-105 transition duration-300"
          >
            Fill Resume
          </button>
        </div>
      </div>

      <div className="relative z-10 w-100 h-100 lg:w-[500px] lg:h-[500px] bg-white/5 rounded-full shadow-2xl border border-black/10 flex items-center justify-center">
        <Canvas camera={{ position: [0, 0.3, 3], fov: 38 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 3, 2]} intensity={1.5} />
          <Suspense fallback={null}>
            <RobotHead />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {infoCard.map((item) => (
        <div
          key={item.id}
          className="absolute z-20 px-5 py-3 bg-gradient-to-t from-slate-300 to-blue-200 backdrop-blur rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-all duration-300 "
          style={{ transform: `translate(${item.translateX}, ${item.translateY})` }}
        >
          <p className="text-white font-semibold">{item.title}</p>
        </div>
      ))}

      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 lg:w-[900px] lg:h-[900px] w-200 h-200 bg-white/30 blur-3xl rounded-full" />
    </section>
  );
}

useGLTF.preload("/models/Robot.glb");