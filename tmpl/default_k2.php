<?php
/**
* Simple isotope module  - Joomla Module 
* Version			: 4.0.2
* Package			: Joomla 4.x.x
* copyright 		: Copyright (C) 2022 ConseilGouz. All rights reserved.
* license    		: http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/

defined('_JEXEC') or die;
use Joomla\CMS\Factory;
$uri = JUri::getInstance();
$user = Factory::getUser();

$defaultdisplay = $params->get('defaultdisplay', 'date_desc');
$displaysortinfo = $params->get('displaysortinfo', 'show');
$article_cat_tag = $params->get('cat_or_tag',$iso_entree == "webLinks"?'cat':'tags'); 
$displayfilter =  $params->get('displayfilter','button');
$tagsfilterorder = $params->get('tagsfilterorder','false');
$tagsfilterimg =  $params->get('tagsfilterimg','false');
$language_filter=$params->get('language_filter','false');
$tagsfilterparent =  $params->get('tagsfilterparent','false');
$tagsfilterparentlabel =  $params->get('tagsfilterparentlabel','false');
$catsfilterimg =  $params->get('catsfilterimg','false');
$blocklink =  $params->get('blocklink','false'); 
$titlelink =  $params->get('titlelink','true'); 
if ($article_cat_tag =="cat") {
    $displayfiltercat = $params->get('displayfiltercat',$displayfilter);
} else {
    $displayfiltercat = $params->get('displayfiltercattags',$displayfilter);
}
$displaysort =  $params->get('displaysort','show');  
$displaybootstrap = $params->get('bootstrapbutton','false'); 
$displaysearch=$params->get('displaysearch','false');  
$displayalpha = $params->get('displayalpha','false');  

$imgmaxwidth = $params->get('introimg_maxwidth','0'); 
$imgmaxheight = $params->get('introimg_maxheight','0'); 
$languagelist = array();
if ($params->get('language_filter','false') != 'false') { // language filter
	$languagelist = JLanguageHelper::getLanguages();
}
$button_bootstrap = "isotope_button";
if ($displaybootstrap == 'true') { 
	$button_bootstrap = "btn btn-sm ";
}
//==============================LAYOUTS======================================//
$layouts_prm = $params->get('layouts');
$layouts = [];
$layouts_order = [];
// Default values 
$width = 0;
$line = 1;
$pos = 0;
if ($displaysort != "hide") {
	$values = new stdClass();
	$values->div = "sort";
	$values->div_line = "1";
	$values->div_pos = "1";
	$pos = $values->div_pos;
	$values->div_width = "5";
	$values->div_align="";
	$width += 5;
	$layouts['sort'] = $values;
}
if ($displaysearch == "true") {
	$values = new stdClass();
	$values->div = "search";
	if ($pos > 0) {// on affiche le tri => recherche en dessous
		$values->div_line = "2";
		$values->div_pos = "0";
		$pos = 1;
	} else {
		$pos += 1;
		$values->div_pos = $pos;
		$values->div_line = "1";
		$width += 4;
	}
	$values->div_width = "4";
	$values->div_align="";
	$layouts['search'] = $values;
}
if ($article_cat_tag == 'cattags') {
	$values = new stdClass();
	$values->div = "cat";
	$pos += 1;
	if ($width + 6 > 12) {
		$pos = 1; 
		$line +=1;
		$width = 0;
	}
	$width += 6;
	$values->div_line = $line;
	$values->div_pos = $pos;
	$values->div_width = "6";
	$values->div_align="";
	$layouts['cat'] = $values;
	$values = new stdClass();
	$values->div = "tag";
	$pos += 1;
	if ($width + 6 > 12) {
		$pos = 1; 
		$line +=1;
		$width = 0;
	}
	$width += 6;
	$values->div_line = $line;
	$values->div_pos = $pos;
	$values->div_width = "6";
	$values->div_align="";
	$layouts['tag'] = $values;
}
if ($article_cat_tag == 'cat') {
	$values = new stdClass();
	$values->div = "cat";
	$values->div_width = "7";
	$pos += 1;
	if ($width + 7 > 12) {
		$pos = 1; 
		$line +=1;
		$width = 0;
	}
	$width += 7;
	$values->div_line = $line;
	$values->div_pos = $pos;
	$values->div_align="";
	$layouts['cat'] = $values;
}
if ($article_cat_tag == 'tags') {
	$values = new stdClass();
	$values->div = "tag";
	$values->div_width = "7";
	$pos += 1;
	if ($width + 7 > 12) {
		$pos = 1; 
		$line +=1;
		$width = 0;
	}
	$width += 7;
	$values->div_line = $line;
	$values->div_pos = $pos;
	$values->div_align="";
	$layouts['tag'] = $values;
}
if ($displayalpha != "false") {
	$values = new stdClass();
	$values->div = "alpha";
	$line +=1;
	$values->div_line = $line;
	$values->div_pos = "1";
	$values->div_width = "12";
	$values->div_align="";
	$layouts['alpha'] = $values;
}

$values = new stdClass();
$values->div = "iso";
$line +=1;
$values->div_line = $line;
$values->div_pos = "1";
$values->div_width = "12";
$values->div_align="";
$layouts["iso"] = $values;

if ($layouts_prm) { // we have a parameter definition: replace default behaviour
	foreach ($layouts_prm as $layout) {
		$layouts[$layout->div] = $layout;
	}
}
foreach ($layouts as $layout) {
	$layouts_order[$layout->div_line.$layout->div_pos] = $layout->div;
}
//====================================Messages=====================================//
$libreverse=JText::_('SSISO_LIBREVERSE');
$liball = JText::_('SSISO_LIBALL');
$libdate = JText::_('SSISO_LIBDATE');
$libcategory = JText::_('SSISO_LIBCAT');
$libvisit= JText::_('SSISO_LIBVISIT');
$librating= JText::_('SSISO_LIBRATING');
$libid= JText::_('SSISO_LIBID');
$libalpha=JText::_('SSISO_LIBALPHA');
$libcreated=JText::_('SSISO_LIBCREATED'); 
$libupdated=JText::_('SSISO_LIBUPDATED');
$librandom=JText::_('SSISO_RANDOM');
$libfilter=JText::_('SSISO_LIBFILTER');  
$libdateformat = $params->get('formatsortdate',JText::_('CG_ISO_DATEFORMAT'));
$libotherdateformat = $params->get('formatotherdate',JText::_('CG_ISO_DATEFORMAT'));
$libsearch = JText::_('SSISO_LIBSEARCH');
$libmore = JText::_('SSISO_LIBMORE');
$libsearchclear = JText::_('SSISO_SEARCHCLEAR');
?>
<div id="isotope-main-<?php echo $module->id;?>" data="<?php echo $module->id;?>" class="isotope-main">
<div class="isotope-div fg-row" >
<?php 
// =====================================sort buttons div =================================================// 
$sort_buttons_div = "";
if ($displaysort != "hide") { 
$sort_buttons_div = '<div class="isotope_button-group sort-by-button-group fg-c'.$layouts["sort"]->div_width.' fg-cs12 fg-cm6 '.$layouts["sort"]->div_align.'">';
$checked = " is-checked ";
if ($params->get('btndate','true') != "false") {
	$sens = $params->get('btndate','true') == 'true' ? '+':'-'; 
	$sens = $defaultdisplay=="date_desc"? "-": $sens;
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' is-checked iso_button_date" data-sort-value="date,title,category,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libdate.'</button>';
	$checked = "";
}
if ($params->get('btncat','true') != "false") {
	$sens = $params->get('btncat','true') == 'true' ? '+':'-';
	$sens = $defaultdisplay=="cat_desc"? "-": $sens;
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_cat" data-sort-value="category,title,date,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libcategory.'</button>';
	$checked = "";
}
if ($params->get('btnalpha','true') != "false") {
	$sens = $params->get('btnalpha','true') == 'true' ? '+':'-';
	$sens = $defaultdisplay=="alpha_desc"? "-": $sens;
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_alpha" data-sort-value="title,category,date,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libalpha.'</button>';
	$checked = "";
}
if ($params->get('btnvisit','true') != "false") {
	$sens = $params->get('btnvisit','true') == 'true' ? '+':'-';
	$sens = $defaultdisplay=="click_desc"? "-": $sens;
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_click" data-sort-value="click,category,title,date" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libvisit.'</button>';
	$checked = "";
}
if ($params->get('btnid','false') != "false") {
	$sens = $params->get('btnid','true') == 'true' ? '+':'-';
	$sens = $defaultdisplay=="click_desc"? "-": $sens;
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_click" data-sort-value="id" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libid.'</button>';
	$checked = "";
}
if ($params->get('btnrandom','false') != "false") {
	$sens = ''; 
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_random" data-sort-value="random">'.$librandom.'</button>';
	$checked = "";
}
if ((JPluginHelper::isEnabled('content', 'vote')) && ($params->get('btnrating','true') != "false")) {
	$sens = $params->get('btnrating','true') == 'true' ? '+':'-';
	$sens = $defaultdisplay=="rating_desc"? "-": $sens;
	$sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_click" data-sort-value="rating,category,title,date" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$librating.'</button>';
	$checked = "";
}
$sort_buttons_div .= "</div>";
}
// ============================search div ============================================//
$search_div = "";
if ($displaysearch == "true") { 
	$search_div .= '<div class="iso_search fg-c'.$layouts["search"]->div_width.' fg-cs12 '.$layouts["search"]->div_align.'" >';
	$search_div .= '<input type="text" class="quicksearch" placeholder="'.$libsearch.'" style="width:80%;float:left">';
	$search_div .= '<i class="ison-cancel-squared" title="'.$libsearchclear.'" style="width:20%;float:right"></i>';
	$search_div .= '</div>';
}
//============================filter div===============================================//
$filter_cat_div = "";
$filter_tag_div= "";
if (($displayfilter != "hide") || ($displayfiltercat != "hide")) {
 if (($article_cat_tag == "tags") || ($article_cat_tag =="cat") || ($article_cat_tag == "cattags")) {
	$filters = array();
	if ( ($article_cat_tag  == "tags") ||  ($article_cat_tag  == "cattags") ) {
		if ($tags_list && (count($tags_list) > 0)) { // on a defini une liste de tags
			foreach ($tags_list as $key) {
			$filters['tags'][]= ModSimpleIsotopeHelperK2::getTagTitle($key);
			}
		} 
	}
	if (($article_cat_tag  == "cat") ||  ($article_cat_tag  == "cattags")) { 
	    if (is_null($categories) ) {
           $keys = array_keys($cats_lib);
           $filters['cat'] = $keys;
	    } else {
		  $filters['cat']= $categories;
	    }
	}
	if (($article_cat_tag  == "cat") || ($article_cat_tag  == "cattags")) {
		// categories sort
		$sortFilter = array();
		// category alias parameter
		if ($params->get('catfilteralias','false') == 'true') { // sort category aliases
			foreach ($cats_alias as $key => $filter) {
				$sortFilter[$key] = $cats_alias[$key];
			}
		} else { // sort category names
			foreach ($filters['cat'] as $filter) {
				$sortFilter[$filter] = $cats_lib[$filter];
			}	
		}
		if ($params->get('catfilteralias','false') != 'order') { // don't sort categories
			asort($sortFilter,  SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL ); // alphabatic order
		}
	    if  (($displayfiltercat == "button")  || ($displayfiltercat == "multi") || ($displayfiltercat == "multiex")) {
    	    $filter_cat_div .= '<div class="isotope_button-group filter-button-group-cat fg-c'.$layouts["cat"]->div_width.' fg-cs12 '.$layouts["cat"]->div_align.'" data-filter-group="cat">';
			$checked = "";
			if ($default_cat == "") {
				$checked = "is-checked";
			}
		    $filter_cat_div .= '<button class="'.$button_bootstrap.'  iso_button_cat_tout '.$checked.'" data-sort-value="*" />'.$liball.'</button>';
		    foreach ($sortFilter as $key => $filter) {
		        $aff = $cats_lib[$key];
		        $aff_alias = $cats_alias[$key];
				if (!is_null($aff)) {
					$checked = "";
					if ($default_cat == $aff_alias) {$checked = "is-checked";}
					$img="";
					if ($catsfilterimg == "true") {
						$catparam  = json_decode($cats_params[$key]);	
						if ($catparam->image != "") {
							$img = '<img src="'.JURI::root().$catparam->image.'"  
							class="iso_cat_img" alt="'.$tagimage->image_alt.'" /> ';
						}
					}
					$filter_cat_div .= '<button class="'.$button_bootstrap.'  iso_button_cat_'.$aff_alias.' '.$checked.'" data-sort-value="'.$aff_alias.'" />'.$img.JText::_($aff).'</button>';
				}
			}
			$filter_cat_div .= '</div>';
		} else {
		    $filter_cat_div .= '<div class="isotope_button-group filter-button-group-cat fg-c'.$layouts["cat"]->div_width.' fg-cs12 '.$layouts["cat"]->div_align.'" data-filter-group="cat">';
		    $filter_cat_div .= '<p class="hidden-phone" >'.$libfilter.' : </p><select class="isotope_select" data-filter-group="cat">';
		    $filter_cat_div .= '<option>'.$liball.'</option>';
		    foreach ($sortFilter as $key => $filter) {
		        $aff = $cats_lib[$key];
		        $aff_alias = $cats_alias[$key];
		        if (!is_null($aff)) {
					$selected = "";
					if ($default_cat == $aff_alias) {$selected = "selected";}
					$filter_cat_div .= '<option value="'.$aff_alias.'" '.$selected.'>'. JText::_($aff).'</option>';
		        }
		    }
		    $filter_cat_div .= '</select>';
		    $filter_cat_div .= '</div>';
		}
	}
	if (( $article_cat_tag  == "tags") || ($article_cat_tag  == "cattags")) {
	    // tri des tags
		$sortFilter = array();
		$alias = array();
		if ($tags_list && (count($tags_list) > 0)) {
			foreach ($filters['tags'] as $filter) {
				$sortFilter[] = '&'.$filter[0]->tag;
				$alias[$filter[0]->tag] = $filter[0]->alias;
			}
		} else { 
			foreach ($tags as $key=>$value) {
				$sortFilter[] = "&".$value;
				$alias[$value] = $tags_alias[$key];
			}
		}
		if ($tagsfilterorder == "false") {
			asort($sortFilter,  SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL ); // alphabetic order
		}
	    if (($displayfilter == "button") || ($displayfilter == "multi") || ($displayfilter == "multiex") ) {
			$checked = "";
			if ($default_tag == "") {
				$checked = "is-checked";
			}
			$filter_tag_div .= '<div class="isotope_button-group filter-button-group-tags fg-c'.$layouts["tag"]->div_width.' fg-cs12 '.$layouts["tag"]->div_align.'" data-filter-group="tags">';
			$filter_tag_div .= '<button class="'.$button_bootstrap.'  iso_button_cat_tout '.$checked.'" data-sort-value="*" />'.$liball.'</button>';
			$cur_parent = '';
			foreach ($sortFilter as $aval) {
				$res = explode("&",$aval);
				$filter = $res[1];
				$parent = $res[0];
			    $aff = $filter; 
			    $aff_alias = $alias[$filter];
				if (!is_null($aff)) {
					$img = "";
					if ($tagsfilterimg == "true") {
						$tagimage  = json_decode($tags_image[$aff_alias]);	
						if ($tagimage->image_intro != "") {
							$img = '<img src="'.JURI::root().$tagimage->image_intro.'" style="float:'.$tagimage->float_intro.'" 
							class="iso_tag_img" alt="'.$tagimage->image_intro_alt.'" title="'.$tagimage->image_intro_caption.'"/> ';
						} elseif ($tagimage->image_fulltext != "") {
							$img = '<img src="'.JURI::root().$tagimage->image_fulltext.'" style="float:'.$tagimage->float_fulltext.'" 
							class="iso_tag_img" alt="'.$tagimage->image_fulltext_alt.'" title="'.$tagimage->image_fulltext_caption.'"/> ';
						}
					}
					$checked = "";
					if ($default_tag == $aff_alias) {$checked = "is-checked";}
					$filter_tag_div .= '<button class="'.$button_bootstrap.'  iso_button_tags_'.$aff_alias.' '.$checked.'" data-sort-value="'.$aff_alias.'" />'.$img.JText::_($aff).'</button>';
				}
			}
			$filter_tag_div .= '</div>';
		}   else  {	// affichage Liste
			$filter_tag_div .= '<div class="isotope_button-group filter-button-group-tags fg-c'.$layouts["tag"]->div_width.' fg-cs12 '.$layouts["tag"]->div_align.'" data-filter-group="tags">';
			$filter_tag_div .= '<p class="hidden-phone" >'.$libfilter.' : </p><select class="isotope_select" data-filter-group="cat">';
			$filter_tag_div .= '<option>'.$liball.'</option>';
			foreach ($sortFilter as $aval) {
				$res = explode("&",$aval);
				$filter = $res[1];
				$parent = $res[0];
			    $aff = $filter; 
			    $aff_alias = $alias[$filter];
				if (!is_null($aff)) {
					$selected = "";
					if ($default_tag == $aff_alias) {$selected = "selected";}
					$filter_tag_div .= '<option value="'.$aff_alias.'" '.$selected.'>'. JText::_($aff).'</option>';
				}
			}
			$filter_tag_div .= '</select>';
			$filter_tag_div .= '</div>';
		}
	}
   }
 }
//============================= isotope grid =============================================//
$width = $layouts["iso"]->div_width;
$isotope_grid_div = '<div class="isotope_grid fg-c'.$width.' fg-cs12" style="padding:0">'; // bootstrap : suppression du padding pour isotope
foreach ($list as $key=>$category) {
	foreach ($category as $item) {
		$tag_display = "";
		$tag_img = "";
		$cat_img = "";
		if (($article_cat_tag  == "tags") || ($article_cat_tag  == "cattags")) { // filtre tag
			foreach ($article_tags[$item->id] as $tag) {
				$tag_display .= " ".$tags_alias[$tag->id];
				$tagimage  = json_decode($tags_image[$tags_alias[$tag->id]]);
				if (!$tagimage) continue;
                if ((!property_exists($tagimage,'image_image_fulltext')) || ($tagimage->image_fulltext == "") && ($tagimage->image_intro == ""))  continue;
				
				if (($tagimage->image_fulltext == "") && ($tagimage->image_intro == ""))  continue;
				if ($tagimage->image_intro != "") {
					$tag_img .= '<img src="'.JURI::root().$tagimage->image_intro.'" style="float:'.$tagimage->float_intro.'" 
								class="iso_tag_img_art" alt="'.$tagimage->image_intro_alt.'" title="'.$tagimage->image_intro_caption.'"/> ';
				} elseif ($tagimage->image_fulltext != "") {
					$tag_img .=  '<img src="'.JURI::root().$tagimage->image_fulltext.'" style="float:'.$tagimage->float_fulltext.'" 
								class="iso_tag_img_art" alt="'.$tagimage->image_fulltext_alt.'" title="'.$tagimage->image_fulltext_caption.'"/> ';
				};
			}
		} else { // filtre categories
		    $tag_display =  $item->categoryalias;
		}
		$cat_params = json_decode($cats_params[$item->catid]);
		if (($cat_params) && ($cat_params->image != "")) {
			$cat_img = "<img src='".JURI::root().$cat_params->image."' alt='".$cat_params->image_alt."' class='iso_cat_img_art'/>";
		}
		$field_value = "";
		$field_cust = array();
		if (isset($article_fields) and array_key_exists($item->id,$article_fields)) { 
			foreach ($article_fields[$item->id] as $key_f=>$tag_f) {
			    if (!is_array($tag_f) ) {
                   $afield = "";
                    foreach ($tag_f as $avalue) {
                        $obj = $fields[$avalue];
                        $afield .= $afield=="" ?$obj->val : ", ".$obj->val;
                    }
                    $field_cust['{'.$key_f.'}'] = $afield;
                    $field_value .= " ".implode(' ',$tag_f);
                } else { // one field
					$obj = $fields[$tag_f];
					if ((count($params_fields) == 0) ||  (in_array($obj->field_id, $params_fields))) {
						$field_value .= " ".$tag_f;
					}
					$field_cust['{'.$key_f.'}'] = $obj->val; // field display value
				}
			};
		}
    //=== Depuis ajout de Lomart :  prise en charge sous-titre par tilde et badge nouveau
		$item->new = "";
		if ($params->get('btnnew','false') == 'true') {
			$nbday = $params->get('new_limit',0);
			$tmp = date('Y-m-d H:i:s', mktime(date("H"), date("i"), 0, date("m"), date("d")-intval($nbday), date("Y")));    
			$item->new = ($tmp < $item->publish_up) ? ' <span class="iso_badge_new">'.JText::_('SSISO_NEW').'</span> ' : '';
		}
		$item->subtitle = "";
		if ($params->get('btnsubtitle','false') == 'true') {
        // Preparation du titre
        // mise en SMALL du texte apres ~ (tilde) 
			list($title, $item->subtitle) = explode('~',$item->title . '~');
			$item->title = trim($title); 
			if ($item->subtitle) {
				$item->subtitle = '<small>'.trim($item->subtitle).'</small>';
			}
		}
    //=== LM - fin prise en charge sous-titre par tilde et badge nouveau
		$itemtags = "";
		foreach ($article_tags[$item->id] as $tag) {
				$itemtags .= ($itemtags == "") ? "<span class='iso-tags'>".$tag->tag : " - ".$tag->tag;
		}
		$ladate = $item->displayDate;
		$data_cat = $item->categoryalias;
		$item->rating = $item->rating;
		$click = $item->hits;
		$t = "";
		$c = "";
		if ($blocklink == "true") { 
			$t = 'onclick=go_click("'.$iso_entree.'","'.$item->link.'")';
			$c = 'isotope_pointer'; // add class cursor = pointer
		}
		$isotope_grid_div .=  '<div class="isotope_item iso_cat_'.$key.' '.$tag_display.'" data-title="'.$item->title.' '.$c.'" data-category="'.$data_cat.'" data-date="'.$ladate.'" data-click="'.$click.'" data-rating="'.$item->rating.'" data-id="'.$item->id.'" data-lang="'.$item->language.'" data-alpha="'.substr($item->title,0,1).'"  '.$t.'>';
		$canEdit = $user->authorise('core.edit', 'com_content.article.'.$item->id);
		if ($canEdit) {
			$isotope_grid_div .= '<span class="edit-icon">';
			$isotope_grid_div .= '<a href="index.php?task=article.edit&a_id='.$item->id.'&return='.base64_encode($uri).'">';
			$isotope_grid_div .= '<img src="media/system/images/edit.png" alt="modifier" class="iso-img-max-width"></a>';
			$isotope_grid_div .= '</span>';
		}
		if ($titlelink == "true") { 
			$title = '<a href="'.$item->link.'">'.$item->title.'</a>';
		} else {
			$title = $item->title;
		}
		$rating = '';
		for ($i = 1; $i <= $item->rating; $i++) {
			   $rating .= '<img src='.$modulefield.'images/icon.png />';
		}
		$phocacount = ModSimpleIsotopeHelperK2::getArticlePhocaCount($item->fulltext);
		$choixdate = $params->get('choixdate', 'modified');
		$libdate = $choixdate == "modified" ? $libupdated : $libcreated;
		$perso = $params->get('perso');
		$perso = ModSimpleIsotopeHelperK2::checkNullFields($perso,$item,$phocacount); // suppress null field if required			
		$arr_css= array("{title}"=>$title, "{cat}"=>$cats_lib[$item->catid],"{date}"=>$libdate.JHtml::_('date', $item->displayDate, $libdateformat), "{visit}" =>$item->hits, "{intro}" => $item->introtext,"{stars}"=>$rating,"{rating}"=>$item->rating,"{ratingcnt}"=>$item->rating_count,"{count}"=>$phocacount,"{tagsimg}" => $tag_img, "{catsimg}" => $cat_img, "{link}" => $item->link, "{introimg}"=>$item->introimg, "{subtitle}" => $item->subtitle, "{new}" => $item->new, "{tags}" => $itemtags); 
		foreach ($arr_css as $key_c => $val_c) {
			$perso = str_replace($key_c, JText::_($val_c),$perso);
		}
		foreach ($field_cust as $key_f => $val_f) { // affichage du contenu des champs personnalisees
			$perso = str_replace($key_f, JText::_($val_f),$perso);
		}
		$isotope_grid_div .= $perso;
		if ($params->get('readmore','false') !='false') {
			$isotope_grid_div .= '<p class="isotope-readmore">';
			$isotope_grid_div .= '<a class="isotope-readmore-title"  data-articleid="'.$item->id.'" data-href="'.$item->link.'" href="'.$item->link.'">';
				$isotope_grid_div .= JText::_('SSISO_READMORE');
			$isotope_grid_div .= '</a></p>';
		}
		$isotope_grid_div .= '</div>';
	}
}
if ($displayalpha != "false") {
    $isotope_alpha_div = '<div class="isotope_button-group filter-button-group-alpha iso_alpha fg-row fg-c'.$layouts["alpha"]->div_width.' fg-cs12 '.$layouts["alpha"]->div_align.'" data-filter-group="alpha">';
	$isotope_alpha_div .= ModSimpleIsotopeHelperK2::create_alpha_buttons($alpha,$button_bootstrap);
    $isotope_alpha_div .= '</div>';
}

// =============================Lang. filter ============================================//
$isotope_lang_div = "";
if (($language_filter == "button") || ($language_filter == "multi")) {
    $isotope_lang_div = '<div class="isotope_button-group iso_lang fg-row fg-c'.$layouts["lang"]->div_width.' fg-cs12 '.$layouts["lang"]->div_align.'" data-filter-group="lang">';
	$isotope_lang_div .= ModSimpleIsotopeHelperK2::create_language_buttons($languagelist,$button_bootstrap);
    $isotope_lang_div .= '</div>';
}

//=====================================layouts==============================================//
ksort($layouts_order,  SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL ); // order
$val = 0;
foreach ($layouts_order as $layout) {
    $key = (string)$layout;
    $obj = $layouts[$key];
	$val += $obj->div_width;
	if ($line == 0) $line = $obj->div_line; 
	if (($val > 12) || ( ($obj->div_width == 12) && ($val > 12)) || ($line < $obj->div_line)) { // new line needed
		if (($obj->div == "iso") && ($obj->div_width == 12)) {
			echo "</div><div>";
		} else {
			echo "</div><div class='fg-row'>";
		}
		$val = $obj->div_width;
		if ($line < $obj->div_line) { // requested new line
			$line = $obj->div_line; 
		} else { // calculated new line
			$line += 1; 
		}
	}
	if ($obj->div == "search") echo $search_div;
	if ($obj->div == "sort") echo $sort_buttons_div;
	if ($obj->div == "cat") echo $filter_cat_div;
	if ($obj->div == "tag") echo $filter_tag_div;
	if ($obj->div == "lang") echo $isotope_lang_div;
	if ($obj->div == "iso") echo $isotope_grid_div;
	if ($obj->div == "alpha") echo $isotope_alpha_div;	
}
?>
</div>
</div>
<?php 
$width = $layouts["iso"]->div_width;
//view article in isotope module
if ($params->get('readmore','false') =='iframe') {
   echo '<div id="isotope_an_article" class="isotope_an_article fg-c'.$width.' fg-cs12 isotope-hide" ><button type="button" class="close">X</button><iframe src="" id="isotope_article_frame"></iframe></div>'; 
} elseif ($params->get('readmore','false') =='ajax') {
	echo '<input id="token" type="hidden" name="' . JSession::getFormToken() . '" value="1" />';
	echo '<div id="isotope_an_article" class="isotope_an_article fg-c'.$width.' fg-cs12 isotope-hide" ></div>'; 
}
?>
<div class="iso_div_empty iso_hide_elem">
	<?php echo JText::_('SSISO_EMPTY'); ?>
</div>
<div class="iso_div_more">
<button class="<?php echo $button_bootstrap;?> iso_button_more"><?php echo $libmore;?></button>
</div>
</div>
	<?php if (($iso_entree != "webLinks") && ($params->get('pagination','true') == 'true')) {?> 
	<div class="pagination isotope-pagination">	
	<?php $lapagination = $pagination->getPagesLinks($params);
	echo $lapagination;
	?>
    </div>
	<?php } ?>

