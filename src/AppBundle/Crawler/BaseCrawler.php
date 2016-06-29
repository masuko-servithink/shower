<?php

/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/01
 * Time: 14:17
 */
namespace AppBundle\Crawler;
use AppBundle\Repository\PrefectureRepository;
use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use AppBundle\Event\ConsoleDebugEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

// Crawler「ベースクラス」
abstract class BaseCrawler
{
    protected $httpClient;
    protected $filters;
    protected $site_id;
    protected $base_url;
    protected $uri;
    protected $prefs;
    protected $pref;
    protected $dispatcher;

    abstract function next();
    abstract function scrapePage();

    public function __construct(PrefectureRepository $prefRep, $params, Client $httpClient, EventDispatcherInterface $dispatcher)
    {
        $this->prefs = $prefRep->findAll();
        $this->httpClient = $httpClient;
        $this->base_url = $params['base_url'];
        $this->uri = $params['uri'];
        $this->filters = $params['filters'];
        $this->site_id = $params['site_id'];
        $this->dispatcher = $dispatcher;
    }
    public function getLinkHtml($url){
        $html = $this->httpClient->get($url);
        sleep(1);
        return $html->getBody()->getContents();
    }
    public function getSiteId(){
        return $this->site_id;
    }
    public function getPrefId(){
        return $this->pref->getId();
    }
    protected function searchEachNodes($nodes, $filter){
        $nodeValues = $nodes->each(function (Crawler $node, $i) use ($filter) {
            $return = $this->searchNode($node, $filter);
            return $return;
        });
        return $nodeValues;
    }
    protected function searchNode($node, $filters){
        $result = $node;
        foreach ($filters as $method => $arg){
            $result = call_user_func_array(array($result, $method), array($arg));
        }
        return $result;
    }
//    protected function downloadPicture($thumb_src){
//        $ext = pathinfo($thumb_src, PATHINFO_EXTENSION);
//        $filename = date("Ymd").md5(uniqid(microtime(),1)).getmypid() . '.' . $ext;
//        $savepath = $this->image_save_path . $filename;
//        $this->client->request('GET', $thumb_src, ['sink' => $savepath]);
//        $ref_path = $this->image_ref_path . $filename;
//        return $ref_path;
//    }
    protected function writeToConsole($message){
        $this->dispatcher->dispatch(
            'console.debug.output',
            new ConsoleDebugEvent($message)
        );
    }
}