import type { ReactNode } from 'react';

export interface MetadataCardProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}
