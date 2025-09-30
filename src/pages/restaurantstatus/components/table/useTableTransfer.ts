import { useState } from 'react';
import { TableData } from '../../../../types';
import { useConfirm } from '../../../../context/provider/ConfirmProvider';
import { useRestaurant } from '../../../../context/context';
import { useNotification } from '../../../../context/provider/NotificationProvider';

interface UseTableTransferResult {
  transferMode: boolean;
  sourceTableId: string | null;
  showTransferBalloon: boolean;
  startTransfer: (table: TableData, closeModal: () => void) => void;
  handleTableClick: (table: TableData, openModal: (id: string) => void) => Promise<void>;
  cancelTransfer: () => void;
}

export function useTableTransfer(externalTables: TableData[]): UseTableTransferResult {
  const { transferOrder } = useRestaurant();
  const { showNotification } = useNotification();
  const confirm = useConfirm();

  const [transferMode, setTransferMode] = useState(false);
  const [sourceTableId, setSourceTableId] = useState<string | null>(null);
  const [showTransferBalloon, setShowTransferBalloon] = useState(false);

  const startTransfer = (table: TableData, closeModal: () => void) => {
    setTransferMode(true);
    setSourceTableId(table.id);
    setShowTransferBalloon(true);
    closeModal();
  };

  const cancelTransfer = () => {
    setTransferMode(false);
    setSourceTableId(null);
    setShowTransferBalloon(false);
  };

  const handleTableClick = async (table: TableData, openModal: (id: string) => void) => {
    if (transferMode) {
      if (!table.occupied && table.cleanStatus === true) {
        setShowTransferBalloon(false);

        const sourceTable = externalTables.find(t => t.id === sourceTableId);
        const sourceName = sourceTable?.name || `Masa ${sourceTable?.number}`;
        const targetName = table.name || `Masa ${table.number}`;

        const result = await confirm({
          title: 'Masa Aktarımı',
          message: `${sourceName} masasındaki siparişi ${targetName} masasına aktarmak istediğinize emin misiniz?\n\nBu işlem sonrasında:\n• Tüm siparişler ${targetName} masasına taşınacak\n• ${sourceName} masası boş ve temizlenecek olarak işaretlenecek`,
          confirmText: 'Evet, Aktar',
          cancelText: 'İptal'
        });

        if (result) {
          try {
            if (sourceTableId) {
              await transferOrder(sourceTableId, table.id);
              showNotification('success', `${sourceName} masasındaki siparişler ${targetName} masasına başarıyla aktarıldı.`);
            }
            cancelTransfer();
            openModal(table.id);
          } catch (err) {
            showNotification('error', err instanceof Error ? err.message : 'Masa aktarımı sırasında bir hata oluştu.');
            setShowTransferBalloon(true);
          }
        } else {
          setShowTransferBalloon(true);
        }
      }
    } else {
      openModal(table.id);
    }
  };

  return { transferMode, sourceTableId, showTransferBalloon, startTransfer, handleTableClick, cancelTransfer };
}
