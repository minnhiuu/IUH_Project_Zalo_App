import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SavedReelsState {
  savedReelIds: Record<string, boolean>
  toggleSaved: (reelId: string) => void
  setSaved: (reelId: string, value: boolean) => void
  clearAll: () => void
}

export const useSavedReelsStore = create<SavedReelsState>()(
  persist(
    (set) => ({
      savedReelIds: {},

      toggleSaved: (reelId) =>
        set((state) => ({
          savedReelIds: {
            ...state.savedReelIds,
            [reelId]: !state.savedReelIds[reelId]
          }
        })),

      setSaved: (reelId, value) =>
        set((state) => ({
          savedReelIds: {
            ...state.savedReelIds,
            [reelId]: value
          }
        })),

      clearAll: () => set({ savedReelIds: {} })
    }),
    {
      name: 'saved_reels',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ savedReelIds: state.savedReelIds })
    }
  )
)

export default useSavedReelsStore
