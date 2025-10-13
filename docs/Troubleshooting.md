# Отстраняване на проблеми

Това ръководство ще ви помогне да разрешите най-често срещаните проблеми с Econt WooCommerce плъгина.

## Диагностика на проблеми

### Активиране на Debug режим

1. **Редактирайте wp-config.php:**
```php
// Добавете тези редове преди /* That's all, stop editing! */
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

2. **Проверете debug лога:**
- Файл локация: `/wp-content/debug.log`
- Търсете записи започващи с `[Econt]`

3. **Econt специфичен debug:**
```php
// Добавете за повече детайли
define('ECONT_DEBUG', true);
```

### System Information

Проверете системната информация преди диагностика:

```php
// WordPress версия
echo get_bloginfo('version');

// WooCommerce версия  
echo WC()->version;

// PHP версия
echo phpversion();

// Econt плъгин версия
$plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/deliver-with-econt/deliver-with-econt.php');
echo $plugin_data['Version'];
```

## Най-чести проблеми

### 1. Цените не се калкулират

#### Симптоми:
- Econt доставка показва "Free" или "0.00 лв."
- Няма актуализиране на цената при промяна на адреса
- Показва "Calculating..." но не се обновява

#### Възможни причини и решения:

**🔍 Проблем: Липсващо тегло на продуктите**
```php
// Проверете теглата на продуктите в количката
foreach (WC()->cart->get_cart() as $cart_item) {
    $product = $cart_item['data'];
    $weight = $product->get_weight();
    
    if (empty($weight)) {
        echo "Продукт {$product->get_name()} няма тегло!";
    }
}
```

**Решение:**
- Редактирайте всички продукти
- Задайте тегло в kg (напр. 0.5 за 500г)
- Запазете промените

**🔍 Проблем: Грешни API данни**
```php
// Тествайте API връзката
$econt = DWEH();
$response = wp_remote_get($econt->get_service_url() . 'test-connection.php');

if (is_wp_error($response)) {
    echo 'API грешка: ' . $response->get_error_message();
}
```

**Решение:**
- Проверете Store ID и Private Key в настройките
- Уверете се, че използвате правилната среда (Demo/Production)
- Тествайте с Demo данни първо

**🔍 Проблем: JavaScript грешки**

Отворете Developer Console (F12) и търсете грешки:
```javascript
// Чести JavaScript грешки:
Uncaught TypeError: Cannot read property 'price' of undefined
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource

// Debug script:
console.log('Econt calculator loaded:', typeof EcontCalculator !== 'undefined');
```

**Решение:**
- Проверете за конфликти с други плъгини
- Деактивирайте други плъгини временно
- Използвайте HTTPS за целия сайт

### 2. Товарителниците не се създават

#### Симптоми:
- Поръчката се създава успешно
- Няма Waybill ID в админ панела
- Клиентът не получава tracking номер

*Проверете дали се показват Econt колони в админ панела за поръчки*

#### Диагностика:
```php
// Проверете дали Cash on Delivery е активиран
$cod_enabled = get_option('woocommerce_cod_settings')['enabled'];
echo 'COD активиран: ' . ($cod_enabled === 'yes' ? 'Да' : 'Не');

// Проверете API лимитите
$api_response = wp_remote_get($econt->get_service_url() . 'api-status.php');
```

#### Решения:

**✅ Активирайте Cash on Delivery:**
1. WooCommerce → Настройки → Payments
2. Намерете "Cash on delivery"
3. Кликнете "Set up" и активирайте

**✅ Проверете API лимитите:**
- Свържете се с Econt за увеличаване на лимитите
- Проверете дали Store ID не е блокиран

**✅ Валидирайте данните на поръчката:**
```php
// Проверете задължителните полета
$required_fields = ['billing_first_name', 'billing_last_name', 'billing_phone', 'shipping_address_1'];

foreach ($required_fields as $field) {
    if (empty($order->get_meta($field))) {
        echo "Липсва поле: {$field}";
    }
}
```

### 3. Блоковият checkout не работи

#### Симптоми:
- Econt не се показва в блоковия checkout
- JavaScript грешки в конзолата
- Iframe не се зарежда
- Econt полетата не се показват правилно

#### Диагностика:
```php
// Проверете дали страницата използва блокове
if (is_using_block_checkout()) {
    echo 'Използва блокови checkout';
} else {
    echo 'Използва класически checkout';
}

// Проверете дали checkout блока е правилно конфигуриран
$checkout_page = get_post(wc_get_page_id('checkout'));
if (has_block('woocommerce/checkout', $checkout_page->post_content)) {
    echo 'Checkout блокът е намерен';
}
```

#### Решения:

**✅ Обновете WooCommerce:**
- Минимална версия: 9.0
- Препоръчително: Най-новата версия

**✅ Проверете блоковата структура:**
```html
<!-- Правилна структура на checkout страницата -->
<!-- wp:woocommerce/checkout -->
<div class="wp-block-woocommerce-checkout">
    <!-- wp:woocommerce/checkout-shipping-address-block -->
    <!-- wp:woocommerce/checkout-shipping-method-block -->
    <!-- wp:woocommerce/checkout-payment-block -->
</div>
<!-- /wp:woocommerce/checkout -->
```

**✅ Конфигурирайте Customer Details Container:**

Ако вашата тема или page builder използва различна структура на checkout формата, може да се наложи да конфигурирате CSS селектора за контейнера с полета за доставка:

1. **Отидете в:** WordPress Admin → Настройки → Econt Доставка
2. **Намерете:** Полето "Customer Details Container"
3. **Въведете правилния CSS селектор:**
   - По подразбиране: `#customer_details`
   - За персонализирани теми: `.woocommerce-checkout`, `#checkout-form`, `.checkout-wrapper`

**Как да намерите правилния селектор:**
```javascript
// Отворете Developer Console (F12) на checkout страницата
// Намерете контейнера с полетата за доставка и копирайте неговия ID или class
document.querySelector('#customer_details'); // Стандартен WooCommerce
document.querySelector('.your-custom-selector'); // Вашата тема
```

**Често използвани селектори:**
- Стандартен WooCommerce: `#customer_details`
- Elementor: `.elementor-widget-woocommerce-checkout-page`
- Divi: `.et_pb_wc_checkout_billing`
- Custom теми: Инспектирайте HTML кода на checkout страницата

**✅ Изчистете кеша:**
```php
// Изчисти всички кешове
wp_cache_flush();

// Regenerate block assets
wp_cli('wc tool run regenerate_product_lookup_tables --user=admin');
```

### 4. API Connection Failed

#### Симптоми:
- "API connection failed" в настройките
- Timeout грешки в лога
- SSL certificate грешки

#### Решения:

**✅ Firewall настройки:**
- Whitelist IP адресите на Econt API
- Разрешете изходящи HTTPS заявки на порт 443

**✅ SSL/TLS настройки:**
```php
// Проверете SSL поддръжката
if (function_exists('curl_version')) {
    $curl_info = curl_version();
    echo 'cURL версия: ' . $curl_info['version'];
    echo 'SSL версия: ' . $curl_info['ssl_version'];
}

// Тест със различни SSL настройки
$args = array(
    'sslverify' => true,
    'timeout' => 30,
    'user-agent' => 'WordPress/' . get_bloginfo('version') . '; ' . home_url()
);
```

**✅ Proxy конфигурация:**
```php
// Ако използвате proxy
add_filter('http_request_args', 'configure_proxy_for_econt', 10, 2);
function configure_proxy_for_econt($args, $url) {
    if (strpos($url, 'delivery.econt.com') !== false) {
        $args['proxy'] = 'your-proxy:port';
        $args['proxy_username'] = 'username';
        $args['proxy_password'] = 'password';
    }
    return $args;
}
```

### 5. Performance проблеми

#### Симптоми:
- Бавно зареждане на checkout
- Timeout при калкулиране на цени
- Високо CPU използване

## 6. Ръчна синхронизация на поръчки към Еконт (от версия 3.0.1)

Във версия **3.0.1** е добавена нова функционалност, която позволява **ръчно изпращане на избрани поръчки към Еконт** (синхронизация).  
Тази опция е полезна, ако:

- Товарителницата не е създадена автоматично в системата на Еконт
- Искате да повторите синхронизацията на поръчки в системата на Еконт

### Как да използвате функцията

1. Отидете в **WooCommerce → Orders**
2. Маркирайте желаните поръчки (чрез чекбоксовете отляво)
3. От падащото меню **Bulk actions** изберете **“Sync Econt Waybills”**
4. Натиснете бутона **Apply**

След това плъгинът ще синхронизира избраните поръчки с Еконт API и ще обнови товарителниците.

📸 **Примери от интерфейса:**
- ![Step 1](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Step-1.png)
- ![Step 2](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Step-2.png)

> 💡 **Забележка:** Уверете се, че използвате **последната версия на плъгина**, за да имате достъп до тази функционалност.


## Plugin Conflicts

### Често конфликтиращи плъгини:

**🔍 Caching плъгини:**
- WP Rocket, W3 Total Cache, WP Super Cache
- **Решение:** Изключете кеширането на checkout страницата

**🔍 Security плъгини:**
- Wordfence, Sucuri, iThemes Security
- **Решение:** Whitelist Econt API endpoints

**🔍 Performance плъгини:**
- Autoptimize, WP Optimize
- **Решение:** Изключете минификацията на Econt скриптовете

## Съобщаване на бъгове

### Информация за включване:

Когато съобщавате проблем, включете:

1. **System Info:**
```php
// Копирайте резултата от този код:
echo "WordPress: " . get_bloginfo('version') . "\n";
echo "WooCommerce: " . WC()->version . "\n";
echo "PHP: " . phpversion() . "\n";
echo "Econt Plugin: " . get_plugin_data(__FILE__)['Version'] . "\n";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
echo "SSL: " . (is_ssl() ? 'Yes' : 'No') . "\n";
```

2. **Debug лог:** Последните 20 реда от debug.log
3. **Screenshots:** На проблема и error съобщенията
4. **Steps to reproduce:** Точни стъпки за възпроизвеждане
5. **Expected vs Actual:** Какво очаквате срещу какво се случва

### Къде да съобщите:

- 🐛 **GitHub Issues:** [Създайте issue](https://github.com/econt/econt-woo-opc-plugin/issues/new)

## Preventive Measures

### Редовна поддръжка:

**✅ Обновления:**
- Винаги тествайте обновленията на staging среда
- Правете backup преди обновяване
- Следете release notes за breaking changes

---

## Помощ и поддръжка

Ако този гайд не реши вашия проблем:

- 🔧 **Community Support:** [WordPress.org форуми](https://wordpress.org/support/plugin/deliver-with-econt/)
