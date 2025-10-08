<?php

if (!defined( 'ABSPATH')) {
    die;
}

class Delivery_With_Econt_Options
{
    const SHIPPING_METHOD_NAME = 'Econt';

    const PLUGIN_NAME = 'delivery_with_econt';
    // Econt track url
    const TRACK_URL = 'https://www.econt.com/services/track-shipment/';

    const REAL_URL = 'https://delivery.econt.com/';
    const DEMO_URL = 'https://delivery-demo.econt.com/';

    /**
     * Holds the values to be used in the fields callbacks
     */
    private $options;

    /**
     * Start up
     */
    public function __construct()
    {        
        // add_action( 'admin_menu', array( $this, 'add_plugin_page' ) );
        // add_action( 'admin_init', array( $this, 'page_init' ) );
    }    

    /**
     * Add options page
     */
    public function add_plugin_page()
    {
        add_options_page(
            __('Delivery With Econt','deliver-with-econt'), 
            __('Delivery With Econt','deliver-with-econt'), 
            'manage_options', 
            'delivery-with-econt-settings', 
            array( $this, 'create_admin_page' )
        );        
    }

    /**
     * Options page callback
     */
    public function create_admin_page()
    {
        // Set class property
        ?>
        <div class="wrap">
            <h1><?php _e('Econt Delivery Settings Page', 'delivery-with-econt') ?></h1>
            <form method="post" action="options.php">
            <?php
                // This prints out all hidden setting fields
                settings_fields( 'delivery_with_econt_settings_group' );
                do_settings_sections( 'delivery-with-econt-settings' );
                submit_button();
            ?>
            </form>
        </div>
        <?php
    }

    /**
     * Register and add settings
     */
    public function page_init()
    {        
        // dd('a');
        $this->options = get_option( 'delivery_with_econt_settings' );
        register_setting(
            'delivery_with_econt_settings_group', // Option group
            'delivery_with_econt_settings', // Option name
            array( $this, 'sanitize' ) // Sanitize
        );

        add_settings_section(
            'setting_section_id', // ID
            __('Econt Delivery Shop Settings', 'deliver-with-econt'), // Title
            array( $this, 'print_section_info' ), // Callback
            'delivery-with-econt-settings' // Page
        );  

        add_settings_field(
            'store_id', // ID
            __('ID Number', 'deliver-with-econt'), // Title 
            array( $this, 'id_number_callback' ), // Callback
            'delivery-with-econt-settings', // Page
            'setting_section_id' // Section
        );      

        add_settings_field(
            'private_key', 
            __('Private Key', 'deliver-with-econt'), 
            array( $this, 'title_callback' ), 
            'delivery-with-econt-settings', 
            'setting_section_id'
        );    
        
        add_settings_field(
            'demo_service',
            __('Use Econt Demo Service', 'deliver-with-econt'),
            array($this, 'demo_checkbox_callback'),
            'delivery-with-econt-settings',
            'setting_section_id'
        );

	    add_settings_field(
		    'customer_details_selector',
		    __('Customer Details Container', 'deliver-with-econt'),
		    array($this, 'customer_details_selector_callback'),
		    'delivery-with-econt-settings',
		    'setting_section_id'
	    );

	    add_settings_field(
		    'hidden_billing_fields',
		    __('Hidden Billing Fields', 'deliver-with-econt'),
		    array($this, 'hidden_billing_fields_callback'),
		    'delivery-with-econt-settings',
		    'setting_section_id'
	    );

	    add_settings_field(
		    'hidden_shipping_fields',
		    __('Hidden Shipping Fields', 'deliver-with-econt'),
		    array($this, 'hidden_shipping_fields_callback'),
		    'delivery-with-econt-settings',
		    'setting_section_id'
	    );

	    add_settings_field(
		    'custom_hidden_selectors',
		    __('Custom Hidden Selectors', 'deliver-with-econt'),
		    array($this, 'custom_hidden_selectors_callback'),
		    'delivery-with-econt-settings',
		    'setting_section_id'
	    );
    }

    /**
     * Sanitize each setting field as needed
     *
     * @param array $input Contains all settings fields as array keys
     */
    public function sanitize($input) {
        $new_input = array();

        if (isset($input['store_id'])) $new_input['store_id'] = absint($input['store_id']);
        if (isset($input['private_key'])) $new_input['private_key'] = sanitize_text_field($input['private_key']);
        if (isset($input['demo_service'])) $new_input['demo_service'] = absint($input['demo_service']);

	    if (isset($input['customer_details_selector'])) {
		    $new_input['customer_details_selector'] = sanitize_text_field($input['customer_details_selector']);
	    }

	    if (isset($input['hidden_billing_fields'])) {
		    $new_input['hidden_billing_fields'] = is_array($input['hidden_billing_fields'])
			    ? array_map('sanitize_text_field', $input['hidden_billing_fields'])
			    : array();
	    }

	    if (isset($input['hidden_shipping_fields'])) {
		    $new_input['hidden_shipping_fields'] = is_array($input['hidden_shipping_fields'])
			    ? array_map('sanitize_text_field', $input['hidden_shipping_fields'])
			    : array();
	    }

	    if (isset($input['custom_hidden_selectors'])) {
		    $new_input['custom_hidden_selectors'] = sanitize_textarea_field($input['custom_hidden_selectors']);
	    }

        if ($input['private_key'] != $this->options['private_key']) {
            Delivery_With_Econt_Helper::sendLog('activate', 'activated', (intval($new_input['demo_service']) <= 0 ? self::REAL_URL : self::DEMO_URL), $new_input['private_key']);
        }

        return $new_input;
    }

    /** 
     * Print the Section text
     */
    public function print_section_info()
    {
        _e('Enter your settings below:', 'deliver-with-econt');
    }

    /** 
     * Get the settings option array and print one of its values
     */
    public function id_number_callback()
    {        
        printf(
            '<input type="text" id="store_id" name="delivery_with_econt_settings[store_id]" value="%s" />',
            isset( $this->options['store_id'] ) ? esc_attr( $this->options['store_id']) : ''
        );
    }

    /** 
     * Get the settings option array and print one of its values
     */
    public function title_callback()
    {
        printf(
            '<input type="password" id="private_key" name="delivery_with_econt_settings[private_key]" value="%s" />',
            isset( $this->options['private_key'] ) ? esc_attr( $this->options['private_key']) : ''
        );
    }

    function demo_checkbox_callback()
    {
        printf(
            '<!-- Here we are comparing stored value with 1. Stored value is 1 if user checks the checkbox otherwise empty string. -->
            <input type="checkbox" name="delivery_with_econt_settings[demo_service]" value="1" %s />',
            checked(1, $this->options['demo_service'], false)
        );
    }

	/**
	 * Customer Details Selector callback
	 */
	public function customer_details_selector_callback()
	{
		printf(
			'<input type="text" id="customer_details_selector" name="delivery_with_econt_settings[customer_details_selector]" value="%s" placeholder="#customer_details" style="width: 300px;" /><br><small>%s</small>',
			isset( $this->options['customer_details_selector'] ) ? esc_attr( $this->options['customer_details_selector']) : '',
			__('CSS selector for the main customer details container (billing/shipping fields)', 'deliver-with-econt')
		);
	}

	/**
	 * Hidden Billing Fields callback
	 */
	public function hidden_billing_fields_callback()
	{
		$available_fields = array(
			'first_name' => __('First Name', 'deliver-with-econt'),
			'last_name' => __('Last Name', 'deliver-with-econt'),
			'company' => __('Company', 'deliver-with-econt'),
			'country' => __('Country', 'deliver-with-econt'),
			'address_1' => __('Address 1', 'deliver-with-econt'),
			'address_2' => __('Address 2', 'deliver-with-econt'),
			'city' => __('City', 'deliver-with-econt'),
			'state' => __('State/Region', 'deliver-with-econt'),
			'postcode' => __('Postcode', 'deliver-with-econt'),
			'phone' => __('Phone', 'deliver-with-econt'),
			'email' => __('Email', 'deliver-with-econt'),
		);

		$selected_fields = isset($this->options['hidden_billing_fields']) ? $this->options['hidden_billing_fields'] : array();

		echo '<div style="margin-bottom: 10px;">';
		foreach ($available_fields as $field_key => $field_label) {
			$checked = in_array($field_key, $selected_fields) ? 'checked' : '';
			printf(
				'<label style="display: block; margin-bottom: 5px;"><input type="checkbox" name="delivery_with_econt_settings[hidden_billing_fields][]" value="%s" %s /> %s</label>',
				esc_attr($field_key),
				$checked,
				esc_html($field_label)
			);
		}
		echo '</div>';
		echo '<div style="padding: 10px; background-color: #f0f6fc; border-left: 4px solid #2271b1; margin-top: 10px;">';
		echo '<p style="margin: 0;"><strong>' . __('About this setting:', 'deliver-with-econt') . '</strong></p>';
		echo '<p style="margin: 5px 0 0 0;">' . __('Select the billing fields you want to hide on the checkout page when Econt shipping method is selected. These fields will be filled automatically from the Econt delivery form. If no fields are selected, the entire billing section will be hidden (legacy behavior).', 'deliver-with-econt') . '</p>';
		echo '<p style="margin: 5px 0 0 0;"><em>' . __('Recommended fields to hide: First Name, Last Name, Country, Address 1, City, State/Region, Phone', 'deliver-with-econt') . '</em></p>';
		echo '</div>';
	}

	/**
	 * Hidden Shipping Fields callback
	 */
	public function hidden_shipping_fields_callback()
	{
		$available_fields = array(
			'first_name' => __('First Name', 'deliver-with-econt'),
			'last_name' => __('Last Name', 'deliver-with-econt'),
			'company' => __('Company', 'deliver-with-econt'),
			'country' => __('Country', 'deliver-with-econt'),
			'address_1' => __('Address 1', 'deliver-with-econt'),
			'address_2' => __('Address 2', 'deliver-with-econt'),
			'city' => __('City', 'deliver-with-econt'),
			'state' => __('State/Region', 'deliver-with-econt'),
			'postcode' => __('Postcode', 'deliver-with-econt'),
		);

		$selected_fields = isset($this->options['hidden_shipping_fields']) ? $this->options['hidden_shipping_fields'] : array();

		echo '<div style="margin-bottom: 10px;">';
		foreach ($available_fields as $field_key => $field_label) {
			$checked = in_array($field_key, $selected_fields) ? 'checked' : '';
			printf(
				'<label style="display: block; margin-bottom: 5px;"><input type="checkbox" name="delivery_with_econt_settings[hidden_shipping_fields][]" value="%s" %s /> %s</label>',
				esc_attr($field_key),
				$checked,
				esc_html($field_label)
			);
		}
		echo '</div>';
		echo '<div style="padding: 10px; background-color: #f0f6fc; border-left: 4px solid #2271b1; margin-top: 10px;">';
		echo '<p style="margin: 0;"><strong>' . __('About this setting:', 'deliver-with-econt') . '</strong></p>';
		echo '<p style="margin: 5px 0 0 0;">' . __('Select the shipping fields you want to hide on the checkout page when Econt shipping method is selected. These fields will be filled automatically from the Econt delivery form.', 'deliver-with-econt') . '</p>';
		echo '<p style="margin: 5px 0 0 0;"><em>' . __('Note: Only applicable if "Ship to a different address" option is enabled on your checkout.', 'deliver-with-econt') . '</em></p>';
		echo '</div>';
	}

	/**
	 * Custom Hidden Selectors callback
	 */
	public function custom_hidden_selectors_callback()
	{
		printf(
			'<textarea id="custom_hidden_selectors" name="delivery_with_econt_settings[custom_hidden_selectors]" rows="5" style="width: 100%%; max-width: 600px;" placeholder=".custom-field-wrapper%s#special_field_row%s.elementor-widget-woocommerce-checkout-page .my-custom-field">%s</textarea>',
			"\n",
			"\n",
			isset($this->options['custom_hidden_selectors']) ? esc_textarea($this->options['custom_hidden_selectors']) : ''
		);
		echo '<div style="padding: 10px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin-top: 10px;">';
		echo '<p style="margin: 0;"><strong>' . __('Advanced Setting - For Theme Customization:', 'deliver-with-econt') . '</strong></p>';
		echo '<p style="margin: 5px 0 0 0;">' . __('Enter custom CSS selectors (one per line) for additional fields to hide when Econt shipping is selected. This is useful when your theme adds custom checkout fields or uses custom field wrappers.', 'deliver-with-econt') . '</p>';
		echo '<p style="margin: 5px 0 0 0;"><strong>' . __('Examples:', 'deliver-with-econt') . '</strong></p>';
		echo '<ul style="margin: 5px 0 0 20px;">';
		echo '<li><code>.custom-field-wrapper</code> - ' . __('Hides elements with this class', 'deliver-with-econt') . '</li>';
		echo '<li><code>#special_field_row</code> - ' . __('Hides element with this ID', 'deliver-with-econt') . '</li>';
		echo '<li><code>.elementor-widget-woocommerce-checkout-page .my-field</code> - ' . __('Hides specific field in Elementor checkout', 'deliver-with-econt') . '</li>';
		echo '</ul>';
		echo '<p style="margin: 5px 0 0 0;"><em>' . __('Note: Use browser developer tools to inspect your checkout page and find the correct selectors.', 'deliver-with-econt') . '</em></p>';
		echo '</div>';
	}

    /**
     * Econt tracking service
     * 
     * @return const TRACK_URL
     */
    public static function get_track_url()
    {
        return self::TRACK_URL;
    }

    /**
     * The name of the plugin
     * 
     * @return const PLUGIN_NAME
     */
    public static function get_plugin_name()
    {
        return self::PLUGIN_NAME;
    }

    /**
     * The name of the plugin
     * 
     * @return const SHIPPING_METHOD_NAME
     */
    public static function get_shipping_method_name()
    {
        return self::SHIPPING_METHOD_NAME;
    }

    /**
     * undocumented function summary
     *
     * Undocumented function long description
     *
     * @return string const REAL_URL || DEMO_URL
     **/
    public static function get_service_url()
    {
        return self::REAL_URL;
    }

    public static function get_demo_service_url()
    {
        return self::DEMO_URL;
    }
}