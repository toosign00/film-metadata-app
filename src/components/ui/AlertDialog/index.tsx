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
        <AlertDialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50' />
        <AlertDialog.Content className='fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700 bg-gray-800 p-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg sm:p-6'>
          <div className='space-y-2'>
            <AlertDialog.Title className='text-lg font-semibold text-white'>
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className='text-sm text-gray-300 leading-relaxed'>
              {description}
            </AlertDialog.Description>
          </div>
          <div className='flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end'>
            <AlertDialog.Cancel asChild>
              <button
                type='button'
                onClick={handleCancel}
                className='px-4 py-3 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 hover:!border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 transition-all sm:py-2 sm:order-1'
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type='button'
                onClick={handleConfirm}
                className='px-4 py-3 text-sm font-medium text-white bg-red-500 border border-red-500 rounded-md hover:bg-red-600 hover:!border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 transition-all sm:py-2 sm:order-2'
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
