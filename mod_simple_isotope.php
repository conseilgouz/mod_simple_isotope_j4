<?php
/**
* Simple isotope module  - Joomla Module
* Version			: 4.3.19
* Package			: Joomla 4.x/5.x
* copyright 		: Copyright (C) 2024 ConseilGouz. All rights reserved.
* license    		: https://www.gnu.org/licenses/gpl-3.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/
defined('_JEXEC') or die;
use Joomla\CMS\Access\Access;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Helper\ModuleHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;
use ConseilGouz\Module\SimpleIsotope\Site\Helper\SimpleIsotopeHelper as IsotopeHelper;
use ConseilGouz\Component\CGIsotope\Site\Helper\CGHelper;
use ConseilGouz\Component\CGIsotope\Site\Controller\PageController;

$document 		= Factory::getApplication()->getDocument();

$modulefield	= 'media/mod_simple_isotope/';
$iso_entree = $params->get('iso_entree', 'webLinks');
$is_component = false;
if ($iso_entree == 'cgisotope') {
    $id = $params->get('iso_id', 0);
    $controller = new PageController();
    $model = $controller->getModel();
    $params = CGHelper::getParams($id, $model);
    $is_component = true;
}
$moduleclass_sfx = htmlspecialchars($params->get('moduleclass_sfx', ''));

$limitstart = 0;
if ($params->get("pagination", "false") != 'false') {
    $input = Factory::getApplication()->getInput();
    $limitstart = $input->getVar('limitstart', 0, '', 'int');
}
$iso_entree = $params->get('iso_entree', 'webLinks');
$article_cat_tag = $params->get('cat_or_tag', $iso_entree == "webLinks" ? 'cat' : 'tags');
$iso_layout = $params->get('iso_layout', 'fitRows');
$iso_nbcol = $params->get('iso_nbcol', 2);
$tags_list = $params->get('tags', array());
// check authorised tags
$authorised = Access::getAuthorisedViewLevels(Factory::getApplication()->getIdentity());
foreach ($tags_list as $key => $atag) {
    if (!IsotopeHelper::getTagAccess($atag, $authorised)) {
        unset($tags_list[$key]); // not authorized : remove it
    }
}
$fields_list = $params->get('displayfields');
$iso_limit = $params->get('iso_limit', 'all');

$displaybootstrap = $params->get('bootstrapbutton', 'false');
$button_bootstrap = "isotope_button";
if ($displaybootstrap == 'true') {
    $button_bootstrap = "btn btn-sm ";
}
$imgmaxwidth =  $params->get('introimg_maxwidth', '0');
$imgmaxheight =  $params->get('introimg_maxheight', '0');

$displayrange =  $params->get('displayrange', 'false');
$displayalpha =  $params->get('displayalpha', 'false');
$rangefields =   $params->get('rangefields', '');
$rangestep =   $params->get('rangestep', '0');
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
$article_tags = array();

if ($iso_entree == "webLinks") {
    $categories = $params->get('wl_categories');
    $weblinks_params = ComponentHelper::getParams('com_weblinks');
    $list = IsotopeHelper::getWebLinks($params, $weblinks_params, $tags_list, $tags, $tags_alias, $tags_note, $tags_image, $tags_parent, $tags_parent_alias, $article_tags, $cats_lib, $cats_alias, $cats_note, $cats_params, $fields, $article_fields, $article_fields_names, $rangefields, $alpha);
    if (!$list) {
        return false;
    } // on a eu une erreur: on sort
} else {
    $categories = $params->get('categories');
    if (is_null($categories)) {
        $res = IsotopeHelper::getAllCategories($params);
        $categories = array();
        foreach ($res as $catid) {
            if ($catid->count > 0) {
                $categories[] = $catid->id;
            }
        }
    }
    if ($params->get("pagination", "false") != 'false') {
        // -> get all categories infos
        foreach($categories as $catid) {
            $infos = IsotopeHelper::getCategoryName($catid);
            $cats_lib[$catid] = $infos[0]->title;
            $cats_alias[$catid] = $infos[0]->alias;
            $cats_note[$catid] = $infos[0]->note;
            $cats_params[$catid] = $infos[0]->params;
        }
        $limit = (int) $params->get("page_count", 0);
        $order =  $params->get("page_order", "a.ordering");
    } else {
        $limit = (int) $params->get('iso_count', 0);
        $choixdate = $params->get('choixdate', 'modified');
        $defaultdisplay = $params->get('defaultdisplay', 'date_desc');
        $order = "a.ordering";
        $dirstr = " DESC";
        if (strpos((string)$defaultdisplay, 'ASC') !== false) {
            $dirstr = " ASC";
        }
        if (strpos((string)$defaultdisplay, 'date') !== false) {
            $order = 'a.'.$choixdate.$dirstr;
        }
        if (strpos((string)$defaultdisplay, 'id') !== false) {
            $order = 'a.id'.$dirstr;
        }
        if (strpos((string)$defaultdisplay, 'blog') !== false) {
            $order = 'ordering'.$dirstr;
        }
        if ($defaultdisplay == 'random') { //
            $order = 'RAND() ';
        }
    }
    $pagination = "";
    $list[] = IsotopeHelper::getItems($categories, $params, $tags_list, $tags, $tags_alias, $tags_note, $tags_image, $tags_parent, $tags_parent_alias, $cats_lib, $cats_alias, $cats_note, $cats_params, $article_tags, $module, $fields, $article_fields, $article_fields_names, $pagination, $limitstart, $limit, $order, $rangefields, $rangetitle, $rangelabel, $rangedesc, $minrange, $maxrange, $alpha);
}
// pagination : check tags_list to add missing tags in the list
if (sizeof($tags_list) && ($params->get("pagination", "false") != 'false')) {
    $authorised = Access::getAuthorisedViewLevels(Factory::getApplication()->getIdentity());
    $missings = IsotopeHelper::getMissingTags($tags_list, $authorised);
    foreach ($missings as $tag) {
        if (!in_array($tag->tag, $tags)) {
            $tags[] = $tag->tag;
            $tags_alias[$tag->tag] = $tag->alias;
            $tags_image[$tag->alias] = $tag->images;
            $tags_note[$tag->alias] = $tag->note;
            $tags_parent[$tag->alias] = $tag->parent_title;
            $tags_parent_alias[$tag->alias] = $tag->parent_alias;
        }
    }
}
// HTMLHelper::_('bootstrap.framework');
// HTMLHelper::_('jquery.framework');
/** @var Joomla\CMS\WebAsset\WebAssetManager $wa */
$wa = Factory::getApplication()->getDocument()->getWebAssetManager();

$wa->registerAndUseStyle('iso', $modulefield.'css/isotope.css');
$wa->registerAndUseStyle('up', $modulefield.'css/up.css');
if ($params->get('css')) {
    $wa->addInlineStyle($params->get('css'));
}
if ($params->get("pagination", "false") == 'infinite') {
    $wa->registerAndUseScript('infinite', $modulefield.'js/infinite-scroll.min.js');
} else {
    $wa->registerAndUseScript('imgload', $modulefield.'js/imagesloaded.min.js');
}
$wa->registerAndUseScript('isotope', $modulefield.'js/isotope.min.js');
$wa->registerAndUseScript('packery', $modulefield.'js/packery-mode.min.js');
if ($displayrange == 'true') {
    $wa->registerAndUseStyle('rslider', $modulefield.'css/rSlider.min.css');
    $wa->registerAndUseScript('rslider', $modulefield.'js/rSlider.min.js');
}
if ($params->get('customjs')) {
    $wa->addInlineScript($params->get('customjs'));
}

$min = ".min";
if ((bool)Factory::getApplication()->getConfig()->get('debug')) { // Mode debug
    $document->addScript(''.URI::base(true).'/media/mod_simple_isotope/js/init.js');
} else {
    $wa->registerAndUseScript('cgisotope', $modulefield.'js/init.min.js');
}

if (($iso_layout == "masonry") || ($iso_layout == "fitRows") || ($iso_layout == "packery")) {
    $width = (100 / $iso_nbcol) - 2;
    $wa->addInlineStyle('#isotope-main-'.$module->id.' .isotope_item{ width:'.$width.'%}');
}
if ($iso_layout == "vertical") {
    $wa->addInlineStyle('#isotope-main-'.$module->id.' .isotope_item{ width:100%}');
}
if  ($imgmaxwidth) {
    $wa->addInlineStyle('#isotope-main-'.$module->id.' .isotope_item img{ max-width:'.$imgmaxwidth.'px}');
}
if  ($imgmaxheight) {
    $wa->addInlineStyle('#isotope-main-'.$module->id.' .isotope_item img{ max-height:'.$imgmaxheight.'px}');
}
$language_filter = $params->get('language_filter', 'false');
$defaultdisplay = $params->get('defaultdisplay', 'date_desc');
$sortBy = "";
$sortAscending = "";
if ($defaultdisplay == "date_asc") {
    $sortBy = "date";
    $sortAscending = "true";
}
if ($defaultdisplay == "date_desc") {
    $sortBy = "date";
    $sortAscending = "false";
}
if ($defaultdisplay == "cat_asc") {
    $sortBy = "category";
    $sortAscending = "true";
}
if ($defaultdisplay == "cat_desc") {
    $sortBy = "category";
    $sortAscending = "false";
}
if ($defaultdisplay == "alpha_asc") {
    $sortBy = "title";
    $sortAscending = "true";
}
if ($defaultdisplay == "alpha_desc") {
    $sortBy = "title";
    $sortAscending = "false";
}
if ($defaultdisplay == "click_asc") {
    $sortBy = "click";
    $sortAscending = "true";
}
if ($defaultdisplay == "click_desc") {
    $sortBy = "click";
    $sortAscending = "false";
}
if ($defaultdisplay == "rating_asc") {
    $sortBy = "rating";
    $sortAscending = "true";
}
if ($defaultdisplay == "rating_desc") {
    $sortBy = "rating";
    $sortAscending = "false";
}
if ($defaultdisplay == "id_asc") {
    $sortBy = "id";
    $sortAscending = "true";
}
if ($defaultdisplay == "id_desc") {
    $sortBy = "id";
    $sortAscending = "false";
}
if ($defaultdisplay == "blog_asc") {
    $sortBy = "blog";
    $sortAscending = "true";
}
if ($defaultdisplay == "blog_desc") {
    $sortBy = "blog";
    $sortAscending = "false";
}
if ($params->get('btnfeature', 'false') != "false") { // featured always first
    $sortBy = 'featured,'.$sortBy;
}
$displayfilter =  $params->get('displayfilter', 'button');
if ($iso_entree == "webLinks") {
    $default_cat = $params->get('default_cat_wl', '');
    if (($default_cat != "") && ($default_cat != "none")) {
        $default_cat = $cats_alias[$params->get('default_cat_wl')];
    }
    $default_tag = $params->get('default_tag', '');
    if (($default_tag != "") && ($default_tag != "none")) {
        $onetag = IsotopeHelper::getTagTitle($default_tag);
        $default_tag = $onetag[0]->alias;
    }
} else {
    $default_cat = $params->get('default_cat', '');
    if (($default_cat != "") && ($default_cat != "none")) {
        $default_cat = $cats_alias[$params->get('default_cat')];
    }
    $default_tag = $params->get('default_tag', '');
    if (($default_tag != "") && ($default_tag != "none")) {
        $onetag = IsotopeHelper::getTagTitle($default_tag);
        $default_tag = $onetag[0]->alias;
    }
}
if (($displayrange == "true") && ($rangestep == "auto")) {
    $step = ((int)$maxrange - (int)$minrange) / 5 ; // PHP 8
    if ($step < 1) {
        $step = 1;
    }
    $rangestep = $step;
}
$default_field = "";
if (($article_cat_tag == "fields") || ($article_cat_tag == "catfields") || ($article_cat_tag == "tagsfields") || ($article_cat_tag == "cattagsfields")) {
    $splitfields = $params->get('displayfiltersplitfields', 'false');
    $displayfilterfields =  $params->get('displayfilterfields', 'button');
    $displayfiltertags = $params->get('displayfiltertags', 'button');
    $displayfilter =  $params->get('displayfilter', 'button');
    $searchmultiex = "false";
    if  (($displayfilterfields == "multiex") || ($displayfilterfields == "listex")) {
        $searchmultiex = "true";
    }
    if ($article_cat_tag == "catfields") {
        $displayfiltercat = $params->get('displayfiltercat', $displayfilter);
    } elseif ($article_cat_tag == "tagsfields") {
        $displayfiltercat = $params->get('displayfilter', $displayfilter);
    } else {
        $displayfiltercat = $displayfilterfields;
    }

    $document->addScriptOptions(
        'mod_simple_isotope_'.$module->id,
        array('entree' => $iso_entree,'article_cat_tag' => $article_cat_tag,
              'default_cat' => $default_cat,
              'default_field' => $default_field,
              'layout' => $iso_layout,'nbcol' => $iso_nbcol,
              'background' => $params->get("backgroundcolor", "#eee"),
              'imgmaxwidth' => $params->get('introimg_maxwidth', '0'),
              'imgmaxheight' => $params->get('introimg_maxheight', '0'),
              'sortby' => $sortBy, 'ascending' => $sortAscending,
              'searchmultiex' => $searchmultiex, 'liball' => Text::_('SSISO_LIBALL'),
              'language_filter' => $language_filter,
              'displayfilterfields' =>  $displayfilterfields,'displayfiltertags' => $displayfiltertags,
              'displayfiltercat' => $displayfiltercat,
              'displayrange' => $displayrange,'rangestep' => $rangestep, 'minrange' => $minrange,'maxrange' => $maxrange,
              'limit_items' => $params->get('limit_items', '0'),'displayalpha' => $displayalpha,
              'libmore' => Text::_('SSISO_LIBMORE'), 'libless' => Text::_('SSISO_LIBLESS'), 'readmore' => $params->get("readmore", "false"),
              'empty' => $params->get("empty", "false"),
              'pagination' => $params->get('pagination', 'false'),'page_count' => $params->get('page_count', '0'),'infinite_btn' => $params->get("infinite_btn", "false"),
              'button_bootstrap' => $button_bootstrap, 'cookieduration' => $params->get('cookieduration', '0'))
    );
} else {
    if ($article_cat_tag == "cat") {
        $displayfiltercat = $params->get('displayfiltercat', $displayfilter);
        $default_tag = "";
    } else {
        $displayfiltercat = $params->get('displayfiltercattags', $displayfilter);
    }

    $searchmultiex = "false";
    if ((($article_cat_tag == "tags") && ($displayfilter == "multiex"))
        || (($article_cat_tag  == "cattags") && ($displayfilter == "multiex"))
        || (($article_cat_tag == "cat") && ($displayfiltercat == "multiex"))
        || (($article_cat_tag  == "cattags") && ($displayfiltercat == "multiex"))) {
        $searchmultiex = "true";
    }
    $displayfiltertags = $params->get('displayfiltertags', $displayfilter);

    $document->addScriptOptions(
        'mod_simple_isotope_'.$module->id,
        array('entree' => $iso_entree,'article_cat_tag' => $article_cat_tag,
              'default_cat' => $default_cat,
              'default_tag' => $default_tag,
              'layout' => $iso_layout,'nbcol' => $iso_nbcol,
              'background' => $params->get("backgroundcolor", "#eee"),
              'imgmaxwidth' => $params->get('introimg_maxwidth', '0'),
              'imgmaxheight' => $params->get('introimg_maxheight', '0'),
              'sortby' => $sortBy, 'ascending' => $sortAscending,
              'searchmultiex' => $searchmultiex, 'liball' => Text::_('SSISO_LIBALL'),
              'language_filter' => $language_filter,
              'displayfiltertags' => $displayfiltertags, 'displayfiltercat' => $displayfiltercat,
              'displayrange' => $displayrange,'rangestep' => $rangestep, 'minrange' => $minrange,'maxrange' => $maxrange,
              'limit_items' => $params->get('limit_items', '0'),'displayalpha' => $displayalpha,
              'libmore' => Text::_('SSISO_LIBMORE'), 'libless' => Text::_('SSISO_LIBLESS'), 'readmore' => $params->get("readmore", "false"),
              'empty' => $params->get("empty", "false"),
              'pagination' => $params->get('pagination', 'false'),'page_count' => $params->get('page_count', '0'),'infinite_btn' => $params->get("infinite_btn", "false"),
              'button_bootstrap' => $button_bootstrap, 'cookieduration' => $params->get('cookieduration', '0'))
    );
}

if (($article_cat_tag == "fields") || ($article_cat_tag == "catfields") || ($article_cat_tag == "tagsfields")) {
    require ModuleHelper::getLayoutPath('mod_simple_isotope', 'default_fields');
} else {
    require ModuleHelper::getLayoutPath('mod_simple_isotope', 'default_cat_tags');
}
