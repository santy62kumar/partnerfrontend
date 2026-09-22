import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';

const SIZES = {
  sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl',
};

const Modal = ({
  isOpen, onClose, title, children, size = 'md',
  showCloseButton = true, closeOnOverlayClick = true,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent
      className={`max-h-[90dvh] overflow-y-auto ${SIZES[size] || SIZES.md}`}
      showCloseButton={showCloseButton}
      aria-describedby={undefined}
      onPointerDownOutside={(event) => { if (!closeOnOverlayClick) event.preventDefault(); }}
    >
      <DialogTitle className={title ? 'pr-8' : 'sr-only'}>{title || 'Dialog'}</DialogTitle>
      {children}
    </DialogContent>
  </Dialog>
);

export default Modal;
