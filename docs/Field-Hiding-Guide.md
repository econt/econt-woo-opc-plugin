# Ръководство за скриване на полета / Field Hiding Guide

**Версия:** 3.0.4+
**Приложимо за:** Classic Checkout и Block Checkout

---

## 📋 Съдържание / Table of Contents

1. [Какво е селективно скриване на полета?](#какво-е-селективно-скриване-на-полета)
2. [Защо да използвам тази функция?](#защо-да-използвам-тази-функция)
3. [Бърз старт](#бърз-старт)
4. [Настройки стъпка по стъпка](#настройки-стъпка-по-стъпка)
5. [Примери за конфигурация](#примери-за-конфигурация)
6. [Разширени настройки](#разширени-настройки)
7. [Персонализирани CSS селектори](#персонализирани-css-селектори)
8. [Съвместимост с теми](#съвместимост-с-теми)
9. [Отстраняване на проблеми](#отстраняване-на-проблеми)
10. [Често задавани въпроси](#често-задавани-въпроси)

---

## Какво е селективно скриване на полета?

**Селективното скриване на полета** е функционалност, която ви позволява да контролирате кои точно полета от формата за поръчка (checkout) да се скрият, когато клиентът избере доставка с Еконт.

### Преди (версия < 3.0.4):
- Целият блок `#customer_details` се скриваше
- Всички billing и shipping полета изчезваха
- Нямаше контрол върху отделните полета

### Сега (версия 3.0.4+):
- ✅ Изберете конкретни полета за скриване
- ✅ Оставете важни полета видими (напр. имейл)
- ✅ Добавете персонализирани селектори за вашата тема
- ✅ Работи както с класически, така и с block checkout

---

## Защо да използвам тази функция?

### 🎯 Предимства:

1. **По-добро потребителско изживяване**
   - Клиентите виждат само релевантните полета
   - По-малко объркване
   - По-бързо попълване на поръчката

2. **Гъвкавост**
   - Можете да оставите имейл видим за регистрация
   - Контролирайте какво да скривате за различни теми
   - Лесна персонализация

3. **Автоматично попълване**
   - Скритите полета се попълват автоматично от Econt формата
   - Няма нужда клиентът да въвежда данните два пъти
   - По-малко грешки при въвеждане

4. **Съвместимост**
   - Работи с всички WooCommerce теми
   - Поддръжка за Elementor, Divi и други page builders
   - Работи както с класически, така и с block checkout

---

## Бърз старт

### За нетърпеливите 🚀

1. **Отидете на:** WordPress Admin → **Settings → Econt Delivery**

2. **Намерете секцията:** "Hidden Billing Fields"

3. **Изберете полетата за скриване:**
   ```
   ☑ First Name
   ☑ Last Name
   ☑ Country
   ☑ Address 1
   ☑ City
   ☑ State/Region
   ☑ Phone
   ☐ Email (оставете видимо!)
   ```

4. **Кликнете:** Save Changes

5. **Тествайте:** Отидете на checkout и изберете Econt доставка

**Готово!** 🎉

---

## Настройки стъпка по стъпка

### 1️⃣ Достъп до настройките

**Път:** WordPress Admin → Settings → Econt Delivery

**Намерете следните секции:**
- Hidden Billing Fields
- Hidden Shipping Fields
- Custom Hidden Selectors

---

### 2️⃣ Hidden Billing Fields (Скрити полета за плащане)

Тази секция контролира кои полета за плащане да се скрият.

#### Налични полета:

| Поле | Описание | Препоръка |
|------|----------|-----------|
| **First Name** | Име | ☑ Скрий |
| **Last Name** | Фамилия | ☑ Скрий |
| **Company** | Фирма | ☐ Зависи от бизнеса |
| **Country** | Държава | ☑ Скрий |
| **Address 1** | Адрес 1 | ☑ Скрий |
| **Address 2** | Адрес 2 | ☑ Скрий |
| **City** | Град | ☑ Скрий |
| **State/Region** | Област | ☑ Скрий |
| **Postcode** | Пощенски код | ☑ Скрий |
| **Phone** | Телефон | ☑ Скрий |
| **Email** | Имейл | ☐ **Не скривайте!** |

#### 💡 Важни забележки:

**Email поле:**
- **НЕ** скривайте email полето!
- Необходимо е за създаване на потребителски акаунт
- Необходимо е за изпращане на потвърждение за поръчка
- Еконт не попълва автоматично email

**Company поле:**
- Ако работите само с физически лица → Скрийте
- Ако работите с фирми → Оставете видимо
- Или използвайте условна логика

---

### 3️⃣ Hidden Shipping Fields (Скрити полета за доставка)

Тази секция работи само ако имате активирана опцията **"Ship to a different address"** (Доставка на различен адрес).

#### Налични полета:

Същите като billing полета, без:
- Email
- Phone

#### Препоръка:
Изберете **същите полета** както за billing, ако използвате различни адреси за доставка.

---

### 4️⃣ Custom Hidden Selectors (Персонализирани селектори)

Разширена настройка за персонализация на теми.

**Формат:** Един CSS селектор на ред

**Примери:**
```css
.custom-field-wrapper
#special_field_row
.my-theme-custom-field
```

**Подробности:** Вижте секцията [Персонализирани CSS селектори](#персонализирани-css-селектори)

---

## Примери за конфигурация

### Пример 1: Стандартен онлайн магазин

**Сценарий:** Продавате физически продукти на индивидуални клиенти.

**Конфигурация:**
```
Hidden Billing Fields:
☑ First Name
☑ Last Name
☑ Country
☑ Address 1
☑ City
☑ State/Region
☑ Phone
☐ Email
☐ Company

Hidden Shipping Fields:
☑ First Name
☑ Last Name
☑ Country
☑ Address 1
☑ City
☑ State/Region

Custom Hidden Selectors:
(оставете празно)
```

---

### Пример 2: B2B магазин (бизнес към бизнес)

**Сценарий:** Продавате на фирми и имате нужда от Company поле.

**Конфигурация:**
```
Hidden Billing Fields:
☑ First Name
☑ Last Name
☑ Country
☑ Address 1
☑ City
☑ State/Region
☑ Phone
☐ Email
☐ Company (оставете видимо!)

Hidden Shipping Fields:
☑ First Name
☑ Last Name
☑ Country
☑ Address 1
☑ City
☑ State/Region
☐ Company (оставете видимо!)

Custom Hidden Selectors:
(оставете празно)
```

---

### Пример 3: Минималистична конфигурация

**Сценарий:** Искате да скриете само най-основните полета.

**Конфигурация:**
```
Hidden Billing Fields:
☑ First Name
☑ Last Name
☑ Address 1
☑ City
☐ Country (може да остане видимо)
☐ State/Region (може да остане видимо)
☐ Phone (може да остане видимо)
☐ Email

Hidden Shipping Fields:
(не избирайте нищо)

Custom Hidden Selectors:
(оставете празно)
```

---

### Пример 4: Максимална конфигурация

**Сценарий:** Искате да скриете максимум полета.

**Конфигурация:**
```
Hidden Billing Fields:
☑ First Name
☑ Last Name
☑ Company
☑ Country
☑ Address 1
☑ Address 2
☑ City
☑ State/Region
☑ Postcode
☑ Phone
☐ Email

Hidden Shipping Fields:
☑ First Name
☑ Last Name
☑ Company
☑ Country
☑ Address 1
☑ Address 2
☑ City
☑ State/Region
☑ Postcode

Custom Hidden Selectors:
(зависи от темата)
```

---

## Разширени настройки

### Backward Compatibility (Обратна съвместимост)

**Какво става ако НЕ изберете нито едно поле?**

- Плъгинът ще използва **старото поведение**
- Целият `#customer_details` контейнер ще бъде скрит
- Това е за съвместимост със стари инсталации

**Препоръка:** Винаги изберете поне едно поле за оптимално поведение.

---

### Block Checkout vs Classic Checkout

**Важно:** Конфигурацията е **една и съща** за двата типа checkout!

#### Автоматично разпознаване:

**Classic Checkout селектори:**
```css
#billing_first_name_field
#billing_last_name_field
#shipping_city_field
```

**Block Checkout селектори:**
```css
#billing-first_name
#billing-last_name
#shipping-city
.wc-block-components-text-input
.wc-block-components-address-form__field
```

Плъгинът **автоматично** използва правилните селектори!

---

### Debug Mode (Режим за отстраняване на грешки)

**Как да активирам debug mode?**

Добавете `?econt_debug=1` към URL на checkout:
```
https://yoursite.com/checkout/?econt_debug=1
```

**Какво прави:**
- Показва debug съобщения в browser console
- Показва кои полета са скрити
- Показва кои селектори се използват
- Полезно за troubleshooting

**Как да видя съобщенията:**
1. Натиснете `F12` в browser
2. Отидете на таб **Console**
3. Търсете съобщения започващи с `[ECONT]` или `[FIELDS]`

---

## Персонализирани CSS селектори

### Какво са CSS селекторите?

CSS селекторите са начин да идентифицирате HTML елементи на страницата.

**Типове селектори:**

| Тип | Пример | Описание |
|-----|--------|----------|
| **Class** | `.my-class` | Избира елементи с клас "my-class" |
| **ID** | `#my-id` | Избира елемент с ID "my-id" |
| **Element** | `div` | Избира всички div елементи |
| **Descendant** | `.parent .child` | Избира child вътре в parent |
| **Attribute** | `[data-field="custom"]` | Избира елементи с атрибут |

---

### Как да намеря правилния селектор?

#### Метод 1: Browser DevTools (Препоръчан)

**Стъпки:**

1. **Отворете checkout страницата**
2. **Натиснете F12** (отваря DevTools)
3. **Кликнете на иконата за инспекция** (горен ляв ъгъл)
4. **Кликнете върху полето** което искате да скриете
5. **Вижте HTML** в DevTools:
   ```html
   <p class="form-row form-row-wide my-custom-field" id="billing_custom_field">
   ```
6. **Копирайте class или ID:**
   - Class: `.my-custom-field`
   - ID: `#billing_custom_field`

---

#### Метод 2: View Page Source

1. Отворете checkout страницата
2. Кликнете **десен бутон → View Page Source**
3. Натиснете **Ctrl+F** и търсете име на полето
4. Намерете HTML код и копирайте class/ID

---

### Примери за персонализирани селектори

#### За Elementor теми:

```css
.elementor-field-group-billing_vat
.elementor-widget-woocommerce-checkout-page .my-field
.elementor-element-abc123
```

#### За Divi теми:

```css
.et_pb_contact_field_wrapper
#et_pb_custom_billing_field
.et_pb_row .custom-field
```

#### За Astra тема:

```css
.ast-checkout-custom-field
.ast-billing-fields .my-custom-field
```

#### За Storefront тема:

```css
.storefront-billing-field-custom
#custom_checkout_field_wrapper
```

#### За custom полета от plugins:

```css
.woocommerce-billing-fields__field-wrapper--my_plugin_field
#my_plugin_custom_field_row
[data-field="my_custom_field"]
```

---

### Множество селектори

**Формат:** Един селектор на ред

**Пример:**
```
.custom-field-1
.custom-field-2
#special-field
.my-theme-wrapper .nested-field
```

**Всеки ред** ще бъде обработен отделно.

---

## Съвместимост с теми

### WooCommerce по подразбиране ✅

**Работи директно без допълнителна настройка.**

**Селектори:**
- Classic: `#billing_field_name_field`
- Block: `#billing-field_name`

---

### Elementor Pro ✅

**Работи с малка конфигурация.**

**Какво трябва да направите:**

1. Изберете стандартните полета
2. Добавете Elementor-специфични wrapper-и в Custom Selectors:
   ```css
   .elementor-widget-woocommerce-checkout-page
   ```

**Често срещани Elementor селектори:**
```css
.elementor-field-group-billing_first_name
.elementor-field-group-shipping_city
.elementor-widget-form .custom-field
```

**Важно:** Elementor често wrap-ва полетата в допълнителни div-ове.

---

### Divi Theme ✅

**Работи с малка конфигурация.**

**Добавете в Custom Selectors:**
```css
.et_pb_wc_checkout_billing
.et_pb_contact_field_wrapper
```

**Специфични за Divi:**
```css
.et_pb_row .et_pb_column .woocommerce-billing-fields
```

---

### Flatsome Theme ✅

**Работи директно, понякога се нуждае от персонализация.**

**Custom Selectors (ако е нужно):**
```css
.flatsome-checkout-fields
.checkout-form-custom-field
```

---

### Astra Theme ✅

**Работи директно без допълнителна настройка.**

**Ако използвате Astra Pro custom fields:**
```css
.ast-checkout-custom-field
.astra-custom-billing-field
```

---

### Storefront ✅

**Работи директно без допълнителна настройка.**

WooCommerce официална тема - пълна съвместимост.

---

### Custom Themes ⚠️

**За custom теми:**

1. **Използвайте DevTools** да намерите селекторите
2. **Тествайте внимателно** на checkout страницата
3. **Добавете селекторите** в Custom Hidden Selectors

**Често срещани проблеми:**
- Custom wrapper div-ове
- JavaScript-генерирани полета
- Ajax-динамични полета

**Решение:** Debug mode + DevTools inspection

---

## Отстраняване на проблеми

### Проблем 1: Полето не се скрива

**Симптоми:**
- Избрали сте поле в настройките
- Полето все още е видимо на checkout

**Решения:**

#### Стъпка 1: Изчистете cache
```bash
# WordPress cache
wp cache flush

# Browser cache
Ctrl+Shift+Delete → Clear Browsing Data
```

#### Стъпка 2: Проверете селектора
1. Отворете DevTools (F12)
2. Намерете полето в HTML
3. Проверете дали class/ID са правилни
4. Ако са различни → добавете в Custom Selectors

#### Стъпка 3: Проверете CSS конфликти
1. Отворете DevTools (F12)
2. Намерете полето
3. Виж дали има CSS правило, което override-ва `display: none`

**Пример за fix:**
```css
/* Добавете в Appearance → Customize → Additional CSS */
.my-custom-field.econt-hidden-field {
    display: none !important;
}
```

#### Стъпка 4: Проверете JavaScript грешки
1. Отворете Console (F12)
2. Търсете червени error съобщения
3. Ако има грешки → може да блокират скриването

---

### Проблем 2: Полето се показва при смяна на метод на доставка

**Симптоми:**
- Полето се скрива правилно при зареждане
- Когато смените доставката на друг метод и обратно → полето се появява

**Решения:**

#### Проверете за JavaScript конфликти
```javascript
// Отворете Console и проверете:
console.log(window.econtFieldConfig);
// Трябва да видите вашата конфигурация
```

#### Деактивирайте други plugins временно
- Конфликт с други checkout plugins?
- Деактивирайте един по един и тествайте

---

### Проблем 3: Block checkout - полетата не се скриват

**Симптоми:**
- Работи на classic checkout
- НЕ работи на block checkout

**Решения:**

#### Стъпка 1: Проверете дали имате build файла
```bash
# Проверете дали файлът съществува:
ls -la build/blocks/checkout.js
```

**Ако липсва:**
```bash
cd /path/to/plugin
npm install
npm run build
```

#### Стъпка 2: Изчистете cache
- Browser cache
- WordPress cache
- WooCommerce cache

#### Стъпка 3: Активирайте debug mode
```
https://yoursite.com/checkout/?econt_debug=1
```

Вижте в Console дали има съобщения за скриване на полета.

---

### Проблем 4: Имейл полето е скрито

**Симптоми:**
- Клиентите не могат да създадат акаунт
- Не получават confirmation email

**Решение:**
1. Отидете в Settings → Econt Delivery
2. Намерете "Hidden Billing Fields"
3. **ОТМЕТНЕТЕ** Email checkbox
4. Save Changes

**Важно:** Винаги оставяйте Email видимо!

---

### Проблем 5: Custom селектор не работи

**Симптоми:**
- Добавили сте custom селектор
- Полето не се скрива

**Решения:**

#### Проверете синтаксиса
```css
✅ Правилно:
.my-custom-field
#special_field_id
.parent .child

❌ Грешно:
my-custom-field (липсва .)
#special_field_id; (излишна ;)
.parent > .child:hover (твърде специфично)
```

#### Тествайте селектора в Console
```javascript
// В browser console:
document.querySelectorAll('.my-custom-field')
// Трябва да върне вашите елементи
```

#### Използвайте по-общ селектор
Вместо:
```css
.woocommerce-billing-fields__field-wrapper.my-custom-field-wrapper
```

Пробвайте:
```css
.my-custom-field-wrapper
```

---

## Често задавани въпроси

### 1. Мога ли да използвам тази функция с block checkout?

**Да!** Версия 3.0.4+ поддържа както classic, така и block checkout.

Конфигурацията е една и съща за двата типа.

---

### 2. Какво става ако не изберем нито едно поле?

Плъгинът ще използва **старото поведение** - целият `#customer_details` контейнер ще бъде скрит.

Това е за **обратна съвместимост** със стари инсталации.

---

### 3. Трябва ли да rebuild-вам JavaScript след промяна в настройките?

**НЕ!**

Rebuild е нужен само ако променяте **source код** на JavaScript файловете в `/src/blocks/`.

Промените в admin настройките се прилагат **веднага** след Save.

---

### 4. Мога ли да скрия само shipping полета, но не и billing?

**Да!**

Просто **не избирайте** нищо в "Hidden Billing Fields" и изберете полета в "Hidden Shipping Fields".

---

### 5. Работи ли с custom checkout plugins?

**Зависи.**

Повечето checkout plugins са съвместими, но някои може да имат проблеми.

**Тествани plugins:**
- ✅ WooCommerce Checkout Field Editor
- ✅ Flexible Checkout Fields
- ✅ Checkout Manager
- ⚠️ Други - трябва тестване

---

### 6. Как да скрия само за определени продукти?

**Текуща версия:** Това НЕ е поддържано.

**Планирано за v3.0.5:**
- Per-product field hiding rules
- Conditional field hiding

---

### 7. Мога ли да скрия VAT/ЕИК полета?

**Да!**

Ако VAT/ЕИК полетата са добавени от plugin или custom code:

1. Намерете техния CSS селектор с DevTools
2. Добавете в "Custom Hidden Selectors"

**Пример:**
```css
#billing_vat_field
.woocommerce-billing-fields__field-wrapper--vat_number
```

---

### 8. Работи ли с One Page Checkout plugins?

**Обикновено да**, но зависи от plugin-а.

**Препоръка:** Тествайте внимателно преди да пуснете на production.

---

### 9. Скритите полета се валидират ли?

**Да!**

WooCommerce валидацията **продължава да работи** за всички полета, дори скритите.

Скритите полета се попълват автоматично от Econt формата преди submit.

---

### 10. Как да експортирам/импортирам конфигурацията?

**Текуща версия:** Трябва да копирате ръчно.

**Планирано за v3.0.5:**
- Import/Export configuration templates
- Predefined templates

---

## Поддръжка и помощ

### Ресурси:

📚 **Документация:**
- README.md
- Troubleshooting.md
- BUILD_INSTRUCTIONS.md
- CHANGELOG_3.0.4.md

🐛 **Докладване на проблеми:**
- GitHub Issues: [Create Issue](https://github.com/econt/econt-woo-opc-plugin/issues/new)

💬 **Community Support:**
- WordPress.org Forums

📧 **Contact:**
- support@econt.com

---

## Версия и история

**Текуща версия:** 3.0.4

**Промени:**
- ✅ Добавено селективно скриване на полета
- ✅ Поддръжка за classic checkout
- ✅ Поддръжка за block checkout
- ✅ Custom CSS selectors
- ✅ Debug mode
- ✅ Пълна документация

**Следваща версия (3.0.5):**
- Visual field selector
- Import/export templates
- Per-product rules
- Conditional hiding

---

**Автор:** Econt Development Team
**Дата:** 2025-10-08
**Лиценз:** Same as plugin license

---

**🎉 Благодарим че използвате Econt WooCommerce Plugin! 🎉**