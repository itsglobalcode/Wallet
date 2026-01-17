import { Redirect } from "expo-router"

export default function Index() {
  // Redirige automáticamente a la pantalla de login
  // TODO: Aquí puedes verificar si hay un token de sesión guardado
  // y redirigir a (tabs) si el usuario ya está autenticado
  return <Redirect href="/(pages)/(wallet)/wallets" />
}
