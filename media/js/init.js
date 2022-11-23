/**
* Simple isotope module  - Joomla Module 
* Version			: 4.0.5
* Package			: Joomla 4.x.x
* copyright 		: Copyright (C) 2022 ConseilGouz. All rights reserved.
* license    		: http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/
var $close,$toggle,$article,
	$height,$width,$article_frame;
var resetToggle,options,myid;
var qsRegex,$asc,$sortby,filters;
var rangeSlider,range_init,range_sel,min_range,max_range;
var cookie_name;
jQuery(document).ready(function($) {
$('.isotope-main').each(function() {
	var $this = $(this);
	myid = $this.attr("data");
	if (typeof Joomla === 'undefined' || typeof Joomla.getOptions === 'undefined') {
		console.log('Simple Isotope : Joomla /Joomla.getOptions  undefined');
	} else {
		 options = Joomla.getOptions('mod_simple_isotope_'+myid);
	}
	if (typeof options === 'undefined' ) { // cache Joomla problem
		request = {
			'option' : 'com_ajax',
			'module' : 'simple_isotope',
			'data'   : 'param',
			'id'     : myid,
			'format' : 'raw'
			};
			jQuery.ajax({
				type   : 'POST',
				data   : request,
				success: function (response) {
				    cookie_name = 'simple_isotope_'+myid;
					options = JSON.parse(response);
					iso_cat_k2($,myid,options); 
					init_readmore($);
					return true;
				}
			});
	}
	if (typeof options === 'undefined' ) {return false}
    cookie_name = 'simple_isotope_'+myid;
	iso_cat_k2($,myid,options);
})
if (typeof options === 'undefined' ) {return false}

init_readmore($);
})
function init_readmore($) {
$toggle = jQuery('.isotope_grid'),
$article = jQuery('.isotope_an_article'),
$article_frame=jQuery('iframe#isotope_article_frame');
if ((options.readmore == 'ajax') || (options.readmore == 'iframe'))  {
	$height = $toggle.height();
	$width = $toggle.width();
	$('.isotope-readmore-title').on('click touchstart', function (e) {
		$pos = $('.isotope-div').offset().top;
		$("html, body").animate({ scrollTop: $pos }, "slow");
		e.stopPropagation();
		e.preventDefault();		
		$toggle.addClass('isotope-hide');
		$article.addClass('isotope-open');
		$article.removeClass('isotope-hide');
		$article.height('auto');
		$article.addClass('article-loading');
		if (options.readmore == 'ajax') {
			$("#isotope_an_article").html('');
			var token = $("#token").attr("name");
			request = {
				'option' : 'com_ajax',
				'module' : 'simple_isotope',
				'data'   : 'readmore',
				'id'     : myid,
				'article': this.dataset['articleid'],
				'entree': options.entree,			
				'format' : 'json'
			};
			jQuery.ajax({
				type   : 'POST',
				data   : request,
				success: function (result) {
					$article.removeClass('article-loading');
					$article.height($height);
					$article.width($width);
					displayArticle(result); 
				},
				error: function(message) {console.log(message.responseText)}
			});
		} else if (options.readmore == 'iframe') {	
	/* iFrame */
			$article_frame.height(0);
			$article_frame.width(0);
			$char = '?';
			if ( this.dataset['href'].indexOf('?') > 0 ) $char = '&';
			$article_frame.attr('src',this.dataset['href']+$char+'tmpl=component');
			$article.addClass('article-loading');
			$close = $('button.close');
			$close.addClass('isotope-hide');
			$close.on('click touchstart', resetToggle);
		}
	// listen to exit event
		$toggle.on('click touchstart', resetToggle);
	});
}
$('.isotope-div').on('click touchstart', function() {
	resetToggle();
});

$('.isotope_button-group').on('click touchstart', function() {
	resetToggle();
});

resetToggle = function () {
	if ($toggle.hasClass('isotope-hide')) {
		$article.removeClass('isotope-open');
		$article.addClass('isotope-hide');
		$toggle.removeClass('isotope-hide');
		$('.isotope-main .isotope-div').trigger('refresh');
	} else if (jQuery("#isotope_an_article").hasClass('isotope-open')) {
		jQuery("#isotope_an_article").removeClass('isotope-open');
		jQuery("#isotope_an_article").addClass('isotope-hide');
		jQuery("#isotope_an_article").html('');
		$('.isotope-main .isotope-div').trigger('refresh');
	}
}
$article_frame.on("load",function(){
	$article.removeClass('article-loading');
	if ($close)	$close.removeClass('isotope-hide');
	$article_frame.height($height);
	$article_frame.width($width);
	}).show(); 
}
function displayArticle(result) {
	var html ='';

    if (result.success) {
		$info = result.data;
		for (var i=0; i< $info.data.length; i++) {
            html += '<h1>'+$info.data[i].title+'<button type="button" class="close">X</button></h1>';
			if ((options.entree == "k2") && ($info.data[i].image)) {
				html += '<span class="itemImage"><a class="moduleItemImage" href="'+$info.data[i].link+'">';
				html += '<img src="'+$info.data[i].image+'" alt="'+$info.data[i].title+'" /></a></span>';
			}
			html +=$info.data[i].fulltext;
			if ($info.data[i].fulltext =="") html += $info.data[i].introtext;
			if ((options.entree == "k2") && ($info.data[i].extra_fields)) {
				html +='<div class="itemExtraFields"><ul>';
				if (Array.isArray($info.data[i].extra_fields) ) {
					$l = $info.data[i].extra_fields.length;
					for (var x=0; x< $l; x++) {
						html += '<li class="typeTextfield">';
						html += '<span class="itemExtraFieldsLabel">'+$info.data[i].extra_fields[x].name+"</span>";
						html += '<span class="itemExtraFieldsValue">'+$info.data[i].extra_fields[x].value+"</span>";
						html += "</li>";
					}
				} else { 
					$l = Object.values($info.data[i].extra_fields).length;
					for (var x in $info.data[i].extra_fields ) {
					html += '<li class="typeTextfield">';
					html += '<span class="itemExtraFieldsLabel">'+$info.data[i].extra_fields[x].name+"</span>";
					html += '<span class="itemExtraFieldsValue">'+$info.data[i].extra_fields[x].value+"</span>";
					html += "</li>";
				}

				}
				html +='</ul></div>';
			}
			if ($info.data[i].scripts.length > 0) {
				for (var s=0; s < $info.data[i].scripts.length ;s++) {
					var scriptElement = document.createElement( "script" );
					scriptElement.addEventListener(	"load",function() {
							console.log( "Successfully loaded scripts" );
						}
					);
 					scriptElement.src = $info.data[i].scripts[s];
					document.head.appendChild( scriptElement );
				}
			}
			if ($info.data[i].css.length > 0) {
				for (var s=0; s < $info.data[i].css.length ;s++) {
					var link = document.createElement( "link" );
					link.type = "text/css";
					link.rel = "stylesheet";
					
					link.addEventListener(	"load",function() {
							console.log( "Successfully loaded css" );
						}
					);
 					link.href = $info.data[i].css[s];
					document.head.appendChild( link );
				}
			}
			
        }
        jQuery("#isotope_an_article").html(html);		
		$close = jQuery('button.close'),
		$close.on('click touchstart', resetToggle);
	} else {
        html = result.message;
        if ((result.messages) && (result.messages.error)) {
            for (var j=0; j<result.messages.error.length; j++) {
                html += "<br/>" + result.messages.error[j];
            }
		}
	}
}
function iso_cat_k2 ($,myid,options) {
	var me = "#isotope-main-"+myid+" ";
	var parent = 'cat';
	var items_limit = options.limit_items;
	var sav_limit = options.limit_items;
	var empty_message = (options.empty == "true");
	filters = {};
	$asc = (options.ascending == "true");
	$sortby = options.sortby;
	if (options.limit_items == 0) { // no limit : hide show more button
		$(me+'.iso_button_more').hide();
	}
	if ((options.default_cat == "") || (options.default_cat == null) || (typeof options.default_cat === 'undefined'))
		filters['cat'] = ['*']
	else 
		filters['cat'] = [options.default_cat];
	if ((options.default_tag == "") || (options.default_tag == null) || (typeof options.default_tag === 'undefined'))
		filters['tags'] = ['*']
	else 
		filters['tags'] = [options.default_tag];
	filters['lang'] = ['*'];
	filters['alpha'] = ['*'];
	var $cookie = getCookie(cookie_name);
	if ($cookie != "") {
		$arr = $cookie.split('&');
		$arr.forEach(splitCookie);
	}
	if ((options.layout == "masonry") || (options.layout == "fitRows") || (options.layout == "packery"))
		$('#isotope-main-' + myid + ' .isotope_item').css("width", (100 / parseInt(options.nbcol)-2)+"%" );
	if (options.layout == "vertical") 
		$('#isotope-main-' + myid + ' .isotope_item').css("width", "100%" );
	$('#isotope-main-' + myid + ' .isotope_item').css("background", options.background );
	if (parseInt(options.imgmaxheight) > 0) 
		$('#isotope-main-' + myid + ' .isotope_item img').css("max-height",options.imgmaxheight + "px");
	if (parseInt(options.imgmaxwidth) > 0) 
		$('#isotope-main-' + myid + ' .isotope_item img').css("max-width",options.imgmaxwidth + "px");
	if (options.displayrange == "true") {
		if (!min_range) {
			min_range = parseInt(options.minrange);
			max_range = parseInt(options.maxrange);
		}
		rangeSlider = new rSlider({
			target: '#rSlider',
			values: {min:parseInt(options.minrange), max:parseInt(options.maxrange)},
			step: parseInt(options.rangestep),
			set: [min_range,max_range],
			range: true,
			tooltip: true,
			scale: true,
			labels: true,
			onChange: rangeUpdated,
		});
	}		

	function rangeUpdated(){
		range_sel = rangeSlider.getValue();
		range_init = rangeSlider.conf.values[0]+','+rangeSlider.conf.values[rangeSlider.conf.values.length - 1];
		CG_Cookie_Set(myid,'range',range_sel);
		$grid.isotope();
	};
    if (typeof $sortby === 'string') {
		$sortby = $sortby.split(',');
	}
	var $grid = $(me + '.isotope_grid').isotope({ 
			itemSelector: 'none',
			percentPosition: true,
			layoutMode: options.layout,
			getSortData: {
				title: '[data-title]',
				category: '[data-category]',
				date: '[data-date]',
				click: '[data-click] parseInt',
				rating: '[data-rating] parseInt',
				id: '[data-id] parseInt',
				blog: '[data-blog] parseInt'
			},
			sortBy: $sortby,
			sortAscending: $asc,
			filter: function(){ return grid_filter($(this))	}			
	}); // end of grid
	
	$grid.imagesLoaded( function() {
		$grid.isotope( 'option', { itemSelector: '.isotope_item' });
		var $items = $grid.find('.isotope_item');
		$grid.isotope( 'appended', $items );
		updateFilterCounts();
		if ($sortby == "random") {
			$grid.isotope('shuffle');
		} else {
			$grid.isotope();
		}
		$width = $toggle.width();
		$height = $toggle.height();
	});
	$(me + '.isotope-div').on("refresh", function(){
 	  $grid.isotope();
	});
    if (options.pagination == 'infinite') { 
		// --------------> infinite scroll <----------------
		var iso = $grid.data('isotope');
		$grid.infiniteScroll({
			path: getPath,
			append: '.isotope_item',
			outlayer: iso,
		    status: '.page-load-status',
			// debug: true,
		});
        
		function getPath() {
			currentpage = this.loadCount;
			return '?start='+(currentpage+1)*options.page_count;
		}
		if (options.infinite_btn == "true") {
			$grid.infiniteScroll('option',{
				button: '.iso_button_more',
				loadOnScroll: false,
			});
			let $viewMoreButton = $('.iso_button_more');
			jQuery(me+'.iso_button_more').show();
			$viewMoreButton.on( 'click', function() {
  // load next page
			$grid.infiniteScroll('loadNextPage');
  // enable loading on scroll
			$grid.infiniteScroll( 'option', {
				loadOnScroll: true,
			});
  // hide button
			$viewMoreButton.hide();
			});
		} else {
			jQuery(me+'.iso_div_more').hide();
		}
		$grid.on( 'append.infiniteScroll', function( event, body, path, items, response ) {
			// console.log(`Appended ${items.length} items on ${path}`);
			infinite_buttons(items);
			if ((options.layout == "masonry") || (options.layout == "fitRows") || (options.layout == "packery"))
				$('#isotope-main-' + myid + ' .isotope_item').css("width", (100 / parseInt(options.nbcol)-2)+"%" );
			if (options.layout == "vertical") 
				$('#isotope-main-' + myid + ' .isotope_item').css("width", "100%" );
			$('#isotope-main-' + myid + ' .isotope_item').css("background", options.background );
			if (parseInt(options.imgmaxheight) > 0) 
				$('#isotope-main-' + myid + ' .isotope_item img').css("max-height",options.imgmaxheight + "px");
			if (parseInt(options.imgmaxwidth) > 0) 
				$('#isotope-main-' + myid + ' .isotope_item img').css("max-width",options.imgmaxwidth + "px");
			$grid.isotope();
		});
	}
	// --------------> end of infinite scroll <----------------
	
	$(me+'.sort-by-button-group').on( 'click', 'button', function() {
		var sortValue = $(this).attr('data-sort-value');
		if (sortValue == "random") {
			CG_Cookie_Set(myid,'sort',sortValue+'-');
			$grid.isotope('shuffle');
			return;
		} 
		sens = $(this).attr('data-sens');
		sortValue = sortValue.split(',');
		if (!$(this).hasClass('is-checked')) { // first time sorting
			sens = $(this).attr('data-init');
			$(this).attr("data-sens",sens);
			asc=true;
			if (sens== "-") asc = false;
		} else { // invert order
			if (sens == "-") {
				$(this).attr("data-sens","+");
				asc = true;
			} else {
				$(this).attr("data-sens","-");
				asc = false;
			}
		}
		CG_Cookie_Set(myid,'sort',sortValue+'-'+asc);
		$grid.isotope({ 
			sortBy: sortValue, 
			sortAscending: asc,
		});
	});
	$(me+'.sort-by-button-group').each( function( i, buttonGroup ) {
		var $buttonGroup = jQuery( buttonGroup );
		$buttonGroup.find('.is-checked').removeClass('is-checked');
		$buttonGroup.children().each(function(j, child) {
			var sortValue = $(this).attr('data-sort-value');
			sortValue = sortValue.split(',');
			if ((Array.isArray($sortby) && (sortValue[0] == $sortby[0])) || 
			    ((typeof $sortby === 'string') && (sortValue[0] == $sortby)) ) {
				jQuery(this).addClass('is-checked');
				jQuery(this).attr("data-sens","+");
				if (!$asc) jQuery(this).attr("data-sens","-"); // $asc = boolean
			}
		});
	});
	$(me+'.sort-by-button-group').each( function( i, buttonGroup ) {
		var $buttonGroup = $( buttonGroup );
		$buttonGroup.on( 'click', 'button', function() {
			$buttonGroup.find('.is-checked').removeClass('is-checked');
			$( this ).addClass('is-checked');
		});
	});
	
// use value of search field to filter
	var $quicksearch = $(me+'.quicksearch').keyup( 
		debounce( function() {
			qsRegex = new RegExp( $quicksearch.val(), 'gi' );
			CG_Cookie_Set(myid,'search',$quicksearch.val());
			$grid.isotope();
			updateFilterCounts();
		}) 
	);
//  clear search button + reset filter buttons
	$(me+'.ison-cancel-squared').on( 'click', function() {
		$(me+'.quicksearch').val("");
		qsRegex = new RegExp( $quicksearch.val(), 'gi' );
		CG_Cookie_Set(myid,'search',$quicksearch.val());
		if (rangeSlider) {
			range_sel = range_init;
			ranges = range_sel.split(",");
			rangeSlider.setValues(parseInt(ranges[0]),parseInt(ranges[1]));
			CG_Cookie_Set(myid,'range',range_sel);
		}
		filters['cat'] = ['*']
		filters['tags'] = ['*']
		filters['lang'] = ['*']
		filters['alpha'] = ['*']
		$(me+'.filter-button-group-cat').each( function( i, buttonGroup ) {
			var $buttonGroup = $( buttonGroup );
			$buttonGroup.each( function() {
				$(this).find('.is-checked').removeClass('is-checked');
				$(this).find('[data-sort-value="*"]').addClass('is-checked');
				$(this).find('[data-all="all"]').attr('selected',true); // list : all
			});
		});
		$(me+'.filter-button-group-tags').each( function( i, buttonGroup ) {
			var $buttonGroup = $( buttonGroup );
			$buttonGroup.each( function() {
				$(this).find('.is-checked').removeClass('is-checked');
				$(this).find('[data-sort-value="*"]').addClass('is-checked');
				$(this).find('[data-all="all"]').attr('selected',true); // list : all
			});
		});
		$(me + '.filter-button-group-fields').each(function(i, buttonGroup) {
			var $buttonGroup = $( buttonGroup ).attr('data-filter-group');
			filters[$buttonGroup] = ['*'];
			$(this).find('.is-checked').removeClass('is-checked');
			$(this).find('.iso_hide_elem').removeClass('iso_hide_elem');
			$(this).find('[data-sort-value="*"]').addClass('is-checked');
			$(this).find('[data-all="all"]').attr('selected',true); // list : all
		});
		$(me+'.iso_lang').each( function( i, buttonGroup ) {
			var $buttonGroup = $( buttonGroup );
			$buttonGroup.each( function() {
				$(this).find('.is-checked').removeClass('is-checked');
				$(this).find('[data-sort-value="*"]').addClass('is-checked');
				$(this).find('[data-all="all"]').attr('selected',true); // list : all
			});
		});
		$(me+'.filter-button-group-alpha').each( function( i, buttonGroup ) {
			var $buttonGroup = $( buttonGroup );
			$buttonGroup.each( function() {
				$(this).find('.is-checked').removeClass('is-checked');
				$(this).find('[data-sort-value="*"]').addClass('is-checked');
				$(this).find('[data-all="all"]').attr('selected',true); // list : all
			});
		});
		update_cookie_filter(filters);
		$grid.isotope();
		updateFilterCounts();
		$(me+'.quicksearch').focus();
	});
	if  ((options.displayfilter == "list") || (options.displayfilter == "listex")) { 
		$(me+'.filter-button-group-tags').on( 'change', function() {
			filter_list($(this));
		});
		$(me + '.filter-button-group-fields').on( 'change', function() {
			set_filter_list($(this))
		});
	} 
	if  ((options.displayfiltercat == "list")  || (options.displayfiltercat == "listex")) { 
		$(me+'.filter-button-group-cat').on( 'change', function() {
			filter_list($(this));
		});
		$(me + '.filter-button-group-fields').on( 'change', function() {
			set_filter_list($(this))
		});
		if ((options.article_cat_tag == "tagsfields") || (options.article_cat_tag == "cattagsfields"))  { // fields + tags
			$(me+'.filter-button-group-tags').on( 'change', function() {
				filter_list($(this));
			});
		}
	} 
	if ((options.displayfiltercat == "multi") || (options.displayfiltercat == "multiex")) {
		$(me+'.filter-button-group-cat').on( 'click', 'button', function() {
			filter_multi($(this));
		});
		$(me+'.filter-button-group-cat').each( function( i, buttonGroup ) {
			set_buttons_multi($( buttonGroup ));
		});
		if (options.article_cat_tag == "tagsfields") { // fields + tags
			$(me+'.filter-button-group-tags').on( 'click', 'button', function() {
				filter_multi($(this));
			});
			$(me+'.filter-button-group-tags').each( function( i, buttonGroup ) {
				set_buttons_multi($( buttonGroup ));
			});
		}
	}
	if ((options.displayfilter == "multi") || (options.displayfilter == "multiex")) { 
		$(me+'.filter-button-group-tags').on( 'click', 'button', function() {
			filter_multi($(this));
		});
		$(me+'.filter-button-group-tags').each( function( i, buttonGroup ) {
			set_buttons_multi($( buttonGroup ));
		});
		$(me + '.filter-button-group-fields').on( 'click', 'button', function() {
			filter_multi($(this));
		});
		$(me + '.filter-button-group-fields').each( function( i, buttonGroup ) {
			set_buttons_multi($( buttonGroup ));
		});		
	}
	if (options.language_filter == "multi") { 
		$(me + '.iso_lang').on( 'click', 'button', function() {
			filter_multi($(this));
		});
		$(me + '.iso_lang').each( function( i, buttonGroup ) {
			set_buttons_multi($( buttonGroup ));
		});
	}
	if (options.displayalpha == "multi") { 
		$(me + '.filter-button-group-alpha').on( 'click', 'button', function() {
			filter_multi($(this));
		});
		$(me + '.filter-button-group-alpha').each( function( i, buttonGroup ) {
			set_buttons_multi($( buttonGroup ));
		});
	}
	if (options.displayfiltercat == "button"){
		$(me+'.filter-button-group-cat').on( 'click', 'button', function() {
			filter_button($(this));
		});
		$(me+'.filter-button-group-cat').each( function( i, buttonGroup ) {
			set_buttons($( buttonGroup ));
		});
		if ((options.article_cat_tag == "tagsfields") || (options.article_cat_tag == "cattagsfields")) { // fields + tags
			$(me+'.filter-button-group-tags').on( 'click', 'button', function() {
				filter_button($(this));
			});
			$(me+'.filter-button-group-tags').each( function( i, buttonGroup ) {
				set_buttons($( buttonGroup ));
			});
		}
	}
	if (options.displayfilter == "button") { 
		$(me+'.filter-button-group-tags').on( 'click', 'button', function() {
			filter_button($(this));
		});
		$(me+'.filter-button-group-tags').each( function( i, buttonGroup ) {
			set_buttons($( buttonGroup ));
		});
		$(me + '.filter-button-group-fields').on( 'click', 'button', function() {
			filter_button($(this));
		});
		$(me + '.filter-button-group-fields').each( function( i, buttonGroup ) {
			set_buttons($( buttonGroup ));
		});
	}
	if (options.language_filter == "button") { 
		$(me + '.iso_lang').on( 'click', 'button', function() {
			filter_button($(this));
		});
		$(me + '.iso_lang').each( function( i, buttonGroup ) {
			set_buttons($( buttonGroup ));
		});
	}
	if (options.displayalpha == "button") { 
		$(me+'.filter-button-group-alpha').on( 'click', 'button', function() {
			filter_button($(this));
		});
		$(me+'.filter-button-group-alpha').each( function( i, buttonGroup ) {
			set_buttons($( buttonGroup ));
		});
	}
	$(me+'.iso_button_more').on('click', function(e) {
		e.preventDefault();
		if (items_limit > 0) {
			items_limit = 0; // no limit
			$(this).text(options.libless);
		} else {
			items_limit = options.limit_items; // set limit
			$(this).text(options.libmore);
		}
		updateFilterCounts();
	});
	/*------- infinite scroll : update buttons list------------*/
	function infinite_buttons(appended_list) {
		if (options.displayalpha != 'false') {
		// alpha buttons list
			for (x=0;x < appended_list.length-1;x++) {
				alpha = appended_list[x].attributes['data-alpha'].value;
				if ($(me+'.filter-button-group-alpha').find('.iso_button_alpha_'+alpha).length == 0) 
					$(me+'.filter-button-group-alpha').append('<button class="'+options.button_bootstrap+' iso_button_alpha_'+alpha+'" data-sort-value="'+alpha+'" title="'+alpha+'">'+alpha+'</button>')
			}
		}
	}
	/*------- grid filter --------------*/
	function grid_filter($this) {
		var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
		var	lacat = $this.attr('data-category');
		var laclasse = $this.attr('class');
		var lescles = laclasse.split(" ");
		var buttonResult = false;
		var rangeResult = true;
		var searchAlpha = true;
		if (filters['alpha'].indexOf('*') == -1) {// alpha filter
			alpha = $this.attr('data-title').substring(0,1);
			if (filters['alpha'].indexOf(alpha) == -1) return false;
		}
		if (filters['lang'].indexOf('*') == -1) { 
			lalang = $this.attr('data-lang') ;
			if (filters['lang'].indexOf(lalang) == -1)  {
				return false;
			}
		}
		if 	(rangeSlider) {
			var lerange = $this.attr('data-range');
			if (range_sel != range_init) {
				ranges = range_sel.split(",");
				rangeResult = (lerange >= ranges[0]) && (lerange <= ranges[1]);
			}
		}
		if ((options.article_cat_tag != "fields") && (options.article_cat_tag != "catfields") && (options.article_cat_tag != "tagsfields") && (options.article_cat_tag != "cattagsfields")) {
			if ((filters['cat'].indexOf('*') != -1) && (filters['tags'].indexOf('*') != -1)) { return searchResult && rangeResult && true};
			count = 0;
			if (filters['cat'].indexOf('*') == -1) { // on a demandé une classe
				if (filters['cat'].indexOf(lacat) == -1)  {
					return false; // n'appartient pas à la bonne classe: on ignore
				} else { count = 1; } // on a trouvé la catégorie
			}
			if (filters['tags'].indexOf('*') != -1) { // tous les tags
				return searchResult && rangeResult && true ;
			}
			for (var i in lescles) {
				if  (filters['tags'].indexOf(lescles[i]) != -1) {
					buttonResult = true;
					count += 1;
				}
			}
			if (options.searchmultiex == "true")	{
				lgth = filters['cat'].length + filters['tags'].length;
				if ((filters['tags'].indexOf('*') != -1) || (filters['cat'].indexOf('*') != -1)) {lgth = lgth - 1;}
				return searchResult && rangeResult && (count == lgth) ;
			} else { 
				return searchResult && rangeResult && buttonResult ;
			}
		} else { // fields
			ix = 0;
			if (typeof filters === 'undefined' ) { // aucun filtre: on passe
				return searchResult && rangeResult && true ;
			}
			// combien de filtres diff. tout ?
			filterslength = 0;
			for (x in filters) {
				if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') || (x == 'tags')) continue; 
				filterslength++;
				if (filters[x].indexOf('*') != -1) ix++; 
			}
			catok = false;
			if (filters['cat'].indexOf('*') == -1) { // on a demandé une classe
				if (filters['cat'].indexOf(lacat) == -1)  {
					return false; // n'appartient pas à la bonne classe: on ignore
				} else { catok = true; } // on a trouvé la catégorie
			} else {
				catok = true;
			}
			tagok = false;
			if (filters['tags'].indexOf('*') == -1) { // on a demandé un tag
				for (var i in lescles) {
					if  (filters['tags'].indexOf(lescles[i]) != -1) {
						tagok = true;
					//	filterslength++;
					}
				}
			} else {
				tagok = true;
			}
			if ( (ix == filterslength) && catok && tagok) return searchResult && rangeResult && true ;
			count = 0;
			for ( var j in lescles) {
				for (x in filters) {
					if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') || (x == 'tags'))continue; 
					if  (filters[x].indexOf(lescles[j]) != -1) { 
						// buttonResult = true;
						count += 1;
					}
				}
			}
			if (options.searchmultiex == "true")	{ // multi-select on grouped buttons
				lgth = 0;
				for (x in filters) {
					if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') ||(x == 'tags')) continue;
					lgth = lgth + filters[x].length;
					if (filters[x].indexOf('*') != -1) lgth = lgth - 1;
				}
				return searchResult && rangeResult && (count == lgth) && tagok ;
			} else  {
				return searchResult && rangeResult && (count == (filterslength -ix)) && catok && tagok ;
			}
		}
	} 
	function filter_list($this) {
		$parent = $this.attr('data-filter-group');
		var sortValue = $this.find(":selected").val();
		if (sortValue == options.liball)   {
			filters[$parent] = ['*'];
		} else { 
			filters[$parent] = [sortValue];
		}
		update_cookie_filter(filters);
		$grid.isotope(); 
		updateFilterCounts();
	}
	function filter_button($this) {
		$parent = $this.parent().attr('data-filter-group');
		child =  $this.attr('data-child'); // child group number
		var sortValue = $this.attr('data-sort-value');
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = {};
		}
		if (sortValue == '*') {
			filters[$parent] = ['*'];
			if (child) {
				set_family_all(me,child,'button');
			}
		} else { 
			filters[$parent]= [sortValue];
			if (child) {
				set_family(me,'',child,sortValue,'button');
			}
		}
		update_cookie_filter(filters);
		$grid.isotope(); 
		updateFilterCounts();
	}
	function filter_multi($this) {
		$parent = $this.parent().attr('data-filter-group');
		child =  $this.attr('data-child'); // child group number
		var sortValue = $this.attr('data-sort-value');
		$this.toggleClass('is-checked');
		var isChecked = $this.hasClass('is-checked');
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = [];
		}
		if (sortValue == '*') {
			filters[$parent] = ['*'];
			if (child) {
				set_family_all(me,child,'button')
			}
		} else { 
			removeFilter(filters, $parent,'*');
			removeFilter(filters, $parent,'none');
			if ( isChecked ) {
				addFilter( filters, $parent,sortValue );
				if (child) {
					set_family(me,$parent,child,sortValue,'button')
				}
			} else {
				removeFilter( filters, $parent, sortValue );
				if (child) {
					if (filters[$parent].length == 0) {// no more selection
						filters[$parent] = ['*'];
						set_family_all(me,child,'button')
					} else { // remove current selection
						del_family(me,$parent,child,sortValue,'button')
					}
				}
			}	
		}
		update_cookie_filter(filters);
		$grid.isotope(); 
		updateFilterCounts();
	}
	function set_filter_list($this) {
		$parent = $this.attr('data-filter-group');
		child =  $this.find(":selected").attr('data-child'); // child group number
		var sortValue = $this.find(":selected").val();
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = ['*'];
		}
		if (sortValue == options.liball)   {
			filters[$parent] = ['*'];
			if (child) {
				set_family_all(me,child,'list');
			}
		} else { 
			filters[$parent] = [sortValue];
			if (child) {
				set_family(me,'',child,sortValue,'list');
			}
		}
		update_cookie_filter(filters);
		$grid.isotope(); 
		updateFilterCounts();
	}
	function set_buttons($buttonGroup) {
		$parent = $(this).parent().attr('data-filter-group');  
		$buttonGroup.on( 'click', 'button', function() {
			$(this).parent().find('.is-checked').removeClass('is-checked');
			$(this).addClass('is-checked');
		});
	}
	function set_buttons_multi($buttonGroup) {
		$buttonGroup.on( 'click', 'button', function() {
		$parent = $(this).parent().attr('data-filter-group');
		if ($(this).attr('data-sort-value') == '*') { // on a cliqué sur tout => on remet le reste à blanc
			$(this).parent().find('.is-checked').removeClass('is-checked');
			$( this ).addClass('is-checked');
		} else { // on a cliqué sur un autre bouton : uncheck le bouton tout
		if ((filters[$parent].length == 0) || (filters[$parent] == '*')) {// plus rien de sélectionné : on remet tout actif
				$(this).parent().find('[data-sort-value="*"]').addClass('is-checked');
				filters[$parent] = ['*'];
				update_cookie_filter(filters);
				$grid.isotope();
			}
			else {
				$(this).parent().find('[data-sort-value="*"]').removeClass('is-checked');
			}
		}
		});
	}
	// check items limit and hide unnecessary items
	function updateFilterCounts() {
		if (jQuery(me + '.isotope_item').hasClass('iso_hide_elem')) {
			jQuery(me + '.isotope_item').removeClass('iso_hide_elem');
		}
		var itemElems = $grid.isotope('getFilteredItemElements');
		var count_items = jQuery(itemElems).length;
		if (empty_message) { // display "empty message" or not
			if (count_items == 0) {
				jQuery(me + '.iso_div_empty').removeClass('iso_hide_elem')
			} else {
				if (!jQuery(me + '.iso_div_empty').hasClass('iso_hide_elem')) {
					jQuery(me + '.iso_div_empty').addClass('iso_hide_elem')
				}
			}
		}
		if (items_limit > 0)  { 
			var index = 0;
			jQuery(itemElems).each(function () {
				if (index >= items_limit) {
					jQuery(this).addClass('iso_hide_elem');
				}
				index++;
			});
			if (index < items_limit && options.pagination != 'infinite') { // unnecessary button
				jQuery(me+'.iso_button_more').hide();
			} else { // show more button required
				jQuery(me+'.iso_button_more').show();
			}
		} 
		// hide show see less button
		if ((items_limit == 0) && (sav_limit > 0) && options.pagination != 'infinite') { 
			jQuery(itemElems).each(function () {
				if (jQuery(this).hasClass('iso_hide_elem')) {
					count_items -=1;
				}
			});
			if (count_items > sav_limit) {
				jQuery(me+'.iso_button_more').show();
			} else {
				jQuery(me+'.iso_button_more').hide();
			}
		}
		$grid.isotope();
	}
}// end of iso_cat_k2
function debounce( fn, threshold ) {
	var timeout;
	return function debounced() {
		if ( timeout ) {
			clearTimeout( timeout );
		}
	function delayed() {
		fn();
		timeout = null;
		}
	timeout = setTimeout( delayed, threshold || 100 );
	}  
}
function addFilter( filters, $parent, filter ) {
	if ( filters[$parent].indexOf( filter ) == -1 ) {
		filters[$parent].push( filter );
	}
}
function removeFilter( filters, $parent, filter ) {
	var index = filters[$parent].indexOf( filter);
	if ( index != -1 ) {
		filters[$parent].splice( index, 1 );
	}
}	
function update_cookie_filter(filters) {
	$filter_cookie = "";
	for (x in filters) {
		if ($filter_cookie.length > 0) $filter_cookie += ">";
		$filter_cookie += x+'<'+filters[x].toString();
	}
	if ($filter_cookie.length > 0) $filter_cookie += ">";
	CG_Cookie_Set(myid,'filter',$filter_cookie);
}
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : '';
}
function CG_Cookie_Set(id,param,b) {
	var expires = "";
	$secure = "";
	if (window.location.protocol == "https:") $secure="secure;"; 
	lecookie = getCookie(cookie_name);
	$val = param+':'+b;
	$cook = $val;
	if (lecookie != '') {
		if (lecookie.indexOf(param) >=0 ) { // cookie contient le parametre
			$cook = "";
			$arr = lecookie.split('&');
			$arr.forEach(replaceCookie,$val);
		} else { // ne contient pas encore ce parametre : on ajoute
			$cook = lecookie +'&'+$val;
		}
	}
	document.cookie = cookie_name+"="+$cook+expires+"; path=/; samesite=lax;"+$secure;
}
function replaceCookie(item,index,arr) {
	if (this.startsWith('search:') && (item.indexOf('search:') >= 0)) {
		arr[index] = this;
	}
	if (this.startsWith('sort:') && (item.indexOf('sort:') >= 0)) {
		arr[index] = this;
	}
	if (this.startsWith('filter:') && (item.indexOf('filter:') >= 0)) {
		arr[index] = this;
	}
	if (this.startsWith('range:') && (item.indexOf('range:') >= 0)) {
		arr[index] = this;
	}
	if ($cook.length > 0) $cook += "&";
	$cook += arr[index];
}
function splitCookie(item) {
	me = "#isotope-main-"+myid+" ";
	if (item.indexOf('search:') >= 0) {
		val = item.split(':');
		qsRegex = new RegExp( val[1], 'gi' );
		jQuery(me+'.quicksearch').val(val[1]);
	}
	if (item.indexOf('sort:') >= 0) {
		val = item.split(':');
		val = val[1].split('-');
		$sortby = val[0].split(',');
		$asc = (val[1] == "true");
		jQuery(me+'.sort-by-button-group').each( function( i, buttonGroup ) {
			var $buttonGroup = jQuery( buttonGroup );
			if (val[0] != '*') { // tout
				$buttonGroup.find('.is-checked').removeClass('is-checked');
				$buttonGroup.children().each(function(j, child) {
					if (jQuery( this ).attr("data-sort-value") == val[0]) {
						jQuery(this).addClass('is-checked');
						jQuery(this).attr("data-sens","+");
						if (val[1] != "true") jQuery(this).attr("data-sens","-");
					}
				});
			}
		});
	};
	if (item.indexOf('filter:') >=0) {
		val = item.split(':');
		if (val[1].length > 0) {
			val = val[1].split('>'); // get filters
			for (x=0;x < val.length-1;x++) {
				values = val[x].split("<");
				if ((values[0] == 'cat') || (values[0] == "tags") || (values[0] == 'lang') || (values[0] == 'alpha') ) {
					if (values[1] != '*') { // !tout
						filters[values[0]] = values[1].split(',');
						if (values[0] == 'lang') {
							jQuery(me+'.iso_lang').find('.is-checked').removeClass('is-checked');
						} else {
							jQuery(me+'.filter-button-group-'+values[0]).find('.is-checked').removeClass('is-checked');
						}
						for(v=0;v < filters[values[0]].length;v++) {
							if ( ((values[0] == "tags") && (options.displayfilter == 'list') && (options.article_cat_tag != "tagsfields") && (options.article_cat_tag != "cattagsfields")) ||
								 ((values[0] == "cat") && (options.displayfiltercat == 'list')) ) {
								jQuery(me+'.filter-button-group-'+values[0]+' .isotope_select').val(filters[values[0]][v]).attr('selected',true);
							} else {
								jQuery( me+'.iso_button_'+values[0]+'_'+ filters[values[0]][v]).addClass('is-checked');
							}
						};
				    }
				} else  { // fields
					if (values[1] != '*') { // !tout
						jQuery(me+'.class_fields_'+values[0]).find('.is-checked').removeClass('is-checked');
						filters[values[0]] = values[1].split(',');
						for(v=0;v < filters[values[0]].length;v++) {
							if ((options.displayfilter == 'list') ||(options.displayfilter == 'listex')) {
								$this = jQuery(me+'.class_fields_'+values[0]+' .isotope_select').val(filters[values[0]][v]);
								$this.attr('selected',true);
								child =  $this.find(":selected").attr('data-child'); // child group number
								if (child) {
									sortValue = filters[values[0]][v];
									set_family(me,'',child,sortValue,'list');
								}
							} else {
								$this = jQuery( me+'.iso_button_'+values[0]+'_'+ filters[values[0]][v]);
								$this.addClass('is-checked');		
								child =  $this.attr('data-child'); // child group number
								if (child) {
									sortValue = $this.attr('data-sort-value');
									set_family(me,'',child,sortValue,'button')
								}
							}
						};
					}
				}
			}
		}
	}
	if (item.indexOf('range:') >=0) {
		val = item.split(':');
		if (val[1].length > 0) {
			spl = val[1].split(",");
			min_range =parseInt(spl[0]);
			max_range =parseInt(spl[1]);
		}
	}
}
function set_family(me,$parent,child,sortValue,$type) {
	parents = [];
    while (child) {
		if ($type == 'list') {
			$this = jQuery(me+'.filter-button-group-fields').find('[data-group-id="'+child+'"]');
			$this.find('option').addClass('iso_hide_elem'); // hide all
			child = $this.find('[data-all="all"]').removeClass('iso_hide_elem').attr('selected',true).attr('data-child'); // show all 
		} else {
			$this = jQuery(me+'.filter-button-group-fields').parent().find('[data-group-id="'+child+'"]');
			if (($parent == "") || (($parent != "") && (filters[$parent].length == 1) && (filters[$parent] != '*'))) { // multi-select
				$this.find('button').addClass('iso_hide_elem').removeClass('is-checked'); // hide all
			} 
			child = $this.find('button.iso_button_tout').removeClass('iso_hide_elem').addClass('is-checked').attr('data-child'); 
		}
		if (parents.length == 0) {
			$this.find('[data-parent="'+sortValue+'"]').removeClass('iso_hide_elem');
			newparents = $this.find('[data-parent="'+sortValue+'"]');
			parents=[];
			if (newparents.length > 0) {
				for ($i = 0;$i < newparents.length;$i++) {
					if ($type == 'list') {
						$val = newparents[$i].getAttribute('value');
					} else {
						$val = newparents[$i].getAttribute('data-sort-value');
					}
					if ($val != "*") parents.push($val);
				}
			}
		} else {
			newparents = [];
			for ($i=0; $i < parents.length; $i++) {
				sortValue = parents[$i];
				if (sortValue != '*') {
					$this.find('[data-parent="'+sortValue+'"]').removeClass('iso_hide_elem');
					$vals = $this.find('[data-parent="'+sortValue+'"]');
					if ($vals.length > 0) {
						for ($j = 0;$j < $vals.length;$j++) {
							if ($type == 'list') {
								$val = $vals[$j].getAttribute('value');
							} else {
								$val = $vals[$j].getAttribute('data-sort-value');
							}
							if ($val != "*") newparents.push($val);
						}
					}
				}
			}
			parents = newparents;
		}
		childstr = $this.attr('data-filter-group');
		filters[childstr] = ['*'];
		sortValue = '';
	}
}
function del_family(me,$parent,child,sortValue,$type) {
	parents = [];
    while (child) {
		$this = jQuery(me+'.filter-button-group-fields').parent().find('[data-group-id="'+child+'"]');
		$this.find('[data-parent="'+sortValue+'"]').addClass('iso_hide_elem').removeClass('is-checked');
		child = $this.find('button.iso_button_tout').removeClass('iso_hide_elem').addClass('is-checked').attr('data-child'); 
		if (parents.length == 0) {
			newparents = $this.find('[data-parent="'+sortValue+'"]');
			parents=[];
			if (newparents.length > 0) {
				for ($i = 0;$i < newparents.length;$i++) {
					if ($type == 'list') {
						$val = newparents[$i].getAttribute('value');
					} else {
						$val = newparents[$i].getAttribute('data-sort-value');
					}
					if ($val != "*") {
						parents.push($val);
						newparents[$i].addClass('iso_hide_elem');
					}
				}
			}
		} else {
			newparents = [];
			for ($i=0; $i < parents.length; $i++) {
				sortValue = parents[$i];
				if (sortValue != '*') {
					$vals = $this.find('[data-parent="'+sortValue+'"]');
					if ($vals.length > 0) {
						for ($j = 0;$j < $vals.length;$j++) {
							if ($type == 'list') {
								$val = $vals[$j].getAttribute('value');
							} else {
								$val = $vals[$j].getAttribute('data-sort-value');
							}
							if ($val != "*") { 
								newparents.push($val);
								$vals[$j].addClass('iso_hide_elem');
							}
						}
					}
				}
			}
			parents = newparents;
		}
		childstr = $this.attr('data-filter-group');
		filters[childstr] = ['*'];
		sortValue = '';
	}
}
function set_family_all(me,child,$type) {
	parents = [];
	while(child) {
		if ($type == 'list') {
			$this = jQuery(me+'.filter-button-group-fields');
		} else {
			$this = jQuery(me+'.filter-button-group-fields').parent();
		}
		parents = $this.find('[data-child="'+child+'"]');
		for ($i = 0;$i < parents.length;$i++) {
			if (jQuery(parents[$i]).hasClass('iso_hide_elem')) continue; // ignore hidden elements
			if ($type == 'list') {
				$val = parents[$i].getAttribute('value');
			} else {
				$val = parents[$i].getAttribute('data-sort-value');
			}
			if ($val && ($val != "*")) $this.find('[data-parent="'+$val+'"]').removeClass('iso_hide_elem');

		}
		if ($type == 'list') {
			child = $this.find('[data-group-id="'+child+'"]').find('[data-all="all"]').attr('data-child'); 
		} else {
			$this.find('[data-group-id="'+child+'"]').find('button').removeClass('is-checked'); 
			$this.find('[data-group-id="'+child+'"]').find('button.iso_button_tout').addClass('is-checked'); 
			$this = jQuery(me+'.filter-button-group-fields').parent().find('[data-group-id="'+child+'"]');
			child = $this.find('button.iso_button_tout').attr('data-child'); 
		}
		childstr = $this.attr('data-filter-group');
		filters[childstr] = ['*'];
	}
}
function go_click($entree,$link) {
	event.preventDefault();
	if (($entree == "webLinks") || (window.event.ctrlKey) ) {
		 window.open($link,'_blank')
	} else {
		location=$link;
	}
}