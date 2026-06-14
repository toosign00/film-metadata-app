'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { AlertDialogProps } from '@/types/alertDialog.types';

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  trigger,
}: AlertDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-overlay data-[state=closed]:animate-out data-[state=open]:animate-in' />
        <AlertDialog.Content className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border border-border bg-surface p-5 data-[state=closed]:animate-out data-[state=open]:animate-in sm:p-6'>
          <div className='space-y-2'>
            <AlertDialog.Title className='font-semibold text-foreground text-lg'>
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className='text-foreground-muted text-sm leading-6'>
              {description}
            </AlertDialog.Description>
          </div>
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <AlertDialog.Cancel asChild>
              <button
                type='button'
                onClick={handleCancel}
                className='min-h-11 cursor-pointer rounded-[10px] border border-border bg-surface px-5 text-sm font-semibold text-foreground-secondary transition-colors duration-150 hover:bg-surface-alt hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type='button'
                onClick={handleConfirm}
                className='min-h-11 cursor-pointer rounded-[10px] bg-destructive px-5 text-sm font-semibold text-destructive-foreground transition-colors duration-150 hover:bg-destructive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
              >
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
