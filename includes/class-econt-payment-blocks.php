<?php

if (!defined('ABSPATH')) {
    exit;
}

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

/**
 * EcontPay Blocks integration
 */
final class Econt_Payment_Blocks extends AbstractPaymentMethodType {
    /**
     * The gateway instance.
     *
     * @var Delivery_With_Econt_Payment
     */
    private $gateway;

    /**
     * Payment method name/id/slug.
     *
     * @var string
     */
    protected $name = 'econt_payment';

    /**
     * Initializes the payment method type.
     */
    public function initialize() {
        $this->settings = get_option('woocommerce_econt_payment_settings', []);
        $gateways = WC()->payment_gateways->payment_gateways();
        $this->gateway = isset($gateways['econt_payment']) ? $gateways['econt_payment'] : null;
    }

    /**
     * Returns if this payment method should be active. If false, the scripts will not be enqueued.
     *
     * @return boolean
     */
    public function is_active() {
        return $this->gateway && $this->gateway->is_available();

    }

    /**
     * Returns an array of scripts/handles to be registered for this payment method.
     *
     * @return array
     */
    public function get_payment_method_script_handles() {
        $script_path = '/build/blocks/econt-payment.js';
        $script_asset_path = plugin_dir_path(__DIR__) . 'build/blocks/econt-payment.asset.php';
        
        // Check if asset file exists, if not use defaults
        $script_asset = file_exists($script_asset_path) 
            ? require $script_asset_path 
            : array('dependencies' => array(), 'version' => '1.0.0');

        wp_register_script(
            'wc-econt-payment-blocks-integration',
            plugins_url($script_path, dirname(__FILE__)),
            $script_asset['dependencies'],
            $script_asset['version'],
            true
        );

        // Localize script with data
        wp_localize_script(
            'wc-econt-payment-blocks-integration',
            'wc_econt_payment_params',
            array(
                'title' => $this->gateway ? $this->gateway->title : 'EcontPay',
                'description' => $this->gateway ? $this->gateway->description : 'Плащане с карта чрез EcontPay',
                'icon' => $this->gateway ? $this->gateway->icon : '',
                'supports' => $this->gateway ? array_filter($this->gateway->supports, array($this->gateway, 'supports')) : array(),
            )
        );

        return array('wc-econt-payment-blocks-integration');
    }

    /**
     * Returns an array of key=>value pairs of data made available to the payment methods script.
     *
     * @return array
     */
    public function get_payment_method_data() {
        return array(
            'title' => $this->gateway ? $this->gateway->title : 'EcontPay',
            'description' => $this->gateway ? $this->gateway->description : 'Плащане с карта чрез EcontPay',
            'icon' => $this->gateway ? $this->gateway->icon : '',
            'supports' => $this->get_supported_features(),
        );
    }

    /**
     * Returns an array of supported features.
     *
     * @return string[]
     */
    public function get_supported_features() {
        return $this->gateway ? $this->gateway->supports : array('products');
    }
}