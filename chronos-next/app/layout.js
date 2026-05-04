import "./globals.css";

export const metadata = {
  title: "Chronos Premium",
  description: "Landing ecommerce de relojes premium construida con React y Next.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}