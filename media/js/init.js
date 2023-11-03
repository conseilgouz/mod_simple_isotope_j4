/**
* CG Isotope Component/ Simple Isotope module for Joomla 4.x/5.x
* Version			: 4.2.0
* Package			: CG ISotope/Simple Isotope
* copyright 		: Copyright (C) 2023 ConseilGouz. All rights reserved.
* license    		: https://www.gnu.org/licenses/gpl-3.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/
/* note : difference between module and component
	options call
	ajax : component : data in result, module : data in result.data.data
*/

var cgisotope = [];

document.addEventListener('DOMContentLoaded', function() {
	
mains = document.querySelectorAll('.isotope-main');
for(var i=0; i<mains.length; i++) {
	let $oneiso = mains[i];
	// is it a module or a component
	let ismodule = false;
	if ($oneiso.getAttribute("ismodule") && ($oneiso.getAttribute("ismodule") == "true")) 
		ismodule = true;
	
	isoid = $oneiso.getAttribute("data");
	if (typeof Joomla === 'undefined' || typeof Joomla.getOptions === 'undefined') {
		console.error('Joomla.getOptions not found!\nThe Joomla core.js file is not being loaded.');
		return false;
	}
	if (ismodule)
		options_iso = Joomla.getOptions('mod_simple_isotope_'+isoid);
	else
		options_iso = Joomla.getOptions('cg_isotope_'+isoid);
	if (typeof options_iso === 'undefined' ) {return false}
	options_iso.ismodule = ismodule;
	cgisotope[isoid] = new CGIsotope(isoid,options_iso)
	cgisotope[isoid].goisotope(isoid);
}
}) // end of ready --------------
function CGIsotope(isoid,options) {
	$myiso = this;
    this.isoid = isoid;
	this.qsRegex = null;
	this.close = null;
	this.loadCount = 0;
	this.std_parents = ['cat','tags','lang','alpha'] // otherwise it's a custom field
	this.parent = 'cat';
	this.cookie_name = "cg_isotope_"+this.isoid;
	this.me = "#isotope-main-"+this.isoid+" ";
	this.options = options;
	this.filters = {};
	this.items_limit = this.options.limit_items;
	this.sav_limit = this.options.limit_items;
	this.empty_message = (this.options.empty == "true");
	this.asc = (this.options.ascending == "true");
	this.sort_by = this.options.sortby;
	this.grid_toggle = document.querySelector('.isotope_grid')
	this.iso_article = document.querySelector('.isotope_an_article')
	this.iso_div = document.querySelector('.isotope-main .isotope-div')
	this.article_frame=document.querySelector('iframe#isotope_article_frame')

	if (this.article_frame) {
		this.article_frame.addEventListener('load',function(){ // Joomla 4.0
			$myiso.removeClass($myiso.iso_article,'article-loading');
			if ($myiso.close)	$myiso.removeClass($myiso.close,'isotope-hide');
			$myiso.article_frame.style.height= $myiso.iso_height;
			$myiso.article_frame.style.width = $myiso.iso_width+'px';
		}); 
	}
	
	if (this.sort_by.indexOf("featured") !== -1) { // featured 
		this.sortValue = this.sort_by.split(',');
		this.asc = {};
		for (i=0;i < this.sortValue.length;i++) {
			if ( this.sortValue[i] == "featured"){  // featured always first
				this.asc[this.sortValue[i]] = false ;
			} else {
				this.asc[this.sortValue[i]] = (this.options.ascending == "true");
			}
		}
	}
	if (this.options.limit_items == 0) { // no limit : hide show more button
		document.querySelector(this.me+'.iso_button_more').style.display = "none";
	}
	if ((this.options.default_cat == "") || (this.options.default_cat == null) || (typeof this.options.default_cat === 'undefined'))
		this.filters['cat'] = ['*']
	else 
		this.filters['cat'] = [this.options.default_cat];
	if ((this.options.default_tag == "") || (this.options.default_tag == null) || (typeof this.options.default_tag === 'undefined'))
		this.filters['tags'] = ['*']
	else 
		this.filters['tags'] = [this.options.default_tag];
	this.filters['lang'] = ['*'];
	this.filters['alpha'] = ['*'];

	if ((this.options.readmore == 'ajax') || (this.options.readmore == 'iframe'))  {
		this.iso_height = this.grid_toggle.offsetHeight;
		this.iso_width = this.grid_toggle.offsetWidth;
		readmoretitles =  document.querySelectorAll('.isotope-readmore-title');
		for (var t=0;t < readmoretitles.length;t++ ) {
			['click', 'touchstart'].forEach(type => {
				readmoretitles[t].addEventListener(type,function(e) {	
					$pos = $myiso.iso_div.offsetTop;
					document.querySelector("body").scrollTo($pos,1000)
					e.stopPropagation();
					e.preventDefault();		
					$myiso.addClass($myiso.grid_toggle,'isotope-hide');
					$myiso.addClass($myiso.iso_article,'isotope-open');
					$myiso.removeClass($myiso.iso_article,'isotope-hide');
					$myiso.iso_article.offsetHeight ='auto';
					$myiso.addClass($myiso.iso_article,'article-loading');
					if ($myiso.options.readmore == 'ajax') {
						document.querySelector("#isotope_an_article").innerHTML = '';
						var mytoken = document.getElementById("token");
						token = mytoken.getAttribute("name");
						if ($myiso.options.ismodule) {
							url = '?option=com_ajax&module=simple_isotope&article='+ this.dataset['articleid']+'&entree=articles&data=readmore&format=json&id='+$myiso.isoid;
						} else {
							url = '?'+token+'=1&option=com_cgisotope&task=display&article='+ this.dataset['articleid']+'&entree=articles&format=json';
						}
						Joomla.request({
							method : 'POST',
							url : url,
							onSuccess: function(data, xhr) {
								var result = JSON.parse(data);
								$myiso.removeClass($myiso.iso_article,'article-loading');
								$myiso.iso_article.style.height = $myiso.iso_height;
								$myiso.iso_article.style.width = $myiso.iso_width+'px';
								if (!result.success) result.success = true; 
								$myiso.displayArticle(result); 
								['click', 'touchstart'].forEach(type => {
									$myiso.close.addEventListener(type,function(e) {
										e.stopPropagation();
										e.preventDefault();		
										$myiso.resetToggle();
									});
								})
								
							},
							onError: function(message) {console.log(message.responseText)}
						})
					} else if ($myiso.options.readmore == 'iframe') {	
					/* iFrame */
						if ($myiso.iso_height == 0) $myiso.iso_height="100vh";
						$myiso.article_frame.style.height = 0;
						$myiso.article_frame.style.width = 0;
						achar = '?';
						if ( this.dataset['href'].indexOf('?') > 0 ) achar = '&';
						$myiso.article_frame.setAttribute('src',this.dataset['href']+achar+'tmpl=component');
						$myiso.addClass($myiso.iso_article,'article-loading');
						$myiso.close = document.querySelector('button.close');
						$myiso.addClass($myiso.close,'isotope-hide');
						['click', 'touchstart'].forEach(type => {
							$myiso.close.addEventListener(type,function(e) {
									e.stopPropagation();
									e.preventDefault();		
									$myiso.resetToggle();
							});
						})
				}
	// listen to exit event
				['click', 'touchstart'].forEach(type => {
					$myiso.grid_toggle.addEventListener(type, function(e) {
							e.stopPropagation();
							e.preventDefault();		
							$myiso.resetToggle();
							})
				})
			})
		});
		}
	}
	['click', 'touchstart'].forEach(type => {
		$myiso.iso_div.addEventListener(type, function(e) {
			$myiso.resetToggle();
		});
	})
}
CGIsotope.prototype.goisotope = function(isoid) {
	$myiso = cgisotope[isoid];
	this.cookie = this.getCookie(this.cookie_name);
	if (this.cookie != "") {
		let $arr = this.cookie.split('&');
		for (let index = 0; index < $arr.length; ++index) {
			this.splitCookie(this.isoid,$arr[index]);
		}
	}
	$items = document.querySelectorAll('#isotope-main-' + this.isoid + ' .isotope_item');
	for (var i=0; i< $items.length;i++) {
		if ((this.options.layout == "masonry") || (this.options.layout == "fitRows") || (this.options.layout == "packery"))
			$items[i].style.width = (100 / parseInt(this.options.nbcol)-2)+"%" ;
		if (this.options.layout == "vertical") 
			$items[i].style.width = "100%";
		$items[i].style.background = this.options.background;
	}
	$imgs = document.querySelectorAll('#isotope-main-' + this.isoid + ' .isotope_item img');
	for (var i=0; i< $imgs.length;i++) {
		if (parseInt(this.options.imgmaxheight) > 0) 
			$imgs[i].style.maxHeight = this.options.imgmaxheight + "px";
		if (parseInt(this.options.imgmaxwidth) > 0) 
			$imgs[i].style.maxWidth = this.options.imgmaxwidth + "px";
	}
    if (typeof this.sort_by === 'string') {
		this.sort_by = this.sort_by.split(',');
	}
	var grid = document.querySelector(this.me + '.isotope_grid');
	this.iso = new Isotope(grid,{ 
			itemSelector: 'none',
			percentPosition: true,
			layoutMode: this.options.layout,
			getSortData: {
				title: '[data-title]',
				category: '[data-category]',
				date: '[data-date]',
				click: '[data-click] parseInt',
				rating: '[data-rating] parseInt',
				id: '[data-id] parseInt',
				featured: '[data-featured] parseInt'
			},
			sortBy: this.sort_by,
			sortAscending: this.asc,
			isJQueryFiltering : false,
			filter: function(itemElem ){ if (itemElem) return $myiso.grid_filter(itemElem)	}				
	}); // end of Isotope definition
	imagesLoaded(grid, function() {
		$myiso.iso.options.itemSelector ='.isotope_item';
		var $items = Array.prototype.slice.call($myiso.iso.element.querySelectorAll('.isotope_item'));
		$myiso.iso.appended($items );
		$myiso.updateFilterCounts();
		if ($myiso.sort_by == "random") {
			$myiso.iso.shuffle();
		}
		if (typeof $myiso.toogle !== 'undefined') {
			$myiso.iso_width = $myiso.grid_toggle.width();
			$myiso.iso_height = $myiso.grid_toggle.height();
		}
	});
	if (this.options.displayrange == "true") {
		if (!this.min_range) {
			this.min_range = parseInt(this.options.minrange);
			this.max_range = parseInt(this.options.maxrange);
		}
		this.rangeSlider = new rSlider({
			target: '#rSlider',
			values: {min:parseInt(this.options.minrange), max:parseInt(this.options.maxrange)},
			step: parseInt(this.options.rangestep),
			set: [this.min_range,this.max_range],
			range: true,
			tooltip: true,
			scale: true,
			labels: true,
			onChange: this.rangeUpdated,
		});
	}		
	iso_div = document.querySelector(this.me + '.isotope-div');
	iso_div.addEventListener("refresh", function(){
 	  this.iso.arrange();
	});
    if (this.options.pagination == 'infinite') { 
		// --------------> infinite scroll <----------------
		var elem = Isotope.data('.isotope_grid');
		var infScroll = new InfiniteScroll('.isotope_grid',{
			path: getPath,
			append: '.isotope_item',
			outlayer: elem,
		    status: '.page-load-status',
			// debug: true,
		});
        
		function getPath() {
			currentpage = this.loadCount;
			return '?start='+(currentpage+1)*$myiso.options.page_count; 
		}
		let more = document.querySelector(this.me+'.iso_button_more');		
		if (this.options.infinite_btn == "true") {
			infScroll.option({button:'.iso_button_more',loadOnScroll: false});
			let $viewMoreButton = document.querySelector('.iso_button_more');
			more.style.display = "block";
			['click', 'touchstart'].forEach(type => {
				$viewMoreButton.addEventListener( type, function(e) {
					e.stopPropagation();
					e.preventDefault();		
				// load next page
					infScroll.loadNextPage();
					// enable loading on scroll
					infScroll.option({loadOnScroll: true});
				// hide button
					$viewMoreButton.style.display = "none";
					event.preventDefault();
				});
			})
		} else {
			more.style.display = "hide";
		}
		infScroll.on( 'append', function( body, path, items, response ) {
			// console.log(`Appended ${items.length} items on ${path}`);
			$myiso.infinite_buttons(items);
			// iso.arrange();
		 });
	}
	// --------------> end of infinite scroll <----------------
	hamburgerbtn = document.getElementById('offcanvas-hamburger-btn');
	if (hamburgerbtn ) {
	// Offcanvas is on ----------------------------------
		['click'].forEach(type => {
			hamburgerbtn.addEventListener(type,function(e){
	// conflict rangeslider/offcanvas : add a timer
				var selector = '.offcanvas';
				var waitForEl = function (callback, maxTimes = false) {
					if (maxTimes === false || maxTimes > 0) {
						maxTimes != false && maxTimes--;
						setTimeout(function () {
							waitForEl(callback, maxTimes);
						}, 100);
					} else {
						if (typeof rangeSlider !== 'undefined')	rangeSlider.onResize();
						callback();
					}
				};
				waitForEl(function () {
					document.querySelector(selector); // do something with selector
				}, 3);		
			})
		})
	// set default buttons in cloned area
		if ( (this.filters['cat'][0] != '*') || (this.filters['tags'][0] != '*') ) { // default value set for tags or categories ?
			grouptype = ['cat','tags']
			optionstype = [options.displayfiltercat,options.displayfiltertags]
			for (var g = 0; g < grouptype.length;g++) {
				if (this.filters[grouptype[g]][0] == "*") continue; // ignore 'all' value
				clone_exist = document.querySelector(this.me+'#clonedbuttons button[data-sort-value="'+this.filters[grouptype[g]]+'"]');
				if (!clone_exist) {
					agroup = document.querySelectorAll(this.me+'.filter-button-group-'+grouptype[g]+' button'); 
					for (var i=0; i< agroup.length;i++) {
						if (agroup[i].getAttribute('data-sort-value') == this.filters[grouptype[g]]) {
							this.create_clone_button(grouptype[g],this.filters[grouptype[g]],agroup[i].textContent,optionstype[g],'');
							this.create_clone_listener(this.filters[grouptype[g]]);
						}
					}
				}
			}
		}
	}
	var sortbybutton = document.querySelectorAll(this.me+'.sort-by-button-group button');
	for (var i=0; i< sortbybutton.length;i++) {
		['click', 'touchstart'].forEach(type => {
			sortbybutton[i].addEventListener(type,function(e) {
				let isoid = this.parentNode.getAttribute('data'); // get isotope component id
				let isoobj = cgisotope[isoid]; // get isotope object
				e.stopPropagation();
				e.preventDefault();		
				isoobj.update_sort_buttons(this);
				for (var j=0; j< sortbybutton.length;j++) {
					sortbybutton[j].classList.remove('is-checked');
				}
				this.classList.add('is-checked');
			});
		})
	}
// use value of search field to filter
	this.quicksearch = document.querySelector(this.me+'.quicksearch');
	if (this.quicksearch) {
		this.quicksearch.addEventListener('keyup',this.debounce( function() {
			$myiso.qsRegex = new RegExp( $myiso.quicksearch.value, 'gi' );
			$myiso.CG_Cookie_Set($myiso.isoid,'search',$myiso.quicksearch.value);
			$myiso.iso.arrange();
			$myiso.updateFilterCounts();
		}));
	}
//  clear search button + reset filter buttons
    var cancelsquarred = document.querySelectorAll(this.me+'.ison-cancel-squared');
	for (var cl=0; cl< cancelsquarred.length;cl++) {
	['click', 'touchstart'].forEach(type => {
		cancelsquarred[cl].addEventListener( type, function(e) {
			let isoid = this.getAttribute('data');
			if (!isoid) isoid = this.parentNode.getAttribute('data'); // get isotope component id
			let isoobj = cgisotope[isoid]; // get isotope object
			e.stopPropagation();
			e.preventDefault();	
			if (isoobj.quicksearch) {
				isoobj.quicksearch.value = "";
			}
			isoobj.qsRegex = new RegExp( "", 'gi' );
			isoobj.CG_Cookie_Set(isoobj.isoid,'search',"");
			if (isoobj.rangeSlider) {
				range_sel = isoobj.range_init;
				ranges = range_sel.split(",");
				isoobj.rangeSlider.setValues(parseInt(ranges[0]),parseInt(ranges[1]));
				isoobj.CG_Cookie_Set(isoobj.isoid,'range',range_sel);
			}
			isoobj.filters['cat'] = ['*']
			isoobj.filters['tags'] = ['*']
			isoobj.filters['lang'] = ['*']
			isoobj.filters['alpha'] = ['*']
			grouptype = ['cat','tags','alpha','fields']
			for (var g = 0; g < grouptype.length;g++) {
				agroup = document.querySelectorAll(isoobj.me+'.filter-button-group-'+grouptype[g]+' button'); 
				for (var i=0; i< agroup.length;i++) {
					agroup[i].classList.remove('is-checked');
					if (agroup[i].getAttribute('data-sort-value') == "*") isoobj.addClass(agroup[i],'is-checked');
					if (agroup[i].getAttribute('data-all') == "all") agroup[i].setAttribute('selected',true);
					if (grouptype[g] == 'fields') {
						isoobj.removeClass(agroup[i],'iso_hide_elem');
						myparent = agroup[i].parentNode.getAttribute('data-filter-group');
						if (myparent) isoobj.filters[myparent] = ['*'];
					}
				}
			}
			agroup = document.querySelectorAll(isoobj.me+'.iso_lang button'); // 2022-10-27
			for (var i=0; i< agroup.length;i++) {
				agroup[i].classList.remove('is-checked');
				if (agroup[i].getAttribute('data-sort-value') == "*") isoobj.addClass(agroup[i],'is-checked');
				if (agroup[i].getAttribute('data-all') == "all") agroup[i].setAttribute('selected',true);
			}
			agroup= document.querySelectorAll(isoobj.me+'select[id^="isotope-select-"]');
			for (var i=0; i< agroup.length;i++) {
				var myval = agroup[i].parentElement.parentElement.parentElement.getAttribute('data-filter-group');
				var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+myval);
				var choicesInstance = elChoice.choicesInstance;
				choicesInstance.removeActiveItems();
				choicesInstance.setChoiceByValue('')
				isoobj.filters[myval] = ['*']
			};
			$buttons = document.querySelectorAll('#clonedbuttons .is-checked');
			for (var i=0; i< $buttons.length;i++) { // remove buttons
				$buttons[i].remove(); 
			}
			isoobj.update_cookie_filter();
			isoobj.iso.arrange();
			isoobj.updateFilterCounts();
			if (isoobj.quicksearch) {
				isoobj.quicksearch.focus();
			}
		});
	})
	}
	if  (this.options.displayfiltertags == "listmulti") 	{ 
		this.events_listmulti('tags');
	}
	if (this.options.displayfiltercat == "listmulti") {
		this.events_listmulti('cat');
	}
	if  (this.options.displayfilterfields == "listmulti")	{ 
		this.events_listmulti('fields');
	}
	if  ((this.options.displayfiltercat == "list") || (this.options.displayfiltercat == "listex")) { 
		this.events_list('cat');
	} 
	if  ((this.options.displayfiltertags == "list") || (this.options.displayfiltertags == "listex")) { 
		this.events_list('tags');
	} 
	if  ((this.options.displayfilterfields == "list") || (this.options.displayfilterfields == "listex")) { 
		this.events_list('fields');
	} 
	if ((this.options.displayfiltercat == "multi") || (this.options.displayfiltercat == "multiex")  ) {
		this.events_multibutton('cat')
	}
	if ((this.options.displayfiltertags == "multi") || (this.options.displayfiltertags == "multiex")  ) {
		this.events_multibutton('tags')
	}
	if ((this.options.displayfilterfields == "multi") || (this.options.displayfilterfields == "multiex")) { 
		this.events_multibutton('fields');
	}
	if (this.options.language_filter == "multi") { 
		this.events_multibutton('lang')	
	}
	if (this.options.displayalpha == "multi") { 
		this.events_multibutton('alpha')
	}
	if (this.options.displayfiltercat == "button"){
		this.events_button('cat');
	}
	if (this.options.displayfiltertags == "button") { 
		this.events_button('tags');
	}
	if (this.options.displayfilterfields == "button") { 
		this.events_button('fields');
	}
	if (this.options.language_filter == "button") { 
		this.events_button('lang');
	}
	if (this.options.displayalpha == "button") { 
		this.events_button('alpha');
	}
	more = document.querySelector(this.me+'.iso_button_more');
	if (more) {
		['click', 'touchstart'].forEach(type => {
			more.addEventListener(type, function(e) {
				e.stopPropagation();
				e.preventDefault();		
				if ($myiso.items_limit > 0) {
					$myiso.items_limit = 0; // no limit
					this.textContent = $myiso.options.libless;
				} else {
					$myiso.items_limit = $myiso.options.limit_items; // set limit
					this.textContent = $myiso.options.libmore;
				}
				$myiso.updateFilterCounts();
			});
		})
	}
	//-------------------- offcanvas : update isotope width
	var myOffcanvas = document.getElementById('offcanvas_isotope');
	if (myOffcanvas) {
		myOffcanvas.addEventListener('hidden.bs.offcanvas', function () {
			let isoid = this.parentNode.parentNode.getAttribute('data');
			document.getElementById('offcanvas_isotope').classList.remove('offcanvas25');
			document.getElementsByClassName('isotope_grid')[0].classList.remove('isogrid75');
			document.getElementsByClassName('isotope_grid')[0].classList.remove('offstart');
			document.getElementsByClassName('isotope_grid')[0].classList.remove('offend');
			cgisotope[isoid].iso.arrange();
		})
		myOffcanvas.addEventListener('show.bs.offcanvas', function () {
			let isoid = this.parentNode.parentNode.getAttribute('data');
			document.getElementById('offcanvas_isotope').classList.add('offcanvas25');
			if (document.getElementById('offcanvas_isotope').classList.contains("offcanvas-start")) 
				document.getElementsByClassName('isotope_grid')[0].classList.add('offstart');
			if (document.getElementById('offcanvas_isotope').classList.contains("offcanvas-end")) 
				document.getElementsByClassName('isotope_grid')[0].classList.add('offend');
			cgisotope[isoid].iso.arrange();
		})
	}
}// end of goisotope
CGIsotope.prototype.displayArticle = function(result) {
	var html ='';
	// Component : result, module : result.data.data
    if (result.success) {
		if (this.options.ismodule) result = result.data.data; // module ajax
		for (var i=0; i<result.length; i++) {
            html += '<h1>'+result[i].title+'<button type="button" class="close">X</button></h1>';
			html +=result[i].fulltext;
			if (result[i].fulltext =="") html += result[i].introtext;
			if (result[i].scripts.length > 0) {
				for (var s=0; s < result[i].scripts.length ;s++) {
					var scriptElement = document.createElement( "script" );
					scriptElement.addEventListener(	"load",function() {
							console.log( "Successfully loaded scripts" );
						}
					);
 					scriptElement.src = result[i].scripts[s];
					document.head.appendChild( scriptElement );
				}
			}
			if (result[i].css.length > 0) {
				for (var s=0; s < result[i].css.length ;s++) {
					var link = document.createElement( "link" );
					link.type = "text/css";
					link.rel = "stylesheet";
					
					link.addEventListener(	"load",function() {
							console.log( "Successfully loaded css" );
						}
					);
 					link.href = result[i].css[s];
					document.head.appendChild( link );
				}
			}
        }
        this.iso_article.innerHTML = html;
		this.close = document.querySelector('button.close');
		
	} else {
        html = result.message;
        if ((result.messages) && (result.messages.error)) {
            for (var j=0; j<result.messages.error.length; j++) {
                html += "<br/>" + result.messages.error[j];
            }
		}
	}
}

CGIsotope.prototype.rangeUpdated = function(){
	let rangeid = this.target;
	let obj = document.querySelector(rangeid);
	let isoid = obj.getAttribute('data');
	let isoobj = cgisotope[isoid];
	isoobj.range_sel = isoobj.rangeSlider.getValue();
	isoobj.range_init = isoobj.rangeSlider.conf.values[0]+','+isoobj.rangeSlider.conf.values[isoobj.rangeSlider.conf.values.length - 1];
	isoobj.CG_Cookie_Set(isoobj.isoid,'range',isoobj.range_sel);
	isoobj.iso.arrange();
}
// create listmulti eventListeners
CGIsotope.prototype.events_listmulti = function(component) {
	agroup= document.querySelectorAll(this.me+'select[id^="isotope-select-'+component+'"]');
	for (var i=0; i< agroup.length;i++) {
		agroup[i].addEventListener('choice',function(evt, params) {
			$myiso.filter_list_multi(this,evt,'choice');
		});
		agroup[i].addEventListener('removeItem',function(evt, params) {
			$myiso.filter_list_multi(this,evt,'remove');
		});
		$parent = agroup[i].parentElement.parentElement.parentElement.getAttribute('data-filter-group');
		if (typeof $myiso.filters[$parent] === 'undefined' ) { 
			$myiso.filters[$parent] = ['*'];
		}			
	};	
	if ((this.filters[$parent][0] != '*') && (this.filters[$parent].length == 1)) {
		var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+component);
		var choicesInstance = elChoice.choicesInstance;
		var savefilter = this.filters[$parent][0];
		choicesInstance.removeActiveItemsByValue(''); // remove all 
		choicesInstance.setChoiceByValue(savefilter);
		if (elChoice.parentElement.parentElement.className == "offcanvas-body") { // need clone
			clone_exist = document.querySelector(this.me+'#clonedbuttons button[data-sort-value="'+this.filters[component]+'"]');
			if (!clone_exist) { // create default button
				sel = savefilter;
				lib = choicesInstance.getValue()[0].label;
				child = null;
				this.create_clone_button(component,sel,lib,'list',child);
				this.create_clone_listener(sel);
			}
		}
	}	
}
// create list eventListeners
CGIsotope.prototype.events_list = function(component) {
	agroup= document.querySelectorAll(this.me+'.filter-button-group-'+component);
	for (var i=0; i< agroup.length;i++) {
		agroup[i].addEventListener('choice',function(evt, params) {
			$myiso.filter_list(this,evt,'choice')
			});
		agroup[i].addEventListener('removeItem',function(evt, params) {
			$myiso.filter_list(this,evt,'remove');
		});
			
	};
	var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+component);
	if (!elChoice) return;
	var choicesInstance = elChoice.choicesInstance;
	choicesInstance.setChoiceByValue(this.filters[component]);
	if ((elChoice.parentElement.parentElement.className == "offcanvas-body") && (this.filters[component] != '*')) { // need clone
		clone_exist = document.querySelector(me+'#clonedbuttons button[data-sort-value="'+this.filters[component]+'"]');
		if (!clone_exist) { // create default button
			sel = this.filters[component];
			lib = choicesInstance.getValue().label;
			child = null;
			this.create_clone_button(component,sel,lib,'list',child);
			this.create_clone_listener(sel);
		}
	}	
}
// create buttons eventListeners
CGIsotope.prototype.events_button = function(component) {
	if (component == "lang")
		agroup= document.querySelectorAll(this.me+'.iso_lang button')
	else 
		agroup= document.querySelectorAll(this.me+'.filter-button-group-'+component+' button');
	for (var i=0; i< agroup.length;i++) {
		['click', 'touchstart'].forEach(type => {
			agroup[i].addEventListener(type,function(evt) {
				evt.stopPropagation();
				evt.preventDefault();		
				$myiso.filter_button(this,evt);
			// reset other buttons
				mygroup= this.parentNode.querySelectorAll('button' );
				for (var g=0; g< mygroup.length;g++) {
					$myiso.removeClass(mygroup[g],'is-checked');
				}
				$myiso.addClass(this,'is-checked');
			});
		})
	};
}
// create multiselect buttons eventListeners
CGIsotope.prototype.events_multibutton = function(component) {
	if (component == "lang")
		agroup= document.querySelectorAll(this.me+'.iso_lang button')
	else 
		agroup= document.querySelectorAll(this.me+'.filter-button-group-'+component+' button');
	for (var i=0; i< agroup.length;i++) {
		['click', 'touchstart'].forEach(type =>{
			agroup[i].addEventListener(type,function(evt) {
			evt.stopPropagation();
			evt.preventDefault();		
			$myiso.filter_multi(this,evt);
			$myiso.set_buttons_multi(this);
			})
		})
	};
}	
CGIsotope.prototype.update_sort_buttons = function(obj) {
	var sortValue = obj.getAttribute('data-sort-value');
	if (sortValue == "random") {
		this.CG_Cookie_Set(this.isoid,'sort',sortValue+'-');
		this.iso.shuffle();
		return;
	} 
	sens = obj.getAttribute('data-sens');
	sortValue = sortValue.split(',');
	if (!this.hasClass(obj,'is-checked')) { // first time sorting
		sens = obj.getAttribute('data-init');
		obj.setAttribute("data-sens",sens);
		asc=true;
		if (sens== "-") asc = false;
	} else { // invert order
		if (sens == "-") {
			obj.setAttribute("data-sens","+");
			asc = true;
		} else {
			obj.setAttribute("data-sens","-");
			asc = false;
		}
	}
	sortAsc = {};
	for (i=0;i < sortValue.length;i++) {
		if ( sortValue[i] == "featured"){  // featured always first
			sortAsc[sortValue[i]] = false ;
		} else {
			sortAsc[sortValue[i]] = asc;
		}
	}
	this.CG_Cookie_Set(this.isoid,'sort',sortValue+'-'+asc);
	this.iso.options.sortBy = sortValue;
	this.iso.options.sortAscending = sortAsc;
	this.iso.arrange();
}
/*------- infinite scroll : update buttons list------------*/
CGIsotope.prototype.infinite_buttons = function(appended_list) {
	if (this.options.displayalpha != 'false') {
	// alpha buttons list
		for (x=0;x < appended_list.length-1;x++) {
			alpha = appended_list[x].attributes['data-alpha'].value;
			mybutton= document.querySelector(this.me+'.filter-button-group-alpha .iso_button_alpha_'+alpha);
			if (!mybutton) {
				buttons = document.querySelector(this.me+'.filter-button-group-alpha');
				var abutton = document.createElement('button');
				abutton.classList.add('btn');
				abutton.classList.add(this.options.button_bootstrap.substr(4,100).trim());
				abutton.classList.add('iso_button_alpha_'+alpha);
				abutton.setAttribute('data-sort-value',alpha);
				abutton.title = alpha;
				abutton.innerHTML = alpha;
				buttons.append(abutton);
			}
		}
	}
}
/*------- grid filter --------------*/
CGIsotope.prototype.grid_filter = function(elem) {
	var searchResult = this.qsRegex ? elem.textContent.match( this.qsRegex ) : true;
	var	lacat = elem.getAttribute('data-category');
	var laclasse = elem.getAttribute('class');
	var lescles = laclasse.split(" ");
	var buttonResult = false;
	var rangeResult = true;
	var searchAlpha = true;
	if (this.filters['alpha'].indexOf('*') == -1) {// alpha filter
		alpha = elem.getAttribute('data-title').substring(0,1);
		if (this.filters['alpha'].indexOf(alpha) == -1) return false;
	}
	if (this.filters['lang'].indexOf('*') == -1) { 
		lalang = elem.getAttribute('data-lang') ;
		if (this.filters['lang'].indexOf(lalang) == -1)  {
			return false;
		}
	}
	if 	(this.rangeSlider) {
		var lerange = elem.getAttribute('data-range');
		if (this.range_sel != this.range_init) {
			ranges = this.range_sel.split(",");
			rangeResult = (parseInt(lerange) >= parseInt(ranges[0])) && (parseInt(lerange) <= parseInt(ranges[1]));
		}
	}
	if ((this.options.article_cat_tag != "fields") && (this.options.article_cat_tag != "catfields") && (this.options.article_cat_tag != "tagsfields") && (this.options.article_cat_tag != "cattagsfields")) {
		if ((this.filters['cat'].indexOf('*') != -1) && (this.filters['tags'].indexOf('*') != -1)) { return searchResult && rangeResult && true};
		count = 0;
		if (this.filters['cat'].indexOf('*') == -1) { // on a demandé une classe
			if (this.filters['cat'].indexOf(lacat) == -1)  {
				return false; // n'appartient pas à la bonne classe: on ignore
			} else { count = 1; } // on a trouvé la catégorie
		}
		if (this.filters['tags'].indexOf('*') != -1) { // tous les tags
			return searchResult && rangeResult && true;
		}
		for (var i in lescles) {
			if  (this.filters['tags'].indexOf(lescles[i]) != -1) {
				buttonResult = true;
				count += 1;
			}
		}
		if (this.options.searchmultiex == "true")	{
			lgth = this.filters['cat'].length + this.filters['tags'].length;
			if ((this.filters['tags'].indexOf('*') != -1) || (this.filters['cat'].indexOf('*') != -1)) {lgth = lgth - 1;}
			return searchResult && rangeResult && (count == lgth) ;
		} else { 
			return searchResult && rangeResult && buttonResult;
		}
	} else { // fields
		ix = 0;
		if (typeof this.filters === 'undefined' ) { // aucun filtre: on passe
			return searchResult && rangeResult && true;
		}
		// combien de filtres diff. tout ?
		filterslength = 0;
		for (x in this.filters) {
			if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') || (x == 'tags') ) continue; 
			filterslength++;
			if (this.filters[x].indexOf('*') != -1) ix++; 
		}
		catok = false;
		if (this.filters['cat'].indexOf('*') == -1) { // on a demandé une classe
			if (this.filters['cat'].indexOf(lacat) == -1)  {
				return false; // n'appartient pas à la bonne classe: on ignore
			} else { catok = true; } // on a trouvé la catégorie
		} else {
			catok = true;
		}
		tagok = false;
		if (this.filters['tags'].indexOf('*') == -1) { // on a demandé un tag
			for (var i in lescles) {
				if  (this.filters['tags'].indexOf(lescles[i]) != -1) {
					tagok = true;
				//	filterslength++;
				}
			}
		} else {
			tagok = true;
		}
		if ( (ix == filterslength) && catok && tagok) return searchResult && rangeResult && true;
		count = 0;
		for ( var j in lescles) {
			for (x in this.filters) {
				if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') || (x == 'tags'))continue; 
				if  (this.filters[x].indexOf(lescles[j]) != -1) { 
					// buttonResult = true;
					count += 1;
				}
			}
		}
		if (this.options.searchmultiex == "true")	{ // multi-select on grouped buttons
			lgth = 0;
			for (x in this.filters) {
				if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') ||(x == 'tags')) continue;
				lgth = lgth + this.filters[x].length;
				if (this.filters[x].indexOf('*') != -1) lgth = lgth - 1;
			}
			return searchResult && rangeResult && (count == lgth) && tagok;
		} else  {
			return searchResult && rangeResult && (count >= (filterslength -ix)) && catok && tagok;
		}
	}
} 
// ---- Filter List 
CGIsotope.prototype.filter_list = function(obj,evt,params) {
	$parent = obj.getAttribute('data-filter-group');
	$isclone = false;
	if (obj.parentNode.id == "clonedbuttons") { // clone 
		$selectid = $parent;
		$isclone = true;
		sortValue =  '';
	} else {
		$selectid = obj.getAttribute('data-filter-group');
		sortValue = obj.querySelector(".is-highlighted");
		sortValue = sortValue.dataset.value;
	}
	if (typeof sortValue === 'undefined') sortValue = ""
	elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+$selectid);
	choicesInstance = elChoice.choicesInstance;
	$needclone = false;
	$grdparent = obj.parentNode;
	if ($grdparent.className == "offcanvas-body") {
		$needclone = true;
	}
	if (params == 'remove' && $needclone) { // remove item from offcanvas => remove button
		this.removeFilter( this.filters, $parent, evt.detail.value );
		myclone = document.querySelector('#clonedbuttons button[data-sort-value="'+evt.detail.value+'"]')
		if (myclone) myclone.remove();
		if (this.filters[$parent].length == 0) {
			this.filters[$parent] = ['*'] ;
			choicesInstance.setChoiceByValue('')
			this.update_cookie_filter();
		}	
		return;
	}
	if (sortValue == '')   {
		choicesInstance.removeActiveItems();
		choicesInstance.setChoiceByValue('')		
		this.filters[$parent] = ['*'];
		$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
		for (var i=0; i< $buttons.length;i++) { // remove buttons
			$buttons[i].remove(); 
		}
	} else { 
		this.filters[$parent] = [sortValue];
		if ($needclone) { // clone
			$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
			for (var i=0; i< $buttons.length;i++) { // remove buttons
				$buttons[i].remove(); 
			}
			clone_exist = document.querySelector(this.me+'#clonedbuttons button[data-sort-value="'+this.filters[$parent]+'"]');
			if (!clone_exist) {
				lib = evt.detail.choice.label;
				this.create_clone_button($parent,sortValue,lib,'list','');
				this.create_clone_listener(sortValue);
			}
		}
	}
	this.update_cookie_filter();
	this.iso.arrange(); 
	this.updateFilterCounts();
}
	// ----- Filter MultiSelect List
CGIsotope.prototype.filter_list_multi = function(obj,evt,params) {
		$evnt = evt;
		$params = params;
		$isclone = false;
		if (obj.parentNode.id == "clonedbuttons") { // clone 
			$parent = obj.getAttribute('data-filter-group');
			$selectid = "isotope-select-"+$parent;
			$isclone = true;
		} else {
			$parent = obj.parentNode.parentNode.parentNode.getAttribute('data-filter-group')
			$selectid = obj.getAttribute('id');
		}
		if (typeof this.filters[$parent] === 'undefined' ) { 
			this.filters[$parent] = [];
		}
		var elChoice = document.querySelector('joomla-field-fancy-select#'+$selectid);
		var choicesInstance = elChoice.choicesInstance;
		
		if ($params == "remove") { // deselect element except all
			if ($isclone) {
				this.removeFilter( this.filters, $parent, obj.getAttribute('data-sort-value') );
				savfilter = JSON.parse(JSON.stringify(this.filters)); // save filter
				// remove all selected items
				choicesInstance.removeActiveItems();
				this.filters = JSON.parse(JSON.stringify(savfilter));
				choicesInstance.removeActiveItemsByValue('');
				// recreate remaining values and buttons
				for (var i = 0; i < this.filters[$parent].length; i++) {
					remval = this.filters[$parent][i];
					choicesInstance.setChoiceByValue(remval);
					asel = choicesInstance.getValue()[i];
					this.create_clone_button($parent,remval,asel.label,'list_multi','');
					this.create_clone_listener(remval);
				}
			} else {
				this.removeFilter( this.filters, $parent, $evnt.detail.value );
				myclone = document.querySelector('#clonedbuttons button[data-sort-value="'+$evnt.detail.value+'"]')
				if (myclone) myclone.remove();
			}
			if (this.filters[$parent].length == 0) {
				this.filters[$parent] = ['*'] ;
				choicesInstance.setChoiceByValue('')
			}
		}
		$needclone = false;
		if (obj.parentNode != null) {
			$grdparent = obj.parentNode.parentNode.parentNode.parentNode.parentNode;
			if ($grdparent.classList[0] == "offcanvas-body") {
				$needclone = true;
			}
		}
		if ($params == "choice") {
			sel = $evnt.detail.choice.value;
			lib = $evnt.detail.choice.label;
			if (sel == '') {// all
				this.filters[$parent] = ['*'];
				choicesInstance.removeActiveItems();
				choicesInstance.setChoiceByValue('');
				$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
				for (var i=0; i< $buttons.length;i++) { // remove buttons
					$buttons[i].remove(); 
				}
			} else {
				if (this.filters[$parent].indexOf('*') != -1) { // was all
					choicesInstance.removeActiveItemsByValue('')
					this.filters[$parent] = []; // remove it
				}
				if ($needclone) {
					clone_exist = false;
					if (this.filters[$parent].indexOf(sel) != -1) clone_exist = true
					// clone_exist = document.querySelector(this.me+'#clonedbuttons button[data-sort-value="'+this.filters[$parent]+'"]');
					if (!clone_exist) {
						this.create_clone_button($parent,sel,lib,'list_multi','');
						this.create_clone_listener(sel);
					}
				}
				this.addFilter( this.filters, $parent, sel );
			}
			choicesInstance.hideDropdown();
		}
		this.update_cookie_filter();
		this.iso.arrange(); 
		this.updateFilterCounts();
	}
     
CGIsotope.prototype.filter_button = function(obj,evt) {
		if (this.hasClass(obj,'disabled')) return; //ignore disabled buttons
		$parent = obj.parentNode.getAttribute('data-filter-group');
		child =  obj.getAttribute('data-child'); // child group number
		var sortValue = obj.getAttribute('data-sort-value');
		$isclone = false;
		if (obj.parentNode.id == "clonedbuttons") { // clone 
			$parent = obj.getAttribute('data-filter-group');
			abutton = document.querySelector('.isotope_button-group .iso_button_'+$parent+'_'+sortValue);
			this.toggleClass(abutton,'is-checked');
			sortValue = '*';
			if (this.std_parents.indexOf($parent) != -1) {
				abutton = document.querySelector('.iso_button_'+$parent+'_tout');
			} else {// custom field
				abutton = document.querySelector('.iso_button_tout.filter-button-group-'+$parent);
			}
			this.toggleClass(abutton,'is-checked'); // all button
			$isclone = true;
		} 		
		if (typeof this.filters[$parent] === 'undefined' ) { 
			this.filters[$parent] = {};
		}
		$needclone = false;
		$grdparent = obj.parentNode.parentNode;
		if (this.hasClass($grdparent,"offcanvas-body")) {
			$needclone = true;
		}
		if ($needclone) {
			if (this.hasClass(obj,'is-checked')) {return} // already cloned
			$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
			for (var i=0; i< $buttons.length;i++) { // remove buttons
					$buttons[i].remove(); 
			}
			if (sortValue != '*') { // don't clone all button
				lib = evt.srcElement.innerHTML;
				this.create_clone_button($parent,sortValue,lib,'button',child);
				this.create_clone_listener(sortValue);
			}
		}
		if (sortValue == '*') {
			this.filters[$parent] = ['*'];
			if ($isclone) {
				obj.remove;
			}
			if (child) {
				this.set_family_all(this.me,child,'button');
			}
		} else { 
			this.filters[$parent]= [sortValue];
			if (child) {
				this.set_family(this.me,'',child,sortValue,'button');
			}
		}
		this.update_cookie_filter();
		this.iso.arrange(); 
		this.updateFilterCounts();
	}
CGIsotope.prototype.filter_multi = function(obj,evt) {
		var sortValue = obj.getAttribute('data-sort-value');
		child =  obj.getAttribute('data-child'); // child group number
		$isclone = false;
		if (obj.parentNode.id == "clonedbuttons") { // clone 
			$parent = obj.getAttribute('data-filter-group');
			$buttons = document.querySelectorAll('.iso_button_'+$parent+'_'+sortValue);
			for (var i=0; i< $buttons.length;i++) { 
					this.toggleClass($buttons[i],'is-checked');
			}
			$isclone = true;
		} else {
			$parent = obj.parentNode.getAttribute('data-filter-group');
			this.toggleClass(obj,'is-checked');
		}
		var isChecked = this.hasClass(obj,'is-checked');
		// clone offcanvas button
		$needclone = false;
		$grdparent = obj.parentNode.parentNode;
		if (this.hasClass($grdparent,"offcanvas-body")) {
			$needclone = true;
		}
		if ($needclone) {
			if ((isChecked) && (sortValue != "*")) { // clone button
			    if (evt.srcElement.localName == "img")
					lib = evt.srcElement.outerHTML+evt.srcElement.nextSibling.textContent;
				else lib = evt.srcElement.innerHTML;
				this.create_clone_button($parent,sortValue,lib,'multi',child);
				this.create_clone_listener(sortValue);
			} else { // remove cloned button
				if (sortValue != "*") {
					aclone = document.querySelector('#clonedbuttons .iso_button_'+$parent+'_'+sortValue)
					aclone.remove();
				}
			}
		}
		// end of cloning
		if (typeof this.filters[$parent] === 'undefined' ) { 
			this.filters[$parent] = [];
		}
		if (sortValue == '*') {
			this.filters[$parent] = ['*'];
			clones = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
			for (var i=0; i< clones.length;i++) { 
				clones[i].remove(); // remove other cloned buttons
			}
			if (child) {
				this.set_family_all(this.me,child,'button')
			}
		} else { 
			this.removeFilter(this.filters, $parent,'*');
			this.removeFilter(this.filters, $parent,'none');
			if ( isChecked ) {
				this.addFilter( this.filters, $parent,sortValue );
				if (child) {
					this.set_family(this.me,$parent,child,sortValue,'button')
				}
			} else {
				this.removeFilter( this.filters, $parent, sortValue );
				if (this.filters[$parent].length == 0) {// no more selection
					this.filters[$parent] = ['*'];
					if ($isclone) {
						aclone = document.querySelector('.filter-button-group-'+$parent+' [data-sort-value="*"]');
						this.addClass(aclone,'is-checked');
					}
				}
				if (child) {
					if (this.filters[$parent] == ['*']) {// no more selection
						this.set_family_all(this.me,child,'button')
					} else { // remove current selection
						this.del_family(this.me,$parent,child,sortValue,'button')
					}
				}
			}	
		}
		this.update_cookie_filter();
		this.iso.arrange(); 
		this.updateFilterCounts();
	}
CGIsotope.prototype.set_buttons_multi = function(obj) {
		$parent = obj.parentNode.getAttribute('data-filter-group');
		if (obj.getAttribute('data-sort-value') == '*') { // on a cliqué sur tout => on remet le reste à blanc
			buttons = obj.parentNode.querySelectorAll('button.is-checked');
			for (var i=0; i< buttons.length;i++) { 
					this.removeClass(buttons[i],'is-checked');
			}
			this.addClass(obj,'is-checked');
		} else { // on a cliqué sur un autre bouton : uncheck le bouton tout
			if ((this.filters[$parent].length == 0) || (this.filters[$parent] == '*')) {// plus rien de sélectionné : on remet tout actif
				button_all = obj.parentNode.querySelector('[data-sort-value="*"]');
				this.addClass(button_all,'is-checked');
				this.filters[$parent] = ['*'];
				this.update_cookie_filter();
				this.iso.arrange();
			}
			else {
				button_all = obj.parentNode.querySelector('[data-sort-value="*"]');
				this.removeClass(button_all,'is-checked');
			}
		}
	}
	//
	// check items limit and hide unnecessary items
CGIsotope.prototype.updateFilterCounts = function() {
		var items = document.querySelectorAll(this.me + '.isotope_item');
		var more = document.querySelector(this.me+'.iso_button_more')
		var itemElems = this.iso.getFilteredItemElements();
		var count_items = itemElems.length;
		var divempty = document.querySelector(this.me + '.iso_div_empty')
		for (var i=0;i < items.length;i++) {
			if (this.hasClass(items[i],'iso_hide_elem')) {
				this.removeClass(items[i],'iso_hide_elem');
			}
		}
		if (this.empty_message) { // display "empty message" or not
			if (count_items == 0) {
				this.removeClass(divempty,'iso_hide_elem')
			} else {
				if (!this.hasClass(divempty,'iso_hide_elem')) {
					this.addClass(divempty,'iso_hide_elem')
				}
			}
		}
		if (this.items_limit > 0)  { 
			for(var index=0;index < itemElems.length;index++) {
				if (index >= this.items_limit) {
					this.addClass(items[index],'iso_hide_elem');
				}
			};
			if (index < this.items_limit && this.options.pagination != 'infinite') { // unnecessary button
				this.addClass(more,'iso_hide_elem');
			} else { // show more button required
				this.removeClass(more,'iso_hide_elem');
			}
		} 
		// hide show see less button
		if ((this.items_limit == 0) && (this.sav_limit > 0) && this.options.pagination != 'infinite') { 
			for(var index=0;index < itemElems.length;index++) {
				if (this.hasClass(itemElems[index],'iso_hide_elem')) {
					count_items -=1;
				}
			};
			if (count_items > this.sav_limit) {
				this.removeClass(more,'iso_hide_elem');
			} else {
				this.addClass(more,'iso_hide_elem');
			}
		}
		this.iso.arrange();
	}
// -- Create a clone button
CGIsotope.prototype.create_clone_button = function($parent,$sel,$lib,$type,child) {
	buttons = document.querySelector('#clonedbuttons');
	var abutton = document.createElement('button');
	abutton.classList.add('btn');
	abutton.classList.add('btn-sm');
	abutton.classList.add('iso_button_'+$parent+'_'+$sel);
	abutton.classList.add('is-checked');
	abutton.setAttribute('data-sort-value',$sel);
	abutton.setAttribute('data-filter-group',$parent);
	abutton.setAttribute('data-clone-type',$type);
	if (child)	abutton.setAttribute('data-child',child);
	if ($lib.indexOf('img src') > 0) {// image in lib : remove it
		abutton.title = $lib.substr($lib.indexOf(">") + 1)
	}
	else {
		abutton.title = $lib;
	}
	abutton.innerHTML = $lib;
	buttons.prepend(abutton);
}
// -- Create cloned button event listener
CGIsotope.prototype.create_clone_listener = function($sel) {
	onebutton =  document.querySelector('#clonedbuttons [data-sort-value="'+$sel+'"] ');
	['click', 'touchstart'].forEach(type => {
		onebutton.addEventListener(type,function(evt) {
			evt.stopPropagation();
			evt.preventDefault();		
			if (this.getAttribute('data-clone-type') == "multi")	$myiso.filter_multi(this);
			if (this.getAttribute('data-clone-type') == "button") $myiso.filter_button(this);
			if (this.getAttribute('data-clone-type') == "list_multi") $myiso.filter_list_multi(this,evt,'remove');
			if (this.getAttribute('data-clone-type') == "list") $myiso.filter_list(this,evt);
			this.remove();
		})
	})
}
CGIsotope.prototype.debounce = function( fn, threshold ) {
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
CGIsotope.prototype.addFilter = function( filters, $parent, filter ) {
	if (!$parent) return;
	if ( filters[$parent].indexOf( filter ) == -1 ) {
		filters[$parent].push( filter );
	}
}
CGIsotope.prototype.removeFilter = function( filters, $parent, filter ) {
	if (!Array.isArray(filters[$parent])) filters[$parent] = ['*']; // lost : assume all
	var index = filters[$parent].indexOf( filter);
	if ( index != -1 ) {
		filters[$parent].splice( index, 1 );
	}
}	
CGIsotope.prototype.update_cookie_filter=function() {
	$filter_cookie = "";
	for (x in this.filters) {
		if (x == "null") continue;
		if ($filter_cookie.length > 0) $filter_cookie += ">";
		$filter_cookie += x+'<'+this.filters[x].toString();
	}
	if ($filter_cookie.length > 0) $filter_cookie += ">";
	this.CG_Cookie_Set(this.isoid,'filter',$filter_cookie);
}
CGIsotope.prototype.getCookie = function(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : '';
}
CGIsotope.prototype.CG_Cookie_Set = function(id,param,b) {
	$myiso = cgisotope[id];
	var expires;
	duration = $myiso.options.cookieduration;
    var d = new Date();
	if( (typeof duration === 'undefined') || (duration == 0) ) expires = ""; // default duration : session
	else if (duration == '-1') expires = ";Max-Age=0;"; // no cookie
	else if (duration == '1d') { // 1 day
		d.setTime(d.getTime() + (1*24*60*60*1000));
		expires = ";expires="+ d.toUTCString();
	} 
	else if (duration == '1w') { // 1 week
		d.setTime(d.getTime() + (7*24*60*60*1000));
		expires = ";expires="+ d.toUTCString();
	}
	else if (duration == '1m') { // 1 month
		d.setTime(d.getTime() + (30*24*60*60*1000));
		expires = ";expires="+ d.toUTCString();
	}
	$secure = "";
	if (window.location.protocol == "https:") $secure="secure;"; 
	lecookie = $myiso.getCookie($myiso.cookie_name);
	$val = param+':'+b;
	$cook = $val;
	if (lecookie != '') {
		if (lecookie.indexOf(param) >=0 ) { // cookie contient le parametre
			$cook = "";
			$arr = lecookie.split('&');
			$arr.forEach($myiso.replaceCookie,$val);
		} else { // ne contient pas encore ce parametre : on ajoute
			$cook = lecookie +'&'+$val;
		}
	}
	document.cookie = $myiso.cookie_name+"="+$cook+expires+"; path=/; samesite=lax;"+$secure;
}
CGIsotope.prototype.replaceCookie = function(item,index,arr) {
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
CGIsotope.prototype.splitCookie = function(isoid,item) {
	// check if quicksearch still exists (may be removed during testing)
	this.quicksearch = document.querySelector(this.me+'.quicksearch');
	if (item.indexOf('search:') >= 0 &&  this.quicksearch ) {
		val = item.split(':');
		this.qsRegex = new RegExp( val[1], 'gi' );
		this.quicksearch.value = val[1];
	}
	if (item.indexOf('sort:') >= 0) {
		val = item.split(':');
		val = val[1].split('-');
		sort_by = val[0].split(',');
		asc = (val[1] == "true");
		//if (sort_by[0] == "featured") { // featured always first
			sortAsc = {};
			for (i=0;i < sort_by.length;i++) {
				if ( sort_by[i] == "featured"){  // featured always first
					sortAsc[sort_by[i]] = false ;
				} else {
					sortAsc[sort_by[i]] = asc;
				}
			}
			asc = sortAsc;
		// } 
		sortButtons = document.querySelectorAll(this.me+'.sort-by-button-group button');
		for(s=0;s < sortButtons.length;s++) {
			if (val[0] != '*') { // tout
				sortButtons[s].classList.remove('is-checked');
				if (sortButtons[s].getAttribute("data-sort-value") == val[0]) {
					sortButtons[s].classList.add('is-checked');
					sortButtons[s].setAttribute("data-sens","+");
					if (val[1] != "true") sortButtons[s].setAttribute("data-sens","-");
				}
			}
		}
	}
	if (item.indexOf('filter:') >=0) {
		val = item.split(':');
		if (val[1].length > 0) {
			val = val[1].split('>'); // get filters
			for (x=0;x < val.length-1;x++) {
				values = val[x].split("<");
				if (this.std_parents.indexOf(values[0]) != -1) { // not a custom field
					if ( (values[0] == "tags" && this.options.displayfiltertags == 'listmulti') || (values[0] == "cat" && this.options.displayfiltercat == 'listmulti')) { // liste multi select	
						var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
						var choicesInstance = elChoice.choicesInstance;
						this.filters[values[0]] = values[1].split(',');
						if (values[1] == '*') {
							choicesInstance.setChoiceByValue('')
						} else {
							choicesInstance.removeActiveItemsByValue('')
							vals = values[1].split(',')
							for(c=0;c < vals.length;c++) {
								choicesInstance.setChoiceByValue(vals[c]);
							}
							if (elChoice.parentElement.parentElement.className == "offcanvas-body")  { // need clone
								for (c=0;c < choicesInstance.getValue().length;c++) {
									lib = choicesInstance.getValue()[c].label;
									sel = choicesInstance.getValue()[c].value;
									child = null;
									this.create_clone_button(values[0],sel,lib,'list_multi',child);
									this.create_clone_listener(sel);
								}
							}
						}
					} else {
						if (values[1] != '*') { // !tout
							this.filters[values[0]] = values[1].split(',');
							if (values[0] == 'lang') {
								filterButtons = document.querySelectorAll(this.me+'.iso_lang button.is-checked');
							} else {
								filterButtons = document.querySelectorAll(this.me+'.filter-button-group-'+values[0]+' button.is-checked')
							}
							for(f=0;f < filterButtons.length;f++) {
								filterButtons[f].classList.remove('is-checked');
							}
							for(v=0;v < this.filters[values[0]].length;v++) {
								if ( ((values[0] == "tags") && (this.options.displayfiltertags == 'list') ) ||
									((values[0] == "cat") && (this.options.displayfiltercat == 'list')) ) {
									var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
									var choicesInstance = elChoice.choicesInstance;
									choicesInstance.setChoiceByValue(this.filters[values[0]][v]);
									if (elChoice.parentElement.parentElement.className == "offcanvas-body")  { // need clone
										var choicesInstance = elChoice.choicesInstance;
										sel = this.filters[values[0]][v];
										lib = choicesInstance.getValue().label;
										child = null;
										this.create_clone_button(values[0],sel,lib,'list',child);
										this.create_clone_listener(sel);
									}
								} else {
									$button =  document.querySelector( this.me+'.iso_button_'+values[0]+'_'+ this.filters[values[0]][v]);
									this.addClass($button,'is-checked');
									if (this.hasClass($button.parentNode.parentNode,"offcanvas-body"))  { // need clone
										$type ='button'; // assume button
										if ((values[0] == "cat" && (this.options.displayfiltercat == "multi" || this.options.displayfiltercat == "multiex")) ||
										    (values[0] == "tags" && (this.options.displayfiltertags == "multi" || this.options.displayfiltercat == "multiex")) || 
											(values[0] == "alpha" && (this.options.displayalpha == "multi" || this.options.displayalpha == "multiex")) ) {
												$type = 'multi';
										}
										child = null;
										lib = $button.innerHTML;
										this.create_clone_button(values[0],this.filters[values[0]][v],lib,$type,child);
										this.create_clone_listener(this.filters[values[0]][v]);
									}
								}
							};
						}
					}
				} else { //fields
					if (this.options.displayfilterfields == 'listmulti') { // liste multi select		
						var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
						var choicesInstance = elChoice.choicesInstance;
						this.filters[values[0]] = values[1].split(',');
						if (values[1] == '*') {
							choicesInstance.setChoiceByValue('')
						} else {
							choicesInstance.removeActiveItemsByValue('')
							vals = values[1].split(',')
							for(c=0;c < vals.length;c++) {
								choicesInstance.setChoiceByValue(vals[c]);
							}
							if (elChoice.parentElement.parentElement.className == "offcanvas-body")  { // need clone
								for (c=0;c < choicesInstance.getValue().length;c++) {
									lib = choicesInstance.getValue()[c].label;
									sel = choicesInstance.getValue()[c].value;
									child=null;
									create_clone_button(values[0],sel,lib,'list',child);
									create_clone_listener(sel);
								}
							}
						}
					} else { if (values[1] != '*') { // !tout
						alist = document.querySelectorAll(this.me+'.class_fields_'+values[0]+' .is-checked');
						for(l=0;l < alist.length;l++) {
								alist[l].classList.remove('is-checked');
						}
						this.filters[values[0]] = values[1].split(',');
						for(v=0;v < this.filters[values[0]].length;v++) {
							if ((this.options.displayfilterfields == 'list') ||(this.options.displayfilterfields == 'listex')) {
								elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
								choicesInstance = elChoice.choicesInstance;
								this.filters[values[0]] = values[1].split(',');
								if (values[1] == '*') {
									choicesInstance.setChoiceByValue('')
								} else {
									choicesInstance.removeActiveItemsByValue('')
									choicesInstance.setChoiceByValue(values[1]);
									if (elChoice.parentElement.parentElement.parentElement.className == "offcanvas-body")  { // need clone
										lib = choicesInstance.getValue().label;
										sel = choicesInstance.getValue().value;
										child=null;
										create_clone_button(values[0],sel,lib,'list',child);
										create_clone_listener(sel);
									}
								}
							} else {
								obj = document.querySelector( this.me+'.iso_button_'+values[0]+'_'+ this.filters[values[0]][v]);
								this.addClass(obj,'is-checked');		
								child =  obj.getAttribute('data-child'); // child group number
								if (child) {
									this.sortValue = obj.getAttribute('data-sort-value');
									this.set_family(this.me,'',child,this.sortValue,'button')
								}
								if (this.hasClass(obj.parentNode.parentNode.parentNode,"offcanvas-body"))  { // need clone
									$type ='button'; 
									lib = obj.innerHTML;
									this.create_clone_button(values[0],this.filters[values[0]][v],lib,$type,child);
									this.create_clone_listener(this.filters[values[0]][v]);
								}
							}
						};
						}
					}
				}
			}
		}
	}
	if (item.indexOf('range:') >=0) {
		val = item.split(':');
		if (val[1].length > 0) {
			spl = val[1].split(",");
			this.min_range =parseInt(spl[0]);
			this.max_range =parseInt(spl[1]);
		}
	}
}
CGIsotope.prototype.set_family = function(me,$parent,child,sortValue,$type) {
	parents = [];
    while (child) {
		if ($type == 'list') { // todo : not tested
			$asel = document.querySelector(me+'.filter-button-group-fields [data-group-id="'+child+'"]');
			listoptions = $asel.querySelectorAll('option');
			for (var i=0;i < listoptions.length;i++) {
				if (!this.hasClass(listoptions[i],'iso_hide_elem')) this.addClass(listoptions[i],'iso_hide_elem'); // hide all options
			}
			// show all 
			$all = $asel.querySelector('[data-all="all"]');
			removeClass($all,'iso_hide_elem')
			$all.setAttribute('selected',true)
			child = $all.getAttribute('data-child'); 
		} else { // button
			$myparent = document.querySelector(me+'.filter-button-group-fields').parentNode;
			$asel = $myparent.querySelector('[data-group-id="'+child+'"]');
			if (($parent == "") || (($parent != "") && (this.filters[$parent].length == 1) && (this.filters[$parent] != '*'))) { // multi-select
				buttons = $asel.querySelectorAll('button');
				for (var i=0;i< buttons.length;i++) {
					if (!this.hasClass(buttons[i],'iso_hide_elem'))	this.addClass(buttons[i],'iso_hide_elem')
					this.removeClass(buttons[i],'is-checked'); // hide all buttons
				}
			} 
			abutton = $asel.querySelector('button.iso_button_tout')
			this.removeClass(abutton,'iso_hide_elem');
			this.addClass(abutton,'is-checked'); 
			child = abutton.getAttribute('data-child');
		}
		if (parents.length == 0) {
			buttons = $asel.querySelectorAll('[data-parent="'+sortValue+'"]');
			for(var i = 0;i < buttons.length;i++) {
				this.removeClass(buttons[i],'iso_hide_elem');
			}
			newparents = $asel.querySelectorAll('[data-parent="'+sortValue+'"]');
			parents=[];
			if (newparents.length > 0) {
				for ($i = 0;$i < newparents.length;$i++) {
					if ($type == 'list') {
						newval = newparents[$i].getAttribute('value');
					} else {
						newval = newparents[$i].getAttribute('data-sort-value');
					}
					if (newval != "*") parents.push(newval);
				}
			}
		} else {
			newparents = [];
			for ($i=0; $i < parents.length; $i++) {
				sortValue = parents[$i];
				if (sortValue != '*') {
					buttons = $asel.querySelectorAll('[data-parent="'+sortValue+'"]');
					for(var i = 0;i < buttons.length;i++) {
						this.removeClass(buttons[i],'iso_hide_elem');
					}
					$vals = $asel.querySelectorAll('[data-parent="'+sortValue+'"]');
					if ($vals.length > 0) {
						for ($j = 0;$j < $vals.length;$j++) {
							if ($type == 'list') {
								oneval = $vals[$j].getAttribute('value');
							} else {
								oneval = $vals[$j].getAttribute('data-sort-value');
							}
							if (oneval != "*") newparents.push(oneval);
						}
					}
				}
			}
			parents = newparents;
		}
		childstr = $asel.getAttribute('data-filter-group');
		this.filters[childstr] = ['*'];
		sortValue = '';
	}
}
CGIsotope.prototype.del_family = function(me,$parent,child,sortValue,$type) {
	parents = [];
    while (child) {
		myparent = document.querySelector(me+'.filter-button-group-fields').parentNode;
		$asel = myparent.querySelector('[data-group-id="'+child+'"]');
		abutton = $asel.querySelector('[data-parent="'+sortValue+'"]')
		this.addClass(abutton,'iso_hide_elem')
		this.removeClass(abutton,'is-checked');
		abutton = $asel.querySelector('button.iso_button_tout');
		this.removeClass(abutton,'iso_hide_elem');
		this.addClass(abutton,'is-checked')
		child = $asel.getAttribute('data-child'); 
		if (parents.length == 0) {
			newparents = $asel.querySelectorAll('[data-parent="'+sortValue+'"]');
			parents=[];
			if (newparents.length > 0) {
				for ($i = 0;$i < newparents.length;$i++) {
					if ($type == 'list') {
						delval = newparents[$i].getAttribute('value');
					} else {
						delval = newparents[$i].getAttribute('data-sort-value');
					}
					if (delval != "*") {
						parents.push(delval);
						this.addClass(newparents[$i],'iso_hide_elem');
					}
				}
			}
		} else {
			newparents = [];
			for ($i=0; $i < parents.length; $i++) {
				sortValue = parents[$i];
				if (sortValue != '*') {
					$vals = $asel.querySelectorAll('[data-parent="'+sortValue+'"]');
					if ($vals.length > 0) {
						for ($j = 0;$j < $vals.length;$j++) {
							if ($type == 'list') {
								delval = $vals[$j].getAttribute('value');
							} else {
								delval = $vals[$j].getAttribute('data-sort-value');
							}
							if (delval != "*") { 
								newparents.push(delval);
								this.addClass($vals[$j],'iso_hide_elem');
							}
						}
					}
				}
			}
			parents = newparents;
		}
		childstr = $asel.getAttribute('data-filter-group');
		this.filters[childstr] = ['*'];
		sortValue = '';
	}
}
CGIsotope.prototype.set_family_all = function(me,child,$type) {
	parents = [];
	while(child) {
		if ($type == 'list') {
			$asel = document.querySelector(me+'.filter-button-group-fields');
		} else {
			$asel = document.querySelector(me+'.filter-button-group-fields').parentNode;
		}
		parents = $asel.querySelectorAll('[data-child="'+child+'"]');
		for (i = 0;i < parents.length;i++) {
			if (this.hasClass(parents[i],'iso_hide_elem')) continue; // ignore hidden elements
			if ($type == 'list') {
				setval = parents[i].getAttribute('value');
			} else {
				setval = parents[i].getAttribute('data-sort-value');
			}
			if (setval && (setval != "*")) {
				this.removeClass($asel.querySelector('[data-parent="'+setval+'"]'),'iso_hide_elem');
			}
		}
		if ($type == 'list') {
			allbuton = $asel.querySelector('[data-group-id="'+child+'"] [data-all="all"]')
			child = allbutton.getAttribute('data-child'); 
		} else {
			buttons = $asel.querySelectorAll('[data-group-id="'+child+'"] button')
			for (var i=0;i < buttons.length;i++) {
				this.removeClass(buttons[i],'is-checked'); 
			}
			this.addClass($asel.querySelector('[data-group-id="'+child+'"] button.iso_button_tout'),'is-checked'); 
			myparent = 
			$mychild = $asel.querySelector('[data-group-id="'+child+'"]');
			$mychild_all = $mychild.querySelector('button.iso_button_tout')
			child = $mychild_all.getAttribute('data-child'); 
		}
		childstr = $asel.getAttribute('data-filter-group');
		this.filters[childstr] = ['*'];
	}
}
// from https://code.tutsplus.com/tutorials/from-jquery-to-javascript-a-reference--net-23703
CGIsotope.prototype.hasClass = function (el, cl) {
    var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
    return !!el.className.match(regex);
}
CGIsotope.prototype.addClass = function (el, cl) {
    el.className += ' ' + cl;
},
CGIsotope.prototype.removeClass = function (el, cl) {
    var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
    el.className = el.className.replace(regex, ' ');
},
CGIsotope.prototype.toggleClass = function (el, cl) {
    $myiso.hasClass(el, cl) ? $myiso.removeClass(el, cl) : $myiso.addClass(el, cl);
};
// from https://gist.github.com/andjosh/6764939
CGIsotope.prototype.scrollTo = function(to, duration) {
    var element = document.scrollingElement || document.documentElement,
    start = element.scrollTop,
    change = to - start,
    startTs = performance.now(),
    // t = current time
    // b = start value
    // c = change in value
    // d = duration
    easeInOutQuad = function(t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    },
    animateScroll = function(ts) {
        var currentTime = ts - startTs;
        element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration));
        if(currentTime < duration) {
            requestAnimationFrame(animateScroll);
        }
        else {
            element.scrollTop = to;
        }
    };
    requestAnimationFrame(animateScroll);
}
CGIsotope.prototype.resetToggle = function () {
	if ($myiso.grid_toggle && $myiso.hasClass($myiso.grid_toggle,'isotope-hide')) {
		$myiso.removeClass($myiso.iso_article,'isotope-open');
		$myiso.addClass($myiso.iso_article,'isotope-hide');
		$myiso.removeClass($myiso.grid_toggle,'isotope-hide');
		$myiso.iso_div.refresh;
	} else if ($myiso.iso_article && $myiso.hasClass($myiso.iso_article,'isotope-open')) {
		$myiso.removeClass($myiso.iso_article,'isotope-open');
		$myiso.addClass($myiso.iso_article,'isotope-hide');
		$myiso.iso_article.innerHTML('');
		$myiso.iso_div.refresh;
	}
}

go_click = function($entree,$link) {
	event.preventDefault();
	if (($entree == "webLinks") || (window.event.ctrlKey) ) {
		 window.open($link,'_blank')
	} else {
		location=$link;
	}
}
