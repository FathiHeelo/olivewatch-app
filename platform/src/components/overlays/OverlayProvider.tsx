// Overlays from the Stitch "Farmer Web Dashboard": the AI agronomist drawer, farm details, leaf scanner and
// "Certify Press Lot" dialogs, plus the bottom toast. Any component can open them with useOverlays().
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mdiCheckCircle } from '@mdi/js';
import Mdi from '../Mdi';
import AgronomistDrawer from './AgronomistDrawer';
import CertifyModal from './CertifyModal';
import FarmModal from './FarmModal';
import ScannerModal from './ScannerModal';

export type OverlayName = 'agronomist' | 'farm' | 'scanner' | 'certify';

type Ctx = {
  open: (n: OverlayName) => void;
  close: () => void;
  toast: (message: string) => void;
};

const OverlayContext = createContext<Ctx | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<OverlayName | null>(null);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((m: string) => {
    setMessage(m);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 3500);
  }, []);
  const close = useCallback(() => setActive(null), []);

  // Escape closes whatever is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close]);

  const value = useMemo<Ctx>(() => ({ open: setActive, close, toast }), [close, toast]);

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {active === 'agronomist' && <AgronomistDrawer />}
      {active === 'farm' && <FarmModal />}
      {active === 'scanner' && <ScannerModal />}
      {active === 'certify' && <CertifyModal />}
      <div className={`fw-toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
        <Mdi path={mdiCheckCircle} size={20} />
        <span>{message}</span>
      </div>
    </OverlayContext.Provider>
  );
}

export function useOverlays(): Ctx {
  const v = useContext(OverlayContext);
  if (!v) throw new Error('useOverlays must be used inside <OverlayProvider>');
  return v;
}
