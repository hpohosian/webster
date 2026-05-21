import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import storage from './storage';
import type { LayoutVariant } from './Layout';
import type { FontWeight } from './Text';

interface LogoState {
  color: string;
  fontFamily: string;
  fontWeight: FontWeight;
  fontSize: number;
  letterSpacing: number;
  backgroundColor: string;
  iconId: string;
  iconColor: string;
  iconSize: number;
  iconSvg: string | null;
  iconLabel: string | null;
  layout: LayoutVariant;
  text: string;
  padding: number;
  gap: number;
}

type LogoContextType = [LogoState, (patch: Partial<LogoState>) => void];

const LogoContext = createContext<LogoContextType | null>(null);

const initLogo: LogoState = {
  color: '#ffffff',
  fontFamily: 'Courier_Prime',
  fontWeight: 'bold',
  fontSize: 60,
  letterSpacing: 1,
  backgroundColor: '#00f2ff',
  iconId: 'Fingerprint',
  iconColor: '#ffffff',
  iconSize: 96,
   iconSvg: null,
  iconLabel: null,
  layout: 'Icon-Left',
  text: 'Logotype',
  padding: 70,
  gap: 25,
};

export const LogoProvider = ({ children }: { children: React.ReactNode }) => {
  const [logo, setLogo] = useState<LogoState>(initLogo);

  const updateLogo = (patch: Partial<LogoState>) => {
    const data = { ...logo, ...patch };
    setLogo(data);
    storage.set(data);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<LogoContextType>(() => [logo, updateLogo], [logo]);

  useEffect(() => {
    const saved = storage.get();
    if (saved) setLogo(saved);
  }, []);

  return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
};

export const useLogo = (): LogoContextType => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

export default LogoProvider;