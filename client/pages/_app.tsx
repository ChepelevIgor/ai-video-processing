// pages/_app.tsx
import '../styles/globals.css'  // <-- глобальные стили подключаем только здесь
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
