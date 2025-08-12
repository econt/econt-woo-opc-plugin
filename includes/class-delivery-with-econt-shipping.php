<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delivery_With_Econt_Shipping extends WC_Shipping_Method
{
    // Shipping method title
    const TITLE = 'Econt';

    // Shipping method description
    const DESCRIPTION = 'Econt Shipping Method';

    /**Wordpress shipping-related variables */
    public $supports;
    public $id;
    public $method_title;
    public $method_description;
    public $enabled;
    public $title;

    /**
     * Constructor for your shipping class
     *
     * @access public
     * @return void
     */
    public function __construct( $instance_id = 0 )
    {
        $this->id                 = Delivery_With_Econt_Options::get_plugin_name();
        $this->instance_id        = absint( $instance_id );
        $this->title              = __(self::TITLE, 'delivery-with-econt');
        $this->method_title       = __(self::TITLE, 'delivery-with-econt');
        $this->method_description = __(self::DESCRIPTION, 'delivery-with-econt');
        $this->enabled            = isset($this->settings['enabled']) ? $this->settings['enabled'] : 'yes';
        $this->supports           = array(
			'shipping-zones',
			'instance-settings',
        );

        $this->init();
    }
    /**
    * Load the settings API
    */
    function init()
    {
        $this->init_form_fields();
        $this->init_settings();                
        // Save settings in admin if you have any defined
        add_action( 'woocommerce_update_options_shipping_' . $this->id, array( $this, 'process_admin_options' ) );        
    }    
    
    public function calculate_shipping( $package = [] )
    {
        $cost = 0;

        if ( array_key_exists('econt_shippment_price', $_COOKIE ) ) {
            $cost = $_COOKIE["econt_shippment_price"];
        }

        $rate = array(
            'id' => $this->id,
            'label' => __('Econt Delivery', 'deliver-with-econt'),
            'cost' =>  $cost
        );
        $this->add_rate( $rate );
    }    
    
    /**
     * Тук можем да проверяваме кой е избраният метод за доставка и ако е Еконт, да проверяваме дали има свързаност със сърварите им.
     * Ако върне статус 500 - проблема е при тях.
     * Ако върне статус 400 - проблема е при нас.
     * Ако върне 200 - всичко е ОК и продължаваме.
     * 
     */

    public function validate_service()
    {
        return false;
    }
	
	public static function get_delivery_url(){
		$options = get_option( 'delivery_with_econt_settings' );
		return DWEH()->get_service_url().'customer_info.php?id_shop='.$options['store_id'];
	}
	
	public static function get_order_info()
    {
        error_log('Getting order info');
        
        $url = DWEH()->get_service_url();
        error_log('Service URL: ' . $url);
        
        // Get plugin settings
        $options = get_option('delivery_with_econt_settings');
        error_log('Plugin settings: ' . print_r($options, true));
        
        // Get parameters from request
        $params = isset($_POST['params']) ? $_POST['params'] : array();
        error_log('Request params: ' . print_r($params, true));
        
        // Get cart data
        $econt_cart = WC()->cart->get_cart();
        
        // Build order data
        $order = array();
        $order['order_total'] = DWEH()->econt_calculate_cart_price($econt_cart);
        $order['order_weight'] = WC()->cart->get_cart_contents_weight();
        $order['pack_count'] = 1;
        $order['order_currency'] = get_woocommerce_currency();
        $order['id_shop'] = $options['store_id'];
        
        // Add customer params
        foreach ($params as $key => $value) {
            $order[$key] = $value;
        }
        
        // Add required params
//        $order['confirm_txt'] = 'Потвърди';
        $order['ignore_history'] = 1;
        
        // error_log('Final order data: ' . print_r($order, true));
        
        // Build and return URL
        $full_url = $url . 'customer_info.php?' . http_build_query($order, null, '&');
        // error_log('Generated URL: ' . $full_url);
        
        wp_send_json($full_url);
    }

    public static function render_form_button($checkout){
            return;
    }

    public static function render_form_modal($checkout) {
        if ( !is_checkout() ) {
            return;
        }        

        ?>
        <!-- Error messages -->
        <div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout econt-alert" style="display: none">
            <ul class="woocommerce-error" role="alert" style="margin-bottom: 5px;">
                <li id="econt_display_error_message"></li>                    
            </ul>
        </div>

        <!-- <input type="hidden" class="input-hidden" name="delivery_with_econt_customer_id" id="delivery_with_econt_customer_id" value="<?php //echo WC()->checkout->get_value('delivery_with_econt_customer_id'); ?>">         -->
        <div id="delivery_with_econt_calculate_shipping">
        </div>
        <?php                       
    }

	/**
	 * Check if shipping method is available
	 *
	 * @param array $package Shipping package
	 * @return bool
	 */
	public function is_available($package) {
		// First check parent availability
		if (!parent::is_available($package)) {
			return false;
		}

		// Check if cart contains only virtual products
		if (DWEH()->cart_contains_only_virtual_products()) {
			return false;
		}

		return true;
	}
}
