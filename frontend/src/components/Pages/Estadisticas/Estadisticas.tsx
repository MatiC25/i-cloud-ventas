import { BarChart3, TrendingUp, Target, Sparkles } from "lucide-react"

export function Estadisticas() {
  return (
    <div className="h-[calc(100vh-7rem)] relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-2xl border bg-background p-8">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl text-center">
        {/* Icono principal */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
          <BarChart3 className="h-8 w-8" />
        </div>

        {/* Título */}
        <h1 className="mb-3 text-3xl font-semibold tracking-tight">
          Estadísticas de Marketing
        </h1>

        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Próximamente
        </div>

        {/* Descripción */}
        <p className="mb-8 text-muted-foreground">
          Estamos preparando un panel avanzado con métricas reales desde la
          <span className="font-medium text-foreground"> Meta Marketing API</span>
          , para que puedas medir y optimizar tus campañas en tiempo real.
        </p>

        {/* Features teaser */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<TrendingUp className="h-5 w-5" />}
            title="Performance"
            desc="CTR, CPC, ROAS"
          />
          <Feature
            icon={<Target className="h-5 w-5" />}
            title="Audiencias"
            desc="Segmentación y alcance"
          />
          <Feature
            icon={<BarChart3 className="h-5 w-5" />}
            title="Insights"
            desc="Comparativas y tendencias"
          />
        </div>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4 text-left shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <span className="text-blue-600">{icon}</span>
        {title}
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  )
}
