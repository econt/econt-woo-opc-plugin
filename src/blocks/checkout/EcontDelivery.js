"use client"

import { useState, useEffect, useRef } from "@wordpress/element"
import { useSelect, useDispatch } from "@wordpress/data"
import { __ } from "@wordpress/i18n"
import { applyFilters } from "@wordpress/hooks"
import { createPortal } from "react-dom"

// No TypeScript declarations needed in plain JS
const EcontDelivery = () => {
    // Declare jQuery and wp variables
    const jQuery = window.jQuery
    const wp = window.wp

    // Component state
    const [iframeUrl, setIframeUrl] = useState("")
    const [globalShipmentPrices, setGlobalShipmentPrices] = useState({
        cod: undefined,
        cod_e: undefined,
        no_cod: undefined,
    })
    const [isEditing, setIsEditing] = useState(true)
    const [localShippingMethod, setLocalShippingMethod] = useState(null)
    const [isEcontSelected, setIsEcontSelected] = useState(false)
    const [portalContainer, setPortalContainer] = useState(null)
    const [isOrderButtonDisabled, setIsOrderButtonDisabled] = useState(false)

    // Refs
    const isMountedRef = useRef(true)
    const messageListenerRef = useRef(null)
    const econtContainerRef = useRef(null)

    // Get data from WooCommerce store
    const { billingData, shippingData, cartData, selectedShippingMethod } = useSelect((select) => {
        const store = select("wc/store/cart")
        if (!store) {
            return {
                billingData: {},
                shippingData: {},
                cartData: {},
                selectedShippingMethod: null,
            }
        }

        let billing = {},
            shipping = {},
            cart = {},
            shippingMethod = null

        try {
            // Try new API first
            billing = store.getCustomerData()?.billing || {}
            shipping = store.getCustomerData()?.shipping || {}

            const cartData = store.getCartData();

            // Calculate total weight from cart items
            const totalWeight = cartData.itemsWeight * 0.001

            // console.log("Calculated total weight:", totalWeight)

            // Set minimum weight of 1kg if calculated weight is less
            const finalWeight = totalWeight > 0 ? totalWeight : 1

            cart = {
                total: Number.parseFloat(cartData.totals?.total_items) / 100 || 0,
                currency: store.getCartTotals()?.currency_code || "BGN",
                weight : finalWeight,
            }
            const shippingRates = store.getShippingRates()
            shippingMethod = shippingRates?.[0]?.shipping_rates?.find((rate) => rate.selected)?.method_id
        } catch (e) {
            try {
                // Fallback to older API
                billing = store.getBillingData() || {}
                shipping = store.getShippingData() || {}
            } catch (e2) {
                // Silently fail
            }
        }

        return {
            billingData: billing,
            shippingData: shipping,
            cartData: cart,
            selectedShippingMethod: shippingMethod,
        }
    }, [])

    const { setBillingAddress, setShippingAddress } = useDispatch("wc/store/cart")

    // Function to check if Econt shipping is selected
    const isEcontShippingSelected = () => {
        // First check the local state
        if (localShippingMethod && localShippingMethod.includes("econt")) {
            return true
        }

        // Then check the store state
        if (
            selectedShippingMethod &&
            (selectedShippingMethod === "delivery_with_econt" || selectedShippingMethod.includes("econt"))
        ) {
            return true
        }

        // Check the DOM directly
        const econtRadio = document.querySelector('input[name^="shipping_method"][value*="econt"]:checked')
        if (econtRadio) {
            return true
        }

        // Check if we have an iframe URL
        if (iframeUrl && iframeUrl.length > 0) {
            return true
        }

        return false
    }

    // Function to find the shipping option container
    const findShippingOptionContainer = () => {
        const selectors = [
            "#shipping-option",
            ".wc-block-components-shipping-rates-control",
            ".shipping_method",
            ".woocommerce-shipping-methods",
            "#shipping_method",
        ]

        for (const selector of selectors) {
            const element = document.querySelector(selector)
            if (element) {
                return element
            }
        }

        return null
    }

    // Function to create a portal container after shipping options
    const createPortalContainerAfterShippingOption = () => {
        if (!isMountedRef.current) return null

        // Find the shipping option element
        const targetElement = findShippingOptionContainer()
        if (!targetElement) return null

        // Check if we already have a portal container
        let container = document.getElementById("econt-portal-container")

        // If no container exists, create one
        if (!container) {
            container = document.createElement("div")
            container.id = "econt-portal-container"

            // Insert after the shipping option
            if (targetElement.nextSibling) {
                targetElement.parentNode.insertBefore(container, targetElement.nextSibling)
            } else {
                targetElement.parentNode.appendChild(container)
            }
        }

        return container
    }

    // Function to disable/enable the place order button
    const togglePlaceOrderButton = (disable) => {
        const placeOrderButton = document.querySelector(".wc-block-components-checkout-place-order-button")
        if (placeOrderButton) {
            placeOrderButton.disabled = disable

            // Add visual indication that the button is disabled
            if (disable) {
                placeOrderButton.style.opacity = "0.5"
                placeOrderButton.style.cursor = "not-allowed"

                // Add a tooltip to explain why it's disabled
                placeOrderButton.title = __("Please complete Econt delivery details first", "deliver-with-econt")
            } else {
                placeOrderButton.style.opacity = ""
                placeOrderButton.style.cursor = ""
                placeOrderButton.title = ""
            }

            // Always update the state to match the button's disabled status
            setIsOrderButtonDisabled(disable)
        }
    }

    // Function to get data from form and make AJAX request
    const getDataFromForm = async () => {
        if (!isMountedRef.current || !isEcontShippingSelected()) return

        // // Disable the place order button while getting Econt data
        // togglePlaceOrderButton(true)

        // Wait a moment for fields to be available
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Get customer data from form
        const customerData = {
            first_name:
                document.querySelector("#shipping-first_name")?.value ||
                document.querySelector("#billing-first_name")?.value ||
                "",
            last_name:
                document.querySelector("#shipping-last_name")?.value ||
                document.querySelector("#billing-last_name")?.value ||
                "",
            company:
                document.querySelector("#shipping-company")?.value || document.querySelector("#billing-company")?.value || "",
            address_1:
                document.querySelector("#shipping-address_1")?.value ||
                document.querySelector("#billing-address_1")?.value ||
                "",
            city: document.querySelector("#shipping-city")?.value || document.querySelector("#billing-city")?.value || "",
            postcode:
                document.querySelector("#shipping-postcode")?.value || document.querySelector("#billing-postcode")?.value || "",
            phone: document.querySelector("#shipping-phone")?.value || document.querySelector("#billing-phone")?.value || "",
            email:
                document.querySelector("#email")?.value ||
                document.querySelector("#shipping-email")?.value ||
                document.querySelector("#billing-email")?.value ||
                "",
        }

        // Check if we have enough data
        if (!customerData.first_name || !customerData.city) {
            if (isMountedRef.current) {
                setTimeout(getDataFromForm, 1000)
            }
            return
        }

        // Process address information
        let isOfficeDelivery = false
        let officeName = ""
        let streetAddress = ""

        if (customerData.address_1) {
            if (customerData.address_1.includes("Delivery to office:")) {
                isOfficeDelivery = true
                officeName = customerData.address_1.replace("Delivery to office:", "").trim()
            } else if (customerData.address_1.includes("Delivery to address:")) {
                streetAddress = customerData.address_1.replace("Delivery to address:", "").trim()
            } else {
                streetAddress = customerData.address_1
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
            office_name: isOfficeDelivery ? officeName : "",
        }

        // Remove empty values
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key]
        })

        try {
            // Add cart data
            const cartParams = {
                ...params,
                order_total: cartData.total || 0,
                order_currency: cartData.currency || "BGN",
                pack_count: 1,
                order_weight: cartData.weight,
            }

            // Make AJAX request
            if (typeof jQuery !== "undefined") {
                const response = await jQuery.ajax({
                    type: "POST",
                    url: window.econtData.ajaxUrl,
                    dataType: "json",
                    data: {
                        action: "woocommerce_delivery_with_econt_get_orderinfo",
                        security: window.econtData.nonce,
                        params: cartParams,
                    },
                })

                if (!response) {
                    // If no response, keep the button disabled
                    return
                }

                // Process URL
                let url
                if (typeof response === "string") {
                    url = response.split('"').join("").replace(/\\\//g, "/")
                } else if (typeof response === "object") {
                    url = response.toString()
                } else {
                    // If invalid response, keep the button disabled
                    return
                }

                // Set locale and build full URL
                const locale = document.documentElement.lang.split("-")[0] || "en"
                const validLocales = ["bg", "en", "gr", "ro"]
                const fullUrl = `${url}&module=onecheckout&lang=${validLocales.includes(locale) ? locale : "bg"}`

                // Update iframe with URL
                updateIframeWithUrl(fullUrl, true)
            }
        } catch (error) {
            // Silently fail, but keep the button disabled
        }
    }

    // Function to update iframe URL and visibility
    const updateIframeWithUrl = (url, isVisible = true) => {
        if (!isMountedRef.current) return

        // Update state
        setIframeUrl(url)

        // Apply URL to iframe element
        setTimeout(() => {
            if (!isMountedRef.current) return

            const iframe = document.querySelector("#delivery_with_econt_iframe")
            if (iframe) {
                iframe.src = url

                if (isVisible) {
                    iframe.style.display = "block"
                    iframe.style.visibility = "visible"
                    iframe.style.height = "500px"
                }

                // Add load event listener
                iframe.onload = () => {
                    try {
                        // This will throw an error if cross-origin
                        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
                    } catch (error) {
                        // Silently fail
                    }
                }

                // Add error event listener
                iframe.onerror = () => {
                    if (isMountedRef.current) {
                        setTimeout(() => {
                            if (isMountedRef.current && iframe) {
                                iframe.src = url
                            }
                        }, 1000)
                    }
                }
            } else if (isMountedRef.current) {
                // Try to update portal container and retry
                const container = createPortalContainerAfterShippingOption()
                if (container) {
                    setPortalContainer(container)
                }

                setTimeout(() => {
                    if (isMountedRef.current) {
                        updateIframeWithUrl(url, isVisible)
                    }
                }, 500)
            }
        }, 100)
    }

    // Handle postMessage events from iframe
    const handleIframeMessage = async (event) => {
        const data = event.data

        // Skip if not a submission event
        if (data.shipment_error || !data.shipping_price || !data.name) {
            return
        }

        try {
            // Set cookie for shipping price
            document.cookie = `econt_shippment_price=${data.shipping_price}; path=/`

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
                            currency: data.shipping_price_currency_sign,
                        },
                    },
                })

                if (!response.success) {
                    throw new Error(response.message || "Failed to update shipping rate")
                }

                // Store shipment prices
                setGlobalShipmentPrices({
                    cod: data.shipping_price_cod,
                    cod_e: data.shipping_price_cod_e,
                    no_cod: data.shipping_price,
                })

                // Trigger checkout update and close iframe
                wp.data.dispatch("wc/store/cart").invalidateResolutionForStoreSelector("getCartData")
                setIsEditing(false)

                // Enable the place order button now that we have shipping data
                togglePlaceOrderButton(false)  // Use the function to ensure state is updated too


                // Wait for checkout to update
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Prepare address data
                const addressData = {
                    first_name: data.face ? data.face.split(" ")[0] : data.name.split(" ")[0],
                    last_name: data.face ? data.face.split(" ")[1] : data.name.split(" ")[1],
                    company: data.face ? data.name : "",
                    address_1: data.address
                        ? `${__("Delivery to address:", "econt")} ${data.address}`
                        : `${__("Delivery to office:", "econt")} ${data.office_name_only}`,
                    city: data.city_name,
                    postcode: data.post_code,
                    phone: data.phone,
                    email: data.email,
                }

                // Update addresses using WooCommerce's store API or direct field updates
                try {
                    const store = wp.data.select("wc/store/cart")
                    const dispatch = wp.data.dispatch("wc/store/cart")

                    if (store && dispatch) {
                        await dispatch.setBillingAddress(addressData)
                        await dispatch.setShippingAddress(addressData)
                    } else {
                        // Direct field updates
                        updateFormFields(addressData)
                    }
                } catch (error) {
                    // Fallback to direct field updates
                    updateFormFields(addressData)
                }

                // Trigger checkout update and close iframe
                wp.data.dispatch("wc/store/cart").invalidateResolutionForStoreSelector("getCartData")
                setIsEditing(false)

                // Enable the place order button now that we have shipping dat
                togglePlaceOrderButton(false)
            }
        } catch (error) {
            // Close iframe even if there's an error
            setIsEditing(false)
            // Keep the button disabled if there was an error
            togglePlaceOrderButton(true)  // Use the function to ensure state is updated too
        }
    }

    // Helper function to update form fields directly
    const updateFormFields = (addressData) => {
        const fields = ["first_name", "last_name", "company", "address_1", "city", "postcode", "phone", "email"]

        fields.forEach((field) => {
            if (typeof jQuery !== "undefined") {
                jQuery(`#shipping-${field}`).val(addressData[field])
                jQuery(`#billing-${field}`).val(addressData[field])
            }
        })
    }

    // Effect to check shipping method changes and update component state
    useEffect(() => {
        // Check if shipping method has changed
        const checkShippingMethod = () => {
            const isEcont = isEcontShippingSelected()
            setIsEcontSelected(isEcont)

            // Update local shipping method if store method changes
            if (selectedShippingMethod && selectedShippingMethod !== localShippingMethod) {
                setLocalShippingMethod(selectedShippingMethod)
            }

            if (isEcont) {

                // Create portal container if needed
                const container = createPortalContainerAfterShippingOption()
                if (container) {
                    setPortalContainer(container)
                }

                // Set editing mode if needed
                if (!iframeUrl) {
                    setIsEditing(true)
                    // Disable place order button until shipping data is received
                    togglePlaceOrderButton(true)
                }
                // Disable the place order button while getting Econt data
                // togglePlaceOrderButton(true)
                getDataFromForm()
            } else {
                // If Econt is not selected, make sure the button is enabled
                togglePlaceOrderButton(false)
            }
        }

        // Initial check
        checkShippingMethod()

        // Set up event listener for shipping method changes
        const handleShippingMethodChange = () => {
            checkShippingMethod()
        }

        // Add event listeners for shipping method changes
        if (typeof jQuery !== "undefined") {
            jQuery(document.body).on("updated_checkout", handleShippingMethodChange)
            jQuery('input[name^="shipping_method"]').on("change", handleShippingMethodChange)
        }

        // Clean up event listeners
        return () => {
            if (typeof jQuery !== "undefined") {
                jQuery(document.body).off("updated_checkout", handleShippingMethodChange)
                jQuery('input[name^="shipping_method"]').off("change", handleShippingMethodChange)
            }
        }
    }, [selectedShippingMethod, localShippingMethod, billingData, shippingData, cartData, iframeUrl])

    // Effect to update portal container when shipping method changes
    useEffect(() => {
        if (isEcontSelected) {
            const container = createPortalContainerAfterShippingOption()
            if (container) {
                setPortalContainer(container)
            }

            // If Econt is selected but we don't have shipping data yet, disable the button
            if (isEditing && !globalShipmentPrices.no_cod) {
                togglePlaceOrderButton(true)
            }
        } else {
            // If Econt is not selected, make sure the button is enabled
            togglePlaceOrderButton(false)
        }
    }, [isEcontSelected, isEditing, globalShipmentPrices])

    // Effect to set up message event listener
    useEffect(() => {
        messageListenerRef.current = handleIframeMessage
        window.addEventListener("message", handleIframeMessage)

        return () => {
            window.removeEventListener("message", handleIframeMessage)
            messageListenerRef.current = null
        }
    }, [])

    // Effect to clean up on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false

            // Clean up any event listeners
            if (typeof jQuery !== "undefined") {
                jQuery(document.body).off("updated_checkout")
                jQuery('input[name^="shipping_method"]').off("change")
            }

            // Remove message event listener
            if (messageListenerRef.current) {
                window.removeEventListener("message", messageListenerRef.current)
                messageListenerRef.current = null
            }

            // Remove portal container
            const container = document.getElementById("econt-portal-container")
            if (container) {
                container.remove()
            }

            // Make sure the place order button is enabled when component unmounts
            togglePlaceOrderButton(false)
        }
    }, [])

    // Effect to handle checkout updates and ensure button state is correct
    useEffect(() => {
        const handleCheckoutUpdate = () => {
            // If Econt is selected and we're still editing (no shipping data yet), disable the button
            if (isEcontSelected && isEditing && !globalShipmentPrices.no_cod) {
                togglePlaceOrderButton(true)
            } else if (!isEcontSelected) {
                // If Econt is not selected, make sure the button is enabled
                togglePlaceOrderButton(false)
            }
        }

        if (typeof jQuery !== "undefined") {
            jQuery(document.body).on("updated_checkout", handleCheckoutUpdate)
        }

        return () => {
            if (typeof jQuery !== "undefined") {
                jQuery(document.body).off("updated_checkout", handleCheckoutUpdate)
            }
        }
    }, [isEcontSelected, isEditing, globalShipmentPrices])

    // Prepare section title and button text
    const defaultSectionTitleText = __("Econt Delivery Details", "deliver-with-econt")
    const defaultEditButtonText = __("Edit delivery details", "deliver-with-econt")
    const sectionTitleText = applyFilters("econtDelivery.editButtonText", defaultSectionTitleText)
    const editButtonText = applyFilters("econtDelivery.checkoutButtonText", defaultEditButtonText)

    // Render component content
    const renderContent = () => {
        return (
            <div
                className="econt-content-wrapper"
                style={{
                    display: isEcontSelected ? "block" : "none",
                    visibility: isEcontSelected ? "visible" : "hidden",
                }}
            >
                <h3>{sectionTitleText}</h3>

                {/* Iframe container */}
                <div
                    className="econt-iframe-container"
                    style={{
                        display: isEcontSelected && isEditing ? "block" : "none",
                        visibility: isEcontSelected && isEditing ? "visible" : "hidden",
                    }}
                >
                    {/* Loading message */}
                    {!iframeUrl && isEcontSelected && isEditing && (
                        <div
                            className="econt-loading"
                            style={{
                                padding: "20px",
                                marginBottom: "20px",
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                            }}
                        >
                            {__("Loading Econt delivery options...", "deliver-with-econt")}
                        </div>
                    )}

                    {/* Iframe */}
                    <iframe
                        src={iframeUrl || "about:blank"}
                        id="delivery_with_econt_iframe"
                        style={{
                            marginTop: "2rem",
                            width: "100%",
                            minHeight: "600px",
                            border: "none",
                            display: isEcontSelected && isEditing && iframeUrl ? "block" : "none",
                            visibility: isEcontSelected && isEditing && iframeUrl ? "visible" : "hidden",
                        }}
                        onLoad={() => {
                            if (!iframeUrl) return

                            const iframe = document.getElementById("delivery_with_econt_iframe")
                            if (iframe && isEcontSelected && isEditing) {
                                iframe.style.display = "block"
                                iframe.style.visibility = "visible"
                            }
                        }}
                    />
                </div>

                {/* Edit button */}
                {isEcontSelected && !isEditing && (
                    <button
                        type="button"
                        className="econt-button econt-button-details"
                        style={{
                            display: "block",
                            visibility: "visible",
                            marginBottom: "40px",
                        }}
                        onClick={() => {
                            setIsEditing(true)
                            // Disable place order button when editing
                            togglePlaceOrderButton(true)

                            if (isEcontSelected && !iframeUrl) {
                                getDataFromForm()
                            }
                        }}
                    >
                        {editButtonText}
                    </button>
                )}

                {/* Message about disabled place order button */}
                {isEcontSelected && isOrderButtonDisabled && (
                    <div
                        className="econt-button-message"
                        style={{
                            marginTop: "10px",
                            padding: "10px",
                            backgroundColor: "#fff9c4",
                            border: "1px solid #ffd600",
                            borderRadius: "4px",
                            fontSize: "14px",
                            textAlign: "center",
                        }}
                    >
                        {__("Please complete Econt delivery details before placing your order", "deliver-with-econt")}
                    </div>
                )}
            </div>
        )
    }

    // If we have a portal container and Econt is selected, render through portal
    if (portalContainer && isEcontSelected) {
        return createPortal(
            <div
                ref={econtContainerRef}
                className="wp-block-econt-delivery"
                style={{
                    position: "relative",
                    zIndex: "10",
                    display: "block",
                    visibility: "visible",
                    opacity: "1",
                    marginTop: "20px",
                    marginBottom: "32px",
                }}
                data-econt-component="true"
                data-econt-shipping-selected="true"
                data-econt-iframe-url={iframeUrl ? "loaded" : "not-loaded"}
            >
                {renderContent()}
            </div>,
            portalContainer,
        )
    }

    // Fallback render method if portal is not available
    return (
        <div
            ref={econtContainerRef}
            className="wp-block-econt-delivery"
            style={{
                position: "relative",
                zIndex: isEcontSelected ? "10" : "-1",
                display: isEcontSelected ? "block" : "none",
                visibility: isEcontSelected ? "visible" : "hidden",
                opacity: isEcontSelected ? "1" : "0",
            }}
            data-econt-component="true"
            data-econt-shipping-selected={isEcontSelected ? "true" : "false"}
            data-econt-iframe-url={iframeUrl ? "loaded" : "not-loaded"}
        >
            {renderContent()}
        </div>
    )
}

export default EcontDelivery

