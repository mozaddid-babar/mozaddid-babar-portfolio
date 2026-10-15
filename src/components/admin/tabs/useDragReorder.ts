import React, { useEffect, useState } from 'react';
import { reorderItemsAPI } from '../../../api';

type ReorderCollection = Parameters<typeof reorderItemsAPI>[0];

// Drag-and-drop ordering for admin lists (same behaviour as the Certifications tab).
// Drag starts only from the grip handle, so text inside cards can still be selected.
export function useDragReorder<T extends { id: string }>(
  items: T[],
  collection: ReorderCollection,
  onRefresh: () => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
) {
  const [localItems, setLocalItems] = useState<T[]>(items || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [armedIndex, setArmedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalItems(items || []);
  }, [items]);

  const handleDragStart = (e: React.DragEvent<HTMLElement>, index: number) => {
    setDraggedIndex(index);
    // For firefox drag-and-drop to work, we need to set data
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...localItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setLocalItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    setArmedIndex(null);
    const newIds = localItems.map(item => item.id);
    const oldIds = (items || []).map(item => item.id);
    if (newIds.join('|') === oldIds.join('|')) return;
    try {
      await reorderItemsAPI(collection, newIds);
      showToast('Order saved');
      onRefresh();
    } catch (err) {
      showToast('Failed to save order', 'error');
      setLocalItems(items || []); // revert
    }
  };

  // Spread onto each list card
  const getItemProps = (index: number) => ({
    draggable: armedIndex === index,
    onDragStart: (e: React.DragEvent<HTMLElement>) => handleDragStart(e, index),
    onDragEnter: (e: React.DragEvent<HTMLElement>) => handleDragEnter(e, index),
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd
  });

  // Spread onto the grip handle inside each card
  const getHandleProps = (index: number) => ({
    onMouseDown: () => setArmedIndex(index),
    onMouseUp: () => setArmedIndex(null),
    title: 'Drag to reorder'
  });

  return { localItems, draggedIndex, getItemProps, getHandleProps };
}
