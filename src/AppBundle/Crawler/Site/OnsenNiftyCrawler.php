<?php

/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/01
 * Time: 14:18
 */
namespace AppBundle\Crawler\Site;
use AppBundle\Crawler\BaseCrawler;
use Symfony\Component\DomCrawler\Crawler;
use AppBundle\Entity\Prefecture;

//use GuzzleHttp\Exception\ClientException;

class OnsenNiftyCrawler extends BaseCrawler
{
    private $crawler;
    private $index;
    private $currentUrl;

    public function next(){
        // 県でループ
        foreach ($this->prefs as $pref){
            $this->pref = $pref;
            $this->currentUrl = str_replace('{pref}', $pref->getNameAlpha(), $this->base_url . $this->uri);
            $this->index = 1;
            // ページ番号でループ
            while(true){
                try {
                    $url = str_replace('{index}', $this->index, $this->currentUrl);
                    $this->crawler = new Crawler($this->getLinkHtml($url));
                    $current = $this->crawler->filter('.pagination span.selected')->text();
                    $this->writeToConsole($pref->getNameKanji() . ": ページ" . $this->index);
                    $this->index = (int)$current + 1;
                    yield true;
                } catch (\Exception $e) {
                    $this->writeToConsole('go to next');
                    break;
                }
            }
        }
    }

    public function scrapePage(){
        //article
        $filters = $this->filters;
        $lists = $this->searchNode($this->crawler, $filters['list'])
            ->each(function (Crawler $list_crawler) use ($filters) {
                $return = [];
                //header
                $return += $this->getElement($list_crawler, $filters['header']);
                //get content url
                $content_url = $this->base_url . $this->searchNode($list_crawler, $filters['content_url']);
                $return += ['url' => $content_url];
                $content_crawler = new Crawler($this->getLinkHtml($content_url));
                //content
                $return += $this->getBasicInfo($content_crawler);
                return $return;
            });
        return $lists;
    }

    private function getBasicInfo($crawler){
        $body_name = $crawler->filter('body')->attr('name');
        if (isset($body_name) && $body_name === 'rich-detail'){
            $filter = ['filter' => ".outlineInner2 tr td"];
//            $text_filter = ['filter' => "td", 'text' => null];
            $elements = [2 => 'address', 3 => 'tel'];
        }else{
            $filter = ['filter' => "ul.basicInfoList li p.content"];
//            $text_filter = ['filter' => ".content", 'text' => null];
            $elements = [0 => 'address', 1 => 'tel'];
        }
        $return = ['address' => null, 'tel' => null];
        $contents = $this->searchNode($crawler, $filter);
        foreach($elements as $index => $element){
            try{
                $return[$element] = $contents->eq($index)->text();
            }catch(\Exception $e){
                $this->writeToConsole($element . ' does not exists.');
            }
        }

        // 地図情報
        $body_class = $crawler->filter('body')->attr('class');
        if ($body_class === 'detail'){
            try{
                $lat = $this->searchNode($crawler, ['filter' => "#detailNormalMapCanvas", 'attr' => 'data-latitude']);
                $lng = $this->searchNode($crawler, ['filter' => "#detailNormalMapCanvas", 'attr' => 'data-longitude']);
                if (!empty($lat) && !empty($lng)){
                    $return['lat'] = round($lat, 10);
                    $return['lng'] = round($lng, 10);
                }
            }catch(\Exception $e){
                $this->writeToConsole('map does not exists.');
            }
        }
        return $return;
    }
    private function getElement($crawler, $filters){
        $return = [];
        foreach ($filters as $key => $filter) {
            if ($key === 'tags'){
                $nodes = $this->searchNode($crawler, $filter['get_nodes']);
                $value = $this->searchEachNodes($nodes, $filter['get_array']);
            }else{
                $value = $this->searchNode($crawler, $filter);
            }
            $return += [$key => $value];
        }
        return $return;
    }
}