/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/blocks/checkout/EcontDelivery.js":
/*!**********************************************!*\
  !*** ./src/blocks/checkout/EcontDelivery.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_4__);
"use client";






const EcontDelivery = () => {
  // Debug mode check - looks for ?econt_debug=1 in URL
  const isDebugMode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("econt_debug") === "1" || urlParams.get("econt_debug") === "true";
  };

  // Debug logging function
  const debugLog = (category, message, data = null) => {
    if (!isDebugMode()) return;
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const prefix = `[ECONT-${category}] ${timestamp}:`;
    if (data) {
      console.group(prefix, message);
      console.log("Data:", data);
      console.groupEnd();
    } else {
      console.log(prefix, message);
    }
  };

  // Component instance counter for debugging
  const instanceId = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(Math.random().toString(36).substr(2, 9));
  debugLog("INIT", `EcontDelivery component initializing - Instance: ${instanceId.current}`);

  // Declare jQuery and wp variables
  const jQuery = window.jQuery;
  const wp = window.wp;

  // Helper function to get translation or fallback to the key
  const getTranslation = key => {
    if (typeof window.econtTranslations !== "undefined" && window.econtTranslations[key]) {
      return window.econtTranslations[key];
    }
    return key;
  };

  // Component state
  const [iframeUrl, setIframeUrl] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)("");
  const [globalShipmentPrices, setGlobalShipmentPrices] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)({
    cod: undefined,
    cod_e: undefined,
    no_cod: undefined
  });
  const [isEditing, setIsEditing] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);
  const [localShippingMethod, setLocalShippingMethod] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isEcontSelected, setIsEcontSelected] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [portalContainer, setPortalContainer] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isOrderButtonDisabled, setIsOrderButtonDisabled] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [isIframeLoading, setIsIframeLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(true);

  // Refs
  const isMountedRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(true);
  const messageListenerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const econtContainerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const ajaxInProgressRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(false); // Prevent duplicate AJAX requests
  const lastFormDataRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null); // Track last form data to prevent duplicates

  // Get data from WooCommerce store
  const {
    billingData,
    shippingData,
    cartData,
    selectedShippingMethod
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useSelect)(select => {
    debugLog("STORE", `useSelect hook called - Instance: ${instanceId.current}`);
    const store = select("wc/store/cart");
    if (!store) {
      return {
        billingData: {},
        shippingData: {},
        cartData: {},
        selectedShippingMethod: null
      };
    }
    let billing = {},
      shipping = {},
      cart = {},
      shippingMethod = null;
    try {
      // Try new API first
      billing = store.getCustomerData()?.billing || {};
      shipping = store.getCustomerData()?.shipping || {};
      const cartData = store.getCartData();

      // Calculate total weight from cart items
      const totalWeight = cartData.itemsWeight * 0.001;
      const finalWeight = totalWeight > 0 ? totalWeight : 1;
      cart = {
        total: Number.parseFloat(cartData.totals?.total_items) / 100 || 0,
        currency: store.getCartTotals()?.currency_code || "BGN",
        weight: finalWeight
      };
      const shippingRates = store.getShippingRates();
      shippingMethod = shippingRates?.[0]?.shipping_rates?.find(rate => rate.selected)?.method_id;
    } catch (e) {
      try {
        // Fallback to older API
        billing = store.getBillingData() || {};
        shipping = store.getShippingData() || {};
      } catch (e2) {
        // Silently fail
      }
    }
    return {
      billingData: billing,
      shippingData: shipping,
      cartData: cart,
      selectedShippingMethod: shippingMethod
    };
  }, []);
  const {
    setBillingAddress,
    setShippingAddress
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.useDispatch)("wc/store/cart");

  // Function to check if Econt shipping is selected
  const isEcontShippingSelected = () => {
    // First check the local state
    if (localShippingMethod && localShippingMethod.includes("econt")) {
      debugLog("CHECK", "Econt found in local shipping method", localShippingMethod);
      return true;
    }

    // Then check the store state
    if (selectedShippingMethod && (selectedShippingMethod === "delivery_with_econt" || selectedShippingMethod.includes("econt"))) {
      debugLog("CHECK", "Econt found in selected shipping method", selectedShippingMethod);
      return true;
    }

    // Check the DOM directly
    const econtRadio = document.querySelector('input[name^="shipping_method"][value*="econt"]:checked');
    if (econtRadio) {
      debugLog("CHECK", "Econt radio button found checked in DOM", econtRadio.value);
      return true;
    }

    // Check if we have an iframe URL
    if (iframeUrl && iframeUrl.length > 0) {
      debugLog("CHECK", "Econt detected via iframe URL", iframeUrl);
      return true;
    }
    return false;
  };

  // Function to find the shipping option container
  const findShippingOptionContainer = () => {
    const selectors = ["#shipping-option", ".wc-block-components-shipping-rates-control", ".shipping_method", ".woocommerce-shipping-methods", "#shipping_method"];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        debugLog("DOM", `Found shipping container with selector: ${selector}`);
        return element;
      }
    }
    debugLog("DOM", "No shipping container found");
    return null;
  };

  // Function to create a portal container after shipping options
  const createPortalContainerAfterShippingOption = () => {
    if (!isMountedRef.current) return null;

    // Find the shipping option element
    const targetElement = findShippingOptionContainer();
    if (!targetElement) return null;

    // Check if we already have a portal container
    let container = document.getElementById("econt-portal-container");

    // If no container exists, create one
    if (!container) {
      debugLog("PORTAL", "Creating new portal container");
      container = document.createElement("div");
      container.id = "econt-portal-container";
      // Insert after the shipping option
      if (targetElement.nextSibling) {
        targetElement.parentNode.insertBefore(container, targetElement.nextSibling);
      } else {
        targetElement.parentNode.appendChild(container);
      }
    } else {
      debugLog("PORTAL", "Using existing portal container");
    }
    return container;
  };

  // Function to disable/enable the place order button
  const togglePlaceOrderButton = disable => {
    debugLog("BUTTON", `Toggling place order button - disable: ${disable}`);
    const placeOrderButton = document.querySelector(".wc-block-components-checkout-place-order-button");
    if (placeOrderButton) {
      placeOrderButton.disabled = disable;

      // Add visual indication that the button is disabled
      if (disable) {
        placeOrderButton.style.opacity = "0.5";
        placeOrderButton.style.cursor = "not-allowed";
        placeOrderButton.title = getTranslation("Please complete Econt delivery details first");
      } else {
        placeOrderButton.style.opacity = "";
        placeOrderButton.style.cursor = "";
        placeOrderButton.title = "";
      }
      setIsOrderButtonDisabled(disable);
    }
  };

  // Function to get data from form and make AJAX request
  const getDataFromForm = async () => {
    debugLog("FORM", `Getting data from form - Instance: ${instanceId.current}`);
    if (!isMountedRef.current || !isEcontShippingSelected()) {
      debugLog("FORM", "Component not mounted or Econt not selected, skipping");
      return;
    }

    // Prevent duplicate AJAX requests
    if (ajaxInProgressRef.current) {
      debugLog("FORM", "AJAX request already in progress, skipping");
      return;
    }

    // Wait a moment for fields to be available
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get customer data from form
    const customerData = {
      first_name: document.querySelector("#shipping-first_name")?.value || document.querySelector("#billing-first_name")?.value || "",
      last_name: document.querySelector("#shipping-last_name")?.value || document.querySelector("#billing-last_name")?.value || "",
      company: document.querySelector("#shipping-company")?.value || document.querySelector("#billing-company")?.value || "",
      address_1: document.querySelector("#shipping-address_1")?.value || document.querySelector("#billing-address_1")?.value || "",
      city: document.querySelector("#shipping-city")?.value || document.querySelector("#billing-city")?.value || "",
      postcode: document.querySelector("#shipping-postcode")?.value || document.querySelector("#billing-postcode")?.value || "",
      phone: document.querySelector("#shipping-phone")?.value || document.querySelector("#billing-phone")?.value || "",
      email: document.querySelector("#email")?.value || document.querySelector("#shipping-email")?.value || document.querySelector("#billing-email")?.value || ""
    };
    debugLog("FORM", "Customer data extracted", customerData);

    // Check if we have enough data
    if (!customerData.first_name || !customerData.city) {
      debugLog("FORM", "Insufficient customer data, retrying in 1 second");
      if (isMountedRef.current) {
        setTimeout(getDataFromForm, 1000);
      }
      return;
    }

    // Process address information
    let isOfficeDelivery = false;
    let officeName = "";
    let streetAddress = "";
    if (customerData.address_1) {
      if (customerData.address_1.includes("Delivery to office:")) {
        isOfficeDelivery = true;
        officeName = customerData.address_1.replace("Delivery to office:", "").trim();
      } else if (customerData.address_1.includes("Delivery to address:")) {
        streetAddress = customerData.address_1.replace("Delivery to address:", "").trim();
      } else {
        streetAddress = customerData.address_1;
      }
    }

    // Prepare request params
    const params = {
      customer_name: `${customerData.first_name} ${customerData.last_name}`.trim(),
      customer_company: customerData.company,
      customer_address: streetAddress,
      customer_city_name: customerData.city,
      customer_post_code: customerData.postcode,
      customer_phone: customerData.phone,
      customer_email: customerData.email,
      office_name: isOfficeDelivery ? officeName : ""
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    // Add cart data
    const cartParams = {
      ...params,
      order_total: cartData.total || 0,
      order_currency: cartData.currency || "BGN",
      pack_count: 1,
      order_weight: cartData.weight
    };

    // Check if this is the same as the last request to prevent duplicates
    const formDataString = JSON.stringify(cartParams);
    if (lastFormDataRef.current === formDataString) {
      debugLog("FORM", "Same form data as last request, skipping AJAX");
      return;
    }
    lastFormDataRef.current = formDataString;
    ajaxInProgressRef.current = true;
    try {
      debugLog("AJAX", "Making AJAX request", cartParams);

      // Make AJAX request
      if (typeof jQuery !== "undefined") {
        // Set loading state when making the request
        setIsIframeLoading(true);
        const response = await jQuery.ajax({
          type: "POST",
          url: window.econtData.ajaxUrl,
          dataType: "json",
          data: {
            action: "woocommerce_delivery_with_econt_get_orderinfo",
            security: window.econtData.nonce,
            params: cartParams
          }
        });
        debugLog("AJAX", "AJAX response received", response);
        if (!response) {
          debugLog("AJAX", "No response received");
          return;
        }

        // Process URL
        let url;
        if (typeof response === "string") {
          url = response.split('"').join("").replace(/\\\//g, "/");
        } else if (typeof response === "object") {
          url = response.toString();
        } else {
          debugLog("AJAX", "Invalid response type");
          return;
        }

        // Set locale and build full URL
        const locale = document.documentElement.lang.split("-")[0] || "en";
        const validLocales = ["bg", "en", "gr", "ro"];
        const fullUrl = `${url}&module=onecheckout&lang=${validLocales.includes(locale) ? locale : "bg"}`;
        debugLog("AJAX", "Final URL constructed", fullUrl);

        // Update iframe with URL only if it's different
        if (fullUrl !== iframeUrl) {
          updateIframeWithUrl(fullUrl, true);
        } else {
          debugLog("IFRAME", "URL unchanged, skipping iframe update");
          setIsIframeLoading(false);
        }
      }
    } catch (error) {
      debugLog("AJAX", "AJAX request failed", error);
      setIsIframeLoading(false);
    } finally {
      ajaxInProgressRef.current = false;
    }
  };

  // Function to update iframe URL and visibility
  const updateIframeWithUrl = (url, isVisible = true) => {
    debugLog("IFRAME", `Updating iframe with URL: ${url}, visible: ${isVisible}`);
    if (!isMountedRef.current) return;

    // Update state
    setIframeUrl(url);
    setIsIframeLoading(true);

    // Apply URL to iframe element
    setTimeout(() => {
      if (!isMountedRef.current) return;
      const iframe = document.querySelector("#delivery_with_econt_iframe");
      if (iframe) {
        debugLog("IFRAME", "Iframe element found, setting src");
        iframe.src = url;
        if (isVisible) {
          iframe.style.display = "block";
          iframe.style.visibility = "visible";
          iframe.style.height = "500px";
        }

        // Add load event listener
        iframe.onload = () => {
          debugLog("IFRAME", "Iframe loaded successfully");
          try {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
            if (isMountedRef.current) {
              setIsIframeLoading(false);
            }
          } catch (error) {
            debugLog("IFRAME", "Cross-origin iframe loaded (expected)", error.message);
            if (isMountedRef.current) {
              setIsIframeLoading(false);
            }
          }
        };

        // Add error event listener
        iframe.onerror = () => {
          debugLog("IFRAME", "Iframe failed to load");
          if (isMountedRef.current) {
            setIsIframeLoading(false);
          }
        };
      } else if (isMountedRef.current) {
        debugLog("IFRAME", "Iframe element not found, creating portal container and retrying");
        const container = createPortalContainerAfterShippingOption();
        if (container) {
          setPortalContainer(container);
        }
        setTimeout(() => {
          if (isMountedRef.current) {
            updateIframeWithUrl(url, isVisible);
          }
        }, 500);
      }
    }, 100);
  };

  // Enhanced version of your existing updateAddressFields function
  const updateAddressFields = async addressData => {
    try {
      const store = wp.data.select("wc/store/cart");
      const dispatch = wp.data.dispatch("wc/store/cart");
      if (store && dispatch) {
        await dispatch.setBillingAddress(addressData);
        await dispatch.setShippingAddress(addressData);

        // Wait for store to update
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        // Enhanced direct field updates with better compatibility
        updateFieldsDirectly(addressData);
      }
    } catch (error) {
      debugLog("MESSAGE", "WooCommerce store update failed, falling back to direct field updates", error);
      // Enhanced fallback to direct field updates
      updateFieldsDirectly(addressData);
    }
  };

  // Enhanced version of your existing updateFieldsDirectly function
  const updateFieldsDirectly = addressData => {
    console.log('updateFieldsDirectly');
    console.log(typeof jQuery !== "undefined");
    if (typeof jQuery !== "undefined") {
      const fields = ["first_name", "last_name", "company", "address_1", "city", "postcode", "phone", "email"];
      console.log('123');
      fields.forEach(field => {
        console.log('foreach');
        const value = addressData[field] || "";

        // Your original selectors plus additional ones for better compatibility
        const selectors = [`#shipping-${field}`, `#billing-${field}`,
        // Additional selectors for better field detection
        `input[name="shipping_${field}"]`, `input[name="billing_${field}"]`, `input[name="${field}"]`, `[data-field="${field}"]`, `.wc-block-components-text-input[name*="${field}"]`, `input[id*="${field}"]`];
        let fieldUpdated = false;
        selectors.forEach(selector => {
          console.log('selectors foreach');
          const $field = jQuery(selector);
          if ($field.length > 0) {
            const oldValue = $field.val();
            $field.val(value);

            // Enhanced event triggering for React compatibility
            $field.trigger('input').trigger('change').trigger('blur');
            console.log($field.val());
            // Also try native events for React controlled components
            const element = $field[0];
            if (element) {
              const inputEvent = new Event('input', {
                bubbles: true
              });
              const changeEvent = new Event('change', {
                bubbles: true
              });
              element.dispatchEvent(inputEvent);
              element.dispatchEvent(changeEvent);
            }
            if (value !== oldValue) {
              fieldUpdated = true;
              debugLog("UPDATE", `Updated ${selector}: "${oldValue}" -> "${value}"`);
            }
          }
        });
        if (!fieldUpdated && value) {
          debugLog("UPDATE", `Warning: Could not update field ${field} with value "${value}"`);
        }
      });

      // Trigger form validation - keep your original approach
      jQuery(document.body).trigger('update_checkout');
    }
  };

  // Handle postMessage events from iframe
  const handleIframeMessage = async event => {
    const data = event.data;

    // Skip if not a submission event
    if (data.shipment_error || data.shipping_price == null || isNaN(Number(data.shipping_price)) || !data.name) {
      return;
    }
    debugLog("MESSAGE", "Processing valid shipment data", data);
    try {
      // Set cookie for shipping price
      document.cookie = `econt_shippment_price=${data.shipping_price}; path=/`;
      document.cookie = `econt_customer_info_id=${data.id}; path=/`;

      // Update shipping rate via AJAX
      if (typeof jQuery !== "undefined") {
        const response = await jQuery.ajax({
          type: "POST",
          url: window.econtData.ajaxUrl,
          dataType: "json",
          data: {
            action: "woocommerce_delivery_with_econt_update_shipping",
            security: window.econtData.nonce,
            shipping_data: {
              price: data.shipping_price,
              price_cod: data.shipping_price_cod,
              price_cod_e: data.shipping_price_cod_e,
              currency: data.shipping_price_currency_sign
            }
          }
        });
        if (!response.success) {
          throw new Error(response.message || "Failed to update shipping rate");
        }

        // Store shipment prices
        setGlobalShipmentPrices({
          cod: data.shipping_price_cod,
          cod_e: data.shipping_price_cod_e,
          no_cod: data.shipping_price
        });

        // Trigger checkout update and close iframe
        wp.data.dispatch("wc/store/cart").invalidateResolutionForStoreSelector("getCartData");
        setIsEditing(false);

        // Keep button disabled while updating
        togglePlaceOrderButton(true);

        // Wait for checkout to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Prepare address data
        const addressData = {
          first_name: data.face ? data.face.split(" ")[0] : data.name.split(" ")[0],
          last_name: data.face ? data.face.split(" ")[1] : data.name.split(" ")[1],
          company: data.face ? data.name : "",
          address_1: data.address ? `${getTranslation("Delivery to address:")} ${data.address}` : `${getTranslation("Delivery to office:")} ${data.office_name_only}`,
          city: data.city_name,
          postcode: data.post_code,
          phone: data.phone,
          email: data.email
        };
        for (let retry = 0; retry < 2; retry++) {
          debugLog("MESSAGE", `Address update attempt ${retry + 1}/2`);

          // Update addresses using enhanced functions
          await updateAddressFields(addressData);

          // Enhanced verification
          const fieldsUpdated = await verifyFieldsUpdated(addressData);
          if (fieldsUpdated) {
            // Wait a bit more for any form validation to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Enable submit button only after verification
            togglePlaceOrderButton(false);
            debugLog("MESSAGE", "All fields updated successfully, submit button enabled");
          } else {
            debugLog("MESSAGE", "Field update verification failed, keeping button disabled");
            togglePlaceOrderButton(true);
          }
        }
        setIsEditing(false);
        setIsIframeLoading(false);
      }
    } catch (error) {
      debugLog("MESSAGE", "Error processing message", error);
      setIsEditing(false);
      setIsIframeLoading(false);
      togglePlaceOrderButton(true);
    }
  };

  // Helper function to verify fields are actually updated
  const verifyFieldsUpdated = async expectedData => {
    if (typeof jQuery === "undefined") {
      return false;
    }
    const fields = ["first_name", "last_name", "company", "address_1", "city", "postcode", "phone", "email"];
    let allFieldsUpdated = true;

    // Check multiple times with delays to account for async updates
    for (let attempt = 0; attempt < 3; attempt++) {
      allFieldsUpdated = true;
      for (const field of fields) {
        const shippingField = jQuery(`#shipping-${field}`);
        const billingField = jQuery(`#billing-${field}`);
        const shippingValue = shippingField.length ? shippingField.val() : null;
        const billingValue = billingField.length ? billingField.val() : null;
        const expectedValue = expectedData[field] || "";

        // Check if at least one field (shipping or billing) has the expected value
        if (shippingField.length || billingField.length) {
          if (shippingValue !== expectedValue && billingValue !== expectedValue) {
            debugLog("MESSAGE", `Field ${field} not updated. Expected: ${expectedValue}, Got shipping: ${shippingValue}, billing: ${billingValue}`);
            allFieldsUpdated = false;
            break;
          }
        }
      }
      if (allFieldsUpdated) {
        debugLog("MESSAGE", "All fields verified as updated");
        return true;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    debugLog("MESSAGE", "Field verification failed after 3 attempts");
    return false;
  };

  // Effect to check shipping method changes and update component state
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    debugLog("EFFECT", `Shipping method check effect triggered - Instance: ${instanceId.current}`);

    // Check if shipping method has changed
    const checkShippingMethod = () => {
      const isEcont = isEcontShippingSelected();
      setIsEcontSelected(isEcont);

      // Update local shipping method if store method changes
      if (selectedShippingMethod && selectedShippingMethod !== localShippingMethod) {
        debugLog("EFFECT", "Updating local shipping method", {
          old: localShippingMethod,
          new: selectedShippingMethod
        });
        setLocalShippingMethod(selectedShippingMethod);
      }
      if (isEcont) {
        debugLog("EFFECT", "Econt is selected, setting up portal and getting form data");
        // Create portal container if needed
        const container = createPortalContainerAfterShippingOption();
        if (container) {
          setPortalContainer(container);
        }

        // Set editing mode if needed
        if (!iframeUrl) {
          setIsEditing(true);
          togglePlaceOrderButton(true);
        }
        getDataFromForm();
      } else {
        debugLog("EFFECT", "Econt not selected, enabling place order button");
        togglePlaceOrderButton(false);
        setIsIframeLoading(false);
      }
    };

    // Initial check
    checkShippingMethod();

    // Set up event listener for shipping method changes
    const handleShippingMethodChange = () => {
      debugLog("EVENT", "Shipping method change event triggered");
      checkShippingMethod();
    };

    // Add event listeners for shipping method changes
    if (typeof jQuery !== "undefined") {
      debugLog("EVENT", "Adding jQuery event listeners");
      jQuery(document.body).on("updated_checkout", handleShippingMethodChange);
      jQuery('input[name^="shipping_method"]').on("change", handleShippingMethodChange);
    }

    // Clean up event listeners
    return () => {
      debugLog("EVENT", "Cleaning up shipping method event listeners");
      if (typeof jQuery !== "undefined") {
        jQuery(document.body).off("updated_checkout", handleShippingMethodChange);
        jQuery('input[name^="shipping_method"]').off("change", handleShippingMethodChange);
      }
    };
  }, [selectedShippingMethod, localShippingMethod, billingData, shippingData, cartData, iframeUrl]);

  // Effect to update portal container when shipping method changes
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (isEcontSelected) {
      const container = createPortalContainerAfterShippingOption();
      if (container) {
        setPortalContainer(container);
      }
      // If Econt is selected but we don't have shipping data yet, disable the button
      if (isEditing && !globalShipmentPrices.no_cod) {
        togglePlaceOrderButton(true);
      }
    } else {
      // If Econt is not selected, make sure the button is enabled
      togglePlaceOrderButton(false);
    }
  }, [isEcontSelected, isEditing, globalShipmentPrices]);

  // Effect to set up message event listener
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    debugLog("EFFECT", `Setting up message event listener - Instance: ${instanceId.current}`);
    messageListenerRef.current = handleIframeMessage;
    window.addEventListener("message", handleIframeMessage);
    return () => {
      debugLog("EFFECT", `Cleaning up message event listener - Instance: ${instanceId.current}`);
      window.removeEventListener("message", handleIframeMessage);
      messageListenerRef.current = null;
    };
  }, []);

  // Effect to clean up on unmount
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    return () => {
      debugLog("CLEANUP", `Component unmounting - Instance: ${instanceId.current}`);
      isMountedRef.current = false;

      // Clean up any event listeners
      if (typeof jQuery !== "undefined") {
        jQuery(document.body).off("updated_checkout");
        jQuery('input[name^="shipping_method"]').off("change");
      }

      // Remove message event listener
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
        messageListenerRef.current = null;
      }

      // Remove portal container
      const container = document.getElementById("econt-portal-container");
      if (container) {
        container.remove();
      }

      // Make sure the place order button is enabled when component unmounts
      togglePlaceOrderButton(false);
    };
  }, []);

  // Effect to handle checkout updates and ensure button state is correct
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const handleCheckoutUpdate = () => {
      // If Econt is selected and we're still editing (no shipping data yet), disable the button
      if (isEcontSelected && isEditing && !globalShipmentPrices.no_cod) {
        togglePlaceOrderButton(true);
      } else if (!isEcontSelected) {
        // If Econt is not selected, make sure the button is enabled
        togglePlaceOrderButton(false);
      }
    };
    if (typeof jQuery !== "undefined") {
      jQuery(document.body).on("updated_checkout", handleCheckoutUpdate);
    }
    return () => {
      if (typeof jQuery !== "undefined") {
        jQuery(document.body).off("updated_checkout", handleCheckoutUpdate);
      }
    };
  }, [isEcontSelected, isEditing, globalShipmentPrices]);

  // Prepare section title and button text
  const defaultSectionTitleText = getTranslation("Econt Delivery Details");
  const defaultEditButtonText = getTranslation("Edit delivery details");
  const sectionTitleText = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)("econtDelivery.editButtonText", defaultSectionTitleText);
  const editButtonText = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)("econtDelivery.checkoutButtonText", defaultEditButtonText);

  // Render component content
  const renderContent = () => {
    debugLog("RENDER", `Rendering component content - Instance: ${instanceId.current}`, {
      isEcontSelected,
      isEditing,
      isIframeLoading,
      iframeUrl: iframeUrl ? "present" : "empty"
    });
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "econt-content-wrapper",
      style: {
        display: isEcontSelected ? "block" : "none",
        visibility: isEcontSelected ? "visible" : "hidden"
      }
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h3", null, sectionTitleText), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "econt-iframe-container",
      style: {
        display: isEcontSelected && isEditing ? "block" : "none",
        visibility: isEcontSelected && isEditing ? "visible" : "hidden"
      }
    }, isEcontSelected && isEditing && isIframeLoading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "econt-loading",
      style: {
        padding: "20px",
        marginBottom: "20px",
        backgroundColor: "#f8f9fa",
        border: "1px solid #ddd",
        borderRadius: "4px",
        textAlign: "center"
      }
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "10px"
      }
    }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "econt-spinner",
      style: {
        width: "30px",
        height: "30px",
        border: "4px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "50%",
        borderTop: "4px solid #3498db",
        animation: "econt-spin 1s linear infinite"
      }
    })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, getTranslation("Loading Econt delivery options...")), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("style", null, `
                                @keyframes econt-spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                                `)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("iframe", {
      src: iframeUrl || "about:blank",
      id: "delivery_with_econt_iframe",
      style: {
        marginTop: "2rem",
        width: "100%",
        minHeight: "600px",
        border: "none",
        display: isEcontSelected && isEditing && iframeUrl && !isIframeLoading ? "block" : "none",
        visibility: isEcontSelected && isEditing && iframeUrl && !isIframeLoading ? "visible" : "hidden"
      },
      onLoad: () => {
        debugLog("IFRAME", "Iframe onLoad event triggered");
        if (!iframeUrl) return;
        const iframe = document.getElementById("delivery_with_econt_iframe");
        if (iframe && isEcontSelected && isEditing) {
          setIsIframeLoading(false);
          iframe.style.display = "block";
          iframe.style.visibility = "visible";
          debugLog("IFRAME", "Iframe made visible after load");
        }
      }
    })), isEcontSelected && !isEditing && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
      type: "button",
      className: "econt-button econt-button-details",
      style: {
        display: "block",
        visibility: "visible",
        marginBottom: "40px"
      },
      onClick: () => {
        debugLog("BUTTON", "Edit button clicked");
        setIsEditing(true);
        setIsIframeLoading(true);
        togglePlaceOrderButton(true);
        if (isEcontSelected && !iframeUrl) {
          getDataFromForm();
        }
      }
    }, editButtonText), isEcontSelected && isOrderButtonDisabled && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      className: "econt-button-message",
      style: {
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#fff9c4",
        border: "1px solid #ffd600",
        borderRadius: "4px",
        fontSize: "14px",
        textAlign: "center"
      }
    }, getTranslation("Please complete Econt delivery details before placing your order")));
  };

  // If we have a portal container and Econt is selected, render through portal
  if (portalContainer && isEcontSelected) {
    debugLog("RENDER", `Rendering through portal - Instance: ${instanceId.current}`);
    return (0,react_dom__WEBPACK_IMPORTED_MODULE_4__.createPortal)((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
      ref: econtContainerRef,
      className: "wp-block-econt-delivery",
      style: {
        position: "relative",
        zIndex: "10",
        display: "block",
        visibility: "visible",
        opacity: "1",
        marginTop: "20px",
        marginBottom: "32px"
      },
      "data-econt-component": "true",
      "data-econt-shipping-selected": "true",
      "data-econt-iframe-url": iframeUrl ? "loaded" : "not-loaded",
      "data-econt-iframe-loading": isIframeLoading ? "true" : "false",
      "data-econt-instance": instanceId.current
    }, renderContent()), portalContainer);
  }

  // Fallback render method if portal is not available
  debugLog("RENDER", `Rendering fallback (no portal) - Instance: ${instanceId.current}`);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ref: econtContainerRef,
    className: "wp-block-econt-delivery",
    style: {
      position: "relative",
      zIndex: isEcontSelected ? "10" : "-1",
      display: isEcontSelected ? "block" : "none",
      visibility: isEcontSelected ? "visible" : "hidden",
      opacity: isEcontSelected ? "1" : "0"
    },
    "data-econt-component": "true",
    "data-econt-shipping-selected": isEcontSelected ? "true" : "false",
    "data-econt-iframe-url": iframeUrl ? "loaded" : "not-loaded",
    "data-econt-iframe-loading": isIframeLoading ? "true" : "false",
    "data-econt-instance": instanceId.current
  }, renderContent());
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EcontDelivery);

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/plugins":
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["plugins"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************************!*\
  !*** ./src/blocks/checkout/index.js ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _EcontDelivery__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./EcontDelivery */ "./src/blocks/checkout/EcontDelivery.js");





const EcontShippingContent = () => {
  const {
    isEcontShippingSelected
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.useSelect)(select => {
    const store = select('wc/store/cart');
    if (!store) {
      return {
        isEcontShippingSelected: false
      };
    }

    // Get shipping rates
    const shippingRates = store.getShippingRates();

    // Find selected shipping rate
    const selectedRate = shippingRates?.[0]?.shipping_rates?.find(rate => rate.selected);
    return {
      isEcontShippingSelected: selectedRate?.method_id === 'delivery_with_econt'
    };
  }, []);
  if (!isEcontShippingSelected) {
    return null;
  }
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_EcontDelivery__WEBPACK_IMPORTED_MODULE_4__["default"], null);
};
console.log('Registering Econt delivery block plugin');
(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_2__.registerPlugin)('econt-delivery-block', {
  render: EcontShippingContent,
  scope: 'woocommerce-checkout'
});
})();

/******/ })()
;
//# sourceMappingURL=checkout.js.map