// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { CartProvider } from "@/context/CartContext";
// import "./globals.css";

// export const metadata = {
//   title: "KIA Fashion",
//   description: "Modern heirloom jewellery",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="antialiased">
//         <CartProvider>
//           {/* Shared navigation and page content live inside the cart provider. */}
//           <Navbar />
//           <main className="pt-16 md:pt-20">
//             {children}
//           </main>
//           <Footer />
//         </CartProvider>
//       </body>
//     </html>
//   );
// }

import Navbar from "@/components/Navbar";           // ✅ direct wapas
import { ConditionalFooter } from "@/components/ConditionalLayout";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

export const metadata = {
  title: "KIA Fashion | Modern Heirlooms",
  description: "Fine jewellery shaped by Indian artistry.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          <Navbar />
          <main className="pt-[104px]">
            {children}
          </main>
          <ConditionalFooter />               {/* ✅ sirf footer conditional */}
        </CartProvider>
      </body>
    </html>
  );
}
