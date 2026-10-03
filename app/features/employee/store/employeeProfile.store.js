import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useEmployeeProfileStore = create(
  persist(
    (set) => ({
      step: 1,
      formData: {},

      setStep: (step) => set({ step }),
      setFormData: (data) => set({ formData: data }),
      clearStore: () => set({ step: 1, formData: {} }),
    }),
    {
      name: "employee-profile-draft",
      // Exclude File objects to prevent JSON stringify errors
      partialize: (state) => {
        const safeData = { ...state.formData };
        for (const key in safeData) {
          if (safeData[key] instanceof File) {
            delete safeData[key];
          }
        }
        return {
          formData: safeData,
        };
      },
    }
  )
);
