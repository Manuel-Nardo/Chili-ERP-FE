<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      Made
      <VIcon
        icon="tabler-heart-filled"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Manuel Nardo</a>
    </span>
    
  </div>
</template>
