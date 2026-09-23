import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps extends Omit<AntModalProps, 'open' | 'width'> {
  open?: boolean;
  isOpen?: boolean; // alias for open
  onClose?: () => void;
  size?: ModalSize;
  width?: string | number;
  maxHeight?: string | number;
  scrollable?: boolean;
  bodyClassName?: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> & {
  confirm: typeof AntModal.confirm;
  info: typeof AntModal.info;
  success: typeof AntModal.success;
  error: typeof AntModal.error;
  warning: typeof AntModal.warning;
} = ({
  open,
  isOpen,
  onClose,
  onCancel,
  size = 'md',
  width,
  maxHeight = 'calc(80vh - 120px)',
  scrollable = true,
  bodyClassName = '',
  children,
  className = '',
  okButtonProps,
  cancelButtonProps,
  ...props
}) => {
  const visible = open !== undefined ? open : isOpen;

  const sizeWidths: Record<ModalSize, number> = {
    sm: 400,
    md: 520,
    lg: 680,
    xl: 840,
    full: 1100,
  };

  const modalWidth = width !== undefined ? width : sizeWidths[size];

  const handleCancel = (e: React.SyntheticEvent) => {
    onCancel?.(e as any);
    onClose?.();
  };

  return (
    <AntModal
      centered
      open={visible}
      onCancel={handleCancel}
      width={modalWidth}
      className={`custom-antd-modal rounded-2xl ${className}`}
      okButtonProps={{
        className: 'bg-stay-primary hover:bg-stay-primary-hover font-semibold rounded-xl shadow-xs',
        ...okButtonProps,
      }}
      cancelButtonProps={{
        className: 'rounded-xl font-medium hover:bg-slate-50',
        ...cancelButtonProps,
      }}
      {...props}
    >
      <div
        className={`pt-1 text-sm text-stay-text leading-relaxed ${
          scrollable ? 'overflow-y-auto overflow-x-hidden pr-1.5 custom-modal-scroll' : ''
        } ${bodyClassName}`}
        style={scrollable ? { maxHeight: maxHeight || 'calc(80vh - 120px)' } : undefined}
      >
        {children}
      </div>
    </AntModal>
  );
};

// Static Modal Methods
Modal.confirm = AntModal.confirm;
Modal.info = AntModal.info;
Modal.success = AntModal.success;
Modal.error = AntModal.error;
Modal.warning = AntModal.warning;

// Aliases
export const AppModal = Modal;
export type AppModalProps = ModalProps;

export default Modal;
