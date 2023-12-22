/* 
* Simple isotope module  - Joomla Module 
* Version			: 4.3.7
* Package			: Joomla 4.x/5.x
* copyright 		: Copyright (C) 2023 ConseilGouz. All rights reserved.
* license    		: https://www.gnu.org/licenses/gpl-3.0.html GNU/GPL
* From              : isotope.metafizzy.co
*
* this js updates mod_simple_isotope parameters so that leave_formatting_tags parameter is displayed right from intro text limit parameter
*
*/
jQuery(document).ready(function(){
	jQuery( ".clear" ).parent('fieldset').parent('.controls').parent(".control-group").css({"clear":"both"});
	jQuery( ".left" ).parent('fieldset').parent('.controls').parent(".control-group").css({"float":"left"});
	jQuery( ".right" ).parent('fieldset').parent('.controls').parent(".control-group").css({"float":"right"});
	jQuery( ".half" ).parent('fieldset').parent('.controls').parent(".control-group").css({"width":"50%"});
	jQuery( ".third" ).parent('fieldset').parent('.controls').parent(".control-group").css({"width":"33%"});
	jQuery( ".full" ).parent('fieldset').parent('.controls').parent(".control-group").css({"width":"100%"});

	jQuery( ".clear" ).parent('.controls').parent(".control-group").css({"clear":"both"});
	jQuery( ".left" ).parent('.controls').parent(".control-group").css({"float":"left"});
	jQuery( ".right" ).parent('.controls').parent(".control-group").css({"float":"right"});
	jQuery( ".half" ).parent('.controls').parent(".control-group").css({"width":"50%"});
	jQuery( ".third" ).parent('.controls').parent(".control-group").css({"width":"33%"});
	jQuery( ".full" ).parent('.controls').parent(".control-group").css({"width":"100%"});

    jQuery(".alert-success.clear.half").css({"width":"100%"});
	jQuery(".half").parent(".control-group").css({"width":"50%"});
	jQuery(".clear").parent(".control-group").css({"clear":"both"});

	jQuery( ".half" ).parent('.minicolors ').parent('.controls').parent(".control-group").css({"width":"50%"});
	jQuery( ".left" ).parent('.minicolors ').parent('.controls').parent(".control-group").css({"float":"left"});
	jQuery( ".right" ).parent('.minicolors ').parent('.controls').parent(".control-group").css({"float":"right"});
	jQuery( ".half" ).parent('.form-check').parent('.controls').parent(".control-group").css({"width":"50%"});
	jQuery( ".left" ).parent('.form-check').parent('.controls').parent(".control-group").css({"float":"left"});
	jQuery( ".right" ).parent('.form-check').parent('.controls').parent(".control-group").css({"float":"right"});
	
	jQuery( "#jform_params_cgisotope" ).parent().parent().css({"display":"none"}); // 4.3.7
	
});