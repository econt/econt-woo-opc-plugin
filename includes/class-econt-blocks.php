<?php

if (!defined('ABSPATH')) {
    exit;
}

class Econt_Blocks {
    public function __construct() {

        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

    }

    public function enqueue_scripts() {
	    if (!is_checkout() && !is_cart()) {
		    return;
	    }

	    wp_enqueue_script('wp-i18n');

        // Register and enqueue the block script
	    wp_register_script(
		    'econt-delivery-block',
		    plugins_url('../build/blocks/checkout.js', __FILE__),
		    array(
			    'jquery',
			    'wp-plugins',
			    'wp-element',
			    'wp-components',
			    'wp-i18n',
			    'wp-data',
			    'wp-hooks',
			    'wc-blocks-checkout',
			    'wc-blocks-registry'
		    ),
		    filemtime(plugin_dir_path(__DIR__) . 'build/blocks/checkout.js'),
		    true
	    );

        // Get cart weight
	    $cart_weight = 0;
	    $pack_count = 0;

	    foreach (WC()->cart->get_cart() as $cart_item) {
		    $product = $cart_item['data'];
		    $weight = $product->get_weight() * Delivery_With_Econt_Shipping::weight_unit_fixer();
		    $quantity = (int)$cart_item['quantity'];

		    // Check if weight is an empty string
		    if ($weight === '') {
			    // Handle empty weight case - could use a default weight or skip
			    // For example: $weight = 0; or continue;
			    $weight = 0; // Using zero as default
		    } else {
			    $weight = (float)$weight;
		    }

		    $cart_weight += $weight * $quantity;
		    $pack_count += $quantity;
	    }

	    // Add manual translations as a fallback
	    $translations = array(
		    'Edit delivery details' => __('Edit delivery details', 'deliver-with-econt'),
		    'Econt Delivery Details' => __('Econt Delivery Details', 'deliver-with-econt'),
		    'Loading Econt delivery options...' => __('Loading Econt delivery options...', 'deliver-with-econt'),
		    'Please complete Econt delivery details before placing your order' => __('Please complete Econt delivery details before placing your order', 'deliver-with-econt'),
		    'Please complete Econt delivery details first' => __('Please complete Econt delivery details first', 'deliver-with-econt'),
		    'Delivery to office:' => __('Delivery to office:', 'deliver-with-econt'),
		    'Delivery to address:' => __('Delivery to address:', 'deliver-with-econt'),
		    'Calculating...' => __('Calculating...', 'deliver-with-econt'),
		    'Free' => __('Free', 'woocommerce')
	    );

	    // Add these translations to the localized data
	    wp_localize_script('econt-delivery-block', 'econtTranslations', $translations);

        wp_localize_script('econt-delivery-block', 'econtData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('delivery-with-econt-security-nonce'),
            'orderWeight' => $cart_weight,
            'packCount' => $pack_count,
            'shopId' => get_option('econt_shop_id', ''), // Make sure this option exists
        ));

	    wp_enqueue_script('econt-delivery-block');

    }

}

new Econt_Blocks(); 
