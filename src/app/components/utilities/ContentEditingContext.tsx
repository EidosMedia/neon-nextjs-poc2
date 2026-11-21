'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';

type EditingContext = { objectId: string; viewStatus: ViewStatus; lockedBy?: unknown };
const ContentEditingContext = createContext<EditingContext | undefined>(undefined);

export const useContentEditingContext = () => useContext(ContentEditingContext);

export function ContentEditingProvider({
  objectId, viewStatus, lockedBy, children,
}: EditingContext & { children: ReactNode }) {
  const parent = useContentEditingContext();
  return (
    <ContentEditingContext.Provider value={{
      objectId,
      viewStatus: parent?.viewStatus ?? viewStatus,
      lockedBy: lockedBy === undefined && parent?.objectId === objectId ? parent.lockedBy : lockedBy,
    }}>
      {children}
    </ContentEditingContext.Provider>
  );
}
