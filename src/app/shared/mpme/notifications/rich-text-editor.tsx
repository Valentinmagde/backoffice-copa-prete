'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PiCode, PiTextT } from 'react-icons/pi';

const QuillEditor = dynamic(() => import('@core/ui/quill-editor'), {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-md bg-gray-100" />,
});

interface RichTextEditorProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ label, value, onChange, placeholder }: RichTextEditorProps) {
    const [isHtmlMode, setIsHtmlMode] = useState(false);

    return (
        <div>
            {/* Header : label + bouton toggle */}
            <div className="mb-1.5 flex items-center justify-between">
                {label && (
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                )}
                <button
                    type="button"
                    onClick={() => setIsHtmlMode(v => !v)}
                    title={isHtmlMode ? 'Basculer vers l\'éditeur visuel' : 'Basculer vers le HTML brut'}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                        isHtmlMode
                            ? 'border-primary bg-primary text-white hover:bg-primary/90'
                            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {isHtmlMode ? (
                        <><PiTextT className="size-3.5" /> Éditeur visuel</>
                    ) : (
                        <><PiCode className="size-3.5" /> HTML brut</>
                    )}
                </button>
            </div>

            {/* Éditeur */}
            {isHtmlMode ? (
                <div>
                    <textarea
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder="Collez votre HTML ici…"
                        spellCheck={false}
                        className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 font-mono text-xs text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        style={{ minHeight: 280, resize: 'vertical' }}
                    />
                    <p className="mt-1 text-xs text-gray-400">
                        HTML brut — les tableaux et styles inline sont préservés tels quels.
                    </p>
                </div>
            ) : (
                <QuillEditor
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}
