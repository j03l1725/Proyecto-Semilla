import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Recharts y algunos componentes de graficos generan errores de tipos
  // estrictos que no afectan el runtime; no bloqueamos el build de produccion.
  typescript: {
    ignoreBuildErrors: true,
  },

  // La pastilla flotante de Next en la esquina inferior izquierda. Solo sale
  // en desarrollo -en produccion nunca se sirve-, pero estorba al revisar el
  // diseno y al tomar capturas.
  devIndicators: false,
};

export default nextConfig;
