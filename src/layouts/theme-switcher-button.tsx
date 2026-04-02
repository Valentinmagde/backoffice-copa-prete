'use client';

import { useEffect } from 'react';
import { useDirection } from '@core/hooks/use-direction';
import { ActionIcon } from 'rizzui';
import cn from '@core/utils/class-names';
import { presetDark, presetLight, usePresets } from '@/config/color-presets';
import {
  useApplyColorPreset,
  useColorPresetName,
  useColorPresets,
} from '@/layouts/settings/use-theme-color';
import { useTheme } from 'next-themes';
import { updateThemeColor } from '@core/utils/update-theme-color';
import { MoonIcon } from '@core/components/icons/moon';
import { SunIcon } from '@core/components/icons/sun';

export default function ThemeSwitcherButton({
  className,
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const { colorPresetName } = useColorPresetName();
  const COLOR_PRESETS = usePresets();
  const { direction } = useDirection();
  const { colorPresets } = useColorPresets();

  useApplyColorPreset<any>(colorPresets ?? COLOR_PRESETS[0].colors);

  // to set html dir attribute on direction change
  useEffect(() => {
    document.documentElement.dir = direction ?? 'ltr';
  }, [direction]);

  useEffect(() => {
      if (theme === 'light' && colorPresetName === 'black') {
        updateThemeColor(
          presetLight.lighter,
          presetLight.light,
          presetLight.default,
          presetLight.dark,
          presetLight.foreground
        );
      }
      if (theme === 'dark' && colorPresetName === 'black') {
        updateThemeColor(
          presetDark.lighter,
          presetDark.light,
          presetDark.default,
          presetDark.dark,
          presetDark.foreground
        );
      }
    }, [theme, colorPresetName]);

  return (
    <ActionIcon
      aria-label="Settings"
      variant="text"
      className={cn(
        'relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9',
        className
      )}
    >
      {theme === 'light' ? (
        <MoonIcon
          strokeWidth={1.8}
          className="h-[22px] w-auto"
          onClick={() => setTheme('dark')}
        />
      ) : (
        <SunIcon
          strokeWidth={1.8}
          className="h-[22px] w-auto"
          onClick={() => setTheme('light')}
        />
      )}
    </ActionIcon>
  );
}
