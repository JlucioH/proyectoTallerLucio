import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Iniciar Sesión
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Registrarse
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-5 text-3xl font-bold">
                                Gestiona tu empresa <br /> de forma inteligente
                            </h1>
                            <p className="mb-2 text-[#706f6c] dark:text-[#A1A09A]">
                                Sistema SaaS de ventas e inventarios diseñado para microempresas.
                                Controla productos, stock, ventas, clientes y reportes desde una
                                plataforma segura y fácil de usar.
                            </p>
                            
                            <ul className="mb-4 flex flex-col lg:mb-6">
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-1/2 before:bottom-0 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span className="ml-1 font-medium text-[#f53003] dark:text-[#FF4433]">
                                        Control de inventario en tiempo real
                                    </span>
                                </li>
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span className="ml-1 font-medium text-[#f53003] dark:text-[#FF4433]">
                                        Registro de ventas y clientes
                                    </span>
                                </li>
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span className="ml-1 font-medium text-[#f53003] dark:text-[#FF4433]">
                                        Gestión de usuarios por roles
                                    </span>
                                </li>
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#dbdbd7] dark:bg-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span className="ml-1 font-medium text-[#f53003] dark:text-[#FF4433]">
                                        Reportes y estadísticas
                                    </span>
                                </li>
                            </ul>

                            <ul className="flex gap-3 text-sm leading-normal">
                                <li>
                                    <a
                                        href="/catalogo"
                                        className="inline-block rounded-sm border border-black bg-[#1b1b18] px-5 py-1.5 text-sm leading-normal text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                    >
                                        Explorar productos
                                    </a>
                                </li>
                            </ul>
                        </div>

                       
                        <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#FDFCFB] lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:bg-[#111111]">
                            <div className="absolute inset-0 flex items-center justify-center p-6 lg:p-12">
                                <svg 
                                    className="h-full w-full text-[#F53003] opacity-[0.15] dark:text-[#F53003] dark:opacity-[0.25]" 
                                    viewBox="0 0 290 300" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    <path 
                                        d="M166.623 30.744c3.396-4.77 7.209-9.77 13.643-8.592 8.746 1.6 11.261 8.36 10.521 16.301 3.156 3.095 8.816 6.865 12.459 9.541 5.788 4.251 11.826 9.193 17.813 13.101 6.435-1.948 11.564-2.148 16.293 3.55 2.29 2.758 1.774 7.21 1.644 10.583-.124 3.228-5.458 6.604-7.838 8.416-.266 2.753-.124 8.34-.166 11.3l-.484 20.426c-.372 13.909-1.509 26.778-1.458 40.781 1.065.822 2.121 1.754 3.156 2.59 8.424 6.799 5.616 19.839-5.722 21.068-2.912.316-5.193-.058-8.009-.959-7.413 8.389-16.73 17.154-24.745 25.164l-42.162 42.187a289 289 0 0 0-15.379 15.527c1.103 5.81 1.396 10.624-3.609 14.998-3.417 2.986-8.085 2.398-12.27 1.983-6.738-4.62-8.589-9.132-6.348-17.16l-53.428-54.308L42.14 188.86c-2.131-2.128-7.816-7.561-9.406-9.758-3.018.992-6.46 1.524-9.567.666a11.44 11.44 0 0 1-6.977-5.481 12.3 12.3 0 0 1-.986-9.548c1.34-4.51 4.23-6.638 8.101-8.736-.617-5.302-.286-10.167-.64-15.349-.78-11.368-1.032-22.752-1.603-34.143-.357-7.143.085-16.119-1.103-23.06-1.843-1.548-7.212-5.958-7.572-8.168-.355-3.146-.776-7.04 1.045-9.808 4.073-6.191 10.661-8.034 17.166-4.11C41.376 53.62 53.193 45.755 63.7 37.88c-1.987-6.465 3.109-15.203 9.887-15.762 1.015-.015 2.261-.07 3.259.01 4.426.35 8.347 4.575 10.142 8.36 16.938.362 33.709-.278 50.586.085 9.651.207 19.53-.192 29.049.17M66.365 92.126l-.902 4.16c3.167 2.997 8.813 6.682 12.371 9.42l30.405 23.15c2.906 2.169 9.524 6.68 11.927 8.912 10.583 7.656 20.72 16.264 31.217 24.061 1.57 1.165 3.066 2.022 4.791 2.937-.35-4.898-2.633-13.974-3.703-19.042l-8.589-41.409c-.989-4.739-3.634-15.327-4.077-19.76-3.58-1.078-5.817-2.327-8.687-4.74-.691-.58-1.893-1.811-2.767-1.772l-40.808 9.08c-5.803 1.305-15.887 3.256-21.178 5.003m30.413 104.266c3.609.876 5.928 1.406 8.923 3.591 9.415-5.46 20.211-10.055 29.38-15.322 4.882-2.505 10.261-5.162 14.993-7.855-.075-3.012.022-4.327.763-7.247-2.33-1.379-6.194-4.477-8.443-6.228l-12.903-10.049c-18.83-14.565-38.2-28.494-56.952-43.171-1.617-1.265-9.623-7.311-11.128-7.632l-.117-.026c.307 1.07.693 2.112 1.054 3.165 3.624 10.564 7.865 20.898 11.848 31.329zm-62.956-37.95c6.526 5.477 3.706 9.985 6.064 12.804.932 1.114 34.065 20.49 37.654 22.284 3.812 2.222 8.553 5.247 12.617 6.618-.362-2.345-1.061-4.545-1.834-6.782-2.872-8.316-6.384-16.422-9.497-24.649-2.53-6.688-22.492-62.301-25.305-64.485q-.075-.055-.151-.108c-1.735 3.189-2.886 6.472-4.064 9.894-4.66 13.543-9.55 27.01-13.974 40.632-.397 1.22-.948 2.642-1.51 3.792m141.065 18.576c-4.557 7.234-5.487 9.154-14.373 10.152-8.219 20.531-16.211 41.245-24.654 61.702-.719 1.742-1.539 3.809-2.11 5.586.565-.62 1.628-1.721 2.076-2.367 17.16-16.741 34.42-34.182 51.374-51.154l15.31-15.28c3.13-3.168 8.231-8.295 10.733-11.985-.611-.026-2.321-.137-2.838-.058a750 750 0 0 0-26.404 2.219c-2.156.226-7.348.646-9.114 1.185m-28.601-93.89 17.261 80.696c2.727-2.641 7.14-12.182 8.981-15.943 5.551-11.024 11.75-22.305 17.046-33.324-2.596-4.345-3.933-7.227-2.744-12.353-8.76-4.953-17.388-9.91-26.432-14.372-3.38-1.667-8.606-5.876-12.01-6.942zm-37.163 122.445c-.052 4.854.079 8.142-3.794 11.89l-.164.156c3.012 7.604 7.907 15.177 11.02 22.842.419 1.033 1.052 2.484 1.576 3.458 1.209 2.684 4.211 10.139 6.525 11.269.691-.008.93-.09 1.41-.612 1.967-2.139 24.64-59.011 27.132-66.033.479-1.35 1.302-3.381 1.143-4.816-.016-.142-.029-.187-.056-.314l-.339-.151c-4.997 1.618-9.321 4.065-13.945 6.516l-14.966 7.904a755 755 0 0 1-10.123 5.111c-1.538.766-4.074 1.918-5.419 2.78M74.305 46.587c-4.28 12.087-8.795 23.714-12.89 35.895.777.966 2.343 2.669 2.953 3.552 6.244-2.064 11.716-3.313 18.111-4.744 5.296-1.184 10.472-2.587 15.831-3.589l15.222-3.415c5.192-1.162 10.859-2.064 15.552-4.47-7.032-5.545-18.965-11.24-26.976-16.094-3.533-2.14-15.137-9.177-18.481-10.505-3.183 2.25-5.261 3.276-9.322 3.37m96.422 119.056c.643 1.422 1.88 3.086 2.795 4.405 3.317-.163 14.335-1.143 17.515-1.721q6.095-.615 12.197-1.15c2.522-.2 7.007-.378 9.353-.962 1.362-3.386 2.487-5.029 4.968-7.755-2.746-6.03-5.313-12.558-7.899-18.704-3.023-7.184-6.356-14.676-9.149-21.921-2.117-.138-3.102-.26-5.176-.946-4.291 9.594-9.254 19.008-13.945 28.42-3.421 6.863-7.231 13.46-10.659 20.334M88.05 37.163c3.738 3.299 11.056 6.744 15.466 9.368 5.181 3.08 10.504 6.114 15.688 9.184 4.148 2.457 8.926 4.892 12.919 7.474 3.358-2.585 5.55-3.597 9.948-3.118 1.243.135 4.14 1.175 4.89.5 2.901-3.457 20.211-20.01 20.716-21.37-1.74-2.717-15.978-2.047-19.593-1.995-13.987.204-28.423-.593-42.359-.081a547 547 0 0 1-17.675.038m62.758 28.818c1.618 3.687 2.282 5.7 1.151 9.708 8.894 3.993 16.852 9.279 25.197 13.579 2.401 1.432 12.626 8.663 14.64 5.535-.098-3.792-3.575-14.358-4.849-18.635-2.617-8.79-4.97-20.748-8.427-28.985-1.78-.58-5.103-1.884-6.583-2.281-2.256 2.705-5.232 5.43-7.786 7.913a610 610 0 0 0-13.343 13.166M53.206 86.762c-2.732.796-3.271 1.315-4.665 3.856q-.354.633-.665 1.288c1.328 2.927 2.56 5.309 6.241 5.354 2.707-.622 3.46-1.108 5.08-3.447-.559-4.255-.878-6.902-5.991-7.05m180.103-14.961c-1.714-3.115-2.742-5.718-6.778-5.775-4.186 2.181-5.093 4.839-3.258 9.061 2.03 1.357 3.04 1.962 5.509 1.668 2.363-1.43 3.188-2.416 4.527-4.954m-16.394 67.451c1.414 3.363 3.309 8.187 4.992 11.278.382-7.073 3.558-65.521 1.43-67.758a2.4 2.4 0 0 0-.481-.383c-5.51 5.098-9.775 11.439-14.741 16.042 3.864 7.313 2.565 9.677-1.324 16.405a364 364 0 0 0 6.946 17.12c.804 1.877 2.288 5.621 3.178 7.296M35.847 76.475l4.529 3.005c1.84 1.2 3.634 2.257 5.232 3.766 3.706-3.08 4.612-3.198 9.462-3.39 1.211-3.73 12.703-34.106 12.452-35.317l-.29-.038c-3.203 1.713-6.237 4.012-9.243 6.086a968 968 0 0 0-12.992 9.05c-3.238 2.316-6.278 4.67-9.62 6.843 1.214 3.412 1.22 6.453.47 9.995M76.615 39.66a5.23 5.23 0 1 0-2.317-10.2 5.23 5.23 0 0 0 2.317 10.2m149.491 133.481a5.2 5.2 0 1 0-2.4-10.12 5.2 5.2 0 0 0 2.4 10.12m-196.79-22.189c1.331-3.192 2.621-7.158 3.706-10.476a954 954 0 0 1 13.387-38.153c-3.72-3.965-4.681-6.439-4.504-11.872q.024-.744.067-1.487c-1.399-1.24-9.38-7.165-10.855-6.974-1.068.438-2.933 1.142-3.907 1.63-.1 5.665.47 13.162.797 18.896q.47 9.342.77 18.693c.207 5.867.425 11.287.44 17.168.008 3.636-.167 9.136.1 12.575m170.757-40.53c2.202-1.515 2.812-2.666 4.296-4.854-1.887-3.376-3.098-5.754-7.473-5.543-6.73 3.351-3.678 12.226 3.177 10.397m-85.994 141.459c-.206-1.751-3.057-6.587-3.994-8.546-2.241-4.688-4.571-9.45-6.742-14.172-.949-2.067-2.971-6.035-3.6-8.073-8.987.644-14.076-3.471-14.72-12.613a73 73 0 0 1-.127-2.932c-9.595-6.33-21.223-12.282-31.237-18.108-1.923-1.119-6.754-4.509-8.402-4.983 1.09 2.016 5.262 4.683 7.087 6.534l46.386 47.107c4.693 4.718 9.45 9.501 13.82 14.514.534.613.672 1.086 1.529 1.272m27.616-174.76c2.247-1.282 3.332-2.92 4.642-5.093-2.424-3.645-2.758-5.33-7.477-4.93-6.013 1.357-4.625 11.147 2.835 10.023M96.172 203.917a5.063 5.063 0 1 0 1.947 9.934 5.064 5.064 0 0 0-1.947-9.934m29.971 68.071a5.134 5.134 0 1 0-2.685-9.91 5.135 5.135 0 0 0 2.685 9.91m-98.502-98.715a5.086 5.086 0 1 0-1.627-10.04 5.086 5.086 0 0 0 1.627 10.04M178.13 29.017c-7.677 3.083-3.651 11.944 1.659 10.615 1.803-1.115 3.708-2.046 4.205-4.315.742-3.387-2.588-6.48-5.864-6.3m-16.607 139.948c-6.087 3.84-6.235 10.331 1.236 11.131 7.14-3.072 4.87-10.096-1.236-11.131M23.564 66.03c-6.953 2.795-5.478 11.672 1.79 10.74 2.397-.818 3.123-1.718 4.234-3.988q.224-.445.402-.907c-1.429-2.987-2.585-5.85-6.426-5.845M185.32 44.587c1.385 4.263 2.265 9.182 3.53 13.514 3.336 11.417 6.275 23.88 10.274 35.014q2.214.456 4.406 1.004c2.386-2.742 4.591-5.648 7.012-8.332 2.01-2.315 4.55-5.412 6.634-7.564-1.902-3.98-2.314-5.787-1.356-10.125.096-.436.491-1.556.423-1.967-.076-.453-27.845-20.531-29.918-21.261a9 9 0 0 0-1.005-.283"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(0,0,0,0.03)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.05)]" />
                        </div>


                    </main>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}