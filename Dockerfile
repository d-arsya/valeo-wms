FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --no-progress \
    --optimize-autoloader
     
# RUN composer install
#     --no-dev \
#     --prefer-dist \
#     --no-interaction \
#     --no-progress \
#     --optimize-autoloader

FROM dunglas/frankenphp:php8.5 AS app

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev \
    # && docker-php-ext-install pdo pdo_pgsql zip \
    && install-php-extensions mbstring tokenizer intl pcntl bcmath exif gd pdo pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY . .

COPY --from=vendor /app/vendor ./vendor

RUN php artisan route:cache \
    && php artisan view:cache || true

RUN chown -R www-data:www-data storage bootstrap/cache
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]