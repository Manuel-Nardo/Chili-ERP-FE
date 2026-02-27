<template>
  <RouterLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        
      </h1>
    </div>
  </RouterLink>

  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      md="8"
     
      class="d-none d-md-flex"
    >
    <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 6.25rem;"
        >
          <VImg
            max-width="613"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>       
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
     
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Ingresa <span class="text-capitalize"> {{ themeConfig.app.title }} </span>!
          </h4>
          <p class="mb-0">
            Inicia sesión para continuar.
          </p>
        </VCardText>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.email"
                  label="Email"
                  placeholder="example@email.com"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="credentials.password"
                  label="Password"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Remember me"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    Forgot Password?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                >
                  Login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/stores/auth';
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant';
import { default as authV2LoginIllustrationBorderedDark, default as authV2LoginIllustrationBorderedLight, default as authV2LoginIllustrationDark, default as authV2LoginIllustrationLight } from '@images/pages/img_login.png';
import authV2MaskDark from '@images/pages/misc-mask-dark.png';
import authV2MaskLight from '@images/pages/misc-mask-light.png';
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VForm } from 'vuetify/components/VForm';




const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight, authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true
)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()
const refVForm = ref<VForm>()
const credentials = ref({ email: '', password: '' })
const rememberMe = ref(false)

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const authStore = useAuthStore()

const onSubmit = async () => {
  const { valid } = await refVForm.value!.validate()
  if (!valid) return

  const ok = await authStore.login(credentials.value.email, credentials.value.password)
  if (ok) {
    router.replace(route.query.to ? String(route.query.to) : '/')
  } else {
    errors.value.email = undefined
    errors.value.password = authStore.error 
  }
}

const requiredValidator = value => !!value || 'Este campo es obligatorio'
const emailValidator = value => {
  if (!value) return true
  const pattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
  return pattern.test(value) || 'Ingrese un email válido'
}
</script>


<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
