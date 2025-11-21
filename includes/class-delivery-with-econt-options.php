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

        // Status Check Section
        add_settings_section(
            'status_section_id',
            __('Plugin Status Check', 'deliver-with-econt'),
            array( $this, 'print_status_section_info' ),
            'delivery-with-econt-settings'
        );

        add_settings_field(
            'plugin_status_display',
            __('System Status', 'deliver-with-econt'),
            array( $this, 'plugin_status_display_callback' ),
            'delivery-with-econt-settings',
            'status_section_id'
        );

        // Original Settings Section
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
	 * Print the Status Section text
	 */
	public function print_status_section_info()
	{
		_e('Check the status and configuration of your Econt plugin installation:', 'deliver-with-econt');
		echo '<p style="margin-top: 10px;">';
		echo '<a href="' . plugin_dir_url(dirname(__FILE__)) . 'docs/Status-Check.md" target="_blank" class="button button-secondary">';
		echo '📖 ' . __('View Full Documentation', 'deliver-with-econt');
		echo '</a>';
		echo '</p>';
	}

	/**
	 * Display plugin status information
	 */
	public function plugin_status_display_callback()
	{
		// Get plugin data
		if (!function_exists('get_plugin_data')) {
			require_once(ABSPATH . 'wp-admin/includes/plugin.php');
		}

		// Get the plugin file path correctly
		// __FILE__ is in includes/class-delivery-with-econt-options.php
		// We need to go up to the plugin root directory
		$plugin_file = plugin_dir_path(dirname(__FILE__)) . 'deliver-with-econt.php';

		$plugin_data = get_plugin_data($plugin_file);
		$plugin_version = isset($plugin_data['Version']) ? $plugin_data['Version'] : __('Unknown', 'deliver-with-econt');

		// Get all shipping methods
		$shipping_methods = $this->get_shipping_methods_status();

		// Get all payment methods
		$payment_methods = $this->get_payment_methods_status();

		// Get checkout page info
		$checkout_info = $this->get_checkout_page_info();

		?>
		<div class="econt-status-container" style="max-width: 800px;">
			<style>
				.econt-status-table {
					width: 100%;
					border-collapse: collapse;
					margin-bottom: 20px;
					background: #fff;
					box-shadow: 0 1px 3px rgba(0,0,0,0.1);
				}
				.econt-status-table th,
				.econt-status-table td {
					padding: 12px;
					text-align: left;
					border-bottom: 1px solid #e5e5e5;
				}
				.econt-status-table th {
					background: #f9f9f9;
					font-weight: 600;
					width: 30%;
				}
				.econt-status-table tr:last-child td {
					border-bottom: none;
				}
				.econt-status-badge {
					display: inline-block;
					padding: 3px 8px;
					border-radius: 3px;
					font-size: 11px;
					font-weight: 600;
					text-transform: uppercase;
				}
				.econt-status-badge.success {
					background: #d4edda;
					color: #155724;
				}
				.econt-status-badge.warning {
					background: #fff3cd;
					color: #856404;
				}
				.econt-status-badge.error {
					background: #f8d7da;
					color: #721c24;
				}
				.econt-status-badge.info {
					background: #d1ecf1;
					color: #0c5460;
				}
				.econt-check-weight-btn {
					margin-top: 10px;
				}
				#econt-weight-check-result {
					margin-top: 10px;
					padding: 10px;
					border-radius: 4px;
					display: none;
				}
				#econt-weight-check-result.success {
					background: #d4edda;
					border: 1px solid #c3e6cb;
					color: #155724;
				}
				#econt-weight-check-result.error {
					background: #f8d7da;
					border: 1px solid #f5c6cb;
					color: #721c24;
				}
				#econt-weight-check-result.warning {
					background: #fff3cd;
					border: 1px solid #ffeeba;
					color: #856404;
				}
				#econt-weight-check-result.info {
					background: #d1ecf1;
					border: 1px solid #bee5eb;
					color: #0c5460;
				}
				#econt-iframe-check-result {
					margin-top: 10px;
					padding: 10px;
					border-radius: 4px;
					display: none;
				}
				#econt-iframe-check-result.success {
					background: #d4edda;
					border: 1px solid #c3e6cb;
					color: #155724;
				}
				#econt-iframe-check-result.error {
					background: #f8d7da;
					border: 1px solid #f5c6cb;
					color: #721c24;
				}
				#econt-iframe-check-result.warning {
					background: #fff3cd;
					border: 1px solid #ffeeba;
					color: #856404;
				}
				.econt-check-item {
					padding: 8px 12px;
					margin: 5px 0;
					border-radius: 3px;
					border-left: 4px solid;
				}
				.econt-check-item.success {
					background: #f0f9f4;
					border-left-color: #28a745;
				}
				.econt-check-item.error {
					background: #fef5f5;
					border-left-color: #dc3545;
				}
				.econt-check-item.warning {
					background: #fffcf0;
					border-left-color: #ffc107;
				}
				.econt-check-item.info {
					background: #f0f8ff;
					border-left-color: #17a2b8;
				}
				.econt-check-item strong {
					display: block;
					margin-bottom: 3px;
				}
				.econt-check-item small {
					opacity: 0.8;
				}
			</style>

			<!-- Plugin Version -->
			<table class="econt-status-table">
				<tr>
					<th><?php _e('Plugin Version', 'deliver-with-econt'); ?></th>
					<td>
						<strong><?php echo esc_html($plugin_version); ?></strong>
					</td>
				</tr>
			</table>

			<!-- Shipping Methods -->
			<table class="econt-status-table">
				<tr>
					<th colspan="2" style="background: #2271b1; color: #fff;">
						<?php _e('Shipping Methods', 'deliver-with-econt'); ?>
					</th>
				</tr>
				<?php if (!empty($shipping_methods)): ?>
					<?php foreach ($shipping_methods as $method): ?>
						<tr>
							<th><?php echo esc_html($method['title']); ?></th>
							<td>
								<?php if ($method['enabled']): ?>
									<span class="econt-status-badge success"><?php _e('Enabled', 'deliver-with-econt'); ?></span>
								<?php else: ?>
									<span class="econt-status-badge error"><?php _e('Disabled', 'deliver-with-econt'); ?></span>
								<?php endif; ?>
								<?php if (!empty($method['zones'])): ?>
									<div style="margin-top: 5px; font-size: 12px; color: #666;">
										<?php _e('Zones:', 'deliver-with-econt'); ?>
										<?php echo esc_html(implode(', ', $method['zones'])); ?>
									</div>
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php else: ?>
					<tr>
						<td colspan="2">
							<span class="econt-status-badge warning"><?php _e('No shipping methods configured', 'deliver-with-econt'); ?></span>
						</td>
					</tr>
				<?php endif; ?>
			</table>

			<!-- Payment Methods -->
			<table class="econt-status-table">
				<tr>
					<th colspan="2" style="background: #2271b1; color: #fff;">
						<?php _e('Payment Methods', 'deliver-with-econt'); ?>
					</th>
				</tr>
				<?php if (!empty($payment_methods)): ?>
					<?php foreach ($payment_methods as $method): ?>
						<tr>
							<th><?php echo esc_html($method['title']); ?></th>
							<td>
								<?php if ($method['enabled']): ?>
									<span class="econt-status-badge success"><?php _e('Enabled', 'deliver-with-econt'); ?></span>
									<?php if (!$method['works_with_econt']): ?>
										<span class="econt-status-badge warning" style="margin-left: 5px;"><?php _e('Restricted', 'deliver-with-econt'); ?></span>
									<?php endif; ?>
								<?php else: ?>
									<span class="econt-status-badge error"><?php _e('Disabled', 'deliver-with-econt'); ?></span>
								<?php endif; ?>

								<?php if ($method['enabled'] && !empty($method['restriction_note'])): ?>
									<div style="margin-top: 5px; font-size: 12px; color: #856404;">
										<strong><?php _e('Warning:', 'deliver-with-econt'); ?></strong> <?php echo esc_html($method['restriction_note']); ?>
									</div>
								<?php endif; ?>

								<?php if ($method['enabled'] && $method['works_with_econt'] && !empty($method['enable_for_methods'])): ?>
									<div style="margin-top: 5px; font-size: 12px; color: #666;">
										<?php _e('Available for Econt shipping', 'deliver-with-econt'); ?>
									</div>
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
				<?php else: ?>
					<tr>
						<td colspan="2">
							<span class="econt-status-badge warning"><?php _e('No payment methods configured', 'deliver-with-econt'); ?></span>
						</td>
					</tr>
				<?php endif; ?>
			</table>

			<!-- Checkout Page Info -->
			<table class="econt-status-table">
				<tr>
					<th colspan="2" style="background: #2271b1; color: #fff;">
						<?php _e('Checkout Page Configuration', 'deliver-with-econt'); ?>
					</th>
				</tr>
				<tr>
					<th><?php _e('Checkout Page', 'deliver-with-econt'); ?></th>
					<td>
						<?php if ($checkout_info['exists']): ?>
							<span class="econt-status-badge success"><?php _e('Found', 'deliver-with-econt'); ?></span>
							<a href="<?php echo esc_url($checkout_info['edit_url']); ?>" class="button button-small" style="margin-left: 10px;">
								<?php _e('Edit Page', 'deliver-with-econt'); ?>
							</a>
						<?php else: ?>
							<span class="econt-status-badge error"><?php _e('Not Found', 'deliver-with-econt'); ?></span>
						<?php endif; ?>
					</td>
				</tr>
				<?php if ($checkout_info['exists']): ?>
					<tr>
						<th><?php _e('Page Builder', 'deliver-with-econt'); ?></th>
						<td>
							<span class="econt-status-badge info"><?php echo esc_html($checkout_info['builder']); ?></span>
						</td>
					</tr>
					<tr>
						<th><?php _e('Checkout Form Type', 'deliver-with-econt'); ?></th>
						<td>
							<span class="econt-status-badge info"><?php echo esc_html($checkout_info['form_type']); ?></span>
						</td>
					</tr>
				<?php endif; ?>
			</table>

			<!-- Product Weight Check -->
			<table class="econt-status-table">
				<tr>
					<th colspan="2" style="background: #2271b1; color: #fff;">
						<?php _e('Product Weight Verification', 'deliver-with-econt'); ?>
					</th>
				</tr>
				<tr>
					<td colspan="2">
						<p><?php _e('Check if all products have weight configured (required for accurate shipping calculations):', 'deliver-with-econt'); ?></p>
						<button type="button" class="button button-primary econt-check-weight-btn" id="econt-check-weight">
							<?php _e('Check All Products Weight', 'deliver-with-econt'); ?>
						</button>
						<span class="spinner" id="econt-weight-spinner" style="float: none; margin-left: 10px;"></span>
						<div id="econt-weight-check-result"></div>
					</td>
				</tr>
			</table>

			<!-- Checkout Page Iframe Check -->
			<table class="econt-status-table">
				<tr>
					<th colspan="2" style="background: #2271b1; color: #fff;">
						<?php _e('Checkout Page Integration Check', 'deliver-with-econt'); ?>
					</th>
				</tr>
				<tr>
					<td colspan="2">
						<p><?php _e('Verify that the Econt iframe container and required assets are loaded on the checkout page:', 'deliver-with-econt'); ?></p>
						<button type="button" class="button button-primary econt-check-iframe-btn" id="econt-check-iframe">
							<?php _e('Check Checkout Page Integration', 'deliver-with-econt'); ?>
						</button>
						<span class="spinner" id="econt-iframe-spinner" style="float: none; margin-left: 10px;"></span>
						<div id="econt-iframe-check-result"></div>
					</td>
				</tr>
			</table>
		</div>

		<script type="text/javascript">
		jQuery(document).ready(function($) {
			var currentBatch = 0;
			var isProcessing = false;

			function processBatch() {
				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: {
						action: 'econt_check_products_weight',
						security: '<?php echo wp_create_nonce('econt_check_weight_nonce'); ?>',
						batch: currentBatch
					},
					success: function(response) {
						if (response.data.completed) {
							// Processing complete
							$('#econt-weight-spinner').removeClass('is-active');
							$('#econt-check-weight').prop('disabled', false);
							isProcessing = false;
							currentBatch = 0;

							var $result = $('#econt-weight-check-result');
							if (response.success) {
								$result.removeClass('error warning').addClass('success');
								$result.html(response.data.message);
							} else {
								if (response.data.type === 'warning') {
									$result.removeClass('error success').addClass('warning');
								} else {
									$result.removeClass('success warning').addClass('error');
								}
								$result.html(response.data.message);
							}
							$result.show();
						} else {
							// Continue with next batch
							var $result = $('#econt-weight-check-result');
							$result.removeClass('error warning success').addClass('info');

							// Show progress with progress bar
							var progressHtml = '<div style="margin-bottom: 10px;">';
							progressHtml += '<strong>' + response.data.message + '</strong>';
							progressHtml += '</div>';
							progressHtml += '<div style="background: #f0f0f0; height: 20px; border-radius: 3px; overflow: hidden;">';
							progressHtml += '<div style="background: #2271b1; height: 100%; width: ' + response.data.progress + '%; transition: width 0.3s ease;"></div>';
							progressHtml += '</div>';

							$result.html(progressHtml);
							$result.show();

							currentBatch++;
							processBatch(); // Process next batch
						}
					},
					error: function() {
						$('#econt-weight-spinner').removeClass('is-active');
						$('#econt-check-weight').prop('disabled', false);
						isProcessing = false;
						currentBatch = 0;

						var $result = $('#econt-weight-check-result');
						$result.removeClass('success warning').addClass('error');
						$result.html('<?php _e('An error occurred while checking product weights.', 'deliver-with-econt'); ?>');
						$result.show();
					}
				});
			}

			$('#econt-check-weight').on('click', function() {
				if (isProcessing) {
					return; // Prevent multiple clicks
				}

				var $button = $(this);
				var $spinner = $('#econt-weight-spinner');
				var $result = $('#econt-weight-check-result');

				$button.prop('disabled', true);
				$spinner.addClass('is-active');
				$result.hide();

				isProcessing = true;
				currentBatch = 0;

				processBatch();
			});

			// Iframe check handler
			$('#econt-check-iframe').on('click', function() {
				var $button = $(this);
				var $spinner = $('#econt-iframe-spinner');
				var $result = $('#econt-iframe-check-result');

				$button.prop('disabled', true);
				$spinner.addClass('is-active');
				$result.hide();

				$.ajax({
					url: ajaxurl,
					type: 'POST',
					data: {
						action: 'econt_check_iframe_container',
						security: '<?php echo wp_create_nonce('econt_check_iframe_nonce'); ?>'
					},
					success: function(response) {
						$spinner.removeClass('is-active');
						$button.prop('disabled', false);

						var html = '<h4>' + response.data.message + '</h4>';

						if (response.data.checks && response.data.checks.length) {
							response.data.checks.forEach(function(check) {
								html += '<div class="econt-check-item ' + check.status + '">';
								html += '<strong>' + check.label + '</strong>';
								html += '<small>' + check.message + '</small>';
								html += '</div>';
							});
						}

						if (response.data.checkout_url) {
							html += '<p style="margin-top: 15px;"><a href="' + response.data.checkout_url + '" target="_blank" class="button"><?php _e('View Checkout Page', 'deliver-with-econt'); ?></a></p>';
						}

						if (response.success) {
							$result.removeClass('error warning').addClass('success');
						} else {
							if (response.data.type === 'warning') {
								$result.removeClass('error success').addClass('warning');
							} else {
								$result.removeClass('success warning').addClass('error');
							}
						}

						$result.html(html);
						$result.show();
					},
					error: function() {
						$spinner.removeClass('is-active');
						$button.prop('disabled', false);
						$result.removeClass('success warning').addClass('error');
						$result.html('<?php _e('An error occurred while checking the checkout page.', 'deliver-with-econt'); ?>');
						$result.show();
					}
				});
			});
		});
		</script>
		<?php
	}

	/**
	 * Get shipping methods status
	 */
	private function get_shipping_methods_status()
	{
		$methods = array();
		$shipping_zones = WC_Shipping_Zones::get_zones();

		foreach ($shipping_zones as $zone) {
			foreach ($zone['shipping_methods'] as $method) {
				if ($method->id === 'delivery_with_econt') {
					$methods[] = array(
						'title' => $method->get_title(),
						'enabled' => $method->enabled === 'yes',
						'zones' => array($zone['zone_name'])
					);
				}
			}
		}

		// Check for methods in "Rest of the World" zone
		$zone_0 = new WC_Shipping_Zone(0);
		foreach ($zone_0->get_shipping_methods() as $method) {
			if ($method->id === 'delivery_with_econt') {
				$methods[] = array(
					'title' => $method->get_title(),
					'enabled' => $method->enabled === 'yes',
					'zones' => array(__('Rest of the World', 'deliver-with-econt'))
				);
			}
		}

		return $methods;
	}

	/**
	 * Get payment methods status
	 */
	private function get_payment_methods_status()
	{
		$methods = array();
		$payment_gateways = WC()->payment_gateways->payment_gateways();

		foreach ($payment_gateways as $gateway) {
			// Check if this payment method is restricted to specific shipping methods
			$enable_for_methods = array();
			$enable_for_virtual = true;

			if (isset($gateway->enable_for_methods) && is_array($gateway->enable_for_methods)) {
				$enable_for_methods = $gateway->enable_for_methods;
			}

			if (isset($gateway->enable_for_virtual)) {
				$enable_for_virtual = $gateway->enable_for_virtual === 'yes';
			}

			// Determine if this gateway works with Econt shipping
			$works_with_econt = true;
			$restriction_note = '';

			if (!empty($enable_for_methods)) {
				// If specific methods are set, check if Econt is in the list
				if (!in_array('delivery_with_econt', $enable_for_methods)) {
					$works_with_econt = false;
					$restriction_note = __('Not enabled for Econt shipping', 'deliver-with-econt');
				}
			}

			$methods[] = array(
				'id' => $gateway->id,
				'title' => $gateway->get_title(),
				'enabled' => $gateway->enabled === 'yes',
				'works_with_econt' => $works_with_econt,
				'restriction_note' => $restriction_note,
				'enable_for_methods' => $enable_for_methods
			);
		}

		return $methods;
	}

	/**
	 * Get checkout page information
	 */
	private function get_checkout_page_info()
	{
		$checkout_page_id = wc_get_page_id('checkout');
		$info = array(
			'exists' => false,
			'edit_url' => '',
			'builder' => __('Unknown', 'deliver-with-econt'),
			'form_type' => __('Unknown', 'deliver-with-econt')
		);

		if ($checkout_page_id && $checkout_page_id > 0) {
			$info['exists'] = true;
			$info['edit_url'] = get_edit_post_link($checkout_page_id);

			// Detect page builder
			$post_content = get_post_field('post_content', $checkout_page_id);

			// Check for Elementor
			if (get_post_meta($checkout_page_id, '_elementor_edit_mode', true)) {
				$info['builder'] = 'Elementor';
			}
			// Check for Avada (Fusion Builder)
			elseif (get_post_meta($checkout_page_id, '_fusion', true) ||
			        get_post_meta($checkout_page_id, 'fusion_builder_status', true) === 'active' ||
			        strpos($post_content, '[fusion_') !== false) {
				$info['builder'] = 'Avada';
			}
			// Check for Divi
			elseif (get_post_meta($checkout_page_id, '_et_pb_use_builder', true) === 'on') {
				$info['builder'] = 'Divi';
			}
			// Check for WPBakery
			elseif (get_post_meta($checkout_page_id, '_wpb_vc_js_status', true)) {
				$info['builder'] = 'WPBakery';
			}
			// Check for Gutenberg blocks
			elseif (has_blocks($post_content)) {
				$info['builder'] = 'Gutenberg';
			}
			// Classic Editor
			else {
				$info['builder'] = __('Classic Editor', 'deliver-with-econt');
			}

			// Detect checkout form type
			if (has_block('woocommerce/checkout', $post_content)) {
				$info['form_type'] = __('Gutenberg Block', 'deliver-with-econt');
			} elseif (strpos($post_content, '[woocommerce_checkout]') !== false) {
				$info['form_type'] = __('Classic Shortcode', 'deliver-with-econt');
			} elseif (in_array($info['builder'], array('Elementor', 'Divi', 'WPBakery', 'Avada'))) {
				$info['form_type'] = __('Page Builder', 'deliver-with-econt');
			} else {
				$info['form_type'] = __('Unknown', 'deliver-with-econt');
			}
		}

		return $info;
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