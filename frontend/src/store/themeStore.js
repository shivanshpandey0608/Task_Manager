import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggle: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        }),
      init: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
    }),
    { name: 'theme' }
  )
);

export default useThemeStore;
