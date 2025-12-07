import { UserProvider } from '@/contexts/UserContext'
import { CartProvider } from '@/contexts/CartContext'
import { ShippingProvider } from '@/contexts/ShippingContext'
import AppShell from '@/components/AppShell'
import '@/styles/globals.css'
import '@/styles/app.css'

export const metadata = {
  title: 'Robots Anywhere - Robotics Components & Solutions',
  description: 'Shop premium robotics components, sensors, actuators, and development boards.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <CartProvider>
            <ShippingProvider>
              <AppShell>
                {children}
              </AppShell>
            </ShippingProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}
