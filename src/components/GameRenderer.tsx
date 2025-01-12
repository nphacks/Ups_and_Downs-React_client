import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';

interface Step {
  stepMesh: THREE.Mesh;
  edgeMesh: THREE.LineSegments;
}

interface GameRendererProps {
  onError: (error: string) => void;
  onLoadComplete: () => void;
  onContextLost: () => void;
  characterModel: string;
  currentStep: number;
  snakeLadderPositions: Set<number>; 
}

type EdgeMaterial = THREE.LineBasicMaterial & {
  polygonOffset: boolean;
  polygonOffsetFactor: number;
  polygonOffsetUnits: number;
};

const easeInOutQuad = (t: number): number => 
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export function GameRenderer({ 
  onError, 
  onLoadComplete, 
  characterModel,
  currentStep,
  snakeLadderPositions
}: GameRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const personRef = useRef<THREE.Object3D | null>(null);
  const steps = useRef<Step[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isActiveRef = useRef(true);
  const lastRenderTimeRef = useRef(0);
  const animationStateRef = useRef<{
    isAnimating: boolean;
    startTime: number;
    duration: number;
    start: THREE.Vector3 | null;
    target: THREE.Vector3 | null;
    cameraStart: THREE.Vector3 | null;
    cameraTarget: THREE.Vector3 | null;
  }>({
    isAnimating: false,
    startTime: 0,
    duration: 0,
    start: null,
    target: null,
    cameraStart: null,
    cameraTarget: null
  });
  const lightRefs = useRef<{
    ambient: THREE.AmbientLight | null;
    directional: THREE.DirectionalLight | null;
  }>({ ambient: null, directional: null });
  const geometryRef = useRef<THREE.BoxGeometry | null>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const edgeGeometryRef = useRef<THREE.EdgesGeometry | null>(null);
  const edgeMaterialRef = useRef<EdgeMaterial | null>(null);

  // Render function
  const renderScene = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  // Animation loop with frame rate control and animation state management
  const animate = useCallback((currentTime: number) => {
    if (!isActiveRef.current) {
      return;
    }

    // Handle animation state
    const state = animationStateRef.current;
    if (state.isAnimating && state.start && state.target && state.cameraStart && state.cameraTarget) {
      const elapsed = currentTime - state.startTime;
      const progress = Math.min(elapsed / state.duration, 1);
      const easedProgress = easeInOutQuad(progress);

      if (personRef.current && cameraRef.current) {
        personRef.current.position.lerpVectors(state.start, state.target, easedProgress);
        cameraRef.current.position.lerpVectors(state.cameraStart, state.cameraTarget, easedProgress);
      }

      if (progress >= 1) {
        state.isAnimating = false;
      }
    }

    // Frame rate control
    const frameInterval = 1000 / 60; // 60 FPS
    const deltaTime = currentTime - lastRenderTimeRef.current;
    if (deltaTime >= frameInterval) {
      lastRenderTimeRef.current = currentTime - (deltaTime % frameInterval);
      renderScene();
    }

    // Request next frame only if still active
    if (isActiveRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [renderScene]);

  useEffect(() => {
    if (!personRef.current || !cameraRef.current || currentStep <= 0) return;

    // Update animation state for the current step
    animationStateRef.current = {
      isAnimating: true,
      startTime: performance.now(),
      duration: 800,
      start: personRef.current.position.clone(),
      target: new THREE.Vector3(0, currentStep * 0.2, -currentStep * 0.5),
      cameraStart: cameraRef.current.position.clone(),
      cameraTarget: new THREE.Vector3(0, (currentStep * 0.2) + 0.5, (-currentStep * 0.5) + 2)
    };
  }, [currentStep]);

  const initializeRenderer = useCallback(() => {
    if (!containerRef.current) return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: 'high-performance',
        alpha: true
      });
      
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor('white');
      
      containerRef.current.appendChild(renderer.domElement);
      
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      camera.position.set(0, 0.5, 2);

      // Initialize resources and start animation
      setupScene(scene);
      loadCharacterModel();
      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }

      return () => {
        isActiveRef.current = false;
      };
    } catch (error) {
      onError('Failed to initialize WebGL context');
    }
  }, [animate, onError]);

  const setupScene = useCallback((scene: THREE.Scene) => {
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(ambientLight);
    scene.add(directionalLight);
    lightRefs.current = { ambient: ambientLight, directional: directionalLight };

    // Create shared resources
    geometryRef.current = new THREE.BoxGeometry(2, 0.2, 2);
    materialRef.current = new THREE.MeshPhongMaterial({ color: 0x215412 });
    // Add a special material for snake/ladder steps
    const snakeLadderMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFD700,  // Gold color
      opacity: 0.8,
      transparent: true
    });

    edgeGeometryRef.current = new THREE.EdgesGeometry(geometryRef.current);
    edgeMaterialRef.current = new THREE.LineBasicMaterial({
      color: 0xff0000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    }) as EdgeMaterial;

    // Create steps
    for (let i = 0; i < 100; i++) {
      if (!geometryRef.current || !materialRef.current || !edgeGeometryRef.current || !edgeMaterialRef.current) continue;
      
      const step = new THREE.Mesh(
        geometryRef.current, 
        snakeLadderPositions.has(i + 1) ? snakeLadderMaterial : materialRef.current
      );
      const edgeMesh = new THREE.LineSegments(
        edgeGeometryRef.current, 
        snakeLadderPositions.has(i + 1) 
          ? new THREE.LineBasicMaterial({ color: 0xFFD700 }) 
          : edgeMaterialRef.current
      );
      
      edgeMesh.scale.set(1.01, 1.01, 1.06);
      step.position.set(0, i * 0.2, -i * 0.5);
      edgeMesh.position.copy(step.position);
      
      scene.add(step);
      scene.add(edgeMesh);
      steps.current.push({ stepMesh: step, edgeMesh });
    }
  }, [snakeLadderPositions]);

  const loadCharacterModel = useCallback(() => {
    if (!sceneRef.current) return;

    const loader = new GLTFLoader();
    const modelLoadTimeout = setTimeout(() => {
      onError('Model loading timed out. Please refresh the page.');
    }, 10000);

    loader.load(
      characterModel,
      (gltf) => {
        clearTimeout(modelLoadTimeout);
        const personModel = gltf.scene;
        personModel.scale.set(0.1, 0.1, 0.1);
        personModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
          }
        });
        personModel.position.set(0, 0.1, 1.0);
        sceneRef.current?.add(personModel);
        personRef.current = personModel;
        onLoadComplete();
      },
      undefined,
      (error) => {
        clearTimeout(modelLoadTimeout);
        console.warn('Failed to load character model, using fallback cube:', error);
        // Create a fallback cube
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.1, 1.0);
        sceneRef.current?.add(cube);
        personRef.current = cube;
        onLoadComplete();
      }
    );
  }, [characterModel, onError, onLoadComplete]);

  const cleanup = useCallback(() => {
    isActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clean up all resources in the correct order
    steps.current.forEach(({ stepMesh, edgeMesh }) => {
      sceneRef.current?.remove(stepMesh);
      sceneRef.current?.remove(edgeMesh);
      stepMesh.geometry?.dispose();
      (stepMesh.material as THREE.Material)?.dispose();
      edgeMesh.geometry?.dispose();
      (edgeMesh.material as THREE.Material)?.dispose();
    });
    steps.current = [];

    Object.values(lightRefs.current).forEach(light => {
      if (light) {
        light.dispose();
        sceneRef.current?.remove(light);
      }
    });
    lightRefs.current = { ambient: null, directional: null };

    [geometryRef, materialRef, edgeGeometryRef, edgeMaterialRef].forEach(ref => {
      if (ref.current) {
        ref.current.dispose();
        ref.current = null;
      }
    });

    if (personRef.current) {
      personRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.geometry?.dispose();
          if (Array.isArray(node.material)) {
            node.material.forEach(m => m.dispose());
          } else {
            node.material?.dispose();
          }
        }
      });
      sceneRef.current?.remove(personRef.current);
      personRef.current = null;
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
      rendererRef.current = null;
    }

    if (sceneRef.current) {
      sceneRef.current.clear();
      sceneRef.current = null;
    }

    cameraRef.current = null;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    isActiveRef.current = true;
    lastRenderTimeRef.current = performance.now();
    const cleanupFn = initializeRenderer();
    
    return () => {
      if (cleanupFn) cleanupFn();
      cleanup();
      animationStateRef.current = {
        isAnimating: false,
        startTime: 0,
        duration: 0,
        start: null,
        target: null,
        cameraStart: null,
        cameraTarget: null
      };
    };
  }, [initializeRenderer, cleanup]);

  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={containerRef} className="game-renderer" />;
}

export default GameRenderer;