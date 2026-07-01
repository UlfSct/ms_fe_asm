import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { mdi } from 'vuetify/iconsets/mdi'
import { ru } from 'vuetify/locale'

const myCustomTheme = {
  dark: false,
  colors: {
    primary: '#1867C0',
    secondary: '#5CBBF6',
  }
}

export default createVuetify({
  locale: {
    locale: 'ru',        // Устанавливаем русский язык по умолчанию
    fallback: 'en',     // Язык, который будет использоваться, если какого-то перевода нет в русском
    messages: { ru },    // Подключаем загруженные сообщения
  },
  components,
  directives,
  theme: {
    defaultTheme: 'myCustomTheme',
    themes: {
      myCustomTheme,
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases: {
    },
    sets: {
      mdi,
    }
  }
})
