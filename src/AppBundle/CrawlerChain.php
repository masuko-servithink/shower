<?php
/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/01
 * Time: 14:14
 */

namespace AppBundle;
use AppBundle\Crawler\BaseCrawler;
class CrawlerChain
{
    private $crawlers;
    public function __construct()
    {
        $this->crawlers = array();
    }
    public function addCrawler(BaseCrawler  $crawler)
    {
        $this->crawlers[] = $crawler;
    }
    public function getCrawlers()
    {
        return $this->crawlers;
    }
}