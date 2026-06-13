import { router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type * as React from 'react';

import { Button } from '@/components/ui/button';

interface BackButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick' | 'asChild'> {
    fallback: string;
    label?: string;
    showIcon?: boolean;
}

export function BackButton({
  fallback,
  label = 'Kembali',
  showIcon = true,
  ...buttonProps
}: BackButtonProps) {
  function handleClick() {
    router.visit(fallback, { preserveScroll: true, replace: false });
  }

  return (
    <Button onClick={handleClick} variant="ghost" {...buttonProps}>
      {showIcon && <ChevronLeft className="size-4" />}
      {label}
    </Button>
  );
}
