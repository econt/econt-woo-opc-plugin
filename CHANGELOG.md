# Changelog

All notable changes to the Econt Delivery OneCheckout plugin will be documented in this file.

---

## Version 3.1.0 - 03.12.2025

### 🐛 Bug Fixes
- **Free Shipping Display:** Fixed issue where "Calculating..." was shown instead of "Free" when Econt returns 0 shipping price
  - When iframe returns 0 as shipping price, now correctly displays "Free" (Безплатно) instead of "Calculating..."
  - Improved shipping price detection logic to distinguish between:
    - Not yet calculated (shows "Calculating...")
    - Calculated as free/0 (shows "Free")
  - Applied to both shipping options section and order summary sidebar

### 🔧 Technical Improvements
- Enhanced `checkShippingPrice()` function with better conditional logic
- Updated shipping price display to properly handle free delivery from Econt platform

---

## Version 3.0.9 - 21.11.2025

### ✨ New Features
- **Avada Theme Builder Support:** Added full compatibility with Avada (Fusion Builder)
  - Admin panel now correctly detects Avada as page builder
  - Checkout form type properly identified as "Page Builder"
  - Classic jQuery scripts work seamlessly with Avada checkout pages

### 🐛 Bug Fixes
- **Initial Page Load:** Fixed iframe and field hiding not working on initial page load for page builders
  - Implemented smart retry mechanism with 3-tier initialization (immediate, 500ms, 1500ms)
  - Ensures Econt iframe displays correctly when shipping method is pre-selected
  - Customer details fields now hide properly on first page load
- **CSS Asset Path:** Fixed incorrect loader.gif path reference from old plugin directory

### 🔧 Technical Improvements
- Added Avada (Fusion Builder) detection via three methods:
  - `_fusion` post meta check
  - `fusion_builder_status` meta verification
  - Content scanning for `[fusion_` shortcodes
- Enhanced `is_using_block_checkout()` with explanatory comment for Avada behavior
- Improved JavaScript initialization timing for page builders (Avada, Elementor, Divi, etc.)
- Updated CSS loader path: `deliver-with-econt-rm` → `econt-woo-opc-plugin`

---

## Version 3.0.8 - 20.11.2025

### 🐛 Bug Fixes
- **Block Checkout:** Fixed order summary sidebar not updating shipping price on initial page load when Econt shipping is already selected
- Shipping price display now properly updates in order summary sidebar when checkout refreshes/updates
- Implemented polling mechanism to ensure DOM elements are ready before updating shipping price labels

### 🔧 Technical Changes
- Modified `useEffect` hook in block checkout to watch `cartData` and `shippingData` changes
- Added interval-based DOM checking (200ms intervals, up to 3 seconds) to handle asynchronous rendering
- Improved `updateShippingPriceDisplay()` function to reliably update both shipping options and order summary sections

---

## Version 3.0.7 - 30.10.2025

### 🐛 Bug Fixes
- **HPOS/CPT Compatibility:** Fixed waybill ID storage and retrieval to support both HPOS (High-Performance Order Storage) and CPT (Custom Post Types) installations
- Waybill IDs now correctly save and retrieve on non-HPOS sites

### ✨ Enhancements
- **Dual-write mechanism:** Waybill data is now saved in both HPOS and CPT storage systems for maximum compatibility
- **Centralized helper method:** Created `get_order_waybill_id()` helper for consistent waybill ID retrieval across all admin functions
- Ensures seamless operation during migration between CPT and HPOS storage systems

### 🔧 Technical Changes
- Modified `Delivery_With_Econt::save_waybill_id()` to use both `$order->update_meta_data()` and `update_post_meta()`
- Added `Delivery_With_Econt_Admin::get_order_waybill_id()` private static method
- Updated `add_waybill_column_content()` and `add_custom_html_to_order_details()` to use helper method

---

## Version 3.0.6 - 26.10.2025

### ✨ Features
- **Plugin Status Check:** Added comprehensive diagnostics section in settings page
  - Automatic plugin version verification
  - Shipping zones configuration check
  - Payment methods compatibility verification
  - Checkout page configuration detection
  - Page builder detection (Elementor, Divi, etc.)
- **Performance:** AJAX batch processing for product weight verification (handles 1000+ products efficiently)
- **Verification:** Added iframe container verification with WooCommerce checkout detection

### 📚 Documentation
- Enhanced Troubleshooting.md with 10+ screenshots for step-by-step verification
- Created Bulgarian documentation (Status-Check.md) with detailed troubleshooting guide

---

## Version 3.0.5 - 24.10.2025

### 🐛 Bug Fixes
- **WooCommerce Compatibility:** Resolved "doing it wrong" warning for early cart access during payment gateway initialization
- Moved virtual product check from `woocommerce_payment_gateways` filter to `is_available()` method in payment gateway class

---

## Version 3.0.4 - 08.10.2025

### 🎯 New Features - Selective Field Hiding for Classic Checkout

Previously, when Econt shipping was selected, the entire `#customer_details` container was hidden. This version provides granular control over which individual checkout fields to hide.

**Key Features:**
- ✅ Choose specific billing fields to hide (first name, last name, country, address, city, state, phone, email, company)
- ✅ Choose specific shipping fields to hide (when "Ship to different address" is enabled)
- ✅ Add custom CSS selectors for theme-specific or custom fields
- ✅ Backward compatible - if no fields selected, entire container is hidden (legacy behavior)
- ✅ Works with standard WooCommerce checkout
- ✅ Compatible with custom themes and page builders (Elementor, Divi, etc.)

**Benefits:**
- Better user experience - only hide fields that Econt will auto-fill
- Keep important fields visible (e.g., email for account creation)
- Theme compatibility - add custom selectors for modified themes
- Flexibility for different store configurations

### 🔧 Changes

#### Admin Interface
- **Added:** "Hidden Billing Fields" checkbox group with 11 standard WooCommerce fields
- **Added:** "Hidden Shipping Fields" checkbox group with 9 standard WooCommerce fields
- **Added:** "Custom Hidden Selectors" textarea for advanced customization
- **Improved:** Admin field descriptions with helpful examples and recommendations
- **Improved:** Visual styling with info boxes explaining each setting

#### Frontend (Classic Checkout)
- **Modified:** `toggleFieldsBasedOnShippingMethod()` now hides specific fields instead of entire container
- **Added:** `getFieldConfig()` function to retrieve configuration from PHP
- **Added:** `buildFieldSelectors()` function to generate CSS selectors from configuration
- **Added:** `.econt-hidden-field` CSS class for hidden fields
- **Improved:** Field visibility toggling when switching between shipping methods

#### Frontend (Block Checkout)
- **Added:** Field hiding functionality to `/src/blocks/checkout/EcontDelivery.js`
- **Added:** `getFieldConfig()` function for block checkout
- **Added:** `buildFieldSelectors()` function with block-specific selectors
- **Added:** `hideFields()` and `showFields()` functions for block checkout
- **Added:** useEffect hooks to manage field visibility on shipping method changes
- **Added:** Support for WooCommerce Blocks field structure (#billing-field_name, etc.)
- **Added:** Debug mode support with `?econt_debug=1` URL parameter

#### Backend
- **Modified:** `bootstrap.php` to pass field configuration to JavaScript via `wp_localize_script` (Classic)
- **Modified:** `class-econt-blocks.php` to pass field configuration to JavaScript (Block)
- **Added:** Field configuration data structure: `hiddenBillingFields`, `hiddenShippingFields`, `customHiddenSelectors`
- **Added:** Input sanitization for new settings fields
- **Added:** Settings callbacks in `class-delivery-with-econt-options.php`
- **Added:** `econtData.fieldConfig` for block checkout

#### Documentation
- **Added:** Comprehensive troubleshooting section for field hiding configuration
- **Added:** Examples for Elementor, Divi, and custom themes
- **Added:** Step-by-step guide for finding CSS selectors using browser DevTools
- **Added:** Best practices and recommendations for field selection
- **Added:** Block checkout specific documentation in Troubleshooting.md
- **Added:** BUILD_INSTRUCTIONS.md with detailed build process guide
- **Updated:** Documentation to reflect block checkout support

### 🔄 Compatibility
- **WordPress:** 5.8+ (tested up to 6.7)
- **WooCommerce:** 8.0+ (tested up to 9.4)
- **PHP:** 7.4+ (tested up to 8.3)
- **Checkout Type:** ✅ Classic Checkout AND ✅ Block Checkout
- **Node.js:** 14+ required for building block checkout (development only)

---

## Version 3.0.3 - 17.09.2025

### 🐛 Bug Fixes
- Fixed error when submitting coupon in classic checkout

---

## Version 3.0.2 - 05.09.2025

### 🐛 Bug Fixes
- Fixed calculating text errors

### ✨ Features
- Created EcontPay Gutenberg native checkout block

---

## Version 3.0.1 - 29.08.2025

### ✨ Features
- Display "Calculating..." text instead of "Free" when cookie with price is not yet set

---

## Version 3.0.0 - 27.08.2025

### ✨ Features
- Added bulk action for syncing Econt waybills

---

## Version 2.1.0 - 20.08.2025

### ✨ Features
- Updated Admin columns to work with new HPOS orders

### 🐛 Bug Fixes
- Fixed waybill order meta handling

---

## Version 2.0.9 - 12.08.2025

### ✨ Features
- Hide Econt shipping method and validations when cart contains only virtual products

---

## Version 2.0.8 - 07.08.2025

### ✨ Enhancements
- Enhanced field update functions with better React compatibility
- Added multiple field selectors for improved theme compatibility
- Improved event triggering for block-based checkouts

---

## Version 2.0.7 - 07.08.2025

### 🔧 Changes
- Disabled checkout form selector options in block-based checkouts

---

## Version 2.0.6 - 04.08.2025

### ✨ Features
- Added additional settings field to control checkout form selector

---

## Version 2.0.5 - 17.07.2025

### 🐛 Bug Fixes
- **Block checkout:** Fixed cookie store customer ID
- Added additional delay and check to fill out billing and shipping address fields after Econt form is submitted

---

## Version 2.0.4 - 14.07.2025

### ✨ Features
- **Block checkout:** Added console log function to debug with GET parameter `?econt_debug=1`

### 🐛 Bug Fixes
- Fixed multiple iframe initialization

---

## Version 2.0.3 - 13.07.2025

### 🔧 Changes
- **Block checkout:** Bind checkout initialization scripts to `init_checkout` instead of `jQuery.ready` or `updated_checkout`

---

## Version 2.0.2 - 08.07.2025

### 🔧 Changes
- Bound initial load of iframe to `update_checkout` event

---

## Version 2.0.1 - 31.05.2025

### 🐛 Bug Fixes
- Fixed iframe not closing after successful price calculation

---

## Version 2.0.0 - 27.05.2025

### ✨ Features
- Send data to external platform when plugin is updated
- Force send data functionality

---

## Version 1.1.9 - 08.05.2025

### 🐛 Bug Fixes
- Fixed script return when server response shipping_price is 0
- Fixed fill out correct user data when sending order to Econt system

---

## Version 1.1.8 - 22.04.2025

### 🐛 Bug Fixes
- Fixed error while server validates shipping price

---

## Version 1.1.7 - 15.04.2025

### 🐛 Bug Fixes
- **Block-based checkout:** Fixed sending order data to Econt platform

---

## Version 1.1.6

### 🐛 Bug Fixes
- **Classic checkout:** Fixed switching between default fields and Econt iframe when changing shipping methods

---

## Version 1.1.5

### ✨ Features
- Added preloader to iframe loading

### 🐛 Bug Fixes
- Fixed React translates

---

## Version 1.1.41

### 🔧 Changes
- Updated Bulgarian system translates

---

## Version 1.1.4

### ✨ Features
- Added custom version auto-updater via public GitHub repository

---

## Version 1.1.3

### ✨ Features
- Added support for block-based checkout (classic checkout is still recommended)

---

## Version 1.1.2

### 🔧 Changes
- Send to iFrame `total_items` (only products price) instead of `total_price` (total cart price with taxes and shipping costs)

---

## Version 1.1.1

### 🐛 Bug Fixes
- Fixed total price and weight sent to iframe
- Updated update checkout function for faster reload

---

## Version 1.1

### ✨ Features
- Added new Gutenberg React block to use in checkout and work well with block-based themes

---

## Version 1.0.72 - 21.03.2025

### 🔧 Changes
- Removed `confirm_txt` parameter to AJAX. This allows iframe to manage button text by selected language

---

## Version 1.0.71 - 21.03.2025

### 🔧 Changes
- Updated path to load Text domain

---

## Version 1.0.7 - 18.03.2025

### ✨ Features
- Added new translational string for Confirm button
- Updated language translations

---

## Version 1.0.6

### 🐛 Bug Fixes
- Fixed elements overlapping during checkout on small screens

---

## Version 1.0.5

### 🐛 Bug Fixes
- Fixed priority for action `delivery_with_econt_sync_order`
- Fixed form submit selector

---

## Version 1.0.4

### 🐛 Bug Fixes
- Bug fix

---

## Version 1.0.3

### 🐛 Bug Fixes
- Checkout fix for digital products

---

## Version 1.0.2

### ✨ Features
- Show order notes in checkout

---

## Version 1.0.1

### 🐛 Bug Fixes
- Bug fix

---

## Version 1.0.0

### 🎉 Initial Release
- Production ready version