import { __ } from '@wordpress/i18n';
import { createElement, useState, useEffect } from '@wordpress/element';

// EcontPay component for block checkout
const EcontPayComponent = (props) => {
    const { billing, shippingData, onSubmit, activePaymentMethod } = props;
    
    const [isProcessing, setIsProcessing] = useState(false);
    
    useEffect(() => {
        if (activePaymentMethod === 'econt_payment') {
            // Payment method is selected, can add any specific logic here
        }
    }, [activePaymentMethod]);

    const handleSubmit = () => {
        setIsProcessing(true);
        onSubmit();
    };

    return createElement(
        'div',
        { 
            className: 'wc-block-checkout__payment-method--econt-payment'
        },
        createElement(
            'div',
            { className: 'econt-payment-description' },
            window.wc_econt_payment_params?.description || __('Плащане с карта чрез EcontPay', 'delivery-with-econt')
        )
    );
};

// Register the payment method using the global wc.wcBlocksRegistry
const settings = {
    name: 'econt_payment',
    label: createElement(
        'span',
        { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        window.wc_econt_payment_params?.icon ? createElement('img', {
            src: window.wc_econt_payment_params.icon,
            alt: 'EcontPay',
            style: { height: '20px', width: 'auto' }
        }) : null,
        window.wc_econt_payment_params?.title || __('EcontPay', 'delivery-with-econt')
    ),
    content: createElement(EcontPayComponent),
    edit: createElement(EcontPayComponent),
    canMakePayment: () => true,
    ariaLabel: window.wc_econt_payment_params?.title || __('EcontPay', 'delivery-with-econt'),
    supports: {
        features: window.wc_econt_payment_params?.supports || ['products']
    }
};

// Register when DOM is loaded and wc.wcBlocksRegistry is available
document.addEventListener('DOMContentLoaded', function() {
    if (window.wc && window.wc.wcBlocksRegistry && window.wc.wcBlocksRegistry.registerPaymentMethod) {
        window.wc.wcBlocksRegistry.registerPaymentMethod(settings);
    }
});

// Also try immediate registration in case DOMContentLoaded already fired
if (window.wc && window.wc.wcBlocksRegistry && window.wc.wcBlocksRegistry.registerPaymentMethod) {
    window.wc.wcBlocksRegistry.registerPaymentMethod(settings);
}