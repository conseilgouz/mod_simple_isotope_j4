<?php
/**
 * Simple Isotope Module for Joomla 4.x/5.x
 *
 * @author     ConseilgGouz
 * @copyright (C) 2025 www.conseilgouz.com. All Rights Reserved.
 * @license    GNU/GPLv3 https://www.gnu.org/licenses/gpl-3.0.html
 */

namespace ConseilGouz\Module\SimpleIsotope\Site\Field;

use Joomla\CMS\Factory;
use Joomla\CMS\Form\FormField;
use Joomla\CMS\Language\Text;
use Joomla\Database\DatabaseInterface;
use Joomla\String\StringHelper;

// Prevent direct access
defined('_JEXEC') || die;

class VersionField extends FormField
{
    /**
     * Element name
     *
     * @var   string
     */
    protected $_name = 'Version';

    public function getInput()
    {
        $return = '';
        // Load language
        $extension = $this->def('extension');

        $version = '';

        $db = Factory::getContainer()->get(DatabaseInterface::class);
        $query = $db->getQuery(true);
        $query
            ->select($db->quoteName('manifest_cache'))
            ->from($db->quoteName('#__extensions'))
            ->where($db->quoteName('element') . '=' . $db->Quote($extension));
        $db->setQuery($query, 0, 1);
        $row = $db->loadAssoc();
        $tmp = json_decode($row['manifest_cache']);
        $version = $tmp->version;

        $document = Factory::getApplication()->getDocument();
        $css = '';
        $css .= ".version {display:block;text-align:right;color:brown;font-size:10px;}";
        $css .= ".readonly.plg-desc {font-weight:normal;}";
        $css .= "fieldset.radio label {width:auto;}";
        $document->addStyleDeclaration($css);
        $margintop = $this->def('margintop');
        if (StringHelper::strlen($margintop)) {
            $js = "document.addEventListener('DOMContentLoaded', function() {
			vers = document.querySelector('.version');
			parent = vers.parentElement.parentElement;
			parent.style.marginTop = '".$margintop."';
			})";
            $document->addScriptDeclaration($js);
        }
        $return .= '<span class="version">' . Text::_('JVERSION') . ' ' . $version . "</span>";

        return $return;
    }
    public function def($val, $default = '')
    {
        return (isset($this->element[$val]) && (string) $this->element[$val] != '') ? (string) $this->element[$val] : $default;
    }

}
