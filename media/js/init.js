/**
* Simple isotope module  - Joomla Module 
* Version			: 4.1.2
* Package			: Joomla 4.x.x
* copyright 		: Copyright (C) 2022 ConseilGouz. All rights reserved.
* license    		: http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/

/* note : diffrence entre module et composant

	displayfiltertags => displayfilter dans module
*/
var $close,grid_toggle,iso_article,iso,me,
	empty_message,items_limit, sav_limit,
	iso_height,iso_width,article_frame;
var resetToggle,options,myid;
var qsRegex,$asc,$sortby,filters;
var rangeSlider,range_init,range_sel,min_range,max_range;
var cookie_name;
var std_parents = ['cat','tags','lang','alpha'] // otherwise it's a custom field

document.addEventListener('DOMContentLoaded', function() {
mains = document.querySelectorAll('.isotope-main');
for(var i=0; i<mains.length; i++) {
	var $this = mains[i];
	myid = $this.getAttribute("data");
	if (typeof Joomla === 'undefined' || typeof Joomla.getOptions === 'undefined') {
		console.log('Simple Isotope : Joomla /Joomla.getOptions  undefined');
	} else {
		 options = Joomla.getOptions('mod_simple_isotope_'+myid);
	}
	/*if (typeof options === 'undefined' ) { // cache Joomla problem
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
	}*/
	if (typeof options === 'undefined' ) {return false}
    cookie_name = 'simple_isotope_'+myid;
	iso_cat_k2(myid,options);
}
grid_toggle = document.querySelector('.isotope_grid')
iso_article = document.querySelector('.isotope_an_article')
iso_div = document.querySelector('.isotope-main .isotope-div')
article_frame=document.querySelector('iframe#isotope_article_frame')
if ((options.readmore == 'ajax') || (options.readmore == 'iframe'))  {
	iso_height = grid_toggle.offsetHeight;
	iso_width = grid_toggle.offsetWidth;
	readmoretitles =  document.querySelectorAll('.isotope-readmore-title');
	for (var t=0;t < readmoretitles.length;t++ ) {
		['click', 'touchstart'].forEach(type => {
			readmoretitles[t].addEventListener(type,function(e) {	
				$pos = iso_div.offsetTop;
				document.querySelector("body").scrollTo($pos,1000)
				e.stopPropagation();
				e.preventDefault();		
				addClass(grid_toggle,'isotope-hide');
				addClass(iso_article,'isotope-open');
				removeClass(iso_article,'isotope-hide');
				iso_article.offsetHeight ='auto';
				addClass(iso_article,'article-loading');
				if (options.readmore == 'ajax') {
					document.querySelector("#isotope_an_article").innerHTML = '';
					var mytoken = document.getElementById("token");
					token = mytoken.getAttribute("name");
					/* en attente bug Joomla 4 : ajax module */
					url = '?option=com_ajax&module=simple_isotope&article='+ this.dataset['articleid']+'&entree=articles&data=readmore&format=json&id='+myid;
					Joomla.request({
						method : 'POST',
						url : url,
						onSuccess: function(data, xhr) {
							removeClass(iso_article,'article-loading');
							var result = JSON.parse(data);
							iso_article.style.height = iso_height;
							iso_article.style.width = iso_width+'px';
							if (!result.success) result.success = true; 
							displayArticle(result.data); 
						},
						onError: function(message) {console.log(message.responseText)}
					}) 
				} else if (options.readmore == 'iframe') {	
	/* iFrame */
					if (iso_height == 0) iso_height="100vh";
					article_frame.style.height = 0;
					article_frame.style.width = 0;
					achar = '?';
					if ( this.dataset['href'].indexOf('?') > 0 ) achar = '&';
					article_frame.setAttribute('src',this.dataset['href']+achar+'tmpl=component');
					addClass(iso_article,'article-loading');
					$close = document.querySelector('button.close');
					addClass($close,'isotope-hide');
					['click', 'touchstart'].forEach(type => {
							$close.addEventListener(type,function(e) {
									e.stopPropagation();
									e.preventDefault();		
									resetToggle();
							});
					})
				}
	// listen to exit event
				['click', 'touchstart'].forEach(type => {
					grid_toggle.addEventListener(type, function(e) {
							e.stopPropagation();
							e.preventDefault();		
							resetToggle();
							})
				})
			})
		});
	}
}
['click', 'touchstart'].forEach(type => {
	iso_div.addEventListener(type, function(e) {
		resetToggle();
	});
})

resetToggle = function () {
	if (grid_toggle && hasClass(grid_toggle,'isotope-hide')) {
		removeClass(iso_article,'isotope-open');
		addClass(iso_article,'isotope-hide');
		removeClass(grid_toggle,'isotope-hide');
		iso_div.refresh;
	} else if (iso_article && hasClass(iso_article,'isotope-open')) {
		removeClass(iso_article,'isotope-open');
		addClass(iso_article,'isotope-hide');
		iso_article.innerHTML('');
		iso_div.refresh;
	}
}
if (article_frame) {
	article_frame.addEventListener('load',function(){ // Joomla 4.0
		removeClass(iso_article,'article-loading');
		if ($close)	removeClass($close,'isotope-hide');
		article_frame.style.height= iso_height;
		article_frame.style.width =iso_width+'px';
		}); 
}
}) // end of ready --------------
function displayArticle(result) {
	var html ='';
	// Joomla 4.0 : replace result.data by result
    if (result.success) {
		for (var i=0; i<result.data.length; i++) {
            html += '<h1>'+result.data[i].title+'<button type="button" class="close">X</button></h1>';
			html +=result.data[i].fulltext;
			if (result.data[i].fulltext =="") html += result.data[i].introtext;
			if (result.data[i].scripts.length > 0) {
				for (var s=0; s < result.data[i].scripts.length ;s++) {
					var scriptElement = document.createElement( "script" );
					scriptElement.addEventListener(	"load",function() {
							console.log( "Successfully loaded scripts" );
						}
					);
 					scriptElement.src = result.data[i].scripts[s];
					document.head.appendChild( scriptElement );
				}
			}
			if (result.data[i].css.length > 0) {
				for (var s=0; s < result.data[i].css.length ;s++) {
					var link = document.createElement( "link" );
					link.type = "text/css";
					link.rel = "stylesheet";
					
					link.addEventListener(	"load",function() {
							console.log( "Successfully loaded css" );
						}
					);
 					link.href = result.data[i].css[s];
					document.head.appendChild( link );
				}
			}
        }
        iso_article.innerHTML = html;
		$close = document.querySelector('button.close');
		// addClass($close,'isotope-hide');
		['click', 'touchstart'].forEach(type => {
				$close.addEventListener(type,resetToggle)
		})							
		
	} else {
        html = result.message;
        if ((result.messages) && (result.messages.error)) {
            for (var j=0; j<result.messages.error.length; j++) {
                html += "<br/>" + result.messages.error[j];
            }
		}
	}
}
function iso_cat_k2 (myid,options) {
	var parent = 'cat';
	me = "#isotope-main-"+myid+" ";
	items_limit = options.limit_items;
	sav_limit = options.limit_items;
	empty_message = (options.empty == "true");
	filters = {};
	asc = (options.ascending == "true");
	sort_by = options.sortby;
	if (sort_by.indexOf("featured") !== -1) { // featured 
		sortValue = sort_by.split(',');
		asc = {};
		for (i=0;i < sortValue.length;i++) {
			if ( sortValue[i] == "featured"){  // featured always first
				asc[sortValue[i]] = false ;
			} else {
				asc[sortValue[i]] = (options.ascending == "true");
			}
		}
	}
	if (options.limit_items == 0) { // no limit : hide show more button
		document.querySelector(me+'.iso_button_more').style.display = "none";
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
    if (typeof sort_by === 'string') {
		sort_by = sort_by.split(',');
	}
	var grid = document.querySelector(me + '.isotope_grid');
	iso = new Isotope(grid,{ 
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
				blog: '[data-blog] parseInt',
				featured: '[data-featured] parseInt'
			},
			sortBy: sort_by,
			sortAscending: asc,
			isJQueryFiltering : false,
			filter: function(itemElem ){ if (itemElem) return grid_filter(itemElem)	}				
	}); // end of Isotope definition
	imagesLoaded(grid, function() {
		iso.options.itemSelector ='.isotope_item';
		var $items = Array.prototype.slice.call(iso.element.querySelectorAll('.isotope_item'));
		iso.appended($items );
		updateFilterCounts();
		if (sort_by == "random") {
			iso.shuffle();
		}
		if (typeof $toogle !== 'undefined') {
			iso_width = grid_toggle.width();
			iso_height = grid_toggle.height();
		}
	});
	iso_div = document.querySelector(me + '.isotope-div');
	iso_div.addEventListener("refresh", function(){
 	  iso.arrange();
	});
    if (options.pagination == 'infinite') { 
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
			return '?start='+(currentpage+1)*options.page_count;
		}
		let more = document.querySelector(me+'.iso_button_more');		
		if (options.infinite_btn == "true") {
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
			infinite_buttons(items);
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
		if ( (filters['cat'][0] != '*') || (filters['tags'][0] != '*') ) { // default value set for tags or categories ?
			grouptype = ['cat','tags']
			optionstype = [options.displayfiltercat,options.displayfilter]
			for (var g = 0; g < grouptype.length;g++) {
				if (filters[grouptype[g]][0] == "*") continue; // ignore 'all' value
				clone_exist = document.querySelector(me+'#clonedbuttons button[data-sort-value="'+filters[grouptype[g]]+'"]');
				if (!clone_exist) {
					agroup = document.querySelectorAll(me+'.filter-button-group-'+grouptype[g]+' button'); 
					for (var i=0; i< agroup.length;i++) {
						if (agroup[i].getAttribute('data-sort-value') == filters[grouptype[g]]) {
							create_clone_button(grouptype[g],filters[grouptype[g]],agroup[i].textContent,optionstype[g],'');
							create_clone_listener(filters[grouptype[g]]);
						}
					}
				}
			}
		}
	}
	var sortbybutton = document.querySelectorAll(me+'.sort-by-button-group button');
	for (var i=0; i< sortbybutton.length;i++) {
		['click', 'touchstart'].forEach(type => {
			sortbybutton[i].addEventListener(type,function(e) {
				e.stopPropagation();
				e.preventDefault();		
				update_sort_buttons(this);
				for (var j=0; j< sortbybutton.length;j++) {
					sortbybutton[j].classList.remove('is-checked');
				}
				this.classList.add('is-checked');
			});
		})
	}
// use value of search field to filter
	var quicksearch = document.querySelector(me+'.quicksearch');
	if (quicksearch) {
		quicksearch.addEventListener('keyup',debounce( function() {
			qsRegex = new RegExp( quicksearch.value, 'gi' );
			CG_Cookie_Set(myid,'search',quicksearch.value);
			iso.arrange();
			updateFilterCounts();
		}));
	}
//  clear search button + reset filter buttons
    var cancelsquarred = document.querySelectorAll(me+'.ison-cancel-squared');
	for (var cl=0; cl< cancelsquarred.length;cl++) {
	['click', 'touchstart'].forEach(type => {
		cancelsquarred[cl].addEventListener( type, function(e) {
			e.stopPropagation();
			e.preventDefault();	
			if (quicksearch) {
				quicksearch.value = "";
			}
			qsRegex = new RegExp( "", 'gi' );
			CG_Cookie_Set(myid,'search',"");
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
			grouptype = ['cat','tags','alpha','fields']
			for (var g = 0; g < grouptype.length;g++) {
				agroup = document.querySelectorAll(me+'.filter-button-group-'+grouptype[g]+' button'); 
				for (var i=0; i< agroup.length;i++) {
					agroup[i].classList.remove('is-checked');
					if (agroup[i].getAttribute('data-sort-value') == "*") addClass(agroup[i],'is-checked');
					if (agroup[i].getAttribute('data-all') == "all") agroup[i].setAttribute('selected',true);
					if (grouptype[g] == 'fields') {
						removeClass(agroup[i],'iso_hide_elem');
						myparent = agroup[i].parentNode.getAttribute('data-filter-group');
						if (myparent) filters[myparent] = ['*'];
					}
				}
			}
			agroup = document.querySelectorAll(me+'.iso_lang button');
			for (var i=0; i< agroup.length;i++) {
				agroup[i].classList.remove('is-checked');
				if (agroup[i].getAttribute('data-sort-value') == "*") addClass(agroup[i],'is-checked');
				if (agroup[i].getAttribute('data-all') == "all") agroup[i].setAttribute('selected',true);
			}
			agroup= document.querySelectorAll(me+'select[id^="isotope-select-"]');
			for (var i=0; i< agroup.length;i++) {
				var myval = agroup[i].parentElement.parentElement.parentElement.getAttribute('data-filter-group');
				var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+myval);
				var choicesInstance = elChoice.choicesInstance;
				choicesInstance.removeActiveItems();
				choicesInstance.setChoiceByValue('')
				filters[myval] = ['*']
			};
			$buttons = document.querySelectorAll('#clonedbuttons .is-checked');
			for (var i=0; i< $buttons.length;i++) { // remove buttons
				$buttons[i].remove(); 
			}
			update_cookie_filter(filters);
			iso.arrange();
			updateFilterCounts();
			if (quicksearch) {
				quicksearch.focus();
			}
		});
	})
	}
	if  (options.displayfilter == "listmulti") 	{ 
		events_listmulti('tags');
	}
	if (options.displayfiltercat == "listmulti") {
		events_listmulti('cat');
	}
	if  (options.displayfilterfields == "listmulti")	{ 
		events_listmulti('fields');
	}
	if  ((options.displayfiltercat == "list") || (options.displayfiltercat == "listex")) { 
		events_list('cat');
	} 
	if  ((options.displayfilter == "list") || (options.displayfilter == "listex")) { 
		events_list('tags');
	} 
	if  ((options.displayfilterfields == "list") || (options.displayfilterfields == "listex")) { 
		events_list('fields');
	} 
	if ((options.displayfiltercat == "multi") || (options.displayfiltercat == "multiex")  ) {
		events_multibutton('cat')
	}
	if ((options.displayfilter == "multi") || (options.displayfilter == "multiex")  ) {
		events_multibutton('tags')
	}
	if ((options.displayfilterfields == "multi") || (options.displayfilterfields == "multiex")) { 
		events_multibutton('fields');
	}
	if (options.language_filter == "multi") { 
		events_multibutton('lang')	}
	if (options.displayalpha == "multi") { 
		events_multibutton('alpha')
	}
	if (options.displayfiltercat == "button"){
		events_button('cat');
	}
	if (options.displayfilter == "button") { 
		events_button('tags');
	}
	if (options.displayfilterfields == "button") { 
		events_button('fields');
	}
	if (options.language_filter == "button") { 
		events_button('lang');
	}
	if (options.displayalpha == "button") { 
		events_button('alpha');
	}
	more = document.querySelector(me+'.iso_button_more');
	if (more) {
		['click', 'touchstart'].forEach(type => {
			more.addEventListener(type, function(e) {
				e.stopPropagation();
				e.preventDefault();		
				if (items_limit > 0) {
					items_limit = 0; // no limit
					this.textContent = options.libless;
				} else {
					items_limit = options.limit_items; // set limit
					this.textContent = options.libmore;
				}
				updateFilterCounts();
			});
		})
	}
	//-------------------- offcanvas : update isotope width
	var myOffcanvas = document.getElementById('offcanvas_isotope');
	if (myOffcanvas) {
		myOffcanvas.addEventListener('hidden.bs.offcanvas', function () {
			document.getElementById('offcanvas_isotope').classList.remove('offcanvas25');
			document.getElementsByClassName('isotope_grid')[0].classList.remove('isogrid75');
			document.getElementsByClassName('isotope_grid')[0].classList.remove('offstart');
			document.getElementsByClassName('isotope_grid')[0].classList.remove('offend');
			iso.arrange();
		})
		myOffcanvas.addEventListener('show.bs.offcanvas', function () {
			document.getElementById('offcanvas_isotope').classList.add('offcanvas25');
			if (document.getElementById('offcanvas_isotope').classList.contains("offcanvas-start")) 
				document.getElementsByClassName('isotope_grid')[0].classList.add('offstart');
			if (document.getElementById('offcanvas_isotope').classList.contains("offcanvas-end")) 
				document.getElementsByClassName('isotope_grid')[0].classList.add('offend');
			iso.arrange();
		})
	}
}// end of iso_cat_k2
function rangeUpdated(){
	range_sel = rangeSlider.getValue();
	range_init = rangeSlider.conf.values[0]+','+rangeSlider.conf.values[rangeSlider.conf.values.length - 1];
	CG_Cookie_Set(myid,'range',range_sel);
	iso.arrange();
}
// create listmulti eventListeners
function events_listmulti(component) {
	agroup= document.querySelectorAll(me+'select[id^="isotope-select-'+component+'"]');
	for (var i=0; i< agroup.length;i++) {
		agroup[i].addEventListener('choice',function(evt, params) {
			filter_list_multi(this,evt,'choice');
		});
		agroup[i].addEventListener('removeItem',function(evt, params) {
			filter_list_multi(this,evt,'remove');
		});
		$parent = agroup[i].parentElement.parentElement.parentElement.getAttribute('data-filter-group');
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = ['*'];
		}			
	};	
	if ((filters[$parent][0] != '*') && (filters[$parent].length == 1)) {
		var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+component);
		var choicesInstance = elChoice.choicesInstance;
		var savefilter = filters[$parent][0];
		choicesInstance.removeActiveItemsByValue(''); // remove all 
		choicesInstance.setChoiceByValue(savefilter);
		if (elChoice.parentElement.parentElement.className == "offcanvas-body") { // need clone
			clone_exist = document.querySelector(me+'#clonedbuttons button[data-sort-value="'+filters[component]+'"]');
			if (!clone_exist) { // create default button
				sel = savefilter;
				lib = choicesInstance.getValue()[0].label;
				child = null;
				create_clone_button(component,sel,lib,'list',child);
				create_clone_listener(sel);
			}
		}
	}	
}
// create list eventListeners
function events_list(component) {
	agroup= document.querySelectorAll(me+'.filter-button-group-'+component);
	for (var i=0; i< agroup.length;i++) {
		agroup[i].addEventListener('choice',function(evt, params) {
			filter_list(this,evt,'choice')
			});
		agroup[i].addEventListener('removeItem',function(evt, params) {
			filter_list(this,evt,'remove');
		});
			
	};
	var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+component);
	if (!elChoice) return;
	var choicesInstance = elChoice.choicesInstance;
	choicesInstance.setChoiceByValue(filters[component]);
	if ((elChoice.parentElement.parentElement.className == "offcanvas-body") && (filters[component] != '*')) { // need clone
		clone_exist = document.querySelector(me+'#clonedbuttons button[data-sort-value="'+filters[component]+'"]');
		if (!clone_exist) { // create default button
			sel = filters[component];
			lib = choicesInstance.getValue().label;
			child = null;
			create_clone_button(component,sel,lib,'list',child);
			create_clone_listener(sel);
		}
	}	
}
// create buttons eventListeners
function events_button(component) {
	if (component == "lang")
		agroup= document.querySelectorAll(me+'.iso_lang button')
	else 
		agroup= document.querySelectorAll(me+'.filter-button-group-'+component+' button');
	for (var i=0; i< agroup.length;i++) {
		['click', 'touchstart'].forEach(type => {
			agroup[i].addEventListener(type,function(evt) {
				evt.stopPropagation();
				evt.preventDefault();		
				filter_button(this,evt)
			// reset other buttons
				mygroup= this.parentNode.querySelectorAll('button' );
				for (var g=0; g< mygroup.length;g++) {
					removeClass(mygroup[g],'is-checked');
				}
				addClass(this,'is-checked');
			});
		})
	};
}
// create multiselect buttons eventListeners
function events_multibutton(component) {
	if (component == "lang")
		agroup= document.querySelectorAll(me+'.iso_lang button')
	else 
		agroup= document.querySelectorAll(me+'.filter-button-group-'+component+' button');
	for (var i=0; i< agroup.length;i++) {
		['click', 'touchstart'].forEach(type =>{
			agroup[i].addEventListener(type,function(evt) {
			evt.stopPropagation();
			evt.preventDefault();		
			filter_multi(this,evt);
			set_buttons_multi(this);
			})
		})
	};
}	
function update_sort_buttons($this) {
	var sortValue = $this.getAttribute('data-sort-value');
	if (sortValue == "random") {
		CG_Cookie_Set(myid,'sort',sortValue+'-');
		iso.shuffle();
		return;
	} 
	sens = $this.getAttribute('data-sens');
	sortValue = sortValue.split(',');
	if (!hasClass($this,'is-checked')) { // first time sorting
		sens = $this.getAttribute('data-init');
		$this.setAttribute("data-sens",sens);
		asc=true;
		if (sens== "-") asc = false;
	} else { // invert order
		if (sens == "-") {
			$this.setAttribute("data-sens","+");
			asc = true;
		} else {
			$this.setAttribute("data-sens","-");
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
	CG_Cookie_Set(myid,'sort',sortValue+'-'+asc);
	iso.options.sortBy = sortValue;
	iso.options.sortAscending = sortAsc;
	iso.arrange();
}
/*------- infinite scroll : update buttons list------------*/
function infinite_buttons(appended_list) {
	if (options.displayalpha != 'false') {
	// alpha buttons list
		for (x=0;x < appended_list.length-1;x++) {
			alpha = appended_list[x].attributes['data-alpha'].value;
			mybutton= document.querySelector(me+'.filter-button-group-alpha .iso_button_alpha_'+alpha);
			if (!mybutton) {
				buttons = document.querySelector(me+'.filter-button-group-alpha');
				var abutton = document.createElement('button');
				abutton.classList.add('btn');
				abutton.classList.add(options.button_bootstrap.substr(4,100).trim());
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
function grid_filter($this) {
	var searchResult = qsRegex ? $this.textContent.match( qsRegex ) : true;
	var	lacat = $this.getAttribute('data-category');
	var laclasse = $this.getAttribute('class');
	var lescles = laclasse.split(" ");
	var buttonResult = false;
	var rangeResult = true;
	var searchAlpha = true;
	if (filters['alpha'].indexOf('*') == -1) {// alpha filter
		alpha = $this.getAttribute('data-title').substring(0,1);
		if (filters['alpha'].indexOf(alpha) == -1) return false;
	}
	if (filters['lang'].indexOf('*') == -1) { 
		lalang = $this.getAttribute('data-lang') ;
		if (filters['lang'].indexOf(lalang) == -1)  {
			return false;
		}
	}
	if 	(rangeSlider) {
		var lerange = $this.getAttribute('data-range');
		if (range_sel != range_init) {
			ranges = range_sel.split(",");
			rangeResult = (parseInt(lerange) >= parseInt(ranges[0])) && (parseInt(lerange) <= parseInt(ranges[1]));
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
			return searchResult && rangeResult && true;
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
			return searchResult && rangeResult && buttonResult;
		}
	} else { // fields
		ix = 0;
		if (typeof filters === 'undefined' ) { // aucun filtre: on passe
			return searchResult && rangeResult && true;
		}
		// combien de filtres diff. tout ?
		filterslength = 0;
		for (x in filters) {
			if ( (x == 'cat') || (x == 'lang') || (x == 'alpha') || (x == 'tags') ) continue; 
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
		if ( (ix == filterslength) && catok && tagok) return searchResult && rangeResult && true;
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
			return searchResult && rangeResult && (count == lgth) && tagok;
		} else  {
			return searchResult && rangeResult && (count >= (filterslength -ix)) && catok && tagok;
		}
	}
} 
// ---- Filter List 
function filter_list($this,evt,params) {
	$parent = $this.getAttribute('data-filter-group');
	$isclone = false;
	if ($this.parentNode.id == "clonedbuttons") { // clone 
		$selectid = $parent;
		$isclone = true;
		sortValue =  '';
	} else {
		$selectid = $this.getAttribute('data-filter-group');
		sortValue = $this.querySelector(".is-highlighted");
		sortValue = sortValue.dataset.value;
	}
	if (typeof sortValue === 'undefined') sortValue = ""
	elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+$selectid);
	choicesInstance = elChoice.choicesInstance;
	$needclone = false;
	$grdparent = $this.parentNode;
	if ($grdparent.className == "offcanvas-body") {
		$needclone = true;
	}
	if (params == 'remove' && $needclone) { // remove item from offcanvas => remove button
		removeFilter( filters, $parent, evt.detail.value );
		myclone = document.querySelector('#clonedbuttons button[data-sort-value="'+evt.detail.value+'"]')
		if (myclone) myclone.remove();
		if (filters[$parent].length == 0) {
			filters[$parent] = ['*'] ;
			choicesInstance.setChoiceByValue('')
			update_cookie_filter(filters);
		}	
		return;
	}
	if (sortValue == '')   {
		choicesInstance.removeActiveItems();
		choicesInstance.setChoiceByValue('')		
		filters[$parent] = ['*'];
		$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
		for (var i=0; i< $buttons.length;i++) { // remove buttons
			$buttons[i].remove(); 
		}
	} else { 
		filters[$parent] = [sortValue];
		if ($needclone) { // clone
			$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
			for (var i=0; i< $buttons.length;i++) { // remove buttons
				$buttons[i].remove(); 
			}
			clone_exist = document.querySelector(me+'#clonedbuttons button[data-sort-value="'+filters[$parent]+'"]');
			if (!clone_exist) {
				lib = evt.detail.choice.label;
				create_clone_button($parent,sortValue,lib,'list','');
				create_clone_listener(sortValue);
			}
		}
	}
	update_cookie_filter(filters);
	iso.arrange(); 
	updateFilterCounts();
}
	// ----- Filter MultiSelect List
	function filter_list_multi($this,evt,params) {
		$evnt = evt;
		$params = params;
		$isclone = false;
		if ($this.parentNode.id == "clonedbuttons") { // clone 
			$parent = $this.getAttribute('data-filter-group');
			$selectid = "isotope-select-"+$parent;
			$isclone = true;
		} else {
			$parent = $this.parentNode.parentNode.parentNode.getAttribute('data-filter-group')
			$selectid = $this.getAttribute('id');
		}
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = [];
		}
		var elChoice = document.querySelector('joomla-field-fancy-select#'+$selectid);
		var choicesInstance = elChoice.choicesInstance;
		
		if ($params == "remove") { // deselect element except all
			if ($isclone) {
				removeFilter( filters, $parent, $this.getAttribute('data-sort-value') );
				savfilter = JSON.parse(JSON.stringify(filters));
				choicesInstance.removeActiveItems();
				filters = JSON.parse(JSON.stringify(savfilter));
				choicesInstance.removeActiveItemsByValue('');
				for (var i = 0; i < filters[$parent].length; i++) {
					remval = filters[$parent][i];
					choicesInstance.setChoiceByValue(remval);
				}
			} else {
				removeFilter( filters, $parent, $evnt.detail.value );
				myclone = document.querySelector('#clonedbuttons button[data-sort-value="'+$evnt.detail.value+'"]')
				if (myclone) myclone.remove();
			}
			if (filters[$parent].length == 0) {
				filters[$parent] = ['*'] ;
				choicesInstance.setChoiceByValue('')
			}
		}
		$needclone = false;
		$grdparent = $this.parentNode.parentNode.parentNode.parentNode.parentNode;
		if ($grdparent.classList[0] == "offcanvas-body") {
			$needclone = true;
		}
		if ($params == "choice") {
			sel = $evnt.detail.choice.value;
			lib = $evnt.detail.choice.label;
			if (sel == '') {// all
				filters[$parent] = ['*'];
				choicesInstance.removeActiveItems();
				choicesInstance.setChoiceByValue('');
				$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
				for (var i=0; i< $buttons.length;i++) { // remove buttons
					$buttons[i].remove(); 
				}
			} else {
				if (filters[$parent].indexOf('*') != -1) { // was all
					choicesInstance.removeActiveItemsByValue('')
					filters[$parent] = []; // remove it
				}
				if ($needclone) {
					clone_exist = document.querySelector(me+'#clonedbuttons button[data-sort-value="'+filters[$parent]+'"]');
					if (!clone_exist) {
						create_clone_button($parent,sel,lib,'list_multi','');
						create_clone_listener(sel);
					}
				}
				addFilter( filters, $parent, sel );
			}
			choicesInstance.hideDropdown();
		}
		update_cookie_filter(filters);
		iso.arrange(); 
		updateFilterCounts();
	}
     
	function filter_button($this,evt) {
		if (hasClass($this,'disabled')) return; //ignore disabled buttons
		$parent = $this.parentNode.getAttribute('data-filter-group');
		child =  $this.getAttribute('data-child'); // child group number
		var sortValue = $this.getAttribute('data-sort-value');
		$isclone = false;
		if ($this.parentNode.id == "clonedbuttons") { // clone 
			$parent = $this.getAttribute('data-filter-group');
			abutton = document.querySelector('.isotope_button-group .iso_button_'+$parent+'_'+sortValue);
			toggleClass(abutton,'is-checked');
			sortValue = '*';
			if (std_parents.indexOf($parent) != -1) {
				abutton = document.querySelector('.iso_button_'+$parent+'_tout');
			} else {// custom field
				abutton = document.querySelector('.iso_button_tout.filter-button-group-'+$parent);
			}
			toggleClass(abutton,'is-checked'); // all button
			$isclone = true;
		} 		
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = {};
		}
		$needclone = false;
		$grdparent = $this.parentNode.parentNode;
		if (hasClass($grdparent,"offcanvas-body")) {
			$needclone = true;
		}
		if ($needclone) {
			if (hasClass($this,'is-checked')) {return} // already cloned
			$buttons = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
			for (var i=0; i< $buttons.length;i++) { // remove buttons
					$buttons[i].remove(); 
			}
			if (sortValue != '*') { // don't clone all button
				if (evt.srcElement.localName == "img")
					lib = evt.srcElement.outerHTML+evt.srcElement.nextSibling.textContent;
				else lib = evt.srcElement.innerHTML;
				create_clone_button($parent,sortValue,lib,'button',child);
				create_clone_listener(sortValue);
			}
		}
		if (sortValue == '*') {
			filters[$parent] = ['*'];
			if ($isclone) {
				$this.remove;
			}
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
		iso.arrange(); 
		updateFilterCounts();
	}
	function filter_multi($this,evt) {
		var sortValue = $this.getAttribute('data-sort-value');
		child =  $this.getAttribute('data-child'); // child group number
		$isclone = false;
		if ($this.parentNode.id == "clonedbuttons") { // clone 
			$parent = $this.getAttribute('data-filter-group');
			$buttons = document.querySelectorAll('.iso_button_'+$parent+'_'+sortValue);
			for (var i=0; i< $buttons.length;i++) { 
					toggleClass($buttons[i],'is-checked');
			}
			$isclone = true;
		} else {
			$parent = $this.parentNode.getAttribute('data-filter-group');
			toggleClass($this,'is-checked');
		}
		var isChecked = hasClass($this,'is-checked');
		// clone offcanvas button
		$needclone = false;
		$grdparent = $this.parentNode.parentNode;
		if (hasClass($grdparent,"offcanvas-body")) {
			$needclone = true;
		}
		if ($needclone) {
			if ((isChecked) && (sortValue != "*")) { // clone button
				if (evt.srcElement.localName == "img")
					lib = evt.srcElement.outerHTML+evt.srcElement.nextSibling.textContent;
				else lib = evt.srcElement.innerHTML;
				create_clone_button($parent,sortValue,lib,'multi',child);
				create_clone_listener(sortValue);
			} else { // remove cloned button
				if (sortValue != "*") {
					aclone = document.querySelector('#clonedbuttons .iso_button_'+$parent+'_'+sortValue)
					aclone.remove();
				}
			}
		}
		// end of cloning
		if (typeof filters[$parent] === 'undefined' ) { 
			filters[$parent] = [];
		}
		if (sortValue == '*') {
			filters[$parent] = ['*'];
			clones = document.querySelectorAll('#clonedbuttons [data-filter-group="'+$parent+'"]');
			for (var i=0; i< clones.length;i++) { 
				clones[i].remove(); // remove other cloned buttons
			}
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
				if (filters[$parent].length == 0) {// no more selection
					filters[$parent] = ['*'];
					if ($isclone) {
						aclone = document.querySelector('.filter-button-group-'+$parent+' [data-sort-value="*"]');
						addClass(aclone,'is-checked');
					}
				}
				if (child) {
					if (filters[$parent] == ['*']) {// no more selection
						set_family_all(me,child,'button')
					} else { // remove current selection
						del_family(me,$parent,child,sortValue,'button')
					}
				}
			}	
		}
		update_cookie_filter(filters);
		iso.arrange(); 
		updateFilterCounts();
	}
	function set_buttons_multi($this) {
		$parent = $this.parentNode.getAttribute('data-filter-group');
		if ($this.getAttribute('data-sort-value') == '*') { // on a cliqué sur tout => on remet le reste à blanc
			buttons = $this.parentNode.querySelectorAll('button.is-checked');
			for (var i=0; i< buttons.length;i++) { 
					removeClass(buttons[i],'is-checked');
			}
			addClass($this,'is-checked');
		} else { // on a cliqué sur un autre bouton : uncheck le bouton tout
			if ((filters[$parent].length == 0) || (filters[$parent] == '*')) {// plus rien de sélectionné : on remet tout actif
				button_all = $this.parentNode.querySelector('[data-sort-value="*"]');
				addClass(button_all,'is-checked');
				filters[$parent] = ['*'];
				update_cookie_filter(filters);
				iso.arrange();
			}
			else {
				button_all = $this.parentNode.querySelector('[data-sort-value="*"]');
				removeClass(button_all,'is-checked');
			}
		}
	}
	//
	// check items limit and hide unnecessary items
	function updateFilterCounts() {
		var items = document.querySelectorAll(me + '.isotope_item');
		var more = document.querySelector(me+'.iso_button_more')
		var itemElems = iso.getFilteredItemElements();
		var count_items = itemElems.length;
		var divempty = document.querySelector(me + '.iso_div_empty')
		for (var i=0;i < items.length;i++) {
			if (hasClass(items[i],'iso_hide_elem')) {
				removeClass(items[i],'iso_hide_elem');
			}
		}
		if (empty_message) { // display "empty message" or not
			if (count_items == 0) {
				removeClass(divempty,'iso_hide_elem')
			} else {
				if (!hasClass(divempty,'iso_hide_elem')) {
					addClass(divempty,'iso_hide_elem')
				}
			}
		}
		if (items_limit > 0)  { 
			for(var index=0;index < itemElems.length;index++) {
				if (index >= items_limit) {
					addClass(items[index],'iso_hide_elem');
				}
			};
			if (index < items_limit && options.pagination != 'infinite') { // unnecessary button
				addClass(more,'iso_hide_elem');
			} else { // show more button required
				removeClass(more,'iso_hide_elem');
			}
		} 
		// hide show see less button
		if ((items_limit == 0) && (sav_limit > 0) && options.pagination != 'infinite') { 
			for(var index=0;index < itemElems.length;index++) {
				if (hasClass(itemElems[index],'iso_hide_elem')) {
					count_items -=1;
				}
			};
			if (count_items > sav_limit) {
				removeClass(more,'iso_hide_elem');
			} else {
				addClass(more,'iso_hide_elem');
			}
		}
		iso.arrange();
	}
// -- Create a clone button
function create_clone_button($parent,$sel,$lib,$type,child) {
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
function create_clone_listener($sel) {
	onebutton =  document.querySelector('#clonedbuttons [data-sort-value="'+$sel+'"] ');
	['click', 'touchstart'].forEach(type => {
		onebutton.addEventListener(type,function(evt) {
			evt.stopPropagation();
			evt.preventDefault();		
			if (this.getAttribute('data-clone-type') == "multi")	filter_multi(this);
			if (this.getAttribute('data-clone-type') == "button") filter_button(this);
			if (this.getAttribute('data-clone-type') == "list_multi") filter_list_multi(this,evt,'remove');
			if (this.getAttribute('data-clone-type') == "list") filter_list(this,evt);
			this.remove();
		})
	})
}
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
	if (!$parent) return;
	if ( filters[$parent].indexOf( filter ) == -1 ) {
		filters[$parent].push( filter );
	}
}
function removeFilter( filters, $parent, filter ) {
	if (!Array.isArray(filters[$parent])) filters[$parent] = ['*']; // lost : assume all
	var index = filters[$parent].indexOf( filter);
	if ( index != -1 ) {
		filters[$parent].splice( index, 1 );
	}
}	
function update_cookie_filter(filters) {
	$filter_cookie = "";
	for (x in filters) {
		if (x == "null") continue;
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
	// check if quicksearch still exists (may be removed during testing)
	quicksearch = document.querySelector(me+'.quicksearch');
	if (item.indexOf('search:') >= 0 &&  quicksearch ) {
		val = item.split(':');
		qsRegex = new RegExp( val[1], 'gi' );
		quicksearch.value = val[1];
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
		sortButtons = document.querySelectorAll(me+'.sort-by-button-group button');
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
				if (std_parents.indexOf(values[0]) != -1) { // not a custom field
					if ( (values[0] == "tags" && options.displayfilter == 'listmulti') || (values[0] == "cat" && options.displayfiltercat == 'listmulti')) { // liste multi select	
						var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
						var choicesInstance = elChoice.choicesInstance;
						filters[values[0]] = values[1].split(',');
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
									create_clone_button(values[0],sel,lib,'list_multi',child);
									create_clone_listener(sel);
								}
							}
						}
					} else {
						if (values[1] != '*') { // !tout
							filters[values[0]] = values[1].split(',');
							if (values[0] == 'lang') {
								filterButtons = document.querySelectorAll(me+'.iso_lang button.is-checked');
							} else {
								filterButtons = document.querySelectorAll(me+'.filter-button-group-'+values[0]+' button.is-checked')
							}
							for(f=0;f < filterButtons.length;f++) {
								filterButtons[f].classList.remove('is-checked');
							}
							for(v=0;v < filters[values[0]].length;v++) {
								if ( ((values[0] == "tags") && (options.displayfilter == 'list') ) ||
									((values[0] == "cat") && (options.displayfiltercat == 'list')) ) {
									var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
									var choicesInstance = elChoice.choicesInstance;
									choicesInstance.setChoiceByValue(filters[values[0]][v]);
									if (elChoice.parentElement.parentElement.className == "offcanvas-body")  { // need clone
										var choicesInstance = elChoice.choicesInstance;
										sel = filters[values[0]][v];
										lib = choicesInstance.getValue().label;
										child = null;
										create_clone_button(values[0],sel,lib,'list',child);
										create_clone_listener(sel);
									}
								} else {
									$button =  document.querySelector( me+'.iso_button_'+values[0]+'_'+ filters[values[0]][v]);
									addClass($button,'is-checked');
									if (hasClass($button.parentNode.parentNode,"offcanvas-body"))  { // need clone
										$type ='button'; // assume button
										if ((values[0] == "cat" && (options.displayfiltercat == "multi" || options.displayfiltercat == "multiex")) ||
										    (values[0] == "tags" && (options.displayfilter == "multi" || options.displayfiltercat == "multiex")) || 
											(values[0] == "alpha" && (options.displayalpha == "multi" || options.displayalpha == "multiex")) ) {
												$type = 'multi';
										}
										child = null;
										lib = $button.innerHTML;
										create_clone_button(values[0],filters[values[0]][v],lib,$type,child);
										create_clone_listener(filters[values[0]][v]);
									}
								}
							};
						}
					}
				} else { //fields
					if (options.displayfilterfields == 'listmulti') { // liste multi select		
						var elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
						var choicesInstance = elChoice.choicesInstance;
						filters[values[0]] = values[1].split(',');
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
						alist = document.querySelectorAll(me+'.class_fields_'+values[0]+' .is-checked');
						for(l=0;l < alist.length;l++) {
								alist[l].classList.remove('is-checked');
						}
						filters[values[0]] = values[1].split(',');
						for(v=0;v < filters[values[0]].length;v++) {
							if ((options.displayfilterfields == 'list') ||(options.displayfilterfields == 'listex')) {
								elChoice = document.querySelector('joomla-field-fancy-select#isotope-select-'+values[0]);
								choicesInstance = elChoice.choicesInstance;
								filters[values[0]] = values[1].split(',');
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
								$this = document.querySelector( me+'.iso_button_'+values[0]+'_'+ filters[values[0]][v]);
								addClass($this,'is-checked');		
								child =  $this.getAttribute('data-child'); // child group number
								if (child) {
									sortValue = $this.getAttribute('data-sort-value');
									set_family(me,'',child,sortValue,'button')
								}
								if (hasClass($this.parentNode.parentNode.parentNode,"offcanvas-body"))  { // need clone
									$type ='button'; 
									lib = $this.innerHTML;
									create_clone_button(values[0],filters[values[0]][v],lib,$type,child);
									create_clone_listener(filters[values[0]][v]);
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
			min_range =parseInt(spl[0]);
			max_range =parseInt(spl[1]);
		}
	}
}
function set_family(me,$parent,child,sortValue,$type) {
	parents = [];
    while (child) {
		if ($type == 'list') { // todo : not tested
			$this = document.querySelector(me+'.filter-button-group-fields [data-group-id="'+child+'"]');
			listoptions = $this.querySelectorAll('option');
			for (var i=0;i < listoptions.length;i++) {
				if (!hasClass(listoptions[i],'iso_hide_elem')) addClass(listoptions[i],'iso_hide_elem'); // hide all options
			}
			// show all 
			$all = $this.querySelector('[data-all="all"]');
			removeClass($all,'iso_hide_elem')
			$all.setAttribute('selected',true)
			child = $all.getAttribute('data-child'); 
		} else { // button
			$myparent = document.querySelector(me+'.filter-button-group-fields').parentNode;
			$this = $myparent.querySelector('[data-group-id="'+child+'"]');
			if (($parent == "") || (($parent != "") && (filters[$parent].length == 1) && (filters[$parent] != '*'))) { // multi-select
				buttons = $this.querySelectorAll('button');
				for (var i=0;i< buttons.length;i++) {
					if (!hasClass(buttons[i],'iso_hide_elem'))	addClass(buttons[i],'iso_hide_elem')
					removeClass(buttons[i],'is-checked'); // hide all buttons
				}
			} 
			abutton = $this.querySelector('button.iso_button_tout')
			removeClass(abutton,'iso_hide_elem');
			addClass(abutton,'is-checked'); 
			child = abutton.getAttribute('data-child');
		}
		if (parents.length == 0) {
			buttons = $this.querySelectorAll('[data-parent="'+sortValue+'"]');
			for(var i = 0;i < buttons.length;i++) {
				removeClass(buttons[i],'iso_hide_elem');
			}
			newparents = $this.querySelectorAll('[data-parent="'+sortValue+'"]');
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
					buttons = $this.querySelectorAll('[data-parent="'+sortValue+'"]');
					for(var i = 0;i < buttons.length;i++) {
						removeClass(buttons[i],'iso_hide_elem');
					}
					$vals = $this.querySelectorAll('[data-parent="'+sortValue+'"]');
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
		childstr = $this.getAttribute('data-filter-group');
		filters[childstr] = ['*'];
		sortValue = '';
	}
}
function del_family(me,$parent,child,sortValue,$type) {
	parents = [];
    while (child) {
		myparent = document.querySelector(me+'.filter-button-group-fields').parentNode;
		$this = myparent.querySelector('[data-group-id="'+child+'"]');
		abutton = $this.querySelector('[data-parent="'+sortValue+'"]')
		addClass(abutton,'iso_hide_elem')
		removeClass(abutton,'is-checked');
		abutton = $this.querySelector('button.iso_button_tout');
		removeClass(abutton,'iso_hide_elem');
		addClass(abutton,'is-checked')
		child = $this.getAttribute('data-child'); 
		if (parents.length == 0) {
			newparents = $this.querySelectorAll('[data-parent="'+sortValue+'"]');
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
						addClass(newparents[$i],'iso_hide_elem');
					}
				}
			}
		} else {
			newparents = [];
			for ($i=0; $i < parents.length; $i++) {
				sortValue = parents[$i];
				if (sortValue != '*') {
					$vals = $this.querySelectorAll('[data-parent="'+sortValue+'"]');
					if ($vals.length > 0) {
						for ($j = 0;$j < $vals.length;$j++) {
							if ($type == 'list') {
								delval = $vals[$j].getAttribute('value');
							} else {
								delval = $vals[$j].getAttribute('data-sort-value');
							}
							if (delval != "*") { 
								newparents.push(delval);
								addClass($vals[$j],'iso_hide_elem');
							}
						}
					}
				}
			}
			parents = newparents;
		}
		childstr = $this.getAttribute('data-filter-group');
		filters[childstr] = ['*'];
		sortValue = '';
	}
}
function set_family_all(me,child,$type) {
	parents = [];
	while(child) {
		if ($type == 'list') {
			$this = document.querySelector(me+'.filter-button-group-fields');
		} else {
			$this = document.querySelector(me+'.filter-button-group-fields').parentNode;
		}
		parents = $this.querySelectorAll('[data-child="'+child+'"]');
		for (i = 0;i < parents.length;i++) {
			if (hasClass(parents[i],'iso_hide_elem')) continue; // ignore hidden elements
			if ($type == 'list') {
				setval = parents[i].getAttribute('value');
			} else {
				setval = parents[i].getAttribute('data-sort-value');
			}
			if (setval && (setval != "*")) {
				removeClass($this.querySelector('[data-parent="'+setval+'"]'),'iso_hide_elem');
			}
		}
		if ($type == 'list') {
			allbuton = $this.querySelector('[data-group-id="'+child+'"] [data-all="all"]')
			child = allbutton.getAttribute('data-child'); 
		} else {
			buttons = $this.querySelectorAll('[data-group-id="'+child+'"] button')
			for (var i=0;i < buttons.length;i++) {
				removeClass(buttons[i],'is-checked'); 
			}
			addClass($this.querySelector('[data-group-id="'+child+'"] button.iso_button_tout'),'is-checked'); 
			myparent = 
			$mychild = $this.querySelector('[data-group-id="'+child+'"]');
			$mychild_all = $mychild.querySelector('button.iso_button_tout')
			child = $mychild_all.getAttribute('data-child'); 
		}
		childstr = $this.getAttribute('data-filter-group');
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
// from https://code.tutsplus.com/tutorials/from-jquery-to-javascript-a-reference--net-23703
hasClass = function (el, cl) {
    var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
    return !!el.className.match(regex);
}
addClass = function (el, cl) {
    el.className += ' ' + cl;
},
removeClass = function (el, cl) {
    var regex = new RegExp('(?:\\s|^)' + cl + '(?:\\s|$)');
    el.className = el.className.replace(regex, ' ');
},
toggleClass = function (el, cl) {
    hasClass(el, cl) ? removeClass(el, cl) : addClass(el, cl);
};
// from https://gist.github.com/andjosh/6764939
var scrollTo = function(to, duration) {
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