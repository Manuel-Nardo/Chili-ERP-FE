<script setup>
const user=JSON.parse(localStorage.getItem('user'))


</script>

<template>
  <div
    class="d-flex align-center cursor-pointer"
    style="user-select: none;"
  >
    <VBtn
      color="primary"
      variant="plain"
      class="flex-grow-1"
    >
      <VIcon icon="tabler-user" /> {{ user.email }}  ID: {{ user.id }}
    </VBtn>

    
  </div>
</template>


