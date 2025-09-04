# Econt WooCommerce Плъгин - Официална Интеграция за Доставки

[![Последна версия](https://img.shields.io/github/v/release/econt/econt-woo-opc-plugin)](https://github.com/econt/econt-woo-opc-plugin/releases)
[![WordPress съвместимост](https://img.shields.io/badge/WordPress-6.0+-blue)](https://wordpress.org)  
[![WooCommerce съвместимост](https://img.shields.io/badge/WooCommerce-9.0+-blueviolet)](https://woocommerce.com)
[![Лиценз](https://img.shields.io/badge/License-GPLv2-blue)](LICENSE)
[![PHP версия](https://img.shields.io/badge/PHP-8.0+-777bb4)](https://php.net)

**Безпроблемно интегрирайте услугите за доставка на Econt Express с вашия WooCommerce магазин за автоматизирано управление на пратки, калкулиране на цени в реално време и подобрено потребителско изживяване.**

**Препоръчваме да използвате последната версия на плъгина за най-добра функционалност и сигурност.**

** PDF документация с инструкции за инсталация и настройка: [Integrations_WooCommerce_documents_manual_version_3.2_bg.pdf](Integrations_WooCommerce_documents_manual_version_3.2_bg.pdf)**

---

## 🚀 Основни функции

- ✅ **Калкулиране на цени в реalno време** чрез Econt API
- ✅ **Автоматично генериране на товарителници** при потвърждение на поръчка  
- ✅ **Поддръжка на блокови и класически checkout**
- ✅ **Интеграция за проследяване** с уникални tracking номера
- ✅ **Администраторско управление на поръчки** със специализирани колони и действия
- ✅ **Bulk операции** за синхронизиране на товарителници
- ✅ **Econt Pay интеграция** за онлайн плащания
- ✅ **Автоматични обновления** от GitHub repository
- ✅ **HPOS съвместимост** (High-Performance Order Storage)

## 📋 Изисквания

| Компонент | Минимална версия | Препоръчана |
|-----------|----------------|-------------|
| **WordPress** | 6.0+ | Последна стабилна |
| **WooCommerce** | 9.0+ | Последна стабилна |
| **PHP** | 8.0+ | 8.1+ |
| **HTTPS** | Задължително | SSL сертификат |
| **Econt профил** | Активен договор | [Регистрирайте се тук](https://delivery.econt.com/) |

### 📦 Изисквания за продукти
- Всички физически продукти трябва да имат **конфигурирано тегло** (в kg)
- Променливите продукти изискват тегло за всяка вариация
- Виртуалните продукти се изключват автоматично

---

## 📖 Документация

### 🏠 [**Wiki Начало**](https://github.com/econt/econt-woo-opc-plugin/wiki/) - Започнете тук!

### 📚 **Ръководства за потребители**
- **[📥 Ръководство за инсталация](https://github.com/econt/econt-woo-opc-plugin/wiki/Installation)** - Пълни инструкции за инсталация
- **[⚙️ Първоначална настройка](https://github.com/econt/econt-woo-opc-plugin/wiki/Initial-Setup)** - API конфигурация и първоначални настройки
- **[📦 Конфигурация на продукти](https://github.com/econt/econt-woo-opc-plugin/wiki/Product-Configuration)** - Настройка на продукти за доставка
- **[🔧 Отстраняване на проблеми](https://github.com/econt/econt-woo-opc-plugin/wiki/Troubleshooting)** - Чести проблеми и решения

---

## ⚡ Бърз старт

### 1. Инсталиране на плъгина
```bash
# Метод 1: Изтегляне от GitHub Releases
wget https://github.com/econt/econt-woo-opc-plugin/releases/latest/download/econt-woo-opc-plugin.zip

# Метод 2: Инсталиране чрез WP-CLI
wp plugin install https://github.com/econt/econt-woo-opc-plugin/releases/latest/download/econt-woo-opc-plugin.zip --activate
```

### 2. Конфигуриране на API настройки
1. Отидете на **Настройки → Econt Доставка**
2. Въведете вашия **Store ID** и **Private Key** от [Econt Delivery](https://delivery.econt.com/)
3. Изберете **Environment** (Demo за тестване, Production за реална работа)
4. Запазете и тествайте връзката

### 3. Активиране на метода за доставка
1. Отидете на **WooCommerce → Настройки → Доставка**
2. Добавете **Econt** към вашите зони за доставка
3. Конфигурирайте тарифи и ограничения

### 4. Настройка на продукти
1. Редактирайте вашите продукти и добавете **тегло** в kg
2. За променливи продукти, задайте тегло за всяка вариация
3. Запазете промените

**🎉 Готови сте!** Тествайте с демо поръчка, за да се уверите, че всичко работи правилно.

---

## 🔄 Обновления и поддръжка

Плъгинът поддържа **автоматични обновления** от този GitHub repository:
- Известия за обновления в WordPress admin
- Процес на обновяване с едно кликване
- Препоръки за backup преди обновления
- Release notes и changelogs

### Ръчен процес на обновяване
1. Изтеглете последната версия
2. Деактивирайте стария плъгин (настройките се запазват)
3. Изтрийте старите файлове на плъгина
4. Инсталирайте новата версия
5. Активирайте отново плъгина

---

## 🤝 Принос

Приветстваме приноса от общността!

### 🐛 **Съобщения за бъгове**
Намерили сте бъг? [Създайте issue](../../issues/new?template=bug_report.md) с:
- Подробно описание
- Стъпки за възпроизвеждане
- Системна информация (WordPress/WooCommerce/PHP версии)
- Screenshots, ако е приложимо

### 💡 **Заявки за функции**
Имате идея? [Започнете дискусия](../../discussions) или [създайте заявка за функция](../../issues/new?template=feature_request.md)

### 🔧 **Pull Requests**
1. Fork-нете repository-то
2. Създайте feature branch
3. Направете вашите промени
4. Добавете тестове, ако е приложимо
5. Подайте pull request

---

## 📞 Поддръжка и общност

### Официална поддръжка
- 📧 **Email**: developers@econt.com
- 🌐 **Уебсайт**: [econt.com/developers](https://econt.com/developers/)
- 📋 **Бизнес портал**: [delivery.econt.com](https://delivery.econt.com/)

### Ресурси на общността
- 💬 **GitHub Дискусии**: [Форум на общността](../../discussions)
- 🐛 **Tracker за проблеми**: [Съобщения за бъгове и функции](../../issues)
- 📖 **Документация**: [Wiki страници](../../wiki)

### Бизнес контакти
- 📞 **Продажби**: +359 700 10 715
- 📧 **Бизнес**: sales@econt.com
- 🏢 **Enterprise**: enterprise@econt.com

---

## 📄 Лиценз

Този проект е лицензиран под **GNU General Public License v2.0** - вижте файла [LICENSE](LICENSE) за подробности.

---

## 📊 Статистики на проекта

![GitHub issues](https://img.shields.io/github/issues/econt/econt-woo-opc-plugin)
![GitHub pull requests](https://img.shields.io/github/issues-pr/econt/econt-woo-opc-plugin)
![GitHub contributors](https://img.shields.io/github/contributors/econt/econt-woo-opc-plugin)
![GitHub last commit](https://img.shields.io/github/last-commit/econt/econt-woo-opc-plugin)

---

**⭐ Ако този плъгин помага на вашия бизнес, моля обмислете да дадете звезда на repository-то!**

**🔗 [Започнете с Wiki](../../wiki/Home) | [Изтеглете последната версия](../../releases/latest) | [Докладвайте проблем](../../issues/new)**