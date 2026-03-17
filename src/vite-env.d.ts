/// <reference types="vite/client" />

// 全局类型声明
declare global {
  interface Window {
    deductUserCompute?: (cost: number, feature: string) => boolean;
  }
}

export {};
