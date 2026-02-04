import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    ShieldCheck, 
    Building2, 
    ChevronRight, 
    BookOpen, 
    Folder, 
    Users, 
    Info,
    Package, 
    Tags,
    ShoppingBag,
    Truck,
    ClipboardList,
    UserCircle,
    TrendingUp,
    ShoppingCart, // Nuevo icono para ventas
    History      // Icono para historial
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth, is_staff } = usePage().props as any;
    
    // 1. Mantenemos tu acceso original a los datos
    const nombreEmpresa = auth?.empresa;
    const nombreRol = auth?.rol;

    // 2. Extraemos las notificaciones para el badge
    const notifications = auth?.notifications || [];
    const countNotifications = notifications.length;

    // Lógica de roles basada en nombres (strings)
    const esAdminEmpresa = nombreRol === 'Admin Empresa'; // Rol 2
    const esAdminAlmacen = nombreRol === 'Admin Almacen'; // Rol 3
    const esVendedor = nombreRol === 'Vendedor';         // Rol 4
    
    const tieneEmpresaActiva = !is_staff && nombreEmpresa;

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    ];

    const universalEmpresaItems: NavItem[] = [
        { title: 'Datos Empresa', href: '/empresa/datos', icon: Info },
    ];

    // Gestión de Inventario (Roles 2 y 3)
    const inventarioNavItems: any[] = [
        { title: 'Categorías', href: '/inventario/categorias', icon: Tags },
        { title: 'Ítems / Productos', href: '/inventario/items', icon: Package, badge: countNotifications > 0 ? countNotifications : null },
    ];
    //gestion compras roles2 y 3
    const comprasNavItems: NavItem[] = [
        { title: 'Nueva Compra', href: '/compras/nueva', icon: ShoppingBag },
        { title: 'Historial Compras', href: '/compras/historial', icon: History },
        { title: 'Proveedores', href: '/compras/proveedores', icon: Truck },
        { title: 'Suministros x Prov.', href: '/compras/historial-suministros', icon: ClipboardList }, // Nueva Opción
    ];
    // Gestión de Reportes (Roles 2 y 3)
//    const reportesNavItems: NavItem[] = [
//        { 
//            title: 'Kardex Valorizado', 
//            href: '/inventario/items?action=view_kardex', // Añadimos un parámetro para guiar al usuario
//            icon: History 
//        },
//    ];

    const reportesNavItems: NavItem[] = [
        { title: 'Kardex Valorizado', href: '/reporte/reportekardexitem', icon: History },
        { title: 'Rentabilidad y Costos', href: '/reporte/reportecostoitem', icon: TrendingUp },
    ];

    // Gestión de Ventas/Clientes (Roles 2 y 4) - MODIFICADO AQUÍ
    const ventasNavItems: NavItem[] = [
        { title: 'Nueva Venta', href: '/ventas/nueva', icon: ShoppingCart },
        { title: 'Historial Ventas', href: '/ventas/historial', icon: History },
        { title: 'Clientes', href: '/ventas/clientes', icon: UserCircle },
    ];

    const adminEmpresaNavItems: NavItem[] = [
        { title: 'Gestionar Personal', href: '/empresa/usuarios', icon: Users },
    ];

    const adminSystemNavItems: NavItem[] = [
        { title: 'Panel de Control', href: '/system/admin', icon: ShieldCheck },
        { title: 'Empresas / Usuarios', href: '/admin/empresas-usuarios', icon: Users },
        { title: 'Empresas / Clientes', href: '/admin/clientes-consolidado', icon: UserCircle },
        { title: 'Empresas / Categorías', href: '/admin/categorias-consolidado', icon: Tags },
        { title: 'Empresas / Ítems', href: '/admin/items-consolidado', icon: Package },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {tieneEmpresaActiva && (
                    <div className="px-2 mt-2">
                        <Link 
                            href="/select-company" 
                            className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors group"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-bold truncate leading-none mb-1">
                                    {nombreEmpresa}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    {nombreRol}
                                </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                        </Link>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} title="Principal"/>
                
                {tieneEmpresaActiva && (
                    <div className="mt-4 border-t border-sidebar-border pt-2">
                        <NavMain items={universalEmpresaItems} title="Empresa Actual"/>
                        
                        {(esAdminEmpresa || esAdminAlmacen) && (
                            <>
                                <NavMain items={inventarioNavItems} title="Inventario" />
                                <NavMain items={comprasNavItems} title="Compras" />
                                <NavMain items={reportesNavItems} title="Reportes" />
                            </>
                        )}

                        {(esAdminEmpresa || esVendedor) && (
                            <NavMain items={ventasNavItems} title="Ventas" />
                        )}

                        {esAdminEmpresa && (
                            <NavMain items={adminEmpresaNavItems} />
                        )}
                    </div>
                )}
                
                {is_staff && (
                    <div className="mt-4 border-t border-sidebar-border pt-2">
                        <NavMain items={adminSystemNavItems} title="Sistema"/>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}