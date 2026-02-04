<template>
  <UApp>
    <div class="min-h-screen flex flex-col items-center justify-start sm:justify-center bg-white dark:bg-gray-900 p-4 sm:p-6 safe-area-x" style="padding-top: max(2rem, calc(env(safe-area-inset-top, 0px) + 1rem)); padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));">
      <div class="w-full max-w-md mt-4 sm:mt-0">
        <slot />
      </div>
    </div>
  </UApp>
</template>
