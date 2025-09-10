# Инсталация

## Предварителни изисквания

### Системни изисквания
- **WordPress:** 6.0 или по-нова версия
- **WooCommerce:** 9.0 или по-нова версия
- **PHP:** 8.0 или по-нова версия
- **HTTPS:** Задължително за API комуникация

### Изисквания от Econt
- Активен договор с Econt Express
- Валиден Store ID от [Econt Delivery](https://delivery.econt.com/)
- Валиден Private Key
- Активиран "Cash on Delivery" метод за плащане в WooCommerce

## Методи за инсталация

### Метод 1: Автоматично от GitHub (Препоръчително)

1. **Изтеглете най-новата версия:**
   - [Сваляне от GitHub](https://github.com/econt/econt-woo-opc-plugin/releases/latest/download/econt-woo-opc-plugin-main.zip)

2. **Качете в WordPress:**
   - Влезте в WordPress Admin панела
   - Отидете на **Плъгини → Добавяне на нов**
   
   ![WordPress Plugins Page](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/screenshot_1_1.png)
   *WordPress админ панел - страница с плъгини*
   
   - Кликнете **Качване на плъгин**
   
   ![Upload Plugin](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/screenshot_1_2.png)
   *Качване на плъгин файл*
   
   - Изберете изтегления ZIP файл
   - Натиснете **Инсталиране сега**
   
   ![Install Plugin](https://raw.githubusercontent.com/econt/econt-woo-opc-plugin/main/extracted_images/screenshot_1_3.png)
   *Инсталиране на плъгина*

3. **Активирайте плъгина:**
   - След инсталацията кликнете **Активиране**
   - Плъгинът ще се появи в списъка с активни плъгини

### Метод 2: Ръчно инсталиране чрез FTP

1. **Изтеглете и разпакетайте:**
   - Изтеглете ZIP файла от GitHub
   - Разпакетайте архива на вашия компютър

2. **Качете чрез FTP:**
   - Свържете се към сървъра чрез FTP клиент
   - Качете папката в `/wp-content/plugins/`
   - Уверете се, че правата за достъп са 755

3. **Активирайте:**
   - Отидете в WordPress Admin → **Плъгини**
   - Намерете "Econt Delivery OneCheckout"
   - Кликнете **Активиране**

### Метод 3: WP-CLI (За разработчици)

```bash
# Изтеглете от GitHub
wp plugin install https://github.com/econt/econt-woo-opc-plugin/releases/latest/download/econt-woo-opc-plugin-main.zip

# Активирайте плъгина
wp plugin activate deliver-with-econt
```

## Проверка на инсталацията

### След активиране проверете:

1. **Плъгинът е активен:**
   - Отидете на **Плъгини**
   - "Econt Delivery OneCheckout" трябва да е в списъка с активни плъгини

2. **Настройки са достъпни:**
   - **Метод 1:** Отидете на **Настройки → Econt Доставка**
   - **Метод 2:** Кликнете **Settings** под името на плъгина в списъка

3. **WooCommerce интеграцията работи:**
   - Отидете на **WooCommerce → Настройки → Доставка**
   - Трябва да виждате "Econt" като опция за shipping метод

## Обновления

Плъгинът поддържа автоматични обновления от GitHub:

### Автоматично обновяване:
- Отидете на **Dashboard → Updates**
- Ако има нова версия, тя ще се появи в списъка
- Кликнете **Update Now**

### Ръчно обновяване:
1. Деактивирайте стария плъгин (запазете настройките)
2. Изтрийте стария плъгин
3. Инсталирайте новата версия
4. Активирайте отново

### Важно при обновяване:
> ⚠️ **Преди обновяване:**
> - Направете backup на сайта
> - Запишете API настройките
> - Тествайте на staging среда

## Потенциални проблеми

### Проблем: "Plugin could not be activated"
**Причини:**
- Липсва WooCommerce
- Неподдържана PHP версия
- Конфликт с друг плъгин

**Решение:**
```php
// Проверете PHP версията
<?php echo phpversion(); ?>

// Проверете активните плъгини
wp plugin list --status=active
```

### Проблем: "Settings page not found"
**Причини:**
- Недостатъчни права на потребителя
- Грешка в активацията

**Решение:**
- Уверете се, че сте Administrator
- Деактивирайте и активирайте отново плъгина

### Проблем: "API connection failed"
**Причини:**
- Грешни API данни
- Firewall блокира заявките
- SSL проблеми

**Решение:**
- Проверете Store ID и Private Key
- Тествайте от различна мрежа
- Уверете се, че сайтът използва HTTPS

## След инсталацията

Следващи стъпки:
1. **[Първоначална настройка](Initial-Setup)** - Конфигуриране на API данните
2. **[Конфигуриране на продукти](Product-Configuration)** - Настройка на тегла
---

## Поддръжка при инсталация

Ако имате проблеми с инсталацията:
- 📧 Email: [support_integrations@econt.com](mailto:support_integrations@econt.com)
- 🐛 GitHub Issues: [Създайте нов issue](https://github.com/econt/econt-woo-opc-plugin/issues/new)