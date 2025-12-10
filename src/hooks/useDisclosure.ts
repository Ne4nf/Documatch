import { useCallback, useState } from 'react';

export function useDisclosure(
  initialState = false,
  callbacks?: { onClose?: () => void; onOpen?: () => void },
) {
  const { onClose, onOpen } = callbacks || {};
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(isOpened => {
      if (!isOpened) {
        onOpen?.();
        return true;
      }
      return isOpened;
    });
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(isOpened => {
      if (isOpened) {
        onClose?.();
        return false;
      }
      return isOpened;
    });
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [close, open, isOpen]);

  return { close, isOpen, open, toggle } as const;
}
