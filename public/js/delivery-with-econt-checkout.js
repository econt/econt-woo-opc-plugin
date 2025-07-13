jQuery(document).ready(function($){
	let global_shippment_price_cod;
	let global_shippment_price_cod_e;
	let global_shippment_price_no_cod;
	let global_info_message;
	let use_shipping = false;
	var globalAlertMessage = false;

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
		bindShippingMethodChangeEvents();
	}

	// Toggle between Econt iframe and default WooCommerce fields
	function toggleFieldsBasedOnShippingMethod() {
		if (checkIfShippingMethodIsEcont()) {
			// Hide default WooCommerce fields when Econt is selected
			$("#customer_details").hide();

			// Move additional fields if they exist
			if ($("#customer_details .woocommerce-additional-fields").length) {
				$("#customer_details .woocommerce-additional-fields").prependTo($("#customer_details").parent());
			}

			// Create iframe container if it doesn't exist
			if ($("#place_iframe_here").length === 0) {
				$("#customer_details").after($("<div class='col2-set' style='display: block;' id='place_iframe_here'></div>"));
			} else {
				$("#place_iframe_here").show();
			}

			// Load Econt iframe
			getDataFromForm(use_shipping).then();
		} else {
			// Show default WooCommerce fields for other shipping methods
			$("#customer_details").show();

			// Hide Econt iframe container
			$("#place_iframe_here").hide();

			// Move additional fields back if needed
			if ($(".woocommerce-additional-fields").length && !$("#customer_details .woocommerce-additional-fields").length) {
				$(".woocommerce-additional-fields").appendTo($("#customer_details"));
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

	// Prevent form submission with Enter key
	$("form[name='checkout']").on('keypress', function(e) {
		var key = e.which || e.keyCode;
		if (key === 13) { // 13 is enter
			e.preventDefault();
			e.stopPropagation();
		}
	});

	// Form submission validation
	$("form").submit(function(e) {
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
	$(document).on('click', "button[name='apply_coupon']", resetCookies);
	$(document).on('click', "a.woocommerce-remove-coupon", resetCookies);

	// Payment method change handler for Econt shipping
	$(document.body).on('updated_checkout', function() {
		let payment_input = $('input[name^="payment_method"]');
		let selected_shipping_method = getSelectedShippingMethod();

		let econtPrice = getCookie('econt_shippment_price');
		console.log('Econt price from cookie:', econtPrice);
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

		$(".woocommerce-checkout-review-order ul")[0].style.margin = 0;
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

			// Fill in form fields with received data
			if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name').value = full_name[0] ? full_name[0] : '';
			if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name').value = full_name[1] ? full_name[1] : '';
			if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company').value = company;
			if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1').value = data['address'] != '' ? addressText + data['address'] : officeText + data['office_name_only'];
			if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city').value = data['city_name'];
			if (document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode').value = data['post_code'];

			// Handle state selection
			var $state = jQuery("#" + (use_shipping ? 'shipping' : 'billing') + '_state');
			if ($state.length) {
				$state.find("option").each(function() {
					var $this = jQuery(this);
					if ($this.text() === data["city_name"]) {
						$state.val($this.val());
						return false;
					}
				});
				if ($state.val() === "") {
					$state.val($state.find("option:eq(1)").val());
				}
				$state.change();
			}

			if (document.getElementById('billing_phone'))
				document.getElementById('billing_phone').value = data['phone'];
			if (document.getElementById('billing_email'))
				document.getElementById('billing_email').value = data['email'];

			document.cookie = "econt_customer_info_id=" + data['id'] + "; path=/";

			// Trigger WooCommerce update
			$('body').trigger('update_checkout');
		}
	}, false);

	// Initialize the shipping method toggle functionality
	// Wait for WooCommerce to signal it's ready
	$(document.body).on('init_checkout', function() {
		console.log('init checkout')
		initializeShippingMethodToggle();
	});

	// Reset cookies on page load
	resetCookies();
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
