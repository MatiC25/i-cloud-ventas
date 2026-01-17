import { useSession } from "@clerk/clerk-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveFacebookConfig, checkFacebookData, testFacebookName } from "@/services/api-back";
import { IFacebookConfig } from "@/types";

const facebookConfigSchema = z.object({
    api_version: z.string().min(1, "La versión del API es requerida"),
    ad_account_id: z.string().min(1, "El ID de la cuenta publicitaria es requerido"),
    fb_token: z.string().min(1, "El token de Facebook es requerido"),
});

type FacebookConfigValues = z.infer<typeof facebookConfigSchema>;

export function AdminPanel() {
    const { session } = useSession();

    const form = useForm<FacebookConfigValues>({
        resolver: zodResolver(facebookConfigSchema),
        defaultValues: {
            api_version: "",
            ad_account_id: "",
            fb_token: "",
        },
    });

    const onSubmit = async (values: FacebookConfigValues) => {
        if (!session) {
            toast.error("No hay sesión activa");
            return;
        }

        try {
            // Guardar configuración
            await saveFacebookConfig(values, session?.id);
            toast.success("Configuración guardada correctamente");

            // Ejecutar tests opcionales (como estaba en el código original)
            // checkFacebookData(session.id);
            // testFacebookName(session.id);

        } catch (error) {
            console.error("Error saving facebook config:", error);
            toast.error("Error al guardar la configuración");
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Configuración de Facebook Ads</CardTitle>
                    <CardDescription>
                        Ingresa las credenciales para conectar con la API de Marketing de Facebook.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="api_version"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Versión de API</FormLabel>
                                        <FormControl>
                                            <Input placeholder="v18.0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="ad_account_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ID Cuenta Publicitaria (Ad Account ID)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="act_123456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fb_token"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Token de Acceso (Access Token)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="EAA..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Guardar Configuración
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
