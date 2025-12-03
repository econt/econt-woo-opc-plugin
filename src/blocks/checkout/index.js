import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element'; // Import useEffect from WordPress element
import EcontDelivery from './EcontDelivery';

// First plugin - loads only when Econt shipping is selected (your existing code)
const EcontShippingContent = () => {
    const { isEcontShippingSelected } = useSelect((select) => {
        const store = select('wc/store/cart');
        if (!store) {
            return { isEcontShippingSelected: false };
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

    return <EcontDelivery />;
};

// Second plugin - always loads regardless of shipping method (React logic only)
const EcontAlwaysLoadedContent = () => {
    // Get any data you need from the store
    const { cartData, shippingData, selectedShippingMethod } = useSelect((select) => {
        const store = select('wc/store/cart');
        if (!store) {
            return { cartData: null, shippingData: null, selectedShippingMethod: null };
        }

        const shippingRates = store.getShippingRates();
        const selectedRate = shippingRates?.[0]?.shipping_rates?.find(rate => rate.selected);

        return {
            cartData: store.getCartData(),
            shippingData: shippingRates,
            selectedShippingMethod: selectedRate?.method_id
        };
    }, []);

    const getTranslation = (key) => {
        if (typeof window.econtTranslations !== "undefined" && window.econtTranslations[key]) {
            return window.econtTranslations[key];
        }
        return key;
    };

    // Helper function to get cookie value
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    // Helper function to check if Econt shipping is selected
    const isEcontSelected = () => {
        return selectedShippingMethod === 'delivery_with_econt';
    };

    // Helper function to update shipping price display
    const updateShippingPriceDisplay = (priceText) => {
        // Update in shipping options section
        const econtShippingOption = document.querySelector('input[value="delivery_with_econt"]');
        if (econtShippingOption) {
            const secondaryLabel = econtShippingOption.closest('label')?.querySelector('.wc-block-components-radio-control__secondary-label');
            if (secondaryLabel) {
                let priceSpan = secondaryLabel.querySelector('.wc-block-checkout__shipping-option--free');

                if (priceSpan) {
                    priceSpan.textContent = priceText;
                }

            }
        }

        // Update in order summary sidebar (shipping totals)
        const shippingTotalsElement = document.querySelector('.wc-block-components-totals-shipping .wc-block-components-totals-item__value');
        if (shippingTotalsElement && isEcontSelected()) {
            shippingTotalsElement.innerHTML = `<strong>${priceText}</strong>`;
        }
    };

    // React effect for Econt shipping price monitoring - runs on every checkout update
    useEffect(() => {
        if (!isEcontSelected()) {
            return;
        }

        const checkShippingPrice = () => {
            const econtPrice = getCookie('econt_shippment_price');
            console.log('Econt price check:', econtPrice);

            // If cookie is "0", restore original "Free" text
            if (econtPrice === '0') {
                // Restore original free shipping HTML in shipping options section
                const econtShippingOption = document.querySelector('input[value="delivery_with_econt"]');
                if (econtShippingOption) {
                    const secondaryLabel = econtShippingOption.closest('label')?.querySelector('.wc-block-components-radio-control__secondary-label');
                    if (secondaryLabel) {
                        let priceSpan = secondaryLabel.querySelector('.wc-block-checkout__shipping-option--free');
                        if (priceSpan) {
                            priceSpan.textContent = getTranslation('Free');
                        }
                    }
                }

                // Update order summary sidebar to show Free
                const shippingTotalsElement = document.querySelector('.wc-block-components-totals-shipping .wc-block-components-totals-item__value');
                if (shippingTotalsElement && isEcontSelected()) {
                    shippingTotalsElement.innerHTML = `<strong>${getTranslation('Free')}</strong>`;
                }
            }
            // If cookie is missing or empty, show "Calculating..."
            else if (!econtPrice || econtPrice === '') {
                updateShippingPriceDisplay(getTranslation('Calculating...'));
            }
        };

        // Check immediately
        checkShippingPrice();

        // Keep checking until order summary is rendered (up to 3 seconds)
        let attempts = 0;
        const maxAttempts = 15;
        const intervalId = setInterval(() => {
            attempts++;
            const orderSummaryExists = document.querySelector('.wc-block-components-totals-shipping .wc-block-components-totals-item__value');

            if (orderSummaryExists || attempts >= maxAttempts) {
                clearInterval(intervalId);
            }

            checkShippingPrice();
        }, 200);

        return () => clearInterval(intervalId);
    }, [selectedShippingMethod, cartData, shippingData]);




    // Return null - no DOM rendering, just React logic
    return null;
};

console.log('Registering Econt delivery block plugins');

// Check if plugins are already registered to prevent duplicate registration
const { isPluginActive } = wp.plugins || {};

// Register the shipping-method-dependent plugin only if not already registered
if (!isPluginActive || !isPluginActive('econt-delivery-block')) {
    registerPlugin('econt-delivery-block', {
        render: EcontShippingContent,
        scope: 'woocommerce-checkout'
    });
}

// Register the always-loaded plugin only if not already registered
if (!isPluginActive || !isPluginActive('econt-always-loaded')) {
    registerPlugin('econt-always-loaded', {
        render: EcontAlwaysLoadedContent,
        scope: 'woocommerce-checkout'
    });
}

if (!isPluginActive || !isPluginActive('econt-cart-always-loaded')) {
    registerPlugin('econt-cart-always-loaded', {
        render: EcontAlwaysLoadedContent,
        scope: 'woocommerce-cart'  // Different scope for cart
    });
}