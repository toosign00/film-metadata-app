'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { AlertDialogProps } from '@/types/alert-dialog.type';

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
  const handleConfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in' />
        <AlertDialog.Content className='data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:p-6'>
          <div className='space-y-2'>
            <AlertDialog.Title className='font-semibold text-lg text-white'>
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className='text-gray-300 text-sm leading-relaxed'>
              {description}
            </AlertDialog.Description>
          </div>
          <div className='flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end'>
            <AlertDialog.Cancel asChild>
              <button
                type='button'
                onClick={handleCancel}
                className='hover:!border-gray-600 rounded-md border border-gray-600 bg-gray-700 px-4 py-3 font-medium text-gray-300 text-sm transition-all hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 sm:order-1 sm:py-2'
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type='button'
                onClick={handleConfirm}
                className='hover:!border-red-600 rounded-md border border-red-500 bg-red-500 px-4 py-3 font-medium text-sm text-white transition-all hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 sm:order-2 sm:py-2'
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
