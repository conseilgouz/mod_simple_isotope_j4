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
require_once(JPATH_SITE.'/components/com_k2/helpers/route.php');
require_once(JPATH_SITE.'/components/com_k2/helpers/utilities.php');
class ModSimpleIsotopeHelperK2 {
	static function getAllCategories_K2($params) {
		$app       = JFactory::getApplication();
		$lang = $app->getLanguageFilter()->getTag();
		$sqllang = 'AND (cat.language like "'.$lang.'" or cat.language like "*")';
		if ($params->get('language_filter','false') != 'false') {
			$sqllang = ''; // ignore lang
		}
		$db = JFactory::getDbo();
		$query = $db->getQuery(true);
		$query->select('distinct cat.id,cat.alias,count(cont.id) as count')
			->from('#__k2_categories as cat ')
			->join('left','#__k2_items cont on cat.id = cont.catid')
			->where('cat.published = 1 '.$sqllang.' and cat.access = 1 and cont.published = 1')
			->group('catid')
			;
		$db->setQuery($query);
		return $db->loadObjectList();
	}
	static function getCategory_K2($id,$params,&$tags,&$tags_alias,&$tags_note,&$tags_image,&$cats_lib, &$cats_alias, &$cats_note,&$cats_params,&$article_tags,$module,&$fields,&$article_fields,&$alpha) {
		jimport('joomla.filesystem.file');
		$application = JFactory::getApplication();
		$limit = $params->get('iso_count', 5);
		$cid = $id;
		$ordering = $params->get('itemsOrdering', '');
		$componentParams = JComponentHelper::getParams('com_k2');
		$limitstart = JRequest::getInt('limitstart');
		$show_date_format = 'Y-m-d H:i:s';
		$user = JFactory::getUser();
		$aid = $user->get('aid');
		$db = JFactory::getDbo();
		$jnow = JFactory::getDate();
		$now = $jnow->toSql();
		$nullDate = $db->getNullDate();
		$show_date_field  = $params->get('choixdate', 'modified');
		$query = "SELECT DISTINCT i.*,";
		if ($ordering == 'modified') {
			$query .= " CASE WHEN i.modified = 0 THEN i.created ELSE i.modified END as lastChanged,";
		}
		$query .= "c.name AS categoryname,c.id AS categoryid, c.alias AS categoryalias, c.params AS categoryparams";
		$query .= ", (r.rating_sum/r.rating_count) AS rating";
		$query .= " FROM #__k2_items as i RIGHT JOIN #__k2_categories c ON c.id = i.catid";
		$query .= " LEFT JOIN #__k2_rating r ON r.itemID = i.id";
		if (($params->get('cat_or_tag') == "tags") || ($params->get('cat_or_tag') == "cattags")) {
		  $tagsFilter = $params->get('tags_k2');
		}
		if(isset($tagsFilter) && is_array($tagsFilter) && count($tagsFilter)) {
			$query .= " INNER JOIN #__k2_tags_xref tags_xref ON tags_xref.itemID = i.id";
		}
		$query .= " WHERE i.published = 1 AND i.access IN(".implode(',', $user->getAuthorisedViewLevels()).") AND i.trash = 0 AND c.published = 1 AND c.access IN(".implode(',', $user->getAuthorisedViewLevels()).")  AND c.trash = 0";
		$query .= " AND ( i.publish_up = ".$db->Quote($nullDate)." OR i.publish_up <= ".$db->Quote($now)." )";
		$query .= " AND ( i.publish_down = ".$db->Quote($nullDate)." OR i.publish_down >= ".$db->Quote($now)." )";
		$query .= " AND (i.catid =".$cid.")";

		if(isset($tagsFilter) && is_array($tagsFilter) && count($tagsFilter)) {
			$query .= " AND tags_xref.tagID IN(".implode(',', $tagsFilter).")";
		}
		if (($application->getLanguageFilter()) && ($params->get('language_filter','false') == 'false')) {
			$languageTag = JFactory::getLanguage()->getTag();
			$query .= " AND c.language IN (".$db->Quote($languageTag).", ".$db->Quote('*').") AND i.language IN (".$db->Quote($languageTag).", ".$db->Quote('*').")";
		}
		$orderby = 'i.id DESC';
		$query .= " ORDER BY ".$orderby;
		$db->setQuery($query, 0, $limit);
		$items = $db->loadObjectList();
		$model = K2Model::getInstance('Item', 'K2Model');
		if (count($items)) {
			foreach ($items as $item) {
				$item->event = new stdClass;
				//Clean title
				$item->title = JFilterOutput::ampReplace($item->title);
				//Read more link
				$item->link = urldecode(JRoute::_(K2HelperRoute::getItemRoute($item->id.':'.urlencode($item->alias), $item->catid.':'.urlencode($item->categoryalias))));
				//Tags
				$tags_tmp = $model->getItemTags($item->id);
				$article_tags[$item->id] = $tags_tmp;
				for ($i = 0; $i < sizeof($tags_tmp); $i++) {
					$tags_tmp[$i]->link = JRoute::_(K2HelperRoute::getTagRoute($tags_tmp[$i]->name));
				}
				$item->tags = $tags_tmp;
				foreach ($item->tags as $tag) { 
				    if (!in_array($tag->id, $tags)) {
				       $tags[$tag->id]=$tag->name;
					   $tags_alias[$tag->id] = $tag->name; // pas d'alias
					   $tags_note[$tag_id] = ''; // K2 : no note
				    }
				}
				//Category link
				if ($params->get('itemCategory'))
					$item->categoryLink = urldecode(JRoute::_(K2HelperRoute::getCategoryRoute($item->catid.':'.urlencode($item->categoryalias))));
				//Extra fields
				if ($params->get('itemExtraFields')) {
					$item->extra_fields = $model->getItemExtraFields($item->extra_fields, $item);
				}
				// Introtext
				$item->text = '';
				if ($params->get('introtext_limit')) {
					$item->text .= K2HelperUtilities::wordLimit($item->introtext, $params->get('introtext_limit'));
					if  ($params->get('hide_more', 'false') == 'true') $item->text = trim($item->text,'...');
				}
				// Restore the intotext variable after plugins execution
				$item->introtext = $item->text;
				//Clean the plugin tags
				$item->introtext = preg_replace("#{(.*?)}(.*?){/(.*?)}#s", '', $item->introtext);
				$item->introimg = ""; 
				$date = JFactory::getDate($item->modified);
				$timestamp = '?t='.$date->toUnix();
				if (JFile::exists(JPATH_SITE.'/media/k2/items/cache/'.md5("Image".$item->id).'_S.jpg'))	{
					$item->image = JURI::base(true).'/media/k2/items/cache/'.md5("Image".$item->id).'_S.jpg';
					if ($componentParams->get('imageTimestamp')) {
						$item->image .= $timestamp;
					}
				}
				if (!empty($item->image)) { // intro img exists
					$uneimage = '<img src="'.htmlspecialchars($item->image).'">';
					$item->introimg = $uneimage; 
				}
				$introtext_img_link  = $params->get('introtext_img_link', 'false'); 
				if ($params->get('introtext_img') == 'true') { 
					if (!empty($item->image)) { // intro img exists
						$uneimage = '<img src="'.htmlspecialchars($item->image).'">';
						$item->introtext = $item->introimg.$item->introtext;
						if ($introtext_img_link == "true") { 
							$item->introtext = preg_replace('/(<img[^>]+>)/', '<a href="'.$item->link.'">$1</a>', $item->introtext,1); // only first image
						}
					}
                }
				$item->displayDate = JHtml::_('date', $item->$show_date_field, $show_date_format);
				// Extra fields plugins
				if (is_array($item->extra_fields)) {
					foreach ($item->extra_fields as $key => $extraField) {
						if ($extraField->type == 'textarea' || $extraField->type == 'textfield') {
							$tmp = new \stdClass;
							$tmp->text = $extraField->value;
							if ($params->get('JPlugins', 1)) {
								$dispatcher->trigger('onContentPrepare', array('mod_k2_content', &$tmp, &$params, $limitstart));
							}
							if ($params->get('K2Plugins', 1)) {
								$dispatcher->trigger('onK2PrepareContent', array(&$tmp, &$params, $limitstart));
							}
							$extraField->value = $tmp->text;
						}
					}
				}
				if (!in_array($item->categoryalias,$cats_alias)) {
					$cats_lib[$item->categoryid] = $item->categoryname;
					$cats_alias[$item->categoryid] = $item->categoryalias;
					$cats_note[$item->categoryid] = ''; // K2 : no note
				}
				if (!in_array(substr($item->title,0,1),$alpha)) {$alpha[] = substr($item->title,0,1);}
				
				$rows[] = $item;
			}
			return $rows;
		}
	}
	public static function cleanIntrotext($introtext)
	{
		$introtext = str_replace('<p>', ' ', $introtext);
		$introtext = str_replace('</p>', ' ', $introtext);
		$introtext = strip_tags($introtext, '<a><em><strong><br>');
		$introtext = trim($introtext);
		return $introtext;
	}
	public static function getArticlePhocaCount($text) { // 1.2.2 ; nouvelle fonction
		$regex_one		= '/({phocacount\s*)(.*?)(})/si';
		$regex_all		= '/{phocacount\s*.*?}/si';
		$matches 		= array();
		$count 			= 0;
		$count_matches	= preg_match_all($regex_all,$text,$matches,PREG_OFFSET_CAPTURE | PREG_PATTERN_ORDER);
		if ($count_matches == 0) {
			return '?';
		}
		for($i = 0; $i < $count_matches; $i++) {
			$phocacount	= $matches[0][$i][0];
			preg_match($regex_one,$phocacount,$phocacount_parts);
			$values = explode("=", $phocacount_parts[2], 2);
			$id				= $values[1];
			$db 			= JFactory::getDBO();		
			$query = 'SELECT a.hits'
					. ' FROM #__phocadownload AS a';
			$query .= ' WHERE a.id = '.(int)$id;
			$db->setQuery($query);
			$item = $db->loadResult();
			if (!empty($item)) {
				$count += $item;
			}
		}	
		return $count;
	}
	// look for {notnull}
	public static function checkNullFields($perso,$item,$phocacount) {
	    $regexopen = '/\{(?:notnull)\b(.*)\}/siU';
	    if (!preg_match($regexopen, $perso)) {
			return $perso; // no update
		}
		while (preg_match($regexopen, $perso, $matches, PREG_OFFSET_CAPTURE)) {
		    $replace_deb = $matches[0][1];
		    $replace_len = strlen($matches[0][0]);
		    $regexclose = '/\{\/notnull\}/siU';
		    preg_match($regexclose, $perso, $matchesclose, PREG_OFFSET_CAPTURE);
		    $content_deb = $replace_deb + $replace_len;
		    $content_len = $matchesclose[0][1] - $content_deb;
		    $content = substr($perso, $content_deb, $content_len);
		    $replace_len += $content_len + strlen($matchesclose[0][0]);
		    if ((strpos($content,'{rating}') !== false) && ($item->rating == "0" ))  {
		        $content = "";
		    }
		    if ((strpos($content,'{subtitle}') !== false) && ($item->subtitle == "" ))  {
		           $content = "";
		    }
		    if ((strpos($content,'{new}') !== false) && ($item->new == "" ))  {
		           $content = "";
		    }
		    /* rating count : not in K2 
			if ((strpos($content,'{ratingcnt}') !== false) && ($item->rating_count == "0" ))  {
		           $content = "";
		    }
			*/
		    if ((strpos($content,'{count}') !== false) && ($phocacount == '?')) {
		            $content = "";
		    }
		    $perso = substr($perso,0,$replace_deb).$content.substr($perso,$replace_deb + $replace_len);
		}
		return $perso;
	}
//--------------------------Alpha buttons --------------------------------//
	public static function create_alpha_buttons($alpha_arr,$button_bootstrap) {
		$result = "";
		$liball = JText::_('SSISO_LIBALL');
        $result .=  '<button class="'.$button_bootstrap.'  iso_button_alpha_tout isotope_button_first is-checked" data-sort-value="*">'.$liball.'</button>';
		asort($alpha_arr);
		foreach ($alpha_arr as $alpha) {
			$result .= "<button class='".$button_bootstrap." iso_button_alpha_".$alpha."' data-sort-value='".$alpha."' title='".$alpha."'>".$alpha;
			$result .= "</button>";
		}
		return $result; 
	}
//--------------------------Language buttons --------------------------------//
	public static function create_language_buttons($languagelist,$button_bootstrap) {
		$result = "";
		$liball = JText::_('SSISO_LIBALL');
        $result .=  '<button class="'.$button_bootstrap.'  iso_button_lang_tout isotope_button_first is-checked" data-sort-value="*">'.$liball.'</button>';
		foreach ($languagelist as $language) {
			if ($language->image) {
				$result .= "<button class='".$button_bootstrap." iso_button_lang_".$language->lang_code."' data-sort-value='".$language->lang_code."' title='".$language->title_native."'>";
				$result .= JHtml::_('image', 'mod_languages/' . $language->image . '.gif', '', null, true);
				$result .= "</button>";
			}			
		}
		return $result; 
	}
	
}
