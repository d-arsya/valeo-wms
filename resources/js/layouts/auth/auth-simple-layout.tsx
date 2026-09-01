import { Link } from '@inertiajs/react';
import { FlashToaster } from '@/components/flash-toaster';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
            style={{ background: '#f5f5f5' }}>
            <FlashToaster />
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Valeo Brand Header */}
                    <div className="flex flex-col items-center gap-3">
                        <Link href={home()} className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3">
                                {/* Valeo Logo Mark */}
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    background: '#CCFF00',
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#3D3D3D" strokeWidth={2} style={{ width: 22, height: 22 }}>
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                </div>
                                <div style={{ lineHeight: 1.2 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>
                                        Valeo
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#3D3D3D' }}>
                                        Warehouse Management
                                    </div>
                                </div>
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-1 text-center">
                            <h1 className="text-xl font-semibold" style={{ color: '#3D3D3D' }}>{title}</h1>
                            <p className="text-sm text-center" style={{ color: '#999999' }}>
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div style={{
                        background: '#ffffff',
                        borderRadius: 12,
                        padding: '1.75rem',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        border: '1px solid #e8e8e8',
                    }}>
                        {children}
                    </div>

                    {/* Footer tagline */}
                    <p className="text-center text-xs" style={{ color: '#bbbbbb' }}>
                        Smart Technology For Smarter Mobility
                    </p>
                </div>
            </div>
        </div>
    );
}
