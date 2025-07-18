import { useState, useEffect, useRef } from 'react';

interface AnimationConfig {
  movement: 'fade' | 'dvd' | 'static';
  fadeSpeed: number;
}

interface Position {
  x: number;
  y: number;
}

interface AnimationState {
  position: Position;
  opacity: number;
  isVisible: boolean;
}

// Hook específico para DVD movement
const useDVDAnimation = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const velocityRef = useRef<Position>({ x: 2, y: 1.5 });
  const animationRef = useRef<number>();
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 1000, height: 1000 });
  const elementSizeRef = useRef<{ width: number; height: number }>({ width: 200, height: 200 });

  const animateDVD = () => {
    setPosition(prevPos => {
      const newX = prevPos.x + velocityRef.current.x;
      const newY = prevPos.y + velocityRef.current.y;
      
      let newVelocityX = velocityRef.current.x;
      let newVelocityY = velocityRef.current.y;
      
      // Colisão com bordas considerando o tamanho do elemento
      const maxX = containerSizeRef.current.width - elementSizeRef.current.width;
      const maxY = containerSizeRef.current.height - elementSizeRef.current.height;
      
      // Verificar colisão e ajustar posição para bater exatamente na borda
      let finalX = newX;
      let finalY = newY;
      
      if (newX <= 0) {
        finalX = 0;
        newVelocityX = -velocityRef.current.x;
      } else if (newX >= maxX) {
        finalX = maxX;
        newVelocityX = -velocityRef.current.x;
      }
      
      if (newY <= 0) {
        finalY = 0;
        newVelocityY = -velocityRef.current.y;
      } else if (newY >= maxY) {
        finalY = maxY;
        newVelocityY = -velocityRef.current.y;
      }
      
      velocityRef.current = { x: newVelocityX, y: newVelocityY };
      
      const finalPos = { x: finalX, y: finalY };
      
      return finalPos;
    });
  };

  const startDVDAnimation = () => {
    const animate = () => {
      animateDVD();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopDVDAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetDVDAnimation = () => {
    setPosition({ x: 0, y: 0 });
    velocityRef.current = { x: 2, y: 1.5 };
  };

  const setContainerSize = (width: number, height: number) => {
    containerSizeRef.current = { width, height };
  };

  const setElementSize = (width: number, height: number) => {
    elementSizeRef.current = { width, height };
  };

  return {
    position,
    startDVDAnimation,
    stopDVDAnimation,
    resetDVDAnimation,
    setContainerSize,
    setElementSize
  };
};

// Hook específico para Fade movement
const useFadeAnimation = (fadeSpeed: number) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0); // Começar invisível
  const [isVisible, setIsVisible] = useState(false); // Começar invisível
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerSizeRef = useRef<{ width: number; height: number }>({ width: 1000, height: 1000 });
  const elementSizeRef = useRef<{ width: number; height: number }>({ width: 200, height: 200 });

  const calculateRandomPosition = () => {
    const maxX = containerSizeRef.current.width - elementSizeRef.current.width;
    const maxY = containerSizeRef.current.height - elementSizeRef.current.height;
    
    return {
      x: Math.random() * maxX,
      y: Math.random() * maxY
    };
  };

  const animateFade = () => {
    // Fade out
    setOpacity(0);
    setIsVisible(false);
    
    // Após 1 segundo, mover para nova posição e fade in
    timeoutRef.current = setTimeout(() => {
      // Mover para nova posição aleatória
      const newPosition = calculateRandomPosition();
      setPosition(newPosition);
      setOpacity(0);
      setIsVisible(true);
      
      // Fade in imediatamente
      setOpacity(1);
      
      // Agendar próximo fade após o tempo especificado
      timeoutRef.current = setTimeout(() => {
        animateFade();
      }, (fadeSpeed || 15) * 1000);
    }, 1000); // Sempre 1 segundo para o fade out/in
  };

  const startFadeAnimation = () => {
    // Começar em uma posição aleatória mas invisível
    const initialPosition = calculateRandomPosition();
    setPosition(initialPosition);
    setOpacity(0);
    setIsVisible(false);
    
    // Fade in após 1 segundo
    timeoutRef.current = setTimeout(() => {
      setOpacity(1);
      setIsVisible(true);
      
      // Iniciar o ciclo de fade após o tempo especificado
      timeoutRef.current = setTimeout(() => {
        animateFade();
      }, (fadeSpeed || 15) * 1000);
    }, 1000);
  };

  const stopFadeAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const resetFadeAnimation = () => {
    const initialPosition = calculateRandomPosition();
    setPosition(initialPosition);
    setOpacity(0);
    setIsVisible(false);
  };

  const setContainerSize = (width: number, height: number) => {
    containerSizeRef.current = { width, height };
  };

  const setElementSize = (width: number, height: number) => {
    elementSizeRef.current = { width, height };
  };

  return {
    position,
    opacity,
    isVisible,
    startFadeAnimation,
    stopFadeAnimation,
    resetFadeAnimation,
    setContainerSize,
    setElementSize
  };
};

// Hook principal que escolhe qual animação usar
export const useScreenSaverAnimation = (config: AnimationConfig) => {
  const dvdAnimation = useDVDAnimation();
  const fadeAnimation = useFadeAnimation(config.fadeSpeed);

  // Configurar dimensões do container
  const setContainerSize = (width: number, height: number) => {
    if (config.movement === 'dvd') {
      dvdAnimation.setContainerSize(width, height);
    } else if (config.movement === 'fade') {
      fadeAnimation.setContainerSize(width, height);
    }
    // Para static, não precisamos configurar dimensões
  };

  // Configurar tamanho do elemento
  const setElementSize = (width: number, height: number) => {
    if (config.movement === 'dvd') {
      dvdAnimation.setElementSize(width, height);
    } else if (config.movement === 'fade') {
      fadeAnimation.setElementSize(width, height);
    }
    // Para static, não precisamos configurar tamanho
  };

  // Iniciar animação baseada no tipo
  useEffect(() => {
    if (config.movement === 'dvd') {
      dvdAnimation.startDVDAnimation();
      return () => dvdAnimation.stopDVDAnimation();
    } else if (config.movement === 'fade') {
      fadeAnimation.startFadeAnimation();
      return () => fadeAnimation.stopFadeAnimation();
    }
    // Para static, não há animação para iniciar/parar
  }, [config.movement, config.fadeSpeed]);

  // Resetar animação quando config mudar
  useEffect(() => {
    if (config.movement === 'dvd') {
      dvdAnimation.resetDVDAnimation();
    } else if (config.movement === 'fade') {
      fadeAnimation.resetFadeAnimation();
    }
    // Para static, não há animação para resetar
  }, [config.movement]);

  // Retornar estado e estilo baseado no tipo de movimento
  if (config.movement === 'dvd') {
    return {
      animationState: {
        position: dvdAnimation.position,
        opacity: 1,
        isVisible: true
      },
      setContainerSize,
      setElementSize,
      style: {
        transform: `translate(${dvdAnimation.position.x}px, ${dvdAnimation.position.y}px)`,
        opacity: 1,
        transition: 'none' // Sem transição para movimento suave
      }
    };
  } else if (config.movement === 'fade') {
    return {
      animationState: {
        position: fadeAnimation.position,
        opacity: fadeAnimation.opacity,
        isVisible: fadeAnimation.isVisible
      },
      setContainerSize,
      setElementSize,
      style: {
        transform: `translate(${fadeAnimation.position.x}px, ${fadeAnimation.position.y}px)`,
        opacity: fadeAnimation.opacity,
        transition: `opacity 0.5s ease-in-out, transform 0.1s ease-out`
      }
    };
  } else {
    // Modo estático - centralizado na tela
    return {
      animationState: {
        position: { x: 0, y: 0 },
        opacity: 1,
        isVisible: true
      },
      setContainerSize,
      setElementSize,
      style: {
        transform: 'translate(-50%, -50%)',
        opacity: 1,
        transition: 'none'
      }
    };
  }
}; 