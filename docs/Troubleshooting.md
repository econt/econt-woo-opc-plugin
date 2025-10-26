# Отстраняване на проблеми

Това ръководство ще ви помогне да проверите правилната работа на плъгина Доставка с Еконт за WooCommerce и да разрешите най-често срещаните проблеми.

## Проверка преди диагностика

Преди да започнете диагностика на проблеми, моля преминете през този контролен списък.

### 1. Проверка на версията на плъгина

**Стъпки:**

1. Влезте в WordPress администрацията
   - Отворете браузър (Chrome, Firefox, Safari и др.)
   - Въведете адреса на вашия сайт последван от `/wp-admin`
   - Пример: `https://vashsite.com/wp-admin`
   - Въведете потребителско име и парола
   - Натиснете "Влизане"

2. Отворете **Разширения → Инсталирани разширения**

3. Намерете плъгина **"Econt Delivery OneCheckout"**
   - Използвайте функцията за търсене в горния десен ъгъл
   - Въведете "Econt" в полето за търсене

4. Проверете инсталираната версия
   - Под името на плъгина ще видите текст "Версия X.X.X"
   - Запишете номера на версията

5. **Обновете плъгина, ако има по-нова версия:**
   - Под името на плъгина ще видите "Налично е обновяване"
   - Кликнете "обнови сега" (update now)
   - Изчакайте процесът да завърши

📸 ![Plugins](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Plugin-version.png))

---

### 2. Проверка на настройките за доставка

**Стъпки:**

1. Влезте в **WooCommerce → Настройки → Доставка → Зони за доставка**

📸 ![Shipping Zones](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Shipping-zones.png)

2. **Проверете дали съществува зона "България"**
   - Прегледайте таблицата със зони за доставка
   - Потърсете ред с "България" или "Bulgaria"
   - В колоната "Region(s)" трябва да пише "Bulgaria"

⚠️ **Ако зоната не съществува:**
- Кликнете "Add shipping zone"
- Въведете име: "България"
- В "Zone regions" изберете "Bulgaria"
- Запазете промените

3. **Уверете се, че методът Еконт е добавен и активиран**
   - Кликнете върху името на зоната "България"
   - В секцията "Shipping methods" потърсете "Econt" или "Еконт"
   - Проверете дали превключвателят е включен (ON/Enabled)

📸 ![Shipping Settings](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Shipping-settings.png)

⚠️ **Ако методът не е добавен:**
- Кликнете "Add shipping method"
- Изберете "Econt"
- Активирайте метода

---

### 3. Проверка на методите за плащане

**Стъпки:**

1. Влезте в **WooCommerce → Настройки → Плащания**

📸 ![Payments Settings](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Payments-settings.png)

2. **Проверете активните методи за плащане**
   - Прегледайте таблицата "Payment providers"
   - Потърсете методи със статус "Enabled" (Активиран)
   - Примери: Cash on delivery, Stripe, EcontPay и др.

3. **Уверете се, че методите поддържат Еконт доставка**

За всеки активен метод:
- Кликнете "Manage" или "Edit"
- Скролнете до секцията с ограничения за доставка
- Проверете полето "Enable for shipping methods"
- Уверете се, че е избран "Econt" или "Any shipping method"
- Запазете промените

💡 **Специална проверка за "Cash on Delivery":**

Този метод е особено важен за Еконт доставките:
- Отворете настройките на "Cash on delivery"
- Потвърдете, че е активиран
- В "Enable for shipping methods" трябва да е "Econt"

---

### 4. Проверка на Checkout страницата

**Стъпки:**

1. Отидете в **Страници → Всички страници**

📸 ![Pages List](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Pages.png)

2. **Намерете страницата Checkout / Плащане**
   - Потърсете страница с име: "Checkout", "Плащане" или "Поръчка"

3. **Отворете страницата в редактора**
   - Задръжте курсора над заглавието
   - Кликнете "Edit"

4. **Проверете типа на редактора**
   - Gutenberg (Block Editor) - блоков редактор
   - Classic Editor - традиционен текстов редактор
   - Page Builder (Elementor, WPBakery, Divi и др.)

5. **Проверете за WooCommerce Checkout блок/shortcode**

   **За Gutenberg (Block Editor):**
   - Потърсете блок "Checkout" от WooCommerce

   📸 ![Gutenberg Checkout](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Checkout-gutenberg.png)

   **За Classic Editor:**
   - Потърсете `[woocommerce_checkout]` shortcode

   📸 ![Classic Checkout](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Checkout-shortcode-classic.png)

   **За Elementor Page Builder:**
   - Потърсете WooCommerce Checkout widget

   📸 ![Elementor Checkout](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Checkout-Elementor.png)

6. **Проверете за конфликтни checkout плъгини**

Потърсете плъгини като CheckoutWC, Fluid Checkout, Cartflows - тези плъгини могат да влязат в конфликт с Econt.

---

### 5. Проверка за JavaScript грешки

**Стъпки:**

1. **Отворете checkout страницата във фронтенд**
   - Отворете нов таб в браузъра
   - Въведете: `https://vashsite.com/checkout`
   - Добавете поне един продукт в количката преди това

2. **Отворете конзолата на браузъра**
   - **Windows/Linux:** F12 или Ctrl + Shift + J
   - **Mac:** Cmd + Option + J
   - Или: десен бутон → "Inspect" → таб "Console"

3. **Проверете за JavaScript грешки**
   - Презаредете страницата с отворена конзола (F5)
   - Наблюдавайте конзолата по време на зареждане
   - Потърсете съобщения с червен цвят (errors)
   - Обърнете внимание на предупреждения (warnings) с жълт цвят

🔍 **Специално внимание на съобщения съдържащи:**
- "econt" или "Econt"
- "iframe"
- Имена на JS файлове от плъгина

4. **Тествайте взаимодействието с формата**
   - Попълнете формата за поръчка
   - Проверете за нови грешки при взаимодействие
   - Изберете различни опции за доставка и плащане

---

### 6. Проверка на iframe контейнера

**Стъпки:**

1. **Отворете изходния HTML на checkout страницата**
   - Отворете checkout страницата
   - Отворете Developer Tools: F12 или Ctrl+Shift+I (Windows/Linux), Cmd+Option+I (Mac)
   - Уверете се, че сте в таба "Elements" или "Inspector"

2. **Потърсете елемент с ID #place_iframe_here или Class .econt-portal-container**
   - Натиснете Ctrl+F (Windows/Linux) или Cmd+F (Mac)
   - Въведете: `place_iframe_here` / `econt-portal-container`
   - Натиснете Enter

3. **Потвърдете, че елементът съществува**

✅ **Ако елементът е намерен:**
- Ще бъде осветен в HTML кода
- Трябва да изглежда така: `<div id="place_iframe_here"></div>` / `<div class="econt-portal-container"></div>`

❌ **Ако елементът НЕ е намерен:**
- Ще видите "0 of 0" или "Not found"
- Това означава, че контейнерът липсва
- Плъгинът няма къде да зареди своето съдържание
- **Това е КРИТИЧЕН проблем!**

---

### 7. Проверка на теглото на продуктите

⚠️ **КРИТИЧНО ВАЖНО!**

Теглото на продуктите е критично важно за правилното калкулиране на цената за доставка с Еконт. Без правилно зададено тегло, плъгинът **НЕ МОЖЕ** да изчисли точна цена за доставка!

**Стъпки:**

1. Отидете в **Продукти → Всички продукти**

📸 ![Products List](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Products.png)

2. **Изберете продукт за проверка**
   - Кликнете върху името на продукта или "Edit"
   - Намерете секцията "Product data"
   - Отворете таба "Shipping" (Доставка)

3. **Проверете полето "Weight" (Тегло)**
   - Намерете полето "Weight (kg)"
   - Проверете дали има въведена стойност

📸 ![Product Weight Field](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/Product-weight.png)

❌ **Ако полето е празно - това е ПРОБЛЕМ!**

**Примери за правилни стойности:**
- 0.5 (за 500 грама)
- 1.25 (за 1 кг и 250 грама)
- 0.1 (за 100 грама)
- 15 (за 15 килограма)

4. **Проверете размерите (опционално)**
   - Dimensions - Length × Width × Height
   - Тези стойности помагат за точно изчисляване
   - Особено важни за обемни, но леки продукти

**📊 Масова проверка:**
- Върнете се в Продукти → Всички продукти
- Кликнете "Screen Options" в горния десен ъгъл
- Отметнете checkbox-а "Weight"
- Вече ще видите колона "Weight" в таблицата
- Прегледайте кои продукти имат празна колона

**🔀 Вариативни продукти:**

1. **Проверете теглото на вариациите**
   - Отворете продукт с тип "Variable product"
   - Отидете в таба "Variations"
   - Разгънете всяка вариация
   - Всяка вариация има свое поле "Weight"

❗ **ВАЖНО:** Проверете теглото на ВСЯКА вариация поотделно!

**🧪 Тестване на калкулацията:**
- Добавете продукт с известно тегло в количката
- Отидете на страницата Checkout
- Изберете доставка с Еконт
- Проверете дали се показва цена за доставка

---

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

**Решение:**
- Редактирайте всички продукти
- Задайте тегло в kg (напр. 0.5 за 500г)
- Запазете промените

**🔍 Проблем: Грешни API данни**

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

### 3. Блоковият checkout не работи

#### Симптоми:
- Econt не се показва в блоковия checkout
- JavaScript грешки в конзолата
- Iframe не се зарежда
- Econt полетата не се показват правилно

#### Решения:

**✅ Обновете Плъгина:**
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

## 4. Ръчна синхронизация на поръчки към Еконт (от версия 3.0.1)

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
