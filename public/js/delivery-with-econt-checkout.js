jQuery(document).ready(function($){
	let global_shippment_price_cod;
	let global_shippment_price_cod_e;
	let global_shippment_price_no_cod;
	let global_info_message;
	let use_shipping = false;
	var globalAlertMessage = false;

	// Helper function to get custom selectors from window object
	function getCustomSelectors() {
		return window.econtCustomSelectors || {
			customerDetails: '#customer_details',
			shippingOptions: ['#shipping-option', '.wc-block-components-shipping-rates-control', '.shipping_method', '.woocommerce-shipping-methods', '#shipping_method'],
			placeOrderButton: ['#place_order', '.wc-block-components-checkout-place-order-button'],
			additionalFields: '.woocommerce-additional-fields',
			checkoutForm: ['form[name="checkout"]', 'form.woocommerce-checkout']
		};
	}

	// Helper function to get field configuration
	function getFieldConfig() {
		return window.econtFieldConfig || {
			customSelectors: getCustomSelectors(),
			hiddenBillingFields: [],
			hiddenShippingFields: [],
			customHiddenSelectors: []
		};
	}

	// Build field selectors based on configuration
	function buildFieldSelectors() {
		const config = getFieldConfig();
		const selectors = [];

		// Add billing field selectors
		config.hiddenBillingFields.forEach(function(field) {
			selectors.push('#billing_' + field + '_field');
		});

		// Add shipping field selectors
		config.hiddenShippingFields.forEach(function(field) {
			selectors.push('#shipping_' + field + '_field');
		});

		// Add custom selectors
		if (config.customHiddenSelectors && config.customHiddenSelectors.length > 0) {
			config.customHiddenSelectors.forEach(function(selector) {
				selectors.push(selector);
			});
		}

		return selectors;
	}

	// Initialize shipping method toggle
	function initializeShippingMethodToggle() {
		// Check initial shipping method and set appropriate display
		toggleFieldsBasedOnShippingMethod();

		// Listen for shipping method changes
		// $(document.body).on('updated_checkout', function() {
		// 	console.log('updated_checkout')
		// 	toggleFieldsBasedOnShippingMethod();
		// 	bindShippingMethodChangeEvents();
		// });

		// Initial binding
		// bindShippingMethodChangeEvents();
	}

	// Toggle between Econt iframe and default WooCommerce fields
	function toggleFieldsBasedOnShippingMethod(forceEcont) {
		const customSelectors = getCustomSelectors();
		const customerDetailsElement = $(customSelectors.customerDetails);
		const fieldSelectors = buildFieldSelectors();

		// Allow forcing Econt mode for multistep checkouts
		var isEcont = forceEcont === true ? true : checkIfShippingMethodIsEcont();

		if (isEcont) {
			// Hide specific fields based on configuration
			if (fieldSelectors.length > 0) {
				fieldSelectors.forEach(function(selector) {
					$(selector).hide().addClass('econt-hidden-field');
				});
			} else {
				// Fallback: hide entire customer details if no specific fields configured
				customerDetailsElement.hide();
			}

			// Move additional fields if they exist
			if (customerDetailsElement.find('.woocommerce-additional-fields').length) {
				customerDetailsElement.find('.woocommerce-additional-fields').prependTo(customerDetailsElement.parent());
			}

			// Create iframe container if it doesn't exist
			if ($("#place_iframe_here").length === 0) {
				customerDetailsElement.after($("<div class='col2-set' style='display: block;' id='place_iframe_here'></div>"));
			} else {
				$("#place_iframe_here").show();
			}

			// Only load Econt iframe if it hasn't been submitted yet
			// Check if iframe already exists and if shipping prices are already set
			var iframeExists = $('#delivery_with_econt_iframe').length > 0;
			var hasShippingData = global_shippment_price_cod !== undefined && global_shippment_price_no_cod !== undefined;

			if (!iframeExists || !hasShippingData) {
				// Load Econt iframe only if not yet submitted
				getDataFromForm(use_shipping).then();
			}
		} else {
			// Show hidden fields for other shipping methods
			if (fieldSelectors.length > 0) {
				fieldSelectors.forEach(function(selector) {
					$(selector).show().removeClass('econt-hidden-field');
				});
			} else {
				// Fallback: show entire customer details if no specific fields configured
				customerDetailsElement.show();
			}

			// Hide Econt iframe container
			$("#place_iframe_here").hide();

			// Move additional fields back if needed
			if ($(".woocommerce-additional-fields").length && !customerDetailsElement.find('.woocommerce-additional-fields').length) {
				$(".woocommerce-additional-fields").appendTo(customerDetailsElement);
			}
		}
	}

	// Bind change events to shipping method radio buttons
	function bindShippingMethodChangeEvents() {
		$('input[name^="shipping_method"]').off('change.econtToggle').on('change.econtToggle', function() {
			// Reset cookies when shipping method changes
			resetCookies();

			// Toggle fields based on selected shipping method
			toggleFieldsBasedOnShippingMethod();

			// Trigger checkout update to refresh totals
			$('body').trigger('update_checkout');
		});
	}

	// Check if Econt shipping method is selected
	function checkIfShippingMethodIsEcont() {
		let sh = $('[value=delivery_with_econt]');
		if (sh.prop("type") === 'radio' && sh.prop('checked')) return true;
		else if (sh.prop("type") === 'hidden') return true;
		return false;
	}

	// Check if Econt is selected via AJAX (for multistep checkouts)
	function checkIfEcontSelectedViaAjax(callback) {
		// Try to get the chosen shipping method from WooCommerce session
		$.ajax({
			type: 'POST',
			url: delivery_with_econt_calculate_shipping_object.ajax_url,
			data: {
				action: 'get_chosen_shipping_method'
			},
			success: function(response) {
				var isEcont = false;
				if (response && typeof response === 'string' && response.indexOf('delivery_with_econt') !== -1) {
					isEcont = true;
				} else if (response && response.data && typeof response.data === 'string' && response.data.indexOf('delivery_with_econt') !== -1) {
					isEcont = true;
				}
				callback(isEcont);
			},
			error: function() {
				// Assume Econt is selected if we can't determine otherwise
				callback(true);
			}
		});
	}

	// Reset cookies function
	function resetCookies() {
		document.cookie = "econt_shippment_price=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		document.cookie = "econt_customer_info_id=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

		global_shippment_price_cod = undefined;
		global_shippment_price_cod_e = undefined;
		global_shippment_price_no_cod = undefined;
		global_info_message = undefined;
	}

	// Prevent form submission if Econt is selected but shipping price not confirmed
	function validateShippingPrice(e) {
		if (checkIfShippingMethodIsEcont() && (global_shippment_price_cod === undefined || global_shippment_price_cod_e === undefined || global_shippment_price_no_cod === undefined)) {
			e.preventDefault();
			e.stopPropagation();
			if (globalAlertMessage) {
				$('body').trigger('update_checkout');
				globalAlertMessage = false;
				return;
			}

			var locale = document.documentElement.lang.split('-')[0];
			var alertText = (locale === 'bg') ? 'Моля потвърдете секцията с данните за доставка.' : 'Please confirm the shipping details section.';

			alert(alertText);
			$('body').trigger('update_checkout');
			globalAlertMessage = true;
			return false;
		}
	}

	// Get checkout form selectors for validation
	var customSelectors = getCustomSelectors();
	var checkoutFormsArray = customSelectors.checkoutForm || ['form[name="checkout"]', 'form.woocommerce-checkout'];
	var checkoutForms = checkoutFormsArray.join(', ');

	// Prevent form submission with Enter key on checkout forms
	$(checkoutForms).on('keypress', function(e) {
		var key = e.which || e.keyCode;
		if (key === 13) { // 13 is enter
			e.preventDefault();
			e.stopPropagation();
		}
	});

	// Form submission validation - target only checkout forms

	$(checkoutForms).submit(function(e) {
		validateShippingPrice(e);
	});

	// Place order button click handler
	$(document.body).on('click', '#place_order', function(e) {
		validateShippingPrice(e);
	});

	// Handle checkout errors
	$(document.body).on('checkout_error', function(event) {
		resetCookies();
		$('body').trigger('update_checkout');
	});

	// Edit details button handler
	$(document).on('click', '#edit_details', function() {
		this.style.display = 'none';
		$('#delivery_with_econt_iframe')[0].style.display = 'block';
	});

	// Coupon handlers
	// $(document).on('click', "button[name='apply_coupon']", resetCookies);
	// $(document).on('click', "a.woocommerce-remove-coupon", resetCookies);

	// Payment method change handler for Econt shipping
	$(document.body).on('updated_checkout', function() {
		let payment_input = $('input[name^="payment_method"]');
		let selected_shipping_method = getSelectedShippingMethod();

		let econtPrice = getCookie('econt_shippment_price');
		// Show/hide iframe based on previous selections
		if (global_info_message !== undefined || global_shippment_price_cod ) {
			let iframe = $('#delivery_with_econt_iframe');
			iframe[0].style.display = 'none';
			$("#edit_details")[0].style.display = 'block';
		}

		// Handle payment method changes when Econt is selected
		payment_input.each((key, field) => {
			$('#' + field.id).change(function() {
				if (this.value == 'cod' && selected_shipping_method === 'delivery_with_econt') {
					document.cookie = "econt_shippment_price=" + global_shippment_price_cod + "; path=/";
					$('#econt_detailed_shipping').css('display', 'block');
				} else if (this.value == 'econt_payment' && selected_shipping_method === 'delivery_with_econt') {
					document.cookie = "econt_shippment_price=" + global_shippment_price_cod_e + "; path=/";
					$('#econt_detailed_shipping').css('display', 'block');
				} else if (selected_shipping_method === 'delivery_with_econt') {
					document.cookie = "econt_shippment_price=" + global_shippment_price_no_cod + "; path=/";
					$('#econt_detailed_shipping').css('display', 'none');
				}
				$('body').trigger('update_checkout');
			});
		});

		// Show/hide Econt calculation button
		if (selected_shipping_method === 'delivery_with_econt') {
			$("#delivery_with_econt_calculate_shipping").css('display', 'grid');
		}

		$(".woocommerce-checkout-review-order ul").css('margin', 0);

	});

	// Helper function to get selected shipping method
	function getSelectedShippingMethod() {
		// get the shipping method input field
		let input_type = $('input[name^="shipping_method"]')[0];
		// check what type of field do we have and take corresponding action
		if (input_type != undefined && input_type.type === 'radio') {
			return $('input[name^="shipping_method"]:checked').val();
		} else if (input_type != undefined && input_type.type === 'hidden') {
			return input_type.value;
		}
		return '';
	}

	// Handle iframe messages from Econt
	window.addEventListener('message', function(message) {
		let econt_service_url = $('meta[name="econt-service-url"]')[0].content;

		// Check if this "message" came from Econt delivery system
		if (econt_service_url.indexOf(message.origin) < 0) return;

		globalAlertMessage = false;

		let data = message['data'];
		let updateCart = false;

		// Handle shipping errors
		if (data['shipment_error'] && data['shipment_error'] !== '') {
			$('#econt_display_error_message').empty().append(data['shipment_error']);

			$('.econt-alert').addClass('active');
			$('html,body').animate({scrollTop: $('#delivery_with_econt_calculate_shipping').offset().top - 50}, 750);
			setTimeout(function() {
				$('.econt-alert').removeClass('active');
			}, 3500);

			return false;
		}

		// Process shipping prices
		let codInput = document.getElementById('payment_method_cod');
		let econt_payment_input = document.getElementById('payment_method_econt_payment');

		let shipmentPrice;
		global_shippment_price_cod = data['shipping_price_cod'];
		global_shippment_price_cod_e = data['shipping_price_cod_e'];
		global_shippment_price_no_cod = data['shipping_price'];

		if (codInput && codInput.checked) shipmentPrice = data['shipping_price_cod'];
		else if (econt_payment_input && econt_payment_input.checked) shipmentPrice = data['shipping_price_cod_e'];
		else shipmentPrice = data['shipping_price'];

		global_info_message = data['shipping_price'] +
			' ' +
			data['shipping_price_currency_sign'] +
			' за доставка и ' +
			(Math.round((shipmentPrice - data['shipping_price']) * 100) / 100) +
			' ' +
			data['shipping_price_currency_sign'] +
			' наложен платеж.';

		document.cookie = "econt_shippment_price=" + shipmentPrice + "; path=/";

		updateCart = true;

		if (updateCart) {
			// Set billing form fields from Econt data
			let full_name = [];
			let company = '';

			var locale = document.documentElement.lang.split('-')[0];
			var officeText = (locale === 'bg') ? 'Доставка до офис: ' : 'Delivery to office: ';
			var addressText = (locale === 'bg') ? 'Доставка до адрес: ' : 'Delivery to address: ';

			if (data['face'] != null) {
				full_name = data['face'].split(' ');
				company = data['name'];
			} else {
				full_name = data['name'].split(' ');
			}

			// Fill in form fields with received data - update BOTH billing and shipping fields
			var addressValue = data['address'] != '' ? addressText + data['address'] : officeText + data['office_name_only'];

			// Update billing fields
			setFieldValue('billing_first_name', full_name[0] || '');
			setFieldValue('billing_last_name', full_name[1] || '');
			setFieldValue('billing_company', company);
			setFieldValue('billing_address_1', addressValue);
			setFieldValue('billing_city', data['city_name']);
			setFieldValue('billing_postcode', data['post_code']);
			setFieldValue('billing_phone', data['phone']);
			setFieldValue('billing_email', data['email']);

			// Update shipping fields
			setFieldValue('shipping_first_name', full_name[0] || '');
			setFieldValue('shipping_last_name', full_name[1] || '');
			setFieldValue('shipping_company', company);
			setFieldValue('shipping_address_1', addressValue);
			setFieldValue('shipping_city', data['city_name']);
			setFieldValue('shipping_postcode', data['post_code']);

			// Handle state selection for billing
			var $billingState = jQuery("#billing_state");
			if ($billingState.length) {
				$billingState.find("option").each(function() {
					var $this = jQuery(this);
					if ($this.text() === data["city_name"]) {
						$billingState.val($this.val());
						return false;
					}
				});
				if ($billingState.val() === "") {
					$billingState.val($billingState.find("option:eq(1)").val());
				}
				$billingState.change();
			}

			// Handle state selection for shipping
			var $shippingState = jQuery("#shipping_state");
			if ($shippingState.length) {
				$shippingState.find("option").each(function() {
					var $this = jQuery(this);
					if ($this.text() === data["city_name"]) {
						$shippingState.val($this.val());
						return false;
					}
				});
				if ($shippingState.val() === "") {
					$shippingState.val($shippingState.find("option:eq(1)").val());
				}
				$shippingState.change();
			}

			document.cookie = "econt_customer_info_id=" + data['id'] + "; path=/";

			// Trigger WooCommerce update
			$('body').trigger('update_checkout');
		}
	}, false);

	// Track if initialization has been completed
	var isInitialized = false;

	// Initialize the shipping method toggle functionality
	function safeInitialize() {
		var shippingMethods = $('input[name^="shipping_method"]');

		// Only initialize if we have shipping methods and haven't initialized yet
		if (shippingMethods.length > 0 && !isInitialized) {
			isInitialized = true;
			initializeShippingMethodToggle();

			// Disconnect observer if it exists
			if (window.econtShippingObserver) {
				window.econtShippingObserver.disconnect();
				window.econtShippingObserver = null;
			}
		}
	}

	// Listen for WooCommerce init_checkout event (standard WooCommerce)
	$(document.body).on('init_checkout', function() {
		safeInitialize();
	});

	// Listen for updated_checkout event (fires after AJAX updates)
	$(document.body).on('updated_checkout', function() {
		safeInitialize();
	});

	// Use event delegation for shipping method changes
	$(document).on('change.econtToggle', 'input[name^="shipping_method"]', function() {
		resetCookies();
		toggleFieldsBasedOnShippingMethod();
		$('body').trigger('update_checkout');
	});

	// Reset cookies on page load
	resetCookies();

	// Strategy 1: Try immediate initialization (for fast-loading pages)
	safeInitialize();

	// Strategy 2: Use MutationObserver to watch for shipping methods being added to DOM
	// This is the most reliable approach for page builders (Avada, Elementor, Divi, etc.)
	if (!isInitialized && typeof MutationObserver !== 'undefined') {
		var checkoutForm = document.querySelector('form.woocommerce-checkout, form[name="checkout"]');

		if (checkoutForm) {
			window.econtShippingObserver = new MutationObserver(function(mutations) {
				// Check if shipping methods have been added
				if (!isInitialized) {
					safeInitialize();
				}
			});

			// Start observing the checkout form for changes
			window.econtShippingObserver.observe(checkoutForm, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['value', 'checked']
			});

			// Fallback: Stop observing after 10 seconds to prevent memory leaks
			setTimeout(function() {
				if (window.econtShippingObserver) {
					window.econtShippingObserver.disconnect();
					window.econtShippingObserver = null;
				}
			}, 10000);
		}
	}

	// Strategy 3: Fallback polling for environments where MutationObserver might not work
	// Try a few times with increasing intervals
	var pollAttempts = 0;
	var maxPollAttempts = 5;
	var pollInterval;

	function pollForShippingMethods() {
		if (!isInitialized && pollAttempts < maxPollAttempts) {
			pollAttempts++;
			safeInitialize();
		} else {
			clearInterval(pollInterval);
		}
	}

	// Start polling after a short delay (in case MutationObserver works first)
	setTimeout(function() {
		if (!isInitialized) {
			pollInterval = setInterval(pollForShippingMethods, 800);
		}
	}, 300);

	// Strategy 4: Enhanced support for multistep checkouts
	// Watch for when customer details appears (common in multistep checkouts)
	// This handles cases where the billing form appears after initial page load
	// and shipping method inputs may not be visible (already selected in previous step)
	if (typeof MutationObserver !== 'undefined') {
		// Get custom selector for customer details
		var customSelectors = getCustomSelectors();
		var customerDetailsSelector = customSelectors.customerDetails || '#customer_details';

		// Check immediately if the element already exists (page already loaded)
		if ($(customerDetailsSelector).length > 0 && $('input[name^="shipping_method"]').length === 0) {
			checkIfEcontSelectedViaAjax(function(isEcont) {
				if (isEcont) {
					toggleFieldsBasedOnShippingMethod(true); // Pass true to force Econt mode
				}
			});
		}

		var bodyObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				// Check if customer_details or shipping method inputs were added to the DOM
				if (mutation.addedNodes && mutation.addedNodes.length > 0) {
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var node = mutation.addedNodes[i];
						if (node.nodeType === 1) { // Element node
							var foundCustomerDetails = false;
							var foundShippingMethods = false;

							// Check if this node or its children contain customer_details
							if ($(node).is(customerDetailsSelector) || $(node).find(customerDetailsSelector).length > 0) {
								foundCustomerDetails = true;
							}

							// Check if this node or its children contain shipping method inputs
							if ($(node).is('input[name^="shipping_method"]') || $(node).find('input[name^="shipping_method"]').length > 0) {
								foundShippingMethods = true;
							}

							// If we found customer details or shipping methods
							if (foundCustomerDetails || foundShippingMethods) {
								// For multistep checkouts without visible shipping inputs,
								// we need to handle initialization differently
								var hasShippingInputs = $('input[name^="shipping_method"]').length > 0;

								if (!hasShippingInputs && foundCustomerDetails) {
									// Multistep checkout: shipping already selected, billing form just appeared
									// Check if Econt is selected via AJAX (stored in WooCommerce session)
									checkIfEcontSelectedViaAjax(function(isEcont) {
										if (isEcont) {
											// Directly trigger the iframe creation - pass true to force Econt mode
											toggleFieldsBasedOnShippingMethod(true);
										} else {
											console.log('Econt: Econt not selected in multistep checkout');
										}
									});
								} else if (hasShippingInputs) {
									// Standard checkout or multistep with shipping inputs visible
									// Reset initialization flag to allow re-initialization
									isInitialized = false;
									// Try to initialize again
									safeInitialize();
									// If successful, trigger the shipping method check
									if (isInitialized) {
										toggleFieldsBasedOnShippingMethod();
									}
								}
							}
						}
					}
				}
			});
		});

		// Observe the entire document body for changes
		bodyObserver.observe(document.body, {
			childList: true,
			subtree: true
		});

		console.log('Econt: Enhanced multistep checkout observer initialized');
	}
});

/**
 * Render the actual iframe, based on the provided user info
 *
 * @param {string} data - URL data for the iframe
 */
function showIframe(data) {
	var locale = document.documentElement.lang.split('-')[0];
	if (['bg', 'en', 'gr', 'ro'].indexOf(locale) == -1) locale = 'bg';
	let url = data.split('"').join('').replace(/\\\//g, "/");
	let iframe = '<iframe style="margin-top: 2rem;" src="' + url + '&module=onecheckout&lang=' + locale + '" scrolling="yes" id="delivery_with_econt_iframe" name="econt_iframe_form"></iframe>';
	let iframeContainer = jQuery('#place_iframe_here');

	// empty the div if any other instances of the iframe were generated
	iframeContainer.empty();

	// append the generated iframe in the div
	var h3Text = (locale === 'bg') ? 'Данни за доставка и фактуриране' : 'Billing & Delivery Details';
	iframeContainer.append("<h3 style='margin-top: 1.5rem;'>" + h3Text + "</h3>");
	iframeContainer.append(iframe);

	var buttonText = (locale === 'bg') ? 'Промени данни за доставка' : 'Edit delivery details';
	iframeContainer.append(jQuery("<button type='button' class='econt-button econt-button-details' id='edit_details' style='display: none;'>" + buttonText + "</button>"));

	stopLoader();
}

/**
 * Get data from form and load Econt iframe
 *
 * @param {boolean} use_shipping - Whether to use shipping fields
 * @returns {Promise} - Ajax request promise
 */
async function getDataFromForm(use_shipping) {
	let post_data = {
		action: 'woocommerce_delivery_with_econt_get_orderinfo',
		security: delivery_with_econt_calculate_shipping_object.security,
	};
	let params = {};
	let fName = '';
	let lName = '';

	startLoader();

	if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name'))
		fName = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name').value;
	if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name'))
		lName = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name').value;
	if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company'))
		params.customer_company = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company').value;
	if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1'))
		params.customer_address = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1').value;
	if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city'))
		params.customer_city_name = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city').value;
	if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode'))
		params.customer_post_code = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode').value;
	if (document.getElementById('billing_phone'))
		params.customer_phone = document.getElementById('billing_phone').value;
	if (document.getElementById('billing_email'))
		params.customer_email = document.getElementById('billing_email').value;

	params.customer_name = fName + ' ' + lName;
	post_data.params = params;

	return jQuery.ajax({
		type: 'POST',
		url: delivery_with_econt_calculate_shipping_object.ajax_url + '',
		data: post_data,
		success: function(response) {
			jQuery('#delivery_with_econt_calculate_shipping').removeClass('height-30');
			showIframe(response);
		},
		dataType: 'html'
	});

}

/**
 * Start the loading animation
 */
function startLoader() {
	jQuery('#place_iframe_here').addClass('econt-loader');
	jQuery('#delivery_with_econt_calculation_container').addClass('econt-loader');
}

/**
 * Stop the loading animation
 */
function stopLoader() {
	setTimeout(function() {
		jQuery('#place_iframe_here').removeClass('econt-loader');
		jQuery('#delivery_with_econt_calculation_container').removeClass('econt-loader');
	}, 1000);
}

/**
 * Show shipping price information
 *
 * @param {string} global_message - Message to display
 */
function showPriceInfo(global_message) {
	let im = jQuery('#econt_detailed_shipping');
	im.empty();

	if (!checkIfShippingMethodIsEcont()) {
		im.css("display", "none");
	} else {
		if (checkIfPaymentMethodIsSelected('payment_method_cod')) {
			im.text(global_message);
		} else if (checkIfPaymentMethodIsSelected('payment_method_econt_payment')) {
			im.text("");
		} else {
			im.text("");
		}

		im.css("display", "block");
	}
}

/**
 * Check if Econt shipping method is selected
 *
 * @returns {boolean} - True if Econt shipping is selected
 */
function checkIfShippingMethodIsEcont() {
	let sh = jQuery('[value=delivery_with_econt]');
	if (sh.prop("type") === 'radio' && sh.prop('checked')) return true;
	else if (sh.prop("type") === 'hidden') return true;

	return false;
}

/**
 * Check if a specific payment method is selected
 *
 * @param {string} el_id_payment_method - Payment method element ID
 * @returns {boolean} - True if the payment method is selected
 */
function checkIfPaymentMethodIsSelected(el_id_payment_method) {
	let del = jQuery('#' + el_id_payment_method);

	if (del.prop('type') === 'radio' && del.prop("checked")) return true;
	else if (del.prop("type") === 'hidden') return true;

	return false;
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}

function setFieldValue(fieldId, value) {
	var $field = jQuery('#' + fieldId);
	if ($field.length) {
		$field.val(value).trigger('change').trigger('input');
	}
}
