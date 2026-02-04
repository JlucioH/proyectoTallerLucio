import 'sonner/dist/styles.css';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner'; // Si ya tienes instalada la librería


interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <Toaster 
            position="bottom-center" 
            richColors 
            theme="light"
            toastOptions={{
                style: { 
                    zIndex: 10000,
                    fontSize: '14px' 
                },
            }}
        />
    </AppLayoutTemplate>
);
