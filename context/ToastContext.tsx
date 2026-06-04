import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import RootSiblings from 'react-native-root-siblings';
import Toast, { ToastType, ToastPosition } from '@/components/Toast';

interface ToastOptions {
  message: string;
  type?: ToastType;
  position?: ToastPosition;
  duration?: number | null; // null means it's static (won't auto-hide)
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [position, setPosition] = useState<ToastPosition>('bottom');
  const [duration, setDuration] = useState<number | null>(2000);

  const siblingRef = useRef<RootSiblings | null>(null);

  const hideToast = useCallback(() => {
    setIsVisible(false);
  }, []);

  const showToast = useCallback(({ message, type = 'info', position = 'bottom', duration = 2000 }: ToastOptions) => {
    setMessage(message);
    setType(type);
    setPosition(position);
    setDuration(duration);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const element = (
        <Toast
          message={message}
          isVisible={isVisible}
          type={type}
          position={position}
          duration={duration}
          onHide={hideToast}
        />
      );

      if (siblingRef.current) {
        siblingRef.current.update(element);
      } else {
        siblingRef.current = new RootSiblings(element);
      }
    } else {
      if (siblingRef.current) {
        siblingRef.current.destroy();
        siblingRef.current = null;
      }
    }
  }, [isVisible, message, type, position, duration, hideToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (siblingRef.current) {
        siblingRef.current.destroy();
      }
    };
  }, []);

  return <ToastContext.Provider value={{ showToast, hideToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
