<?php
/**
* Simple isotope module  - Joomla Module 
* Version			: 4.1.2
* Package			: Joomla 4.x.x
* copyright 		: Copyright (C) 2022 ConseilGouz. All rights reserved.
* license    		: http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
* From              : isotope.metafizzy.co
*/
namespace ConseilGouz\Module\SimpleIsotope\Site\Helper;
defined('_JEXEC') or die;
use Joomla\CMS\Factory;
use Joomla\Registry\Registry;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Access\Access;
use Joomla\CMS\Router\Route; 
use \Joomla\Component\Fields\Administrator\Helper\FieldsHelper;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\Component\Content\Site\Model\ArticlesModel;
use Joomla\Component\Content\Site\Model\ArticleModel;
use Joomla\Component\Content\Site\Helper\RouteHelper; 
use Joomla\CMS\Filter;
use  Joomla\CMS\Filter\OutputFilter as FilterOutput;
use Joomla\Component\Modules\Administrator\Helper\ModulesHelper;
use Joomla\CMS\Response\JsonResponse;

class SimpleIsotopeHelper
{
	public static function getCGName() {
		return 'Simple Isotope';
	}
    public static function getCGVersion() {
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		$query->select('manifest_cache');
		$query->from($db->quoteName('#__extensions'));
		$query->where('name = "' . self::getCGName() . '"');
		$db->setQuery($query);
		$manifest = json_decode($db->loadResult(), true);
		return $manifest['version'];		
	}

	public static function getWebLinks(&$params,$weblinks_params,&$tags,&$tags_alias,&$tags_note,&$tags_image,&$tags_parent,&$tags_parent_alias,&$article_tags,&$cats_lib, &$cats_alias,&$cats_note, &$cats_params ,&$fields,&$article_fields, &$article_fields_names,$rangefields,&$alpha) {
			$options = array();
			$options['countItems'] = $params->get('show_cat_num_links', 1) || !$params->get('show_empty_categories_cat', 0);
			$categories = self::getAllCategories($params);
			$introtext_img  = $params->get('introtext_img', 'false');
				
			if (!$categories) {
				Factory::getApplication()->enqueueMessage(Text::_('Module Simple Isotope : pas de cat&eacute;gorie liens web'), 'notice');
				return false; // pas de cat�gorie: on sort
			}
			$sel_cat = $params->get('wl_categories',array());
			foreach ($categories as  $categorie) {	
				if (count($sel_cat) > 0) {
				     if (in_array($categorie->id,$sel_cat)) { // found in categories selection list
    				     $result[$categorie->id] = self::getWebLinksCategorie($categorie->id,$categorie->alias,$introtext_img,$weblinks_params,$tags,$tags_alias,$tags_note,$tags_image,$tags_parent,$tags_parent_alias,$article_tags,$cats_lib, $cats_alias, $cats_note, $cats_params, $fields,$article_fields, $article_fields_names,$rangefields,$alpha,$params);
					 }
				} else { // take all categories
				     $result[$categorie->id] = self::getWebLinksCategorie($categorie->id,$categorie->alias,$introtext_img,$weblinks_params,$tags,$tags_alias,$tags_note,$tags_image,$tags_parent,$tags_parent_alias,$article_tags,$cats_lib, $cats_alias , $cats_note, $cats_params ,$fields,$article_fields, $article_fields_names,$rangefields,$alpha,$params);
			    }
			}
			return $result;
	}

	public static function getWebLinksCategorie($id,$alias,$introtext_img,$wl_params,&$tags,&$tags_alias,&$tags_note, &$tags_image, &$tags_parent,&$tags_parent_alias,&$article_tags,&$cats_lib, &$cats_alias, &$cats_note,&$cats_params,&$fields,&$article_fields, &$article_fields_names,$rangefields,&$alpha,$params)
	{
		$introtext_img_link  = $params->get('introtext_img_link', 'false');
		
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		$query->select('*')
			->from('#__weblinks AS u')
			->where('catid = '.(int)$id.' AND state = 1')
			;
		$db->setQuery($query);
		$items= $db->loadObjectList();
		if ($items)
		{
			foreach ($items as $item)
			{ // link to update click counter (visits)
				$item->link	= Route::_('index.php?option=com_weblinks&task=weblink.go&catid=' . $id . ':'.$alias.'&id=' . $item->id.':'.$item->alias);
				$images  = json_decode($item->images);
				$item->introimg = ""; 			
				if (!empty($images->image_first)) { // first img exists
					$imgfloat = (empty($images->float_first)) ? $wl_params->get('float_first') : $images->float_first;
					$float = 'style="float:'.$imgfloat.'"';
					$uneimage = '<div class="iso_img_'.$imgfloat.'"><img src="'.htmlspecialchars($images->image_first).'" alt="'.htmlspecialchars($images->image_first_alt).'" '.$float.' class="iso_img_'.$imgfloat.'"></div>';
					$item->introimg = $uneimage; 
				}
				if ($introtext_img == "true") { // first image
					if (!empty($images->image_first)) { // first img exists
						$item->description = self::cleanIntrotext($item->description,$params); // remove img
						$item->description = $item->introimg.$item->description;
						if ($introtext_img_link == "true") { 
							$item->description = preg_replace('/(<img[^>]+>)/', '<a href="'.$item->link.'">$1</a>', $item->description,1); // only first image
						}
					}
					else { // no intro img: keep article imag if it exists
						$item->description = self::cleanIntrotext_keepimg($item->description,$params);
						if ($introtext_img_link == "true") { 
							$item->description = preg_replace('/(<img[^>]+>)/', '<a href="'.$item->link.'">$1</a>', $item->description,1); // only first image
						}
					}
				} else { // no intro img needed
					$item->description = self::cleanIntrotext($item->description,$params);
				}
				$test = FieldsHelper::getFields('com_weblinks.weblink',$item);
				foreach ($test as $field) {
					if (property_exists($field,'value')) {
                           $val = $field->value;
						if (!is_array($val)) {
                               $alias_sort = FilterOutput::stringURLSafe((string)$val);
                           }
					}
					if (($field->id == $rangefields) && ($field->value !="") ) { // min/max range values
						$rangetitle = $field->title;
						$rangelabel = $field->label;
						$rangedesc = $field->description;
						if (($field->value < $minrange) || ($minrange == ''))  $minrange =$field->value;
						if (($field->value > $maxrange) || ($minrange == ''))  $maxrange =$field->value;
					}
					$param = json_decode($field->fieldparams);
					if (property_exists($param,'options')) { // fields with options
						$ix_field = 0;
						foreach ($param->options as $option) {
							if (is_array($field->value)) { // multiple field values
								foreach ($field->value as $avalue) {
									if ($option->value == $avalue) {
										$val=$option->name;
										$alias_sort = FilterOutput::stringURLSafe((string)$ix_field.'_'.$option->name);
										$alias =  FilterOutput::stringURLSafe((string)$val);
										if ($alias == "") {continue;} 
										$article_fields[$item->id][$field->title][] = $alias; 
										$article_fields_names[$item->id][$field->name][] = $alias; 
										if (!in_array($alias, $fields)) {
											$fields[$alias] = self::field_info($item,$val,$alias,$alias_sort,$field,$params,'weblink');
										}
									}
								}
							} else { // one field value
								if ($option->value == $field->value) {
									$val=$option->name;
									$alias_sort = FilterOutput::stringURLSafe((string)$ix_field.'_'.$val);
									$alias =  FilterOutput::stringURLSafe((string)$val);
									if ($alias == "") {continue;} 
									$article_fields[$item->id][$field->title] = $alias; 
									$article_fields_names[$item->id][$field->name] = $alias; 
									if (!in_array($alias, $fields)) {
										$fields[$alias]=self::field_info($item,$val,$alias,$alias_sort,$field,$params,'weblink');
									}
									$ix_field +=1;  
								}
							} 
						}
					} else { // not an option field
						if (is_string($val)) {  // 30/09/2021 : ignore if not string
							$alias =  FilterOutput::stringURLSafe((string)$val); 
							if (!in_array($alias, $fields)) {
								if ($alias == "") {continue;} 
								$article_fields[$item->id][$field->title] = $alias; 
								$article_fields_names[$item->id][$field->name] = $alias; 
								$fields[$alias]=self::field_info($item,$val,$alias,$alias_sort,$field,$params,'weblink');
							}
						}	
					}
				}
				$authorised = Access::getAuthorisedViewLevels(Factory::getUser()->get('id'));				
				$article_tags[$item->id] = self::getWebLinkTags($item->id,$authorised); // article's tags
				foreach ($article_tags[$item->id] as $tag) { 
					if (!in_array($tag->tag, $tags)) {
						$tags[]=$tag->tag;
						$tags_alias[$tag->tag] = $tag->alias;
						$tags_image[$tag->alias] = $tag->images;
						$tags_note[$tag->alias] = $tag->note; 
						$tags_parent[$tag->alias] = $tag->parent_title;
						$tags_parent_alias[$tag->alias] = $tag->parent_alias;
					}
				}
				$info_cat = self::getCategoryName($item->catid);
				if (!in_array($info_cat[0]->alias,$cats_alias)) {
				    $cats_lib[$item->catid] = $info_cat[0]->title;
				    $cats_alias[$item->catid] = $info_cat[0]->alias;
					$cats_note[$item->catid] = $info_cat[0]->note; 
					$cats_params[$item->catid] = $info_cat[0]->params;
				}
				if (!in_array(substr($item->title,0,1),$alpha)) {$alpha[] = substr($item->title,0,1);}
			}
			return $items;
		}
		return false;
	}	
    public static function getCategoryName($id) 
	{
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		$query->select('*')
			->from('#__categories ')
			->where('id = '.(int)$id)
			;
		$db->setQuery($query);
		return $db->loadObjectList();
	}
	static function getAllCategories($params) {
		$app  = Factory::getApplication();
	    $lang = Factory::getLanguage()->getTag();
		$sqllang = 'AND (cat.language like "'.$lang.'" or cat.language like "*")';
		if ($params->get('language_filter','false') != 'false') {
			$sqllang = ''; // ignore lang
		}
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		if ($params->get('iso_entree', 'webLinks') == 'webLinks') {
			$query->select('distinct cat.id,cat.alias, count(cont.id) as count, cat.note')
			->from('#__categories as cat ')
			->join('left','#__weblinks cont on cat.id = cont.catid')
			->where('extension like "com_weblinks" AND cat.published = 1 '.$sqllang.' and cat.access = 1 and cont.state = 1')
			->group('catid')
			;
		} else {
			$query->select('distinct cat.id,count(cont.id) as count,cat.note')
			->from('#__categories as cat ')
			->join('left','#__content cont on cat.id = cont.catid')
			->where('extension like "com_content" AND cat.published = 1 '.$sqllang.' and cat.access = 1 and cont.state = 1')
			->group('catid')
			;
		}
		$db->setQuery($query);
		return $db->loadObjectList();
	}
	static function getItems($categories,$params,&$tags,&$tags_alias,&$tags_note, &$tags_image,&$tags_parent,&$tags_parent_alias,&$cats_lib, &$cats_alias, &$cats_note, &$cats_params, &$article_tags,$module,&$fields,&$article_fields, &$article_fields_names, &$pagination,$start, $limit,$order,$rangefields,&$rangetitle,&$rangelabel,&$rangedesc,&$minrange,&$maxrange,&$alpha ) {
		
		$articles     = new ArticlesModel(array('ignore_request' => true));
		if ($articles) {
		$app       = Factory::getApplication();
		$appParams = $app->getParams();
		$articles->setState('params', $appParams);
		$articles->setState('list.start', $start);
		$articles->setState('list.limit', $limit);
		$articles->setState('filter.published', 1);
		$access     = true; // check user access level
		$authorised = Access::getAuthorisedViewLevels(Factory::getUser()->get('id'));
		$articles->setState('filter.access', $access);
		$articles->setState('filter.viewlevels', $authorised);
		$catids = $categories;
		$articles->setState('filter.category_id', $catids);		
		$articles->setState('filter.category_id.include', (bool) $params->get('category_filtering_type', 1));
		if (strpos((string)$order,'ASC') !== false)  { 
			$articles->setState('list.direction','ASC');
			$order = substr($order,0,strlen($order) - 3);
		}
		if (strpos((string)$order,'DESC') !== false)  { 
			$articles->setState('list.direction','DESC');
			$order = substr($order,0,strlen($order) - 4);
		}
		if ($order == 'random') { // random order
		    // $articles->setState('list.direction','RAND()');
		    $order = 'RAND()';
		}
		$articles->setState('list.ordering',$order);
		$articles->setState('filter.featured', 'show');
		$articles->setState('filter.author_id',"");
		$articles->setState('filter.author_id.include', 1);
		$excluded_articles = '';
		$date_filtering = 'off';
		if ($params->get('language_filter','false') == 'false') {
			$articles->setState('filter.language', $app->getLanguageFilter());
		}
		$items = $articles->getItems();
		$pagination = $articles->getPagination(); 
		$introtext_limit  = $params->get('introtext_limit', 100);
		$introtext_img  = $params->get('introtext_img', 'false');
		$introtext_img_link  = $params->get('introtext_img_link', 'false'); 
		$show_date_field  = $params->get('choixdate', 'modified');
		$show_date        = true;
		$show_introtext   = true;
		$show_category    =  true;
		$show_hits        =  0;
		$show_author      =  0;
		$show_date_format = 'Y-m-d H:i:s';
		foreach ($items as &$item)
		{
			$images  = json_decode($item->images);			
			$item->introimg = ""; 
			if (!empty($images->image_intro)) { // into img exists
				$uneimage = '<img src="'.htmlspecialchars($images->image_intro).'" alt="'.htmlspecialchars($images->image_intro_alt).'">';
				$item->introimg =$uneimage; 
			}
			$item->slug    = $item->id . ':' . $item->alias;
			$item->catslug = $item->catid . ':' . $item->category_alias;
			if ($access || in_array($item->access, $authorised))
			{
				$item->link = Route::_(RouteHelper::getArticleRoute($item->slug, $item->catid, $item->language));
			}
			else
			{
				$menu      = $app->getMenu();
				$menuitems = $menu->getItems('link', 'index.php?option=com_users&view=login');
				if (isset($menuitems[0])) {
					$Itemid = $menuitems[0]->id;
				}
				elseif ($app->input->getInt('Itemid') > 0) {
					$Itemid = $app->input->getInt('Itemid');
				}
				$item->link = Route::_('index.php?option=com_users&view=login&Itemid=' . $Itemid);
			}
			$item->displayDate = '';
			if ($show_date)	{
			    if (!is_numeric($show_date_field)) {
				    $item->displayDate = HTMLHelper::_('date', $item->$show_date_field, $show_date_format);
			    }
			}
			if ($item->catid) {
				$item->displayCategoryLink  = Route::_(RouteHelper::getCategoryRoute($item->catid));
				$item->displayCategoryTitle = $show_category ? '<a href="' . $item->displayCategoryLink . '">' . $item->category_title . '</a>' : '';
			}
			else {
				$item->displayCategoryTitle = $show_category ? $item->category_title : '';
			}
			$item->displayHits       = $show_hits ? $item->hits : '';
			$item->displayAuthorName = $show_author ? $item->author : '';
			if ($show_introtext) {
				if (!strpos((string)$item->introtext,'{loadposition '.$module->position.'}')) { // ignore current module position
					$item->introtext = HTMLHelper::_('content.prepare', $item->introtext, '', 'mod_articles_category.content');
				}
				if ($introtext_limit == 0) { // no text
					$item->introtext = "";
				}
				if ($introtext_img == "true") { 
					if (!empty($images->image_intro)) { // intro img exists
						$item->introtext = self::cleanIntrotext($item->introtext,$params); // remove img
						$item->introtext = $item->introimg.$item->introtext;
						if ($introtext_img_link == "true") { 
							$item->introtext = preg_replace('/(<img[^>]+>)/', '<a href="'.$item->link.'">$1</a>', $item->introtext,1); // only first image
						}
					}	else { // no intro img: keep article imag if it exists
						$item->introtext = self::cleanIntrotext_keepimg($item->introtext,$params);
						if ($introtext_img_link == "true") { 
							$item->introtext = preg_replace('/(<img[^>]+>)/', '<a href="'.$item->link.'">$1</a>', $item->introtext,1); // only first image
						}
					}
				} else { // no intro img needed
					$item->introtext = self::cleanIntrotext($item->introtext,$params);
				}
			}
			if ($introtext_limit == 500) { // full text
				$item->displayIntrotext = $show_introtext ? self::truncate($item->introtext, 0) : '';
			} else {
				$item->displayIntrotext = $show_introtext ? self::truncate($item->introtext, $introtext_limit) : '';
				if (($params->get('hide_more', 'false') == 'true') && (substr($item->displayIntrotext, -3, 3) == '...')) { // suppress ... if present
					$item->displayIntrotext = substr($item->displayIntrotext, 0, -3); 
				}
			}
			$item->displayReadmore  = $item->alternative_readmore;
			$article_tags[$item->id] = self::getArticleTags($item->id,$authorised); // article's tags
			foreach ($article_tags[$item->id] as $tag) { 
				if (!in_array($tag->tag, $tags)) {
					$tags[]=$tag->tag;
					$tags_alias[$tag->tag] = $tag->alias;
					$tags_image[$tag->alias] = $tag->images;
					$tags_note[$tag->alias] = $tag->note; 
					$tags_parent[$tag->alias] = $tag->parent_title;					
					$tags_parent_alias[$tag->alias] = $tag->parent_alias;					
					
				}
			}
			$params_fields = $params->get('displayfields');  // fields 
			$test = FieldsHelper::getFields('com_content.article',$item);
		    foreach ($test as $field) {
		        if (property_exists($field,'value')) {
                            $val = $field->value;
                            if (!is_array($val)) {
                                $alias_sort = FilterOutput::stringURLSafe((string)$val);
                            }
		        }
		        if (($field->id == $rangefields) && ($field->value !="") ) { // min/max range values
		            $rangetitle = $field->title;
		            $rangelabel = $field->label;
		            $rangedesc = $field->description;
		            if (($field->value < $minrange) || ($minrange == ''))  $minrange =$field->value;
		            if (($field->value > $maxrange) || ($minrange == ''))  $maxrange =$field->value;
		        }
				
			    $param = json_decode($field->fieldparams);
			    if (property_exists($param,'options')) { // fields with options
			        $ix_field = 0;
			        foreach ($param->options as $option) {
                         if (is_array($field->value)) { // multiple field values
                            foreach ($field->value as $avalue) {
                                if ($option->value == $avalue) {
                                    $val=$option->name;
									$alias_sort = FilterOutput::stringURLSafe((string)$ix_field.'_'.$option->name);
							        $alias =  FilterOutput::stringURLSafe((string)$val);
						            if ($alias == "") {continue;} 
						            $article_fields[$item->id][$field->title][] = $alias; 
						            $article_fields_names[$item->id][$field->name][] = $alias; 
									if (!in_array($alias, $fields)) {
										$fields[$alias] = self::field_info($item,$val,$alias,$alias_sort,$field,$params);
									}
                                }
                            }
                        } else { // one field value
			              if (property_exists($option,'value') && ($option->value == $field->value)) {
			                $val=$option->name;
			                $alias_sort = FilterOutput::stringURLSafe((string)$ix_field.'_'.$val);
						    $alias =  FilterOutput::stringURLSafe((string)$val);
							if ($alias == "") {continue;} 
							$article_fields[$item->id][$field->title] = $alias; 
							$article_fields_names[$item->id][$field->name] = $alias; 
							if (!in_array($alias, $fields)) {
								$fields[$alias]=self::field_info($item,$val,$alias,$alias_sort,$field,$params);
							}
                          $ix_field +=1;  
						  }
						} 
				   }
				} else { // not an option field
					if (is_string($val)) {  
						$alias =  FilterOutput::stringURLSafe((string)$val); 
						if (!in_array($alias, $fields)) {
							if ($alias == "") {continue;} 
							$article_fields[$item->id][$field->title] = $alias; 
							$article_fields_names[$item->id][$field->name] = $alias; 
							$fields[$alias]=self::field_info($item,$val,$alias,$alias_sort,$field,$params);
						}
					}	
				}
				if (is_numeric($show_date_field) && ($field->id == $show_date_field)) {
				    $item->displayDate = HTMLHelper::_('date', $field->value, $show_date_format);
				}
			}
			if (!in_array($item->category_alias,$cats_alias)) {
			    $cats_lib[$item->catid] = $item->category_title;
				$cats_alias[$item->catid] = $item->category_alias;
				$infos = self::getCategoryName($item->catid);
				$cats_note[$item->catid] = $infos[0]->note;
				$cats_params[$item->catid] = $infos[0]->params;
			}
			if (!in_array(substr($item->title,0,1),$alpha)) {$alpha[] = substr($item->title,0,1);}
		}
		return $items;
		}
		else { return false;
		}

	}
	public static function field_info($item,$value,$alias,$alias_sort,$field,$params,$type = 'article') {						            
		PluginHelper::importPlugin('fields');
		$obj = new \stdClass;
        $obj->alias = $alias;
       	$obj->val = $value;
        $obj->alias_sort = $alias_sort;
		$obj->field_id = $field->id;
		$obj->field_title = $field->title;
		$obj->field_label = $field->label;
		$field_alias = FilterOutput::stringURLSafe((string)$field->title);
		if ($type == 'article') {
			$context = "com_content.article";
		} else { // weblink
			$context = "com_weblinks.weblink";
		}
		if ($field->type == 'color') {
			$obj->render = $value;
		} elseif (!is_array($field->value)) { 
			$obj->render = '<span class="iso_field_'.$field_alias.'">'.Factory::getApplication()->triggerEvent('onCustomFieldsPrepareField', array ($context, $item,$field))[0].'</span>';
		} else { 
		    $obj->render = $value;
		}
		$params_links = $params->get('fieldslinks');
		if ($params_links) { // fields links
	  	  $model = Factory::getApplication()->bootComponent('com_fields')
			->getMVCFactory()->createModel('Field', 'Administrator', ['ignore_request' => true]);
		  $obj->parent = "";
		  $obj->child="";
		  foreach ($params_links as $key=>$value) {
		      if ($value->fieldchild == $field->id) {
		          $val = $model->getFieldValue($value->fieldparent, $item->id);
		          $obj->parent = FilterOutput::stringURLSafe((string)$val);
		      }
		      if ($value->fieldparent == $field->id) {
		          $obj->child = $value->fieldchild;
		      }
		  }
		} else {
		    $obj->parent = "";
		    $obj->child="";
		}
		return $obj;
	}
	public static function getTagTitle($id) {
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		// Construct the query
		$query->select('tags.title as tag, tags.alias as alias,tags.note as note, parent.title as parent_title, parent.alias as parent_alias')
			->from('#__tags as tags')
			->innerJoin('#__tags as parent on parent.id = tags.parent_id')
			->where('tags.id = '.$id)
			;
		$db->setQuery($query);
		return $db->loadObjectList();
	}
	public static function getTagAccess($id,$authorised) {
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		// Construct the query
		$query->select('tags.title as tag')
			->from('#__tags as tags')
			->where('tags.id = '.(int)$id.' AND tags.access IN ('.implode(',',$authorised).')')
			;
		$db->setQuery($query);
		return $db->loadResult();
	}
	public static function getArticleTags($id,$authorised) {
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		$query->select('tags.title as tag, tags.alias as alias, tags.note as note, tags.images as images, parent.title as parent_title, parent.alias as parent_alias')
			->from('#__contentitem_tag_map as map ')
			->innerJoin('#__content as c on c.id = map.content_item_id') 
			->innerJoin('#__tags as tags on tags.id = map.tag_id')
			->innerJoin('#__tags as parent on parent.id = tags.parent_id')
			->where('c.id = '.(int)$id.' AND map.type_alias like "com_content%" AND tags.access IN ('.implode(',',$authorised).')')
			;
		$db->setQuery($query);
		return $db->loadObjectList();
	}
	public static function getWebLinkTags($id,$authorised) {
		$db = Factory::getDbo();
		$query = $db->getQuery(true);
		$query->select('tags.title as tag, tags.alias as alias, tags.note as note, tags.images as images, parent.title as parent_title, parent.alias as parent_alias ')
			->from('#__contentitem_tag_map as map ')
			->innerJoin('#__weblinks as w on w.id = map.content_item_id') 
			->innerJoin('#__tags as tags on tags.id = map.tag_id')
			->innerJoin('#__tags as parent on parent.id = tags.parent_id')
			->where('w.id = '.(int)$id.' AND map.type_alias like "com_weblinks%" AND tags.access IN ('.implode(',',$authorised).')')
			;
		$db->setQuery($query);
		return $db->loadObjectList();
	}
	
	public static function cleanIntrotext($introtext,$params)
	{
		if ($params->get('introtext_leave_tags','0') == '0') { // 1.1.8 : nouveau parametre
			$introtext = str_replace('<p>', ' ', $introtext);
			$introtext = str_replace('</p>', ' ', $introtext);
			$introtext = strip_tags($introtext, '<a><em><strong><br>');
			$introtext = trim($introtext); 
		}
		return $introtext;
	}
	public static function cleanIntrotext_keepimg($introtext,$params)
	{
		if ($params->get('introtext_leave_tags','0') == '0') { // 1.1.8 : nouveau parametre
			$introtext = str_replace('<p>', ' ', $introtext);
			$introtext = str_replace('</p>', ' ', $introtext);
			$introtext = strip_tags($introtext, '<img><a><em><strong><br>');
			$introtext = trim($introtext);
		}
		return $introtext;
	}

	public static function truncate($html, $maxLength = 0)
	{
		$baseLength = strlen($html);
		$ptString = HTMLHelper::_('string.truncate', $html, $maxLength, $noSplit = true, $allowHtml = false);
		for ($maxLength; $maxLength < $baseLength;)
		{
			$htmlString = HTMLHelper::_('string.truncate', $html, $maxLength, $noSplit = true, $allowHtml = true);
			$htmlStringToPtString = HTMLHelper::_('string.truncate', $htmlString, $maxLength, $noSplit = true, $allowHtml = false);
			if ($ptString == $htmlStringToPtString)
			{
				return $htmlString;
			}
			$diffLength = strlen($ptString) - strlen($htmlStringToPtString);
			$maxLength += $diffLength;
			if ($baseLength <= $maxLength || $diffLength <= 0)
			{
				return $htmlString;
			}
		}
		return $html;
	}
	// check if PhocaCount exists in article. If so, get it.
	public static function getArticlePhocaCount($text) { 
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
			$db 			= Factory::getDBO();		
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
		    if ((strpos($content,'{ratingcnt}') !== false) && ($item->rating_count == "0" ))  {
		           $content = "";
		    }
		    if ((strpos($content,'{count}') !== false) && ($phocacount == '?')) {
		            $content = "";
		   }
		    if ((strpos($content,'{subtitle}') !== false) && ($item->subtitle == "" ))  {
		           $content = "";
		    }
		    if ((strpos($content,'{new}') !== false) && ($item->new == "" ))  {
		           $content = "";
		    }
		    $perso = substr($perso,0,$replace_deb).$content.substr($perso,$replace_deb + $replace_len);
		}
		return $perso;
	}
	// look for {nofield}
	public static function checkNoField($perso) {
	    $regexopen = '/\{(?:nofield)\b(.*)\}/siU';
	    if (!preg_match($regexopen, $perso)) {
			return $perso; // no update
		}
		while (preg_match($regexopen, $perso, $matches, PREG_OFFSET_CAPTURE)) {
		    $replace_deb = $matches[0][1];
		    $replace_len = strlen($matches[0][0]);
		    $regexclose = '/\{\/nofield\}/siU';
		    preg_match($regexclose, $perso, $matchesclose, PREG_OFFSET_CAPTURE);
		    $content_deb = $replace_deb + $replace_len;
		    $content_len = $matchesclose[0][1] - $content_deb;
		    $content = substr($perso, $content_deb, $content_len);
		    $replace_len += $content_len + strlen($matchesclose[0][0]);
		    if (strpos($content,'{') !== false) {
		            $content = "";
		   }
		    $perso = substr($perso,0,$replace_deb).$content.substr($perso,$replace_deb + $replace_len);
		}
		return $perso;
	}
//-------------------------------------------- Create Fields buttons	-----------------------------------------------------------------------
	public static function create_buttons($fields, $group_lib,$onefilter,$params,$col_width,$button_bootstrap,$splitfieldstitle,$group_title) {
	    $params_fields = $params->get('displayfields');
	    $libfilter=Text::_('SSISO_LIBFILTER');		
		$liball = Text::_('SSISO_LIBALL');
		$splitfields = $params->get('displayfiltersplitfields','false'); 
		$displayfilterfields =  $params->get('displayfilterfields','button');
		$aliasorder = array();
		foreach ($onefilter as $key => $one) {
		    if ((count($params_fields) == 0) ||  (in_array($fields[$key]->field_id, $params_fields))) { 
		          $obj = $fields[$key];
		          $aliasorder[$key] = $obj->alias_sort;
		          $group_id = $obj->field_id;
		    }
		}
		asort($aliasorder,  SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL ); // alpha order
		$onefilter = $aliasorder;
		$result = "";
		if  (($displayfilterfields == "button")  || ($displayfilterfields == "multi") || ($displayfilterfields == "multiex")) {
			 if ($splitfieldstitle == "true") {
				$result .= "<p class='iso_fields_title ".$col_width."' data-filter-group='".$group_lib."' data-group-id='".$group_id."' data-group-id='".$group_id."'>". Text::_($group_title)."<br/>";
			 }
			 $first_time = true;
		     foreach ($onefilter as $key=>$filter) {
		         $obj = $fields[$key];
				 if ($first_time) { 		    
					$result .=  '<button class="'.$button_bootstrap.'  iso_button_tout isotope_button_first is-checked filter-button-group-'.$group_lib.'" data-sort-value="*" data-parent="'.$obj->parent.'" data-child="'.$obj->child.'" />'.$liball.'</button>';
					$first_time = false;
				 }				 
		         $aff_alias = $obj->alias;
		         $aff = $obj->render;
		         if (!is_null($aff)) {
		             $result .=  '<button class="'.$button_bootstrap.'  iso_button_'.$group_lib.'_'.$aff_alias.'" data-sort-value="'.$aff_alias.'" data-parent="'.$obj->parent.'" data-child="'.$obj->child.'"/>'. Text::_($aff).'</button>';
		         }
		    }
			if ($splitfieldstitle == "true") $result.="</p>";
			
		} else {
			Factory::getDocument()->getWebAssetManager()
				->useScript('webcomponent.field-fancy-select')
				->usePreset('choicesjs');
			$selectAttr = array('allowHTML:true');
			$multiple = "";
			$multiple_id = "";
			if ($displayfilterfields == "listmulti") {
				$libmulti = Text::_('CG_ISO_LIBLISTMULTI');
				$multiple = "  place-placeholder='".$libmulti."'";
				$selectAttr[] = ' multiple';
				$multiple_id = "fields-";
			}
			$attributes = array(
				'class="isotope_select"',
				' data-filter-group="'.$group_lib.'"',
				' id="isotope-select-'.$group_lib.'"',
				' allowHTML="true"'
			);
			$name = "isotope-select-".$multiple_id.$group_id;

			$first_time = true;
		    foreach ($onefilter as $key=>$filter) {
		         $obj = $fields[$key];
				 if ($first_time) { 	
					$options['']['items'][] = ModulesHelper::createOption('',$liball);				 
					$first_time = false;
				 }
		         $aff_alias = $obj->alias;
		         $aff = strip_tags($obj->render);
		         if (!is_null($aff)) {
		            $options['']['items'][] = ModulesHelper::createOption($aff_alias,Text::_($aff));
		        }
		    }

			$result .= "<div class='iso_fields_title  ".$col_width." '><p>";
			if ($splitfieldstitle == "true") {
				$result .= Text::_($group_title).' : ';
			} else {
				$result .=  '<span class="hidden-phone" >'.$libfilter.' : </span>';
			}
			$result .=  '</p><joomla-field-fancy-select '.implode(' ', $attributes).'>';
			$result .= HTMLHelper::_('select.groupedlist', $options, $name,  array('id'          => $name,'list.select' => null,'list.attr'   => implode(' ', $selectAttr)));
			$result .= '</joomla-field-fancy-select></div>';
						
		}
		return $result;
	}
//--------------------------Language buttons --------------------------------//
	public static function create_language_buttons($languagelist,$button_bootstrap) {
		$liball = Text::_('SSISO_LIBALL');
		$result = "";
        $result .=  '<button class="'.$button_bootstrap.'  iso_button_lang_tout isotope_button_first is-checked" data-sort-value="*">'.$liball.'</button>';
		foreach ($languagelist as $language) {
			if ($language->image) {
				$result .= "<button class='".$button_bootstrap." iso_button_lang_".$language->lang_code."' data-sort-value='".$language->lang_code."' title='".$language->title_native."'>";
				$result .= HTMLHelper::_('image', 'mod_languages/' . $language->image . '.gif', '', null, true);
				$result .= "</button>";
			}			
		}
		return $result; 
	}
//--------------------------Alpha buttons --------------------------------//
	public static function create_alpha_buttons($alpha_arr,$button_bootstrap) {
		$result = "";
		$liball = Text::_('SSISO_LIBALL');
        $result .=  '<button class="'.$button_bootstrap.'  iso_button_alpha_tout isotope_button_first is-checked" data-sort-value="*">'.$liball.'</button>';
		asort($alpha_arr);
		foreach ($alpha_arr as $alpha) {
			$result .= "<button class='".$button_bootstrap." iso_button_alpha_".$alpha."' data-sort-value='".$alpha."' title='".$alpha."'>".$alpha;
			$result .= "</button>";
		}
		return $result; 
	}
// ==============================================    AJAX Request 	============================================================
	public static function getAjax() {
	    $input = Factory::getApplication()->input->request;
	    $id = $input->get('id');
		$module = self::getModuleById($id);
		$params = new Registry($module->params);  		
		if ($input->get('data') == "param") {
			return self::getParams($params);
		} elseif ($input->get('data') == "readmore") {
			$articleId = $input->get('article');
			return new JsonResponse(self::getArticle((int)$articleId,$params)); 
		}
		return false;
	}
// Get Module per ID
	private static function getModuleById($id) {
		$db = Factory::getDbo();
		$query = $db->getQuery(true)
			->select('m.id, m.title, m.module, m.position, m.content, m.showtitle, m.params')
			->from('#__modules AS m')
			->where('m.id = '.(int)$id);
		$db->setQuery($query);
		return $db->loadObject();
	}
// Get params to send them again thru AJAX	
	private static function getParams($params) {
		$iso_entree = $params->get('iso_entree', 'webLinks');
		$article_cat_tag = $params->get('cat_or_tag',$iso_entree == "webLinks"?'cat':'tags'); 
		$defaultdisplay = $params->get('defaultdisplay', 'date_desc');
		$displayfilter =  $params->get('displayfilter','button');	
		$iso_layout = $params->get('iso_layout', 'fitRows');
		$iso_nbcol = $params->get('iso_nbcol',2);
		$tags_list = $params->get('tags');
		$fields_list = $params->get('displayfields');
		$iso_limit = $params->get('iso_limit','all');
		$language_filter=$params->get('language_filter','false');		
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

		if ($iso_entree == "webLinks") {
			if ($params->get('default_cat_wl','') == "") {
				$default_cat = "";
			} else {
				$info_cat = self::getCategoryName($params->get('default_cat_wl'));
				$default_cat  = $info_cat[0]->alias;
			}
		} else {
			if ($params->get('default_cat','') == "") {
				$default_cat = "";
			} else {
				$info_cat = self::getCategoryName($params->get('default_cat'));
				$default_cat  = $info_cat[0]->alias;
			}
		}
		$default_tag = $params->get('default_tag','');
		if (( $default_tag != "") &&  ( $default_tag != "none")) {
			$onetag = self::getTagTitle($default_tag);
			$default_tag = $onetag[0]->alias;
		}
		if ($params->get('default_field','') == "") {
			$default_field = "";
		} else {
			$onetag = self::getTagTitle($params->get('default_field'));
			$default_field = $onetag[0]->alias;
		}
		if ($article_cat_tag == "fields") {
			$splitfields = $params->get('displayfiltersplitfields','false'); // 1.3.4 : new parameter
			$displayfilterfields =  $params->get('displayfilterfields','button');
			$searchmultiex = "false";
			if  ( ($article_cat_tag == "fields") && ($displayfilterfields == "multiex"))  {	
				$searchmultiex = "true";
			}
			$ret = '{"entree":"'.$iso_entree.'","article_cat_tag":"'.$article_cat_tag.'","default_tag":"'.$default_tag.'",';
		    $ret .='"default_field":"'.$default_field.'","layout":"'.$iso_layout.'","nbcol":"'.$iso_nbcol.'",';
			$ret .= '"background":"'.$params->get("backgroundcolor","#eee").'",';
			$ret .= '"imgmaxwidth":"'.$params->get('introimg_maxwidth','0').'",';
			$ret .= '"imgmaxheight":"'.$params->get('introimg_maxheight','0').'",';
			$ret .= '"sortby":"'.$sortBy.'","ascending":"'.$sortAscending.'",';
			$ret .= '"searchmultiex":"'.$searchmultiex.'","liball":"'.Text::_('SSISO_LIBALL').'",';
			$ret .= '"language_filter":"'.$language_filter.'",';
			$ret .= '"displayfilter":"'.$displayfilterfields.'",'; 
			$ret .= '"displayfiltercat":"'.$params->get('displayfiltercattags',$displayfilterfields).'",';
			$ret .= '"limit_items":"'.$params->get('limit_items','0').'",';
			$ret .= '"readmore":"'.$params->get('readmore','false').'",';
			$ret .= '"libmore":"'.Text::_('SSISO_LIBMORE').'","libless":"'.Text::_('SSISO_LIBLESS').'"}';
		} else {
			if ($article_cat_tag =="cat") {
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
			$ret = '{"entree":"'.$iso_entree.'","article_cat_tag":"'.$article_cat_tag.'","default_cat":"'.$default_cat.'",';
                        $ret .='"default_tag":"'.$default_tag.'","layout":"'.$iso_layout.'","nbcol":"'.$iso_nbcol.'",';
			$ret .= '"background":"'.$params->get("backgroundcolor","#eee").'",';
			$ret .= '"imgmaxwidth":"'.$params->get('introimg_maxwidth','0').'",';
			$ret .= '"imgmaxheight":"'.$params->get('introimg_maxheight','0').'",';
			$ret .= '"sortby":"'.$sortBy.'","ascending":"'.$sortAscending.'",';
			$ret .= '"searchmultiex":"'.$searchmultiex.'","liball":"'.Text::_('SSISO_LIBALL').'",';
			$ret .= '"language_filter":"'.$language_filter.'",';
			$ret .= '"displayfilter":"'.$displayfilter.'","displayfiltercat":"'.$displayfiltercat.'",';
			$ret .= '"limit_items":"'.$params->get('limit_items','0').'",';
			$ret .= '"readmore":"'.$params->get('readmore','false').'",';
			$ret .= '"libmore":"'.Text::_('SSISO_LIBMORE').'","libless":"'.Text::_('SSISO_LIBLESS').'"}';
		}	
		return $ret;
	}
	//-----------------------One article display------------------------------------------//
	static function getArticle($id,$modparams) {
		PluginHelper::importPlugin('content');
		$model   = new ArticleModel(array('ignore_request' => true));

        if ($model) { // Set application parameters in model
		$app       = Factory::getApplication();
		$appParams = $app->getParams();
		$params= $appParams;
		$model->setState('params', $appParams);

		$model->setState('list.start', 0);
		$model->setState('list.limit', 1);
		$model->setState('filter.published', 1);
		$model->setState('filter.featured', 'show');
		$model->setState('filter.category_id', array());

		// Access filter
		$access = ComponentHelper::getParams('com_content')->get('show_noauth');
		$authorised = Access::getAuthorisedViewLevels(Factory::getUser()->get('id'));
		$model->setState('filter.access', $access);

		// Filter by language
		$model->setState('filter.language', $app->getLanguageFilter());
		// Ordering
		$model->setState('list.ordering', 'a.hits');
		$model->setState('list.direction', 'DESC');

		$item = $model->getItem($id);

		$item->slug    = $item->id . ':' . $item->alias;
		$item->catslug = $item->catid . ':' . $item->category_alias;
		if ($access || in_array($item->access, $authorised))
		{
			// We know that user has the privilege to view the article
			$item->link = Route::_(RouteHelper::getArticleRoute($item->slug, $item->catid, $item->language));
		}
		else
		{
			$item->link = Route::_('index.php?option=com_users&view=login');
		}
		// appliquer les plugins "content"
		$item_cls = new \stdClass;
		$item_cls->text = $item->fulltext;
		$item_cls->id = $item->id;
		$item_cls->params = $params;
		$app->triggerEvent('onContentPrepare', array ('com_content.article', &$item_cls, &$item_cls->params, 0)); // Joomla 4.0
		$item->fulltext = 	$item_cls->text;	

		$scripts = [];
		if (count($app->getDocument()->_scripts) > 0) { // scripts
		    foreach($app->getDocument()->_scripts as $key=>$val) {
		        $scripts[]= $key;
		    }
		}
		$item->scripts = new \stdClass;
		$item->scripts = $scripts;
		$css = [];
		if (count($app->getDocument()->_styleSheets) > 0) { // scripts
		    foreach($app->getDocument()->_styleSheets as $key=>$val) {
		        $css[]= $key;
		    }
		}
		$item->css = new \stdClass;
		$item->css = $css;
		
		$arr[0] = $item;
        }
        else {
        	$arr = false;
        }
		return $arr;
	}
}
