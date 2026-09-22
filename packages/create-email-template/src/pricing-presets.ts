// Recetas de las variantes del bloque `pricing`. El bloque nace en la
// variante "card" (Precio 1); al cambiar de estilo el panel reescribe las
// props de esa variante (data-driven, fiel a react.email/components/pricing).
import { newId } from "./core/id"
import type { PricingPlan } from "./core/types"

export type PricingVariant = "card" | "offer" | "two-tiers"

export interface PricingVariantDef {
  value: PricingVariant
  label: string
  /** Patch de props para `set` al cambiar de variante (ids frescos). */
  build: () => Record<string, unknown>
}

type PlanInput = {
  title: string
  price: string
  features: string[]
  period?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  highlighted?: boolean
}

const plan = (data: PlanInput): PricingPlan => ({
  id: newId(),
  period: "/ mes",
  description: "",
  ctaLabel: "Empezar hoy",
  ctaHref: "",
  highlighted: false,
  ...data,
})

export const PRICING_VARIANTS: PricingVariantDef[] = [
  {
    value: "card",
    label: "Precio 1 · tarjeta",
    // No reescribe nada: la tarjeta usa title/price/period/bullets/cta.
    build: () => ({}),
  },
  {
    value: "offer",
    label: "Precio 2 · oferta",
    build: () => ({
      eyebrow: "Oferta exclusiva",
      price: "$12",
      period: "/ mes",
      description:
        "Diseñamos el plan perfecto para lo que necesitas. Desbloquea funciones premium a un precio inmejorable.",
      bullets: [
        "Gestiona hasta 25 productos premium",
        "Haz crecer tu audiencia con 10.000 suscriptores",
        "Decisiones con analítica avanzada",
        "Soporte prioritario en 24 horas",
        "Integración con tus herramientas favoritas",
      ],
      ctaLabel: "Reclamar mi oferta",
      note: "Oferta por tiempo limitado: ahorra un 20%",
      note2: "No requiere tarjeta. Incluye 14 días de prueba gratis.",
    }),
  },
  {
    value: "two-tiers",
    label: "Precio 3 · dos planes",
    build: () => ({
      heading: "Elige el plan ideal para ti",
      subtitle:
        "Elige un plan accesible con las mejores funciones para conectar con tu audiencia y vender más.",
      plans: [
        plan({
          title: "Hobby",
          price: "$29",
          description: "El plan perfecto para empezar.",
          features: [
            "25 productos",
            "Hasta 10.000 suscriptores",
            "Analítica avanzada",
            "Respuesta de soporte en 24 h",
          ],
          ctaLabel: "Empezar hoy",
        }),
        plan({
          title: "Enterprise",
          price: "$99",
          description: "Soporte dedicado y listo para empresas.",
          features: [
            "Productos ilimitados",
            "Suscriptores ilimitados",
            "Analítica avanzada",
            "Representante de soporte dedicado",
            "Automatizaciones de marketing",
            "Integraciones a medida",
          ],
          ctaLabel: "Empezar hoy",
          highlighted: true,
        }),
      ],
      footnote: "Equipo de Experiencia del Cliente",
    }),
  },
]
