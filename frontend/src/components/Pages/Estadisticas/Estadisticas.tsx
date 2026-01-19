import { useState } from "react"
import { useSession } from "@clerk/clerk-react"
import { BarChart3, TrendingUp, Target, Sparkles, Loader2, CheckCircle2, XCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { testFacebookName, checkFacebookData } from "@/services/api-back"

interface FBCampaignData {
  Fecha?: string;
  Nombre_Campaña?: string;
  Gasto?: number;
  Impresiones?: number;
  Clics?: number;
  CTR?: number;
  CPC?: number;
  "Mensajes (Conv.)"?: number;
  "Costo Por Mensaje"?: number;
  error?: boolean;
  mensaje?: string;
  data?: string;
}

interface ConnectionStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  name?: string;
  id?: string;
}

interface CampaignDataStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  data?: FBCampaignData[];
}

export function Estadisticas() {
  const { session } = useSession()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ status: 'idle' })
  const [campaignData, setCampaignData] = useState<CampaignDataStatus>({ status: 'idle' })

  const handleTestConnection = async () => {
    if (!session?.id) {
      toast.error("No hay sesión activa")
      return
    }

    setConnectionStatus({ status: 'loading' })

    try {
      const result = await testFacebookName(session.id)

      if (result?.error) {
        setConnectionStatus({
          status: 'error',
          message: result.message || 'Error de conexión'
        })
        toast.error("Error al conectar con Meta API")
      } else if (result?.name) {
        setConnectionStatus({
          status: 'success',
          name: result.name,
          id: result.id
        })
        toast.success(`Conectado como: ${result.name}`)
      } else {
        setConnectionStatus({
          status: 'error',
          message: 'Respuesta inesperada del servidor'
        })
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      })
      toast.error("Error al probar conexión")
    }
  }

  const handleFetchCampaignData = async () => {
    if (!session?.id) {
      toast.error("No hay sesión activa")
      return
    }

    setCampaignData({ status: 'loading' })

    try {
      const result = await checkFacebookData(session.id) as FBCampaignData[]

      if (result && Array.isArray(result)) {
        // Check if first item has error
        if (result[0]?.error) {
          setCampaignData({
            status: 'error',
            message: result[0].mensaje || 'Error al obtener datos'
          })
          toast.error("Error al obtener datos de campañas")
        } else if (result[0]?.data === "No hay campañas en tu app") {
          setCampaignData({
            status: 'success',
            data: [],
            message: 'No hay campañas activas'
          })
          toast.info("No hay campañas activas ayer")
        } else {
          setCampaignData({
            status: 'success',
            data: result
          })
          toast.success(`Se obtuvieron ${result.length} campañas`)
        }
      } else {
        setCampaignData({
          status: 'error',
          message: 'Respuesta inesperada del servidor'
        })
      }
    } catch (error) {
      setCampaignData({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido'
      })
      toast.error("Error al obtener datos de campañas")
    }
  }

  // Calculate totals from campaign data
  const campaignTotals = campaignData.data?.reduce((acc, campaign) => ({
    totalSpend: acc.totalSpend + (campaign.Gasto || 0),
    totalClicks: acc.totalClicks + (campaign.Clics || 0),
    totalImpressions: acc.totalImpressions + (campaign.Impresiones || 0),
    totalMessages: acc.totalMessages + (campaign["Mensajes (Conv.)"] || 0),
  }), { totalSpend: 0, totalClicks: 0, totalImpressions: 0, totalMessages: 0 })

  return (
    <div className="h-[calc(100vh-7rem)] relative flex flex-col overflow-hidden rounded-2xl border bg-background p-8">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">
            Estadísticas de Marketing
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Conecta con la <span className="font-medium text-foreground">Meta Marketing API</span> para obtener métricas de tus campañas publicitarias.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={connectionStatus.status === 'loading'}
            className="gap-2"
          >
            {connectionStatus.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : connectionStatus.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : connectionStatus.status === 'error' ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Probar Conexión
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="gap-2"
                disabled={campaignData.status === 'loading'}
              >
                {campaignData.status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                Obtener Datos de Campañas
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Obtener datos de campañas?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción consultará la API de Meta para obtener los datos de campañas de <strong>ayer</strong> y los guardará automáticamente en tu hoja de Excel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleFetchCampaignData}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Connection Status Card */}
          <Card className={connectionStatus.status === 'success' ? 'border-green-500/50' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Estado de Conexión
              </CardDescription>
              <CardTitle className="text-lg">
                {connectionStatus.status === 'idle' && 'Sin probar'}
                {connectionStatus.status === 'loading' && 'Conectando...'}
                {connectionStatus.status === 'success' && connectionStatus.name}
                {connectionStatus.status === 'error' && 'Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {connectionStatus.status === 'idle' && 'Presiona "Probar Conexión" para verificar'}
                {connectionStatus.status === 'loading' && 'Verificando credenciales...'}
                {connectionStatus.status === 'success' && `ID: ${connectionStatus.id}`}
                {connectionStatus.status === 'error' && connectionStatus.message}
              </p>
            </CardContent>
          </Card>

          {/* Spend Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Gasto Total (Ayer)
              </CardDescription>
              <CardTitle className="text-lg">
                {campaignData.status === 'success' && campaignTotals
                  ? `$${campaignTotals.totalSpend.toFixed(2)}`
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {campaignData.status === 'success'
                  ? `${campaignData.data?.length || 0} campañas activas`
                  : 'Sin datos'}
              </p>
            </CardContent>
          </Card>

          {/* Clicks Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Clics Totales
              </CardDescription>
              <CardTitle className="text-lg">
                {campaignData.status === 'success' && campaignTotals
                  ? campaignTotals.totalClicks.toLocaleString()
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {campaignData.status === 'success' && campaignTotals
                  ? `${campaignTotals.totalImpressions.toLocaleString()} impresiones`
                  : 'Sin datos'}
              </p>
            </CardContent>
          </Card>

          {/* Messages Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Mensajes (Conversiones)
              </CardDescription>
              <CardTitle className="text-lg">
                {campaignData.status === 'success' && campaignTotals
                  ? campaignTotals.totalMessages
                  : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {campaignData.status === 'success' && campaignTotals && campaignTotals.totalMessages > 0
                  ? `$${(campaignTotals.totalSpend / campaignTotals.totalMessages).toFixed(2)} por mensaje`
                  : 'Sin datos'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Details (if data available) */}
        {campaignData.status === 'success' && campaignData.data && campaignData.data.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Detalle por Campaña</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {campaignData.data.map((campaign, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium truncate">
                      {campaign.Nombre_Campaña || 'Sin nombre'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {campaign.Fecha}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Gasto</p>
                        <p className="font-medium">${campaign.Gasto?.toFixed(2) || '0'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clics</p>
                        <p className="font-medium">{campaign.Clics || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mensajes</p>
                        <p className="font-medium">{campaign["Mensajes (Conv.)"] || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {campaignData.status === 'error' && (
          <Card className="mt-6 border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Error al obtener datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{campaignData.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
