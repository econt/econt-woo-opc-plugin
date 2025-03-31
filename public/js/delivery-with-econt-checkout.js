jQuery(document).ready(function(dwe){
	let global_shippment_price_cod
	let global_shippment_price_cod_e
	let global_shippment_price_no_cod
	let global_info_message
	let use_shipping = false
	var globalAlertMessage = false;

	// Initialize shipping method check
	function initializeShipping() {
		if (checkIfShippingMethodIsEcont()) {
			dwe("#customer_details")[0].style.display = 'none';
			dwe("#customer_details .woocommerce-additional-fields").prependTo(dwe("#customer_details").parent());
			jQuery("#customer_details").after(jQuery("<div class='col2-set' style='display: block;' id='place_iframe_here'></div>"));
			getDataFromForm(use_shipping).then();

			// Remove the event listener after successful initialization
			dwe(document.body).off('updated_checkout', shippingUpdateHandler);

			return true;
		}
		return false;
	}

	// Event handler function for shipping updates
	function shippingUpdateHandler() {
		if (!isInitialized && checkIfShippingMethodIsEcont()) {
			isInitialized = initializeShipping();
		}
	}

	// Try initial loading
	let isInitialized = initializeShipping();

	// If initial loading fails, set up a listener for shipping method updates
	if (!isInitialized) {
		dwe(document.body).on('updated_checkout', shippingUpdateHandler);
	}

	/**
	 * First we disable the "Enter" key
	 * because we need the "click" event in order to manage the flow
	 */
	dwe("form[name='checkout']").on('keypress', function(e){
		var key = e.which || e.keyCode;
		if(key === 13){ // 13 is enter
			e.preventDefault();
			e.stopPropagation();
		}
	});

	function resetCookies(){
		document.cookie = "econt_shippment_price=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		document.cookie = "econt_customer_info_id=0; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

		global_shippment_price_cod = undefined
		global_shippment_price_cod_e = undefined
		global_shippment_price_no_cod = undefined
		global_info_message = undefined
	}

	resetCookies();

	dwe("form").submit(function(e){
		validateShippingPrice(e);
	});

	function validateShippingPrice(e){
		if(checkIfShippingMethodIsEcont() && (global_shippment_price_cod === undefined || global_shippment_price_cod_e === undefined || global_shippment_price_no_cod === undefined)){
			e.preventDefault();
			e.stopPropagation();
			if(globalAlertMessage){
				dwe('body').trigger('update_checkout');
				globalAlertMessage = false;
				return;
			}
			alert('Моля потвърдете секцията с данните за доставка.');
			dwe('body').trigger('update_checkout');
			globalAlertMessage = true;
			return false;
		}
	}

	/**
	 * We need this, because on update some fields, wordpress re-renders the html and breaks the listeners
	 */
	dwe(document.body).on('updated_checkout', function(){
		// Let's now identify the payment method and it's visualisation
		let payment_input = dwe('input[name^="payment_method"]')

		if(global_info_message !== undefined){
			let iframe = dwe('#delivery_with_econt_iframe');
			iframe[0].style.display = 'none';
			dwe("#edit_details")[0].style.display = 'block';
		}

		payment_input.each((key, field) => {
			dwe('#' + field.id).change(function(){
				if(this.value == 'cod' && selected_shipping_method === 'delivery_with_econt'){
					document.cookie = "econt_shippment_price=" + global_shippment_price_cod + "; path=/";
					dwe('#econt_detailed_shipping').css('display', 'block')
				} else if(this.value == 'econt_payment' && selected_shipping_method === 'delivery_with_econt'){
					document.cookie = "econt_shippment_price=" + global_shippment_price_cod_e + "; path=/";
					dwe('#econt_detailed_shipping').css('display', 'block')
				} else if(selected_shipping_method === 'delivery_with_econt'){
					document.cookie = "econt_shippment_price=" + global_shippment_price_no_cod + "; path=/";
					dwe('#econt_detailed_shipping').css('display', 'none')
				}
				dwe('body').trigger('update_checkout');
			});
		})


		// define the selected shipping method var
		let selected_shipping_method;
		// get the shipping method input field
		let input_type = dwe('input[name^="shipping_method"]')[0];
		// check what type of field do we have and take corresponding action
		if(input_type != undefined && input_type.type === 'radio'){
			selected_shipping_method = dwe('input[name^="shipping_method"]:checked').val()
		} else if(input_type != undefined && input_type.type === 'hidden'){
			selected_shipping_method = input_type.value
		}

		if(selected_shipping_method === 'delivery_with_econt'){
			dwe("#delivery_with_econt_calculate_shipping").css('display', 'grid');
		} //else {
		  // dwe("#econt_delivery_calculate_buttons").css('display', 'none');
		//}

		dwe('#place_order').on('click', function(e){
			validateShippingPrice(e)
		});

		dwe("button[name='apply_coupon']").on('click', resetCookies);

		dwe("a.woocommerce-remove-coupon").on('click', resetCookies);

		dwe('#edit_details').on('click', function(){
			this.style.display = 'none';
			dwe('#delivery_with_econt_iframe')[0].style.display = 'block';
		});

		dwe(".woocommerce-checkout-review-order ul")[0].style.margin = 0;
		// showPriceInfo(global_info_message);
	});

	/**
	 * Event listener for the iframe window.
	 * Handles the message sent back to us from Econt servers
	 */
	window.addEventListener('message', function(message){
		let econt_service_url = dwe('meta[name="econt-service-url"]')[0].content;

		/**
		 * check if this "message" came from Econt delivery system
		 */
		if(econt_service_url.indexOf(message.origin) < 0) return;

		globalAlertMessage = false;

		let data = message['data'];
		let updateCart = false;

		if(data['shipment_error'] && data['shipment_error'] !== ''){
			dwe('#econt_display_error_message').empty();
			// append the generated iframe in the div
			dwe('#econt_display_error_message').append(data['shipment_error']);

			dwe('.econt-alert').addClass('active');
			dwe('html,body').animate({scrollTop: dwe('#delivery_with_econt_calculate_shipping').offset().top - 50}, 750);
			setTimeout(function(){
				dwe('.econt-alert').removeClass('active');
			}, 3500);

			return false;
		}

		let codInput = document.getElementById('payment_method_cod');
		let econt_payment_input = document.getElementById('payment_method_econt_payment');

		let shipmentPrice;
		global_shippment_price_cod = data['shipping_price_cod'];
		global_shippment_price_cod_e = data['shipping_price_cod_e'];
		global_shippment_price_no_cod = data['shipping_price'];

		if(codInput && codInput.checked) shipmentPrice = data['shipping_price_cod'];
		else if(econt_payment_input && econt_payment_input.checked) shipmentPrice = data['shipping_price_cod_e'];
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

		if(updateCart){
			/**
			 * Set billing form fields
			 */
			let full_name = []
			let company = ''

			var locale = document.documentElement.lang.split('-')[0];
			var officeText = (locale === 'bg') ? 'Доставка до офис: ' : 'Delivery to office: ';
			var addressText = (locale === 'bg') ? 'Доставка до адрес: ' : 'Delivery to address: ';

			if(data['face'] != null){
				full_name = data['face'].split(' ');
				company = data['name'];
			} else {
				full_name = data['name'].split(' ');
			}
			if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name').value = full_name[0] ? full_name[0] : '';
			if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name').value = full_name[1] ? full_name[1] : '';
			if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company').value = company;
			if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1').value = data['address'] != '' ? addressText + data['address'] : officeText + data['office_name_only'];
			if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city').value = data['city_name'];
			if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode'))
				document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode').value = data['post_code'];

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

			if(document.getElementById('billing_phone'))
				document.getElementById('billing_phone').value = data['phone'];
			if(document.getElementById('billing_email'))
				document.getElementById('billing_email').value = data['email'];

			document.cookie = "econt_customer_info_id=" + data['id'] + "; path=/";

			// Trigger WooCommerce update in order to populate the shipping price, the updated address field and if any other
			dwe('body').trigger('update_checkout');
		}
	}, false);

	dwe(document.body).on('checkout_error', function(event){
		resetCookies();
		dwe('body').trigger('update_checkout');
	});
});

/**
 * Render the actual iframe, based on the provided user info
 *
 * @param {data} data
 */
function showIframe(data){
	var locale = document.documentElement.lang.split('-')[0];
	if(['bg','en','gr','ro'].indexOf(locale) == -1) locale = 'bg';
	let url = data.split('"').join('').replace(/\\\//g, "/")
	let iframe = '<iframe style="margin-top: 2rem;" src="' + url + '&module=onecheckout&lang=' + locale + '" scrolling="yes" id="delivery_with_econt_iframe" name="econt_iframe_form"></iframe>';
	let iframeContainer = jQuery('#place_iframe_here');

	// empty the div if any other instances of the iframe were generated
	iframeContainer.empty();
	// append the generated iframe in the div
	var h3Text = (locale === 'bg') ? 'Данни за доставка и фактуриране' : 'Billing & Delivery Details';
	iframeContainer.append("<h3 style='margin-top: 1.5rem;'>"+h3Text+"</h3>");
	iframeContainer.append(iframe);

	var buttonText = (locale === 'bg') ? 'Промени данни за доставка' : 'Edit delivery details';

	iframeContainer.append(jQuery("<button type='button' class='econt-button econt-button-details' id='edit_details' style='display: none;'>" + buttonText + "</button>"));
	stopLoader();
}

async function getDataFromForm(use_shipping){
	let post_data = {
		action: 'woocommerce_delivery_with_econt_get_orderinfo',
		security: delivery_with_econt_calculate_shipping_object.security,
	}
	let params = {};
	let fName = '';
	let lName = '';

	startLoader();
	if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name'))
		fName = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_first_name').value;
	if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name'))
		lName = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_last_name').value
	if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company'))
		params.customer_company = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_company').value;
	if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1'))
		params.customer_address = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_address_1').value;
	if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city'))
		params.customer_city_name = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_city').value;
	if(document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode'))
		params.customer_post_code = document.getElementById((use_shipping ? 'shipping' : 'billing') + '_postcode').value;
	if(document.getElementById('billing_phone'))
		params.customer_phone = document.getElementById('billing_phone').value;
	if(document.getElementById('billing_email'))
		params.customer_email = document.getElementById('billing_email').value;

	params.customer_name = fName + ' ' + lName;
	post_data.params = params

	await jQuery.ajax({
		type: 'POST',
		url: delivery_with_econt_calculate_shipping_object.ajax_url + '',
		data: post_data,
		success: function(response){
			jQuery('#delivery_with_econt_calculate_shipping').removeClass('height-30')
			showIframe(response);
		},
		dataType: 'html'
	});
}

function startLoader(){
	jQuery('#place_iframe_here').addClass('econt-loader');
	jQuery('#delivery_with_econt_calculation_container').addClass('econt-loader');
}

function stopLoader(){
	setTimeout(function(){
		jQuery('#place_iframe_here').removeClass('econt-loader');
		jQuery('#delivery_with_econt_calculation_container').removeClass('econt-loader');
	}, 1000)
}

function showPriceInfo(global_message){
	let im = jQuery('#econt_detailed_shipping');
	im.empty();
	if(!checkIfShippingMethodIsEcont()) im.css("display", "none");
	else {
		if(checkIfPaymentMethodIsSelected('payment_method_cod')) im.text(global_message);
		else if(checkIfPaymentMethodIsSelected('payment_method_econt_payment')) im.text("");
		else im.text("");

		im.css("display", "block");
	}
}

function checkIfShippingMethodIsEcont(){
	let sh = jQuery(' [value=delivery_with_econt] ');
	if(sh.prop("type") === 'radio' && sh.prop('checked')) return true;
	else if(sh.prop("type") === 'hidden') return true;

	return false
}

function checkIfPaymentMethodIsSelected(el_id_payment_method){
	let del = jQuery('#' + el_id_payment_method);

	if(del.prop('type') === 'radio' && del.prop("checked")) return true
	else if(del.prop("type") === 'hidden') return true;

	return false;
}
