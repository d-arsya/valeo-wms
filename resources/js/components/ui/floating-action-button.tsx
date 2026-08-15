import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

type FloatingActionButtonProps = {
    href: string;
    label: string;
    className?: string;
    variant?: ButtonProps['variant'];
};

export function FloatingActionButton({
    href,
    label,
    className = '',
    variant = 'default',
}: FloatingActionButtonProps) {
    const isMobile = useIsMobile();

    if (!isMobile) {
        return null;
    }

    const content = (
        <Button
            asChild
            variant={variant}
            size="icon"
            className={
                'fixed right-5 z-40 h-14 w-14 rounded-full shadow-2xl ring-1 ring-black/5 hover:shadow-3xl active:scale-95 transition-all duration-150 ' +
                'bottom-[max(1.25rem,env(safe-area-inset-bottom))] ' +
                className
            }
            aria-label={label}
        >
            <Link href={href} preserveState>
                <Plus className="h-6 w-6" strokeWidth={2.5} />
            </Link>
        </Button>
    );

    return (
        <Tooltip delayDuration={600}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent
                side="left"
                sideOffset={12}
                className="hidden sm:flex"
            >
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
