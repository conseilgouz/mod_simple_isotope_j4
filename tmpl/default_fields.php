<?php
/**
* Simple isotope module  - Joomla Module
* Package			: Joomla 4.x/5.x
* copyright 		: Copyright (C) 2025 ConseilGouz. All rights reserved.
* license    		: https://www.gnu.org/licenses/gpl-3.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/
defined('_JEXEC') or die;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Language\LanguageHelper;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\CMS\Session\Session;
use Joomla\CMS\Uri\Uri;
use ConseilGouz\Component\CGIsotope\Site\Helper\CGHelper;
use Joomla\Component\Modules\Administrator\Helper\ModulesHelper;
use ConseilGouz\Module\SimpleIsotope\Site\Helper\SimpleIsotopeHelper as IsotopeHelper;

$uri = Uri::getInstance();
$user = Factory::getApplication()->getIdentity();
$defaultdisplay = $params->get('defaultdisplay', 'date_desc');
$displaysortinfo = $params->get('displaysortinfo', 'show');
$article_cat_tag = $params->get('cat_or_tag');
$catsfilterimg =  $params->get('catsfilterimg', 'false');
$catsfiltercount =  $params->get('catsfiltercount', 'false');
$displayfilter =  $params->get('displayfilter_f', 'button');
$tagsfilterorder = $params->get('tagsfilterorder', 'false');
$tagsfilterparent =  $params->get('tagsfilterparent', 'false');
$displayoffcanvas =  $params->get('displayoffcanvas', 'text');
$offcanvaspos = $params->get('offcanvaspos', 'start');
$offcanvasbtnpos = "leave";
if ($displayoffcanvas == "hamburger") {
    $offcanvasbtnpos =  $params->get('offcanvasbtnpos', 'leave');
}
$filtersoffcanvas = $params->get('offcanvas', 'false');

$tagsfiltercount =  $params->get('tagsfiltercount', 'false');
$tagsfilterlink =  $params->get('tagsfilterlink', 'false');
$tagsfilterlinkcls =  $params->get('tagsfilterlinkcls', 'badge bg-info text-white');

$tagsfilterimg =  $params->get('tagsfilterimg', 'false');
$splitfields = $params->get('displayfiltersplitfields', 'false');
$splitfieldstitle = $params->get('splitfieldstitle', 'false');
$fieldsfiltercount =  $params->get('fieldsfiltercount', 'false');
$blocklink =  $params->get('blocklink', 'false');
$titlelink =  $params->get('titlelink', 'true');
$language_filter = $params->get('language_filter', 'false');

$displayfilterfields =  $params->get('displayfilterfields', 'button');
$displayfiltercat = $params->get('displayfiltercatcat', $displayfilter);
$displayfiltertags = $params->get('displayfiltercattags', $displayfilter);

$displaysort =  $params->get('displaysort', 'show');
$displaybootstrap = $params->get('bootstrapbutton', 'false');
$displaysearch = $params->get('displaysearch', 'false');
$displayalpha = $params->get('displayalpha', 'false');

$imgmaxwidth = $params->get('introimg_maxwidth', '0');
$imgmaxheight = $params->get('introimg_maxheight', '0');
$params_fields = $params->get('displayfields', array());
$languagelist = array();
if ($params->get('language_filter', 'false') != 'false') { // language filter
    $languagelist = LanguageHelper::getLanguages();
}
$div_bootstrap = "";
$button_bootstrap = "isotope_button";
$col_bootstrap_sort = "";
$col_bootstrap_filter = "";
$div_bootstrap = "row";
if ($displaybootstrap == 'true') {
    HTMLHelper::_('bootstrap.button', '.selector');
    $button_bootstrap = "btn btn-sm ";
}
//==============================LAYOUTS======================================//
if ($is_component) {// coming from CG Isotope
    $layouts_prm = json_decode($params->get('layouts'));
} else {
    $layouts_prm = $params->get('layouts');
}
$layouts = [];
$layouts_order = [];
// Default values
$width = 0;
$line = 1;
$pos = 0;
if ($displaysort != "hide") {
    $values = new \stdClass();
    $values->div = "sort";
    $values->div_line = "1";
    $values->div_pos = "1";
    $pos = $values->div_pos;
    $values->div_width = "5";
    $width += 5;
    $values->div_align = "";
    $values->offcanvas = "false";
    $layouts['sort'] = $values;
}
if ($displaysearch == "true") {
    $values = new \stdClass();
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
    $values->div_align = "";
    $values->offcanvas = "false";
    $layouts['search'] = $values;
}
if ($displayfilterfields != "hide") {
    if (($article_cat_tag == 'catfields') || ($article_cat_tag == 'cattagsfields')) {
        $values = new \stdClass();
        $values->div = "cat";
        $pos += 1;
        if ($width + 6 > 12) {
            $pos = 1;
            $line += 1;
            $width = 0;
        }
        $width += 6;
        $values->div_line = $line;
        $values->div_pos = $pos;
        $values->div_width = "6";
        $values->div_align = "";
        $values->offcanvas = "false";
        $layouts['cat'] = $values;
    }
    if (($article_cat_tag == 'tagsfields') || ($article_cat_tag == 'cattagsfields')) {
        $values = new \stdClass();
        $values->div = "tag";
        $pos += 1;
        if ($width + 6 > 12) {
            $pos = 1;
            $line += 1;
            $width = 0;
        }
        $width += 6;
        $values->div_line = $line;
        $values->div_pos = $pos;
        $values->div_width = "6";
        $values->div_align = "";
        $values->offcanvas = "false";
        $layouts['tag'] = $values;
    }
    $values = new \stdClass();
    $values->div = "field";
    $values->div_width = "12";
    $pos += 1;
    if ($width + 12 > 12) {
        $pos = 1;
        $line += 1;
        $width = 0;
    }
    $width += 12;
    $values->div_line = $line;
    $values->div_pos = $pos;
    $values->div_align = "";
    $values->offcanvas = "false";
    $layouts['field'] = $values;
}
if ($displayrange == "true") {
    $values = new \stdClass();
    $values->div = "range";
    $line += 1;
    $values->div_line = $line;
    $values->div_pos = "1";
    $values->div_width = "12";
    $values->div_align = "";
    $values->offcanvas = "false";
    $layouts['range'] = $values;
}
if ($displayalpha != "false") {
    $values = new \stdClass();
    $values->div = "alpha";
    $line += 1;
    $values->div_line = $line;
    $values->div_pos = "1";
    $values->div_width = "12";
    $values->div_align = "";
    $values->offcanvas = "false";
    $layouts['alpha'] = $values;
}
if ($language_filter != "false") { // php 8
    $values = new \stdClass();
    $values->div = "lang";
    $line += 1;
    $values->div_line = $line;
    $values->div_pos = "1";
    $values->div_width = "12";
    $values->div_align = "";
    $values->offcanvas = "false";
    $layouts['lang'] = $values;
}

$values = new \stdClass();
$values->div = "iso";
$line += 1;
$values->div_line = $line;
$values->div_pos = "1";
$values->div_width = "12";
$values->div_align = "";
$values->offcanvas = "false";
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
$libreverse = Text::_('SSISO_LIBREVERSE');
$liball = Text::_('SSISO_LIBALL');
$libdate = Text::_('SSISO_LIBDATE');
$libcategory = Text::_('SSISO_LIBCAT');
$libvisit = Text::_('SSISO_LIBVISIT');
$librating = Text::_('SSISO_LIBRATING');
$libid = Text::_('SSISO_LIBID');
$libalpha = Text::_('SSISO_LIBALPHA');
$libcreated = Text::_('SSISO_LIBCREATED');
$libpublished = Text::_('SSISO_LIBPUBLISHED');
$libupdated = Text::_('SSISO_LIBUPDATED');
$librandom = Text::_('SSISO_RANDOM');
$libfilter = Text::_('SSISO_LIBFILTER');

$libblog = Text::_('SSISO_LIBBLOG');
$libfilter = Text::_('SSISO_LIBFILTER');
$libdateformat = $params->get('formatsortdate', Text::_('SSISO_DATEFORMAT'));
$libotherdateformat = $params->get('formatotherdate', Text::_('SSISO_DATEFORMAT'));
$libsearch = Text::_('SSISO_LIBSEARCH');
$libmore = Text::_('SSISO_LIBMORE');
$libsearchclear = Text::_('SSISO_SEARCHCLEAR');
if ($is_component && $params->get('show_page_heading')) {
    echo "<h1>";
    echo $this->escape($params->get('page_heading'));
    echo "</h1>";
}
if ($is_component && $params->get('intro') && (strlen(trim($params->get('intro', ''))) > 0)) {
    // apply content plugins on weblinks
    $item_cls = new \stdClass();
    $item_cls->text = $params->get('intro');
    $item_cls->params = $params;
    $item_cls->id = $com_id;
    Factory::getApplication()->triggerEvent('onContentPrepare', array('com_cgisotope.content', &$item_cls, &$item_cls->params, 0)); // Joomla 4.0
    $intro = 	$item_cls->text;
    echo $intro;
}
?>
<div id="isotope-main-<?php echo $module->id;?>" data="<?php echo $module->id;?>" class="isotope-main" ismodule="true">
<div class="isotope-div fg-row" >
<?php
// =====================================sort buttons div =================================================//
$sort_buttons_div = "";
if ($displaysort != "hide") {
    $featured = "";
    if ($params->get('btnfeature', 'false') != "false") { // featured articles always displayed first
        $featured = 'featured,';
    }
    $awidth = $layouts["sort"]->div_width;
    if (!property_exists($layouts["sort"], 'offcanvas')) {
        $layouts["sort"]->offcanvas = "false";
    }
    if ($layouts["sort"]->offcanvas == "true") {
        $awidth = 12;
    }
    $sort_buttons_div = '<div class="isotope_button-group sort-by-button-group col-md-'.$layouts["sort"]->div_width.' col-12 '.$layouts["sort"]->div_align.'" data="'.$module->id.'">';
    $checked = " is-checked ";
    if ($params->get('btndate', 'true') != "false") {
        $sens = $params->get('btndate', 'true') == 'true' ? '+' : '-';
        $sens = $defaultdisplay == "date_desc" ? "-" : $sens;
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' is-checked iso_button_date" data-sort-value="'.$featured.'date,title,category,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libdate.'</button>';
        $checked = "";
    }
    if ($params->get('btncat', 'true') != "false") {
        $sens = $params->get('btncat', 'true') == 'true' ? '+' : '-';
        $sens = $defaultdisplay == "cat_desc" ? "-" : $sens;
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_cat" data-sort-value="'.$featured.'category,title,date,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libcategory.'</button>';
        $checked = "";
    }
    if ($params->get('btnalpha', 'true') != "false") {
        $sens = $params->get('btnalpha', 'true') == 'true' ? '+' : '-';
        $sens = $defaultdisplay == "alpha_desc" ? "-" : $sens;
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_alpha" data-sort-value="'.$featured.'title,category,date,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libalpha.'</button>';
        $checked = "";
    }
    if ($params->get('btnvisit', 'true') != "false") {
        $sens = $params->get('btnvisit', 'true') == 'true' ? '+' : '-';
        $sens = $defaultdisplay == "click_desc" ? "-" : $sens;
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_click" data-sort-value="'.$featured.'click,category,title,date" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libvisit.'</button>';
        $checked = "";
    }
    if ($params->get('btnid', 'false') != "false") {
        $sens = $params->get('btnid', 'true') == 'true' ? '+' : '-';
        $sens = $defaultdisplay == "click_desc" ? "-" : $sens;
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_click" data-sort-value="'.$featured.'id" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libid.'</button>';
        $checked = "";
    }
    if ($params->get('btnrandom', 'false') != "false") {
        $sens = '';
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_random" data-sort-value="random">'.$librandom.'</button>';
        $checked = "";
    }
    if ($params->get('btnblog', 'false') != "false") {
        $sens = $params->get('btnblog', 'true') == 'true' ? '+' : '-';
        $sens = $defaultdisplay == "blog_desc" ? "-" : $sens;
        $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_blog" data-sort-value="'.$featured.'blog,category,title,date,click" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$libblog.'</button>';
        $checked = "";
    }
    if ($iso_entree != "webLinks") {
        if ((PluginHelper::isEnabled('content', 'vote')) && ($params->get('btnrating', 'true') != "false")) {
            $sens = $params->get('btnrating', 'true') == 'true' ? '+' : '-';
            $sens = $defaultdisplay == "rating_desc" ? "-" : $sens;
            $sort_buttons_div .= '<button class="'.$button_bootstrap.$checked.' iso_button_click" data-sort-value="'.$featured.'rating,category,title,date" data-init="'.$sens.'" data-sens="'.$sens.'" title="'.$libreverse.'">'.$librating.'</button>';
            $checked = "";
        }
    }
    $sort_buttons_div .= "</div>";
}
// ============================search div ============================================//
$search_div = "";
if ($displaysearch == "true") {
    $awidth = $layouts["search"]->div_width;
    if (!property_exists($layouts["search"], 'offcanvas')) {
        $layouts["search"]->offcanvas = "false";
    }
    if ($layouts["search"]->offcanvas == "true") {
        $awidth = 12;
    }
    $search_div .= '<div class="iso_search col-md-'.$awidth.' col-12 '.$layouts["search"]->div_align.'" data="'.$module->id.'">';
    $search_div .= '<input type="text" class="quicksearch" placeholder="'.$libsearch.'" style="width:80%;float:left">';
    $search_div .= '<i class="ison-cancel-squared" title="'.$libsearchclear.'" style="width:20%;float:right"></i>';
    $search_div .= '</div>';
}
//============================filter div===============================================//
$filter_div = "";
if ($displayfilterfields != "hide") {
    $filter_cat_div = "";
    $filter_tag_div = "";

    $filters = array();
    if (($article_cat_tag  == "tagsfields") || ($article_cat_tag  == "cattagsfields")) {
        if (count($tags_list) > 0) { // on a defini une liste de tags
            foreach ($tags_list as $key) {
                $filters['tags'][] = IsotopeHelper::getTagTitle($key);
            }
        }
        $sortFilter = array();
        $alias = array();
        if (count($tags_list) > 0) {
            foreach ($filters['tags'] as $filter) {
                if ($tagsfilterparent == "true") {
                    $sortFilter[] = $filter[0]->parent_alias.'&'.$filter[0]->tag;
                } else {
                    $sortFilter[] = '&'.$filter[0]->tag;
                }
                $alias[$filter[0]->tag] = $filter[0]->alias;
            }
        } else { // empty tags list: take all tags found in articles
            foreach ($iso->tags as $key => $value) {
                if ($tagsfilterparent == "true") {
                    $sortFilter[] = $iso->tags_parent_alias[$value]."&".$value;
                } else {
                    $sortFilter[] = "&".$value;
                }
                $alias[$value] = $iso->tags_alias[$value];
            }
        }
        if ($tagsfilterorder == "false") {
            asort($sortFilter, SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL); // alphabetic order
        }
        if (($displayfiltertags == "button") || ($displayfiltertags == "multi") || ($displayfiltertags == "multiex")) {
            $awidth = $layouts["tag"]->div_width;
            if (!property_exists($layouts["tag"], 'offcanvas')) {
                $layouts["tag"]->offcanvas = "false";
            }
            if ($layouts["tag"]->offcanvas == "true") {
                $awidth = 12;
            }
            $checked = "";
            if ($default_tag == "") {
                $checked = "is-checked";
            }
            if ($tagsfilterparent != "true") {
                $filter_tag_div .= '<div class="isotope_button-group filter-button-group-tags col-md-'.$awidth.' col-12 '.$layouts["tag"]->div_align.'" data-filter-group="tags" data="'.$module->id.'">';
                $filter_tag_div .= '<button class="'.$button_bootstrap.'  iso_button_tags_tout '.$checked.'" data-sort-value="*" />'.$liball.'</button>';
            } else {
                $filter_tag_div .= '<div class="col-md-'.$layouts["tag"]->div_width.' col-12 '.$layouts["tag"]->div_align.'">';
            }
            $cur_parent = '';
            foreach ($sortFilter as $aval) {
                $res = explode("&", $aval);
                $filter = $res[1];
                $parent = $res[0];
                if (($tagsfilterparent == "true") && ($cur_parent != $parent)) {
                    if ($cur_parent != '') {
                        $filter_tag_div .= "</div>";
                    }
                    $cur_parent = $parent;
                    $filter_tag_div .= '<div class="isotope_button-group filter-button-group-tags" data-filter-group="tags" data="'.$module->id.'">';
                    if ($tagsfilterparentlabel == "true") {
                        $filter_tag_div .= '<p class="iso_tags_parent_title">'.$iso->tags_parent[$alias[$filter]].'</p>';
                    }
                }
                $aff = $filter;
                $aff_alias = $alias[$filter];
                if (!is_null($aff)) {
                    $img = "";
                    if ($tagsfilterimg == "true") {
                        $tagimage  = json_decode($iso->tags_image[$aff_alias]);
                        if ((is_object($tagimage) && property_exists($tagimage, 'image_fulltext') || property_exists($tagimage, 'image_intro'))) {
                            if ($tagimage->image_intro != "") {
                                $img = '<img src="'.URI::root().$tagimage->image_intro.'" style="float:'.$tagimage->float_intro.'" 
								class="iso_tag_img" alt="'.$tagimage->image_intro_alt.'" title="'.$tagimage->image_intro_caption.'"/> ';
                            } elseif ($tagimage->image_fulltext != "") {
                                $img = '<img src="'.URI::root().$tagimage->image_fulltext.'" style="float:'.$tagimage->float_fulltext.'" 
							class="iso_tag_img" alt="'.$tagimage->image_fulltext_alt.'" title="'.$tagimage->image_fulltext_caption.'"/> ';
                            }
                        }
                    }
                    $checked = "";
                    if ($default_tag == $aff_alias) {
                        $checked = "is-checked";
                    }
                    $tagcount = '';
                    if ($tagsfiltercount == 'true') {
                        $tagcount = '<span class="tag-count badge bg-info">'.$iso->tags_count[$aff_alias].'</span>';
                    }
                    $filter_tag_div .= '<button class="'.$button_bootstrap.'  iso_button_tags_'.$aff_alias.' '.$checked.'" data-sort-value="'.$aff_alias.'" title="'.$iso->tags_note[$aff_alias].'"/>'.$img.Text::_($aff).$tagcount.'</button>';
                }
            }
            if ($tagsfilterparent == "true") {
                $filter_tag_div .= '</div>';
            }
            $filter_tag_div .= '</div>';
        } else {	// affichage Liste
            Text::script('JGLOBAL_SELECT_PRESS_TO_SELECT');
            Factory::getApplication()->getDocument()->getWebAssetManager()
                    ->useScript('webcomponent.field-fancy-select')
                    ->usePreset('choicesjs');
            $attributes = array(
                'class="isotope_select"',
                ' data-filter-group="tags"',
                ' id="isotope-select-tags"'
            );
            $selectAttr = array();

            $multiple = "";
            if ($displayfiltertags == "listmulti") {
                $libmulti = Text::_('CG_ISO_LIBLISTMULTI');
                $multiple = "  place-placeholder='".$libmulti."'";
                $selectAttr[] = ' multiple';
            }
            $filter_tag_div .= '<div class="isotope_button-group filter-button-group-tags col-md-'.$layouts["tag"]->div_width.' col-12 '.$layouts["tag"]->div_align.'" data-filter-group="tags" data="'.$module->id.'">';
            $filter_tag_div .= '<p class="hidden-phone" >'.$libfilter.' : </p>';
            $name = 'isotope-select-tags';
            $options = array();
            if ( ($params->get('tagsshowall', 'true') == 'true') || 
                 ($params->get('tagsshowall', 'true') == 'false' && ($default_tag == '' || $default_tag == 'none')) ){
                $options['']['items'][] = ModulesHelper::createOption('', $liball);
            }
            foreach ($sortFilter as $aval) {
                $res = explode("&", $aval);
                $filter = $res[1];
                $parent = $res[0];
                $aff = $filter;
                $aff_alias = $alias[$filter];
                $tagcount = '';
                if ($tagsfiltercount == 'true') {
                    $tagcount = ' ('.$iso->tags_count[$aff_alias].') ';
                }
                if (!is_null($aff)) {
                    $selected = "";
                    if ($default_tag == $aff_alias) {
                        $selected = "selected";
                    }
                    $options['']['items'][] = ModulesHelper::createOption($aff_alias, Text::_($aff).$tagcount);
                }
            }
            $filter_tag_div .= '<joomla-field-fancy-select '.implode(' ', $attributes).'>';
            $filter_tag_div .= HTMLHelper::_('select.groupedlist', $options, $name, array('id'          => $name,'list.select' => null,'list.attr'   => implode(' ', $selectAttr)));

            $filter_tag_div .= '</joomla-field-fancy-select>';
            $filter_tag_div .= '</div>';
        }

    }

    if (($article_cat_tag  == "catfields") || ($article_cat_tag  == "cattagsfields")) {
        $filter_cat_div = "";
        if (is_null($iso->categories)) {
            $keys = array_keys($iso->cats_lib);
            $filters['cat'] = $keys;
        } else {
            $filters['cat'] = $iso->categories;
        }
        $sortFilter = array();
        // category alias parameter
        if ($params->get('catfilteralias', 'false') == 'true') { // sort category aliases
            foreach ($iso->cats_alias as $key => $filter) {
                $sortFilter[$key] = $iso->cats_alias[$key];
            }
        } else { // sort category names
            foreach ($filters['cat'] as $filter) {
                if (array_key_exists($filter, $iso->cats_lib)) {
                    $sortFilter[$filter] = $iso->cats_lib[$filter];
                }
            }
        }
        if ($params->get('catfilteralias', 'false') != 'order') { // don't sort categories
            asort($sortFilter, SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL); // alphabatic order
        }
        if (($displayfiltercat == "button")  || ($displayfiltercat == "multi") || ($displayfiltercat == "multiex")) {
            $awidth = $layouts["cat"]->div_width;
            if (!property_exists($layouts["cat"], 'offcanvas')) {
                $layouts["cat"]->offcanvas = "false";
            }
            if ($layouts["cat"]->offcanvas == "true") {
                $awidth = 12;
            }
            $filter_cat_div .= '<div class="isotope_button-group filter-button-group-cat col-md-'.$awidth.' col-12 '.$layouts["cat"]->div_align.'" data-filter-group="cat" data="'.$module->id.'">';
            $checked = "";
            if ($default_cat == "") {
                $checked = "is-checked";
            }
            $filter_cat_div .= '<button class="'.$button_bootstrap.'  iso_button_cat_tout '.$checked.'" data-sort-value="*" />'.$liball.'</button>';
            foreach ($sortFilter as $key => $filter) {
                $aff = $iso->cats_lib[$key];
                $aff_alias = $iso->cats_alias[$key];
                if (!is_null($aff)) {
                    $checked = "";
                    if ($default_cat == $aff_alias) {
                        $checked = "is-checked";
                    }
                    $img = "";
                    if ($catsfilterimg == "true") {
                        $catparam  = json_decode($iso->cats_params[$key]);
                        if ($catparam->image != "") {
                            $img = '<img src="'.URI::root().$catparam->image.'"  
							class="iso_cat_img" alt="'.$catparam->image_alt.'" /> '; // pascal
                        }
                    }
                    $catcount = '';
                    if ($catsfiltercount == 'true') {
                        $catcount = '<span class="cat-count badge bg-info">'.$iso->cats_count[$key].'</span>';
                    }
                    $filter_cat_div .= '<button class="'.$button_bootstrap.'  iso_button_cat_'.$aff_alias.' '.$checked.'" data-sort-value="'.$aff_alias.'" title="'.$iso->cats_note[$key].'"/>'.$img.Text::_($aff).$catcount.'</button>';
                }
            }
            $filter_cat_div .= '</div>';
        } else {
            Text::script('JGLOBAL_SELECT_PRESS_TO_SELECT');
            Factory::getApplication()->getDocument()->getWebAssetManager()
                    ->useScript('webcomponent.field-fancy-select')
                    ->usePreset('choicesjs');
            $attributes = array(
                'class="isotope_select"',
                ' data-filter-group="cat"',
                ' id="isotope-select-cat"'
            );
            $selectAttr = array();

            $multiple = "";
            if ($displayfiltercat == "listmulti") {
                $libmulti = Text::_('CG_ISO_LIBLISTMULTI');
                $multiple = "  place-placeholder='".$libmulti."'";
                $selectAttr[] = ' multiple';
            }
            $awidth = $layouts["cat"]->div_width;
            if (!property_exists($layouts["cat"], 'offcanvas')) {
                $layouts["cat"]->offcanvas = "false";
            }
            if ($layouts["cat"]->offcanvas == "true") {
                $awidth = 12;
            }
            $filter_cat_div .= '<div class="isotope_button-group filter-button-group-cat col-md-'.$awidth.' col-12 '.$layouts["cat"]->div_align.'" data-filter-group="cat" data="'.$module->id.'">';
            $filter_cat_div .= '<p class="hidden-phone" >'.$libfilter.' : </p>';
            $name = 'isotope-select-cat';
            $options = array();
            if (($params->get('catsshowall', 'true') == 'true') || 
                     ($params->get('catsshowall', 'true') == 'false' && ($default_cat == '' || $default_cat == 'none')) ){
                $options['']['items'][] = ModulesHelper::createOption('', $liball);
            }
            foreach ($sortFilter as $key => $filter) {
                $aff = $iso->cats_lib[$key];
                $aff_alias = $iso->cats_alias[$key];
                if (!is_null($aff)) {
                    $selected = "";
                    if ($default_cat == $aff_alias) {
                        $selected = "selected";
                    }
                    $catcount = '';
                    if ($catsfiltercount == 'true') {
                        $catcount = ' ('.$iso->cats_count[$key].') ';
                    }
                    $options['']['items'][] = ModulesHelper::createOption($aff_alias, Text::_($aff).$catcount);
                }
            }
            $filter_cat_div .= '<joomla-field-fancy-select '.implode(' ', $attributes).'>';
            $filter_cat_div .= HTMLHelper::_('select.groupedlist', $options, $name, array('id'          => $name,'list.select' => null,'list.attr'   => implode(' ', $selectAttr)));
            $filter_cat_div .= '</joomla-field-fancy-select>';
            $filter_cat_div .= '</div>';
        }
    }
    if ($splitfields == "true") { // split fields buttons per field
        $group = array();
        $group_label = array();
        foreach ($iso->article_fields_names as $key_article => $one) {
            foreach ($one as $key => $onefield) {
                if (is_array($onefield)) { // multiple values field
                    foreach ($onefield as $oneobj) {
                        $obj = $iso->fields[$oneobj];
                        if ((count($params_fields) > 0)  &&  (!in_array($obj->field_id, $params_fields))) {
                            continue;
                        }
                        if (!array_key_exists($key, $group)) {
                            $val = array();
                        } else {
                            $val = $group[$key];
                        }
                        if (!in_array($oneobj, $val)) {
                            $val[$oneobj] = $obj;
                        }
                        if (!array_key_exists($key, $group_label)) {
                            $group_label[$key] = $obj->field_label;
                        }
                        $group[$key] = $val;
                    }
                } else { // single value field
                    $obj = $iso->fields[$onefield];
                    if ((count($params_fields) > 0)  &&  (!in_array($obj->field_id, $params_fields))) {
                        continue;
                    }
                    if (!array_key_exists($key, $group)) {
                        $val = array();
                    } else {
                        $val = $group[$key];
                    }
                    if (!in_array($onefield, $val)) {
                        $val[$onefield] = $obj;
                    }
                    if (!array_key_exists($key, $group_label)) {
                        $group_label[$key] = $obj->field_label;
                    }
                    $group[$key] = $val;
                }
            }
        }
        $width = $layouts['field']->div_width;
        $col_width = "col-md-".$width." col-12";
        if ($width == 12) { // full width button list: try to figure out a correct width for every group
            $col_width = "col-12 col-md-12 col-xs-12";
            if (count($group) == 2) {
                $col_width = "col-md-6 col-12";
            }
            if (count($group) == 3) {
                $col_width = "col-md-4 col-12";
            }
            if (count($group) == 4) {
                $col_width = "col-md-3 col-12";
            }
            if (count($group) == 5) {
                $col_width = "col-md-2 col-12";
            }
            if (count($group) == 6) {
                $col_width = "col-md-2 col-12";
            }
        }
        if (!property_exists($layouts["field"], 'offcanvas')) {
            $layouts["field"]->offcanvas = "false";
        }
        if ($layouts["field"]->offcanvas == "true") {
            $col_width = 12;
        }

        if (count($params_fields) == 0) {// all fields : sort otherwise keep parameter's order
            ksort($group, SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL);
        }
        if ($width <	12) {
            $group_lib = 'fields';
            $filter_div .=  '<div class="'.$col_width.'  isotope_button-group filter-button-group-fields class_fields_'.$group_lib.' '.$layouts["field"]->div_align.'" data-filter-group="'.$group_lib.'" data="'.$module->id.'">';
        }
        foreach ($group as $group_lib => $onegroup) {
            $first =  array_key_first($onegroup);
            $group_id = $onegroup[$first]->field_id;
            $filter_div .=  '<div class="'.$col_width.'  isotope_button-group filter-button-group-fields class_fields_'.$group_lib.' '.$layouts["field"]->div_align.'" data-filter-group="'.$group_lib.'" data-group-id="'.$group_id.'" data="'.$module->id.'">';

            $filter_div .= IsotopeHelper::create_buttons($iso->fields, $group_lib, $onegroup, $params, $col_width, $button_bootstrap, $splitfieldstitle, $group_label[$group_lib], $group_id, $module->id, $fieldsfiltercount, $iso->fields_count);
            $filter_div .= "</div>";
        }
        if ($params->get('splitfieldscolumn', 'false') == "true") {
            $filter_div .= '</div>';
        }
    } else { // keep fields groups together
        $group_lib = 'fields';
        $width = $layouts['field']->div_width;
        $col_width = "col-md-".$width." col-12";
        $filter_div .=  '<div class="'.$col_width.'  isotope_button-group filter-button-group-fields class_fields_'.$group_lib.' '.$layouts["field"]->div_align.'" data-filter-group="'.$group_lib.'" data="'.$module->id.'">';
        $filter_div .=  IsotopeHelper::create_buttons($iso->fields, 'fields', $iso->fields, $params, $col_width, $button_bootstrap, 'false', 'fields', 0, $module->id,$fieldsfiltercount, $iso->fields_count);
        $filter_div .= "</div>";
    }
}
//============================= isotope grid =============================================//
$width = $layouts["iso"]->div_width;
$isotope_grid_div = "";
if ($is_component && $params->get('middle') && (strlen(trim($params->get('middle', ''))) > 0)) {
    // apply content plugins
    $item_cls = new \stdClass();
    $item_cls->text = $params->get('middle');
    $item_cls->params = $params;
    $item_cls->id = $com_id;
    Factory::getApplication()->triggerEvent('onContentPrepare', array('com_cgisotope.content', &$item_cls, &$item_cls->params, 0)); // Joomla 4.0
    $isotope_grid_div = 	$item_cls->text;
}
$isotope_grid_div .= '<div class="isotope_grid col-md-'.$width.' col-12" style="padding:0" data="'.$module->id.'">'; // bootstrap : suppression du padding pour isotope
foreach ($list as $key => $category) {
    foreach ($category as $item) {
        $tag_display = "";
        $tag_img = "";
        $cat_img = "";
        if (($article_cat_tag  == "tagsfields") || ($article_cat_tag  == "cattagsfields")) { // filtre
            foreach ($iso->article_tags[$item->id] as $tag) {
                $isdefined = false; // supposed not found
                if (($params->get('tagsmissinghidden', 'false') == 'false') || ($params->get('pagination', 'false') != 'false')) {
                    $isdefined = true;
                } // don't check => ok
                foreach ($iso->article_tags[$item->id] as $tag) {
                    // ignore tags not defined in the tags list if tagsmissinghidden param is set
                    if ($tags_list && (count($tags_list) > 0) && ($params->get('tagsmissinghidden', 'false') == 'true')) {
                        $isdefined = IsotopeHelper::checkTagSet($tag->tag, $filters['tags']);
                    }
                    $tag_display .= " ".$iso->tags_alias[$tag->tag];
                    $tagimage  = json_decode($iso->tags_image[$iso->tags_alias[$tag->tag]]);
                    if (!$tagimage) {
                        continue;
                    }
                    if ((!property_exists($tagimage, 'image_fulltext')) || ($tagimage->image_fulltext == "") && ($tagimage->image_intro == "")) {
                        continue;
                    }
                    if ($tagimage->image_intro != "") {
                        $tag_img .= '<img src="'.URI::root().$tagimage->image_intro.'" style="float:'.$tagimage->float_intro.'" 
						class="iso_tag_img_art" alt="'.$tagimage->image_intro_alt.'" title="'.$tagimage->image_intro_caption.'"/> ';
                    } elseif ($tagimage->image_fulltext != "") {
                        $tag_img .=  '<img src="'.URI::root().$tagimage->image_fulltext.'" style="float:'.$tagimage->float_fulltext.'" 
						class="iso_tag_img_art" alt="'.$tagimage->image_fulltext_alt.'" title="'.$tagimage->image_fulltext_caption.'"/> ';
                    };
                }
                if (!$isdefined) {
                    continue;
                } // not in list : ignore it
            }
        }
        $cat_params = json_decode($iso->cats_params[$item->catid]);
        if (($cat_params) && ($cat_params->image != "")) {
            $cat_img = "<img src='".URI::root().$cat_params->image."' alt='".$cat_params->image_alt."' class='iso_cat_img_art'/>";
        }
        $field_value = "";
        $field_cust = array();
        $data_range = "";
        if (isset($iso->article_fields) and array_key_exists($item->id, $iso->article_fields)) {
            foreach ($iso->article_fields[$item->id] as $key_f => $tag_f) {
                if (is_array($tag_f)) { // multiple answers
                    $afield = "";
                    foreach ($tag_f as $avalue) {
                        $obj = $iso->fields[$avalue];
                        $afield .= $afield == "" ? $obj->render : ", ".$obj->render;
                    }
                    $field_cust[$key_f] = (string)$afield;
                    // $field_cust['field '.$obj->field_id] = (string)$afield; // revert this
                    $field_value .= " ".implode(' ', $tag_f);
                } else { // one field
                    $obj = $iso->fields[$tag_f];
                    if ((count($params_fields) == 0) ||  (in_array($obj->field_id, $params_fields))) {
                        $field_value .= " ".$tag_f;
                    }
                    $field_cust[$key_f] = (string)$obj->render;
                    // $field_cust['field '.$obj->field_id] = (string)$obj->render; // revert this
                }
                if (($displayrange == "true") && ($key_f == $rangetitle)  && isset($obj->val)) {
                    $data_range = " data-range='".$obj->val."' ";
                }
            };
        }
        $item->new = "";
        if ($params->get('btnnew', 'false') == 'true') {
            $nbday = $params->get('new_limit', 0);
            $tmp = date('Y-m-d H:i:s', mktime(date("H"), date("i"), 0, date("m"), date("d") - intval($nbday), date("Y")));
            $item->new = ($tmp < $item->publish_up) ? ' <span class="iso_badge_new">'.Text::_('SSISO_NEW').'</span> ' : '';
        }
        $item->subtitle = "";
        if ($params->get('btnsubtitle', 'false') == 'true') {
            // Préparation du titre
            // mise en SMALL du texte après ~ (tilde)
            list($title, $item->subtitle) = explode('~', $item->title . '~');
            $item->title = trim($title);
            if ($item->subtitle) {
                $item->subtitle = '<small>'.trim($item->subtitle).'</small>';
            }
        }
        $itemtags = "<span class='iso-tags' data='".$module->id."'>";
        foreach ($iso->article_tags[$item->id] as $tag) {
            $iso_link_cls = "";
            $iso_link_sort = "";
            if ($tagsfilterlink == 'joomla') { // joomla link to tag component
                $iso_link_cls = $iso->tags_link[$tag->alias] ? " iso_tag_link" : "";
            }
            if ($tagsfilterlink == 'iso') { // isotope filtering
                $iso_link_sort = ' data-sort-value="'.$tag->alias.'"';
                $iso_link_cls = ' iso_tag_link';
            }
            $itemtags .= '<span class="iso_tag_'.$iso->tags_alias[$tag->tag].$iso_link_cls.'"'.$iso_link_sort.'>';
            if ($tagsfilterlink == 'joomla') { // joomla link to tag component
                $itemtags .= '<a href="'.$iso->tags_link[$tag->alias].'"  target="_blank">';
            }
            if ($tagsfilterlink == 'iso') { // isotope link
                $itemtags .= '<a href="" class="text-decoration-none '.$tagsfilterlinkcls.'">';
            }
            $itemtags .= "<span class='iso_tagsep'><span>-</span></span>".$tag->tag;
            if ($tagsfilterlink == 'joomla' || $tagsfilterlink == 'iso') { // joomla link to tag component
                $itemtags .= '</a>';
            }
            $itemtags .= '</span>';
        }
        $itemtags .= "</span>";
        $ladate = $item->displayDate;
        $data_cat =  $item->category_alias;
        $click = $item->hits;
        if (!isset($item->rating)) {
            $item->rating = "";
            $item->rating_count = 0;
        }
        $t = "";
        $c = "";
        if ($blocklink == "true") {
            $t = 'onclick=go_click("'.$iso_entree.'","'.$item->link.'")';
            $c = 'isotope_pointer'; // add class cursor = pointer
        }
        $isotope_grid_div .= '<div class="isotope_item iso_cat_'.$key.' '.$field_value.' '.$c.' '.$tag_display.'" data-title="'.$item->title.'" data-category="'.$data_cat.'" data-date="'.$ladate.'" data-click="'.$click.'"data-rating="'.$item->rating.'" data-id="'.$item->id.'" data-blog="'.$item->ordering.'" data-featured="'.$item->featured.'" data-lang="'.$item->language.'" data-alpha="'.substr($item->title, 0, 1).'"  '.$data_range.$t.'>';
        $canEdit = $user->authorise('core.edit', 'com_content.article.'.$item->id);
        if ($canEdit) {
            $isotope_grid_div .=  '<span class="edit-icon">';
            $isotope_grid_div .=  '<a href="index.php?option=com_content&task=article.edit&a_id='.$item->id.'&return='.base64_encode($uri).'">';
            $isotope_grid_div .=  '<img src="media/system/images/edit.png" alt="modifier" class="iso-img-max-width"></a>';
            $isotope_grid_div .=  '</span>';
        }
        // prise en charge sous-titre par tilde et badge nouveau
        $item->new = "";
        if ($params->get('btnnew', 'false') == 'true') {
            $nbday = $params->get('new_limit', 0);
            $tmp = date('Y-m-d H:i:s', mktime(date("H"), date("i"), 0, date("m"), date("d") - intval($nbday), date("Y")));
            $item->new = ($tmp < $item->publish_up) ? ' <span class="iso_badge_new">'.Text::_('CG_ISO_NEW').'</span> ' : '';
        }
        $item->subtitle = "";
        if ($params->get('btnsubtitle', 'false') == 'true') {
            // Préparation du titre
            // mise en SMALL du texte après ~ (tilde)
            // + BR si texte > 10 car
            list($title, $item->subtitle) = explode('~', $item->title . '~');
            $item->title = trim($title);
            if ($item->subtitle) {
                $item->subtitle = '<small>'.trim($item->subtitle).'</small>';
            }
        }
        // fin prise en charge sous-titre par tilde et badge nouveau

        if ($titlelink == "true") {
            $title = '<a href="'.$item->link.'">'.$item->title.'</a>';
        } else {
            $title =  $item->title;
        }
        $rating = "";
        for ($i = 1; $i <= $item->rating; $i++) {
            $rating .= '<img src='.$modulefield.'images/icon.png />';
        }
        $deb = '{';
        $end = '}';
        if ($params->get('bracket', 'bracket') == 'squarred') {
            $deb = '[';
            $end = ']';
        }
        $phocacount = IsotopeHelper::getArticlePhocaCount($item->fulltext);
        $choixdate = $params->get('choixdate', 'modified');
        $libdate = $choixdate == "modified" ? $libupdated : ($choixdate == "created" ? $libcreated : $libpublished);
        $perso = $params->get('perso');
        $perso = IsotopeHelper::checkNullFields($perso, $item, $phocacount, $deb, $end); // suppress null field if required
        $arr_css = array("title" => $title, "cat" => $iso->cats_lib[$item->catid],"date" => $libdate.date($libdateformat, strtotime($item->displayDate)),"create" => HTMLHelper::_('date', $item->created, $libotherdateformat),"pub" => HTMLHelper::_('date', $item->publish_up, $libotherdateformat),"modif" => HTMLHelper::_('date', $item->modified, $libotherdateformat), "visit" => $item->hits, "intro" => $item->displayIntrotext,"stars" => $rating,"ratingcnt" => $item->rating_count,"count" => $phocacount,"tagsimg" => $tag_img, "catsimg" => $cat_img, "tags" => $itemtags);
        foreach ($arr_css as $key_c => $val_c) {
            $perso = str_replace($deb.$key_c.$end, Text::_($val_c), $perso);
        }
        foreach ($field_cust as $key_f => $val_f) { // display fields values
            $perso = str_replace($deb.$key_f.$end, Text::_($val_f), $perso);
        }
        $perso = IsotopeHelper::checkNoField($perso, $deb, $end); // suppress empty fields

        $perso = IsotopeHelper::checkDBFields($item, $perso, $deb, $end); // check if any field from db definition is left

        // apply content plugins
        $app = Factory::getApplication(); // Joomla 4.0
        $item_cls = new \stdClass();
        $item_cls->id = $item->id;
        $item_cls->text = $perso;
        $item_cls->params = $params;
        $app->triggerEvent('onContentPrepare', array('com_content.article', &$item_cls, &$item_cls->params, 0)); // Joomla 4.0
        $perso = 	$item_cls->text;

        $isotope_grid_div .=  $perso;
        if ($params->get('readmore', 'false') != 'false') {
            $isotope_grid_div .=  '<p class="isotope-readmore">';
            $isotope_grid_div .= '<a class="isotope-readmore-title"  data-articleid="'.$item->id.'" data-href="'.$item->link.'" href="'.$item->link.'">';
            $isotope_grid_div .=  Text::_('SSISO_READMORE');
            $isotope_grid_div .=  '</a></p>';
        }
        $isotope_grid_div .=  '</div>';
    }
}
// ============================range div ==============================================//
$isotope_range_div = "";
if ($displayrange == "true") {
    $awidth = $layouts["range"]->div_width;
    if (!property_exists($layouts["range"], 'offcanvas')) {
        $layouts["range"]->offcanvas = "false";
    }
    if ($layouts["range"]->offcanvas == "true") {
        $awidth = 12;
    }
    $isotope_range_div = '<div class="iso_range col-md-'.$awidth.' col-12 '.$layouts["range"]->div_align.'" data="'.$module->id.'">';
    $isotope_range_div .= '<div class="col-12"><label title="'.$rangedesc.'">'.$rangelabel.'</label></div><div class="col-12 col-md-12"><input type="text" id="rSlider" data="'.$module->id.'"/></div>';
    $isotope_range_div .= '</div>';
}
// ============================alpha div ==============================================//
$isotope_alpha_div = "";
if ($displayalpha != "false") {
    $awidth = $layouts["alpha"]->div_width;
    if (!property_exists($layouts["alpha"], 'offcanvas')) {
        $layouts["alpha"]->offcanvas = "false";
    }
    if ($layouts["alpha"]->offcanvas == "true") {
        $awidth = 12;
    }
    $isotope_alpha_div = '<div class="isotope_button-group filter-button-group-alpha iso_alpha col-md-'.$awidth.' col-12 '.$layouts["alpha"]->div_align.'" data-filter-group="alpha" data="'.$module->id.'">';
    $isotope_alpha_div .= IsotopeHelper::create_alpha_buttons($iso->alpha, $button_bootstrap);
    $isotope_alpha_div .= '</div>';
}
// =============================Lang. filter ============================================//
$isotope_lang_div = "";
if (($language_filter == "button") || ($language_filter == "multi")) {
    $awidth = $layouts["lang"]->div_width;
    if (!property_exists($layouts["lang"], 'offcanvas')) {
        $layouts["lang"]->offcanvas = "false";
    }
    if ($layouts["lang"]->offcanvas == "true") {
        $awidth = 12;
    }
    $isotope_lang_div = '<div class="isotope_button-group iso_lang col-md-'.$awidth.' col-12 '.$layouts["lang"]->div_align.'" data-filter-group="lang" data="'.$module->id.'">';
    $isotope_lang_div .= IsotopeHelper::create_language_buttons($languagelist, $button_bootstrap);
    $isotope_lang_div .= '</div>';
}
//=====================================layouts==============================================//
ksort($layouts_order, SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL); // order
$val = 0;
$line = 0;
$offcanvas = false;
$offcanvasopened = false;
foreach ($layouts_order as $layout) {
    $key = (string)$layout;
    $obj = $layouts[$key];
    $val = $obj->div_width;
    $line = $obj->div_line;
    if (!property_exists($layouts[$key], 'offcanvas')) {
        $layouts[$key]->offcanvas = "false";
        $obj->offcanvas = "false";
    }
    if ($obj->div == "iso") {// no offcanvas on iso
        $obj->offcanvas = "false";
    }
    if ($line == 0) {
        $line = $obj->div_line;
    }
    if ($offcanvasopened) {
        if ($obj->offcanvas == "false") {
            $offcanvasopened = false;
            echo "</div></div>";
        }
    }
    $offcanvas = ($obj->offcanvas == "true");
    if ($offcanvas && !$offcanvasopened) {// offcanvas
        \Joomla\CMS\HTML\HTMLHelper::_('bootstrap.offcanvas', '.selector', []);
        $offcanvasopened = true;
        echo '<div class="col-md-'.$obj->div_width.'" id="offcanvas-clone">';
        $offcanvasbtnpos = ($offcanvasbtnpos == "leave") ? "" : $offcanvasbtnpos;
        echo '<a class="'.$button_bootstrap.' btn-info navbar-dark '.$offcanvasbtnpos.'" data-bs-toggle="offcanvas" href="#offcanvas'.$obj->div.'" role="button" aria-controls="offcanvas'.$obj->div.'"  title="Filtre" id="offcanvas-hamburger-btn">';
        if ($displayoffcanvas == 'hamburger') {
            echo '<span class="navbar-toggler-icon"></span>';
        } else {
            echo '<span class="navbar-toggler-text">'.Text::_('SSISO_LIBFILTER').'</span>';
        }
        echo '</a><div id="clonedbuttons" data="'.$module->id.'"></div></div>';
        echo '<div class="offcanvas offcanvas-'.$offcanvaspos.'" tabindex="-1" id="offcanvas'.$obj->div.'" aria-labelledby="offcanvas'.$obj->div.'Label" data-bs-scroll="true">';
        $liboff = Text::_('SSISO_LIBFILTER');
        echo '<div class="offcanvas-header"><h5 class="offcanvas-title" id="offcanvas'.$obj->div.'Label">'.$liboff.'</h5>';
        echo '<button type="button" class="btn ison-cancel-squared" title="'.Text::_('CG_ISO_CLEAR_FILTER').'" data="'.$module->id.'">'.Text::_('CG_ISO_CLEAR_FILTER').'</button>';
        echo '<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" title="'.Text::_('CG_ISO_CLOSE').'"></button>';
        echo '</div><div class="offcanvas-body">';
    }
    if (($val > 12) || (($obj->div_width == 12) && ($val > 12)) || ($line < $obj->div_line)) { // new line needed
        if (($obj->div == "iso") && ($obj->div_width == 12)) {
            echo "</div><div>";
        } else {
            echo "</div><div class='row'>";
        }
        $val = $obj->div_width;
        if ($line < $obj->div_line) { // requested new line
            $line = $obj->div_line;
        } else { // calculated new line
            $line += 1;
        }
    }
    if ($obj->div == "search") {
        echo $search_div;
    }
    if ($obj->div == "sort") {
        echo $sort_buttons_div;
    }
    if ($obj->div == "cat") {
        echo $filter_cat_div;
    }
    if ($obj->div == "tag") {
        echo $filter_tag_div;
    }
    if ($obj->div == "field") {
        echo $filter_div;
    }
    if ($obj->div == "iso") {
        echo $isotope_grid_div;
    }
    if ($obj->div == "lang") {
        echo $isotope_lang_div;
    }
    if ($obj->div == "range") {
        echo $isotope_range_div;
    }
    if ($obj->div == "alpha") {
        echo $isotope_alpha_div;
    }
}
?>
</div>
</div>
<?php
$width = $layouts["iso"]->div_width;
if ($params->get('readmore', 'false') == 'iframe') {
    echo '<div id="isotope_an_article" class="isotope_an_article col-md-'.$width.' col-12 isotope-hide" ><button type="button" class="close">X</button><iframe src="" id="isotope_article_frame"></iframe></div>';
} elseif ($params->get('readmore', 'false') == 'ajax') {
    echo '<input id="token" type="hidden" name="' . Session::getFormToken() . '" value="1" />';
    echo '<div id="isotope_an_article" class="isotope_an_article col-md-'.$width.' col-12 isotope-hide" ></div>';
} elseif ($params->get('readmore', 'false') == 'modal') {
    HTMLHelper::_('bootstrap.modal', '.modal_iso');
    $link = 'modules/mod_'.$module->name.'/tmpl/wait.html';
    echo ' <div class="modal_iso modal modal-xl"  id="modalsrc_'.$module->id.'_id"  aria-labelledby="iframemodalsrc_'.$module->id.'_id" aria-hidden="true">
            <div class="modal-dialog" style="height:90vh">
                <div class="modal-content h-100 ">
                    <div class="modal-header">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body h-100 w-100">
                        <iframe id="iframemodalsrc_'.$module->id.'_id" height="100%" width="100%" src="'.$link.'" name="iframe_modal"></iframe>
                    </div>
                </div>
            </div>
            </div>';
}
?>
<div class="iso_div_empty iso_hide_elem">
	<?php echo Text::_('SSISO_EMPTY'); ?>
</div>
<div class="iso_div_more">
<button class="<?php echo $button_bootstrap;?> iso_button_more" data="<?php echo $module->id;?>"><?php echo $libmore;?></button>
</div>
</div>
	<?php if (($iso_entree != "webLinks") && ($params->get('pagination', 'true') == 'true')) {?> 
	<div class="pagination isotope-pagination">	
	<?php $lapagination = $pagination->getPagesLinks($params);
	    echo $lapagination;
	    ?>
    </div>
	<?php } if ($params->get('pagination', 'true') == 'infinite') { ?>
<div class="page-load-status">
  <div class="loader-ellips infinite-scroll-request">
    <span class="loader-ellips__dot"></span>
    <span class="loader-ellips__dot"></span>
    <span class="loader-ellips__dot"></span>
    <span class="loader-ellips__dot"></span>
  </div>
  <p class="infinite-scroll-last"><?php echo Text::_('CG_ISO_END_OF_CONTENT'); ?></p>
  <p class="infinite-scroll-error"><?php echo Text::_('CG_ISO_NO_MORE_PAGE'); ?></p>
</div>
<?php } ?>
<?php if ($is_component && (strlen(trim($params->get('bottom', ''))) > 0)) {
    // apply content plugins on weblinks
    $item_cls = new \stdClass();
    $item_cls->text = $params->get('bottom');
    $item_cls->params = $params;
    $item_cls->id = $com_id;
    Factory::getApplication()->triggerEvent('onContentPrepare', array('com_cgisotope.content', &$item_cls, &$item_cls->params, 0)); // Joomla 4.0
    $bottom = 	$item_cls->text;
    $bottom = str_replace('{cg-version}', CGHelper::getCGVersion(), $bottom);
    $bottom = str_replace('{cg-name}', CGHelper::getCGName(), $bottom);
    echo $bottom;
}
?>

