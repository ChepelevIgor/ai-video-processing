import React, { useState } from 'react';
import Button from '../UI/Button';

export enum VideoEffect {
    DENOISE = 'denoise',
    ENHANCE = 'enhance',
    HOLLYWOOD = 'hollywood',
}

interface FilterPanelProps {
    onApplyEffect: (effect: VideoEffect) => Promise<void>; // теперь ожидаем async
    onReset: () => void;
    disabled?: boolean;
    videoLoaded?: boolean;
}

export default function FilterPanel({ onApplyEffect, onReset, disabled, videoLoaded }: FilterPanelProps) {
    const [activeEffect, setActiveEffect] = useState<VideoEffect | null>(null);
    const [appliedEffects, setAppliedEffects] = useState<VideoEffect[]>([]);
    const [loadingEffect, setLoadingEffect] = useState<VideoEffect | null>(null);

    const handleToggle = async (effect: VideoEffect) => {
        if (activeEffect === effect) {
            setActiveEffect(null);
            setAppliedEffects((prev) => prev.filter((e) => e !== effect)); // удаляем галку
            onReset();
            return;
        }

        setActiveEffect(effect);
        setLoadingEffect(effect); // показываем, что эффект применяется

        try {
            await onApplyEffect(effect); // ждём пока эффект применится
            setAppliedEffects((prev) => [...prev, effect]);
        } catch (err) {
            console.error("Ошибка применения эффекта:", err);
        } finally {
            setLoadingEffect(null);
        }
    };

    const buttonVariant = (effect: VideoEffect) =>
        activeEffect === effect ? "primary" : "secondary";

    const renderLabel = (effect: VideoEffect, label: string) => (
        <>
            {label}{" "}
            {loadingEffect === effect
                ? "⏳"
                : videoLoaded && appliedEffects.includes(effect)
                    ? "✔️"
                    : ""}
        </>
    );

    return (
        <aside className="w-64 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
            <h2 className="text-lg font-bold mb-1 text-neutral-800">
                ✨ Эффекты Голливуда
            </h2>

            <p className="text-sm text-neutral-500 mb-2">Улучшение видео и звука</p>

            <Button
                onClick={() => handleToggle(VideoEffect.DENOISE)}
                variant={buttonVariant(VideoEffect.DENOISE)}
                disabled={disabled}
            >
                {renderLabel(VideoEffect.DENOISE, "Очистить звук")}
            </Button>

            <Button
                onClick={() => handleToggle(VideoEffect.ENHANCE)}
                variant={buttonVariant(VideoEffect.ENHANCE)}
                disabled={disabled}
            >
                {renderLabel(VideoEffect.ENHANCE, "Улучшить качество")}
            </Button>

            <Button
                onClick={() => handleToggle(VideoEffect.HOLLYWOOD)}
                variant={buttonVariant(VideoEffect.HOLLYWOOD)}
                disabled={disabled}
            >
                {renderLabel(VideoEffect.HOLLYWOOD, "Голливудский акцент")}
            </Button>
        </aside>
    );
}
