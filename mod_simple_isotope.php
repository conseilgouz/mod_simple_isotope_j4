<?php
/**
* Simple isotope module  - Joomla Module 
* Version			: 4.0.1
* Package			: Joomla 4.x.x
* copyright 		: Copyright (C) 2022 ConseilGouz. All rights reserved.
* license    		: http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/
defined('_JEXEC') or die;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Helper\ModuleHelper;
use Joomla\CMS\Component\ComponentHelper;
use ConseilGouz\Module\SimpleIsotope\Site\Helper\IsotopeHelper;
use Joomla\CMS\Language\Text;

$document 		= Factory::getDocument();

$modulefield	= 'media/mod_simple_isotope/';

$moduleclass_sfx = htmlspecialchars($params->get('moduleclass_sfx',''));

$limitstart = 0;
if ($params->get("pagination","false") == 'true') {
	$limitstart = JRequest::getVar('limitstart', 0, '', 'int');
}
$iso_entree = $params->get('iso_entree', 'webLinks');
$article_cat_tag = $params->get('cat_or_tag',$iso_entree == "webLinks"?'cat':'tags'); 
$iso_layout = $params->get('iso_layout', 'fitRows');
$iso_nbcol = $params->get('iso_nbcol',2);
$tags_list = $params->get('tags');
$fields_list = $params->get('displayfields');
$iso_limit = $params->get('iso_limit','all');

$displayrange =  $params->get('displayrange','false');
$displayalpha =  $params->get('displayalpha','false');
$rangefields =   $params->get('rangefields',''); 
$rangestep =   $params->get('rangestep','0'); 
$minrange = '';
$maxrange = '';
$rangetitle =  '';
$rangelabel =  '';
$rangedesc =  '';

$tags = array();
$tags_alias = array();
$tags_image = array();
$tags_parent = array();
$tags_note = array();
$tags_parent_alias = array();
$fields = array();
$cats_lib = array();
$cats_alias = array();
$cats_note = array();
$cats_params = array();
$article_fields = array(); 
$article_fields_names = array(); 
$alpha = array(); 

if ($iso_entree == "k2") {
	$db = JFactory::getDbo();
	$db->setQuery("SELECT enabled FROM #__extensions WHERE name = 'COM_K2'");
	$is_enabled = $db->loadResult();        
	if ($is_enabled != 1) { 
		Factory::getApplication()->enqueueMessage('Where is K2 ?', 'error');	
		return true;
	} 
	require_once __DIR__ . '/helper_k2.php';
	$tags_list = array();
	if (($params->get('cat_or_tag') == "tags") || ($params->get('cat_or_tag') == "cattags")) { 
		$tags_list = $params->get('tags_k2');
	}
	$categories = $params->get('categories_k2');
	if (is_null($categories)) {
		$res = IsotopeK2Helper:: getAllCategories_K2($params);
		$categories = array();
		foreach ($res as $catid) {
			if ($catid->count > 0) {
				$categories[] = $catid->id;
			}
		}
	}
	$article_tags = array();
	foreach ($categories as $catid) {
		$list[$catid] = IsotopeK2Helper::getCategory_K2($catid,$params,$tags,$tags_alias,$tags_note,$tags_image, $cats_lib, $cats_alias,$cats_note,$cats_params, $article_tags,$module,$fields, $article_fields,$alpha);
	}
} elseif ($iso_entree == "webLinks") {
	$categories = $params->get('wl_categories');
	$weblinks_params = ComponentHelper::getParams('com_weblinks');
	$list = IsotopeHelper::getWebLinks($params,$weblinks_params,$tags,$tags_alias,$tags_note,$tags_image,$tags_parent,$tags_parent_alias,$article_tags,$cats_lib ,$cats_alias,$cats_note,$cats_params,$fields,$article_fields, $article_fields_names,$rangefields,$alpha);
	if (!$list) return false; // on a eu une erreur: on sort
} else { 
	$categories = $params->get('categories');
	if (is_null($categories)) {
		$res = IsotopeHelper:: getAllCategories($params);
		$categories = array();
		foreach ($res as $catid) {
			if ($catid->count > 0) {
				$categories[] = $catid->id;
			}
		}
	}
	$article_tags = array();
	if ($params->get("pagination","false") == 'true') {
		$limit = (int) $params->get("page_count",0);
		$order =  $params->get("page_order","a.ordering");
	} else {
		$limit = (int) $params->get('iso_count', 0);
		$order = "a.ordering";
	}
	$pagination = "";
	$list[] = IsotopeHelper::getItems($categories,$params,$tags,$tags_alias,$tags_note,$tags_image,$tags_parent,$tags_parent_alias, $cats_lib, $cats_alias, $cats_note,$cats_params, $article_tags,$module,$fields,$article_fields, $article_fields_names, $pagination, $limitstart, $limit,$order,$rangefields,$rangetitle,$rangelabel,$rangedesc,$minrange,$maxrange,$alpha);

}
HTMLHelper::_('bootstrap.framework');
HTMLHelper::_('jquery.framework');   
/** @var Joomla\CMS\WebAsset\WebAssetManager $wa */
$wa = Factory::getDocument()->getWebAssetManager();

$wa->registerAndUseStyle('iso',$modulefield.'css/isotope.css');
$wa->registerAndUseStyle('up',$modulefield.'css/up.css');
if ($params->get('css')) $wa->addInlineStyle($params->get('css')); 
$wa->registerAndUseScript('imgload',$modulefield.'js/imagesloaded.min.js');
$wa->registerAndUseScript('isotope',$modulefield.'js/isotope.min.js');
$wa->registerAndUseScript('packery',$modulefield.'js/packery-mode.min.js');
if ($displayrange == 'true') {
	$wa->registerAndUseStyle('rslider',$modulefield.'css/rSlider.min.css');
	$wa->registerAndUseScript('rslider',$modulefield.'js/rSlider.min.js');
}
if ($params->get('customjs')) $wa->addInlineScript($params->get('customjs')); 

$min = ".min";
if ((bool)Factory::getConfig()->get('debug')) $min = '';
$wa->registerAndUseScript('cgisotope',$modulefield.'js/init'.$min.'.js');
// ==> debug init.js ==> $document->addScript(''.JURI::base(true).'/media/simple_gisotope/js/init.js');


$language_filter=$params->get('language_filter','false');
$defaultdisplay = $params->get('defaultdisplay', 'date_desc');
$sortBy = "";$sortAscending = "";
if ($defaultdisplay == "date_asc")   { $sortBy = "date"; $sortAscending = "true";}
if ($defaultdisplay == "date_desc")  { $sortBy = "date"; $sortAscending = "false";}
if ($defaultdisplay == "cat_asc")    { $sortBy = "category"; $sortAscending = "true";}
if ($defaultdisplay == "cat_desc")   { $sortBy = "category"; $sortAscending = "false";}
if ($defaultdisplay == "alpha_asc")  { $sortBy = "title"; $sortAscending = "true";}
if ($defaultdisplay == "alpha_desc") { $sortBy = "title"; $sortAscending = "false";}
if ($defaultdisplay == "click_asc")  { $sortBy = "click"; $sortAscending = "true";}
if ($defaultdisplay == "click_desc") { $sortBy = "click"; $sortAscending = "false";}
if ($defaultdisplay == "rating_asc") { $sortBy = "rating"; $sortAscending = "true";}
if ($defaultdisplay == "rating_desc") {$sortBy = "rating"; $sortAscending = "false";}
if ($defaultdisplay == "id_asc") { $sortBy = "id"; $sortAscending = "true";}
if ($defaultdisplay == "id_desc") {$sortBy = "id"; $sortAscending = "false";}
if ($defaultdisplay == "blog_asc") {$sortBy = "blog"; $sortAscending = "true";}
if ($defaultdisplay == "blog_desc") {$sortBy = "blog"; $sortAscending = "false";}

$displayfilter =  $params->get('displayfilter','button');
if ($iso_entree == "k2") {
	$default_cat = $params->get('default_cat_k2','');
	$default_tag = $params->get('default_tag_k2','');
	if (($default_cat != "") && ($default_cat != "none"))  {
		$default_cat = $cats_alias[$default_cat];
	}
	if (($default_tag != "") && ($default_tag != "none"))  {
		$default_tag = $tags_alias[$default_tag];
	}
} elseif ($iso_entree == "webLinks") {
	$default_cat = $params->get('default_cat_wl','');
	if (($default_cat != "") && ($default_cat != "none"))  {
		$default_cat = $cats_alias[$params->get('default_cat_wl')];
	}
	$default_tag = $params->get('default_tag','');
	if (($default_tag != "") && ($default_tag != "none"))  {
		$onetag = IsotopeHelper::getTagTitle($default_tag);
		$default_tag = $onetag[0]->alias;
	}
} else {
	$default_cat = $params->get('default_cat','');
	if (($default_cat != "") && ($default_cat != "none"))  {
		$default_cat = $cats_alias[$params->get('default_cat')];
	}
	$default_tag = $params->get('default_tag','');
	if (($default_tag != "") && ($default_tag != "none"))  {
		$onetag = IsotopeHelper::getTagTitle($default_tag);
		$default_tag = $onetag[0]->alias;
	}
}	
$default_field = "";
if ($iso_entree == "k2") {
	if ($article_cat_tag =="cat") {
		$default_tag = "";
		$displayfiltercat = $params->get('displayfiltercat',$displayfilter);
	} else {
		$displayfiltercat = $params->get('displayfiltercattags',$displayfilter);
	}
	$searchmultiex = "false";
	if (  ( ($article_cat_tag == "tags") && ($displayfilter == "multiex")) 
		|| ( ($article_cat_tag  == "cattags") && ($displayfilter == "multiex"))
		|| ( ($article_cat_tag == "cat") && ($displayfiltercat == "multiex")) 
		|| ( ($article_cat_tag  == "cattags") && ($displayfiltercat == "multiex"))){
		$searchmultiex = "true";
	}
	if ($article_cat_tag =="cat") {
		$displayfiltercat = $params->get('displayfiltercat',$displayfilter);
	} else {
		$displayfiltercat = $params->get('displayfiltercattags',$displayfilter);
	}
	$document->addScriptOptions('mod_simple_isotope_'.$module->id, 
		array('entree' => $iso_entree,'article_cat_tag' => $article_cat_tag,
			  'default_cat' => $default_cat,
		      'default_tag' => $default_tag,
			  'layout' => $iso_layout,'nbcol' => $iso_nbcol,
			  'background' => $params->get("backgroundcolor","#eee"),
			  'imgmaxwidth' => $params->get('introimg_maxwidth','0'),
			  'imgmaxheight' => $params->get('introimg_maxheight','0'),
			  'sortby' => $sortBy, 'ascending' => $sortAscending,
			  'searchmultiex' => $searchmultiex, 'liball' => Text::_('SSISO_LIBALL'),
			  'language_filter' => $language_filter,
			  'displayfilter'=> $displayfilter, 'displayfiltercat' => $displayfiltercat,
			  'limit_items' => $params->get('limit_items','0'),'displayalpha'=>$displayalpha,
			  'libmore' => Text::_('SSISO_LIBMORE'), 'libless' => Text::_('SSISO_LIBLESS'), 'readmore' => $params->get("readmore","false"),
			  'empty' => $params->get("empty","false")));
} elseif (($article_cat_tag == "fields") || ($article_cat_tag == "catfields") || ($article_cat_tag == "tagsfields") ) {
	$splitfields = $params->get('displayfiltersplitfields','false'); 
	$displayfilterfields =  $params->get('displayfilterfields','button');
	$displayfilter =  $params->get('displayfilter_f','button');
	$searchmultiex = "false";
	if  ( ($displayfilterfields == "multiex") || ($displayfilterfields == "listex"))  {	
		$searchmultiex = "true";
	}
	if ($article_cat_tag =="catfields") {
		$displayfiltercat = $params->get('displayfiltercat',$displayfilter);
	} elseif ($article_cat_tag =="tagsfields") {
		$displayfiltercat = $params->get('displayfilter',$displayfilter);
	} else {
		$displayfiltercat = $displayfilterfields;
	}
	
	$document->addScriptOptions('mod_simple_isotope_'.$module->id, 
		array('entree' => $iso_entree,'article_cat_tag' => $article_cat_tag,
			  'default_cat' => $default_cat,
			  'default_field' => $default_field,
			  'layout' => $iso_layout,'nbcol' => $iso_nbcol,
			  'background' => $params->get("backgroundcolor","#eee"),
			  'imgmaxwidth' => $params->get('introimg_maxwidth','0'),
			  'imgmaxheight' => $params->get('introimg_maxheight','0'),
			  'sortby' => $sortBy, 'ascending' => $sortAscending,
			  'searchmultiex' => $searchmultiex, 'liball' => Text::_('SSISO_LIBALL'),
			  'language_filter' => $language_filter,
			  'displayfilter'=>  $displayfilterfields, 
			  'displayfiltercat' => $displayfiltercat,
			  'displayrange'=>$displayrange,'rangestep'=>$rangestep, 'minrange'=>$minrange,'maxrange'=>$maxrange,			  
			  'limit_items' => $params->get('limit_items','0'),'displayalpha'=>$displayalpha,
			  'libmore' => Text::_('SSISO_LIBMORE'), 'libless' => Text::_('SSISO_LIBLESS'), 'readmore' => $params->get("readmore","false"),
			  'empty' => $params->get("empty","false")));
} else {
	if ($article_cat_tag =="cat") {
		$displayfiltercat = $params->get('displayfiltercat',$displayfilter);
		$default_tag = "";
	} else {
		$displayfiltercat = $params->get('displayfiltercattags',$displayfilter);
	}
	
	$searchmultiex = "false";
	if (  ( ($article_cat_tag == "tags") && ($displayfilter == "multiex")) 
		|| ( ($article_cat_tag  == "cattags") && ($displayfilter == "multiex"))
		|| ( ($article_cat_tag == "cat") && ($displayfiltercat == "multiex")) 
		|| ( ($article_cat_tag  == "cattags") && ($displayfiltercat == "multiex"))){
		$searchmultiex = "true";
	}
	if ($article_cat_tag =="cat") {
		$displayfiltercat = $params->get('displayfiltercat',$displayfilter);
	} else {
		$displayfiltercat = $params->get('displayfiltercattags',$displayfilter);
	}
	$document->addScriptOptions('mod_simple_isotope_'.$module->id, 
		array('entree' => $iso_entree,'article_cat_tag' => $article_cat_tag,
			  'default_cat' => $default_cat,
			  'default_tag' => $default_tag,
		      'layout' => $iso_layout,'nbcol' => $iso_nbcol,
			  'background' => $params->get("backgroundcolor","#eee"),
			  'imgmaxwidth' => $params->get('introimg_maxwidth','0'),
			  'imgmaxheight' => $params->get('introimg_maxheight','0'),
			  'sortby' => $sortBy, 'ascending' => $sortAscending,
			  'searchmultiex' => $searchmultiex, 'liball' => Text::_('SSISO_LIBALL'),
			  'language_filter' => $language_filter,
			  'displayfilter'=> $displayfilter, 'displayfiltercat' => $displayfiltercat,
			  'displayrange'=>$displayrange,'rangestep'=>$rangestep, 'minrange'=>$minrange,'maxrange'=>$maxrange,			  
			  'limit_items' => $params->get('limit_items','0'),'displayalpha'=>$displayalpha,
			  'libmore' => Text::_('SSISO_LIBMORE'), 'libless' => Text::_('SSISO_LIBLESS'), 'readmore' => $params->get("readmore","false"),
			  'empty' => $params->get("empty","false")));
}

if ($iso_entree == "k2") {
	require ModuleHelper::getLayoutPath('mod_simple_isotope', 'default_k2');
} elseif (($article_cat_tag == "fields") || ($article_cat_tag == "catfields") || ($article_cat_tag == "tagsfields")) {
	require ModuleHelper::getLayoutPath('mod_simple_isotope', 'default_fields');
} else {
	require ModuleHelper::getLayoutPath('mod_simple_isotope', 'default_cat_tags');
}
?>