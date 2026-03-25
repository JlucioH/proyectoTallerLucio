FROM php:8.4-apache

# 1. Instalar dependencias del sistema y extensiones necesarias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libicu-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql intl bcmath

# 2. Instalar Node.js (Usando una versión estable para Vite/React)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 3. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Configurar el directorio de trabajo
WORKDIR /var/www/html
COPY . .

# 5. Instalar dependencias de PHP y generar assets de React
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# 6. Configurar permisos para Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 7. Configurar Apache para que apunte a la carpeta /public
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite

# 8. TRUCO PARA RENDER: Cambiar el puerto 80 de Apache por el $PORT dinámico
RUN sed -i 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf
RUN sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/g' /etc/apache2/sites-available/000-default.conf

# 9. Comando de inicio: Migraciones y encender Apache
# Usamos "exec" para que Apache reciba las señales de apagado correctamente
#CMD php artisan migrate --force && apache2-foreground
CMD php artisan config:clear && php artisan migrate --force && apache2-foreground