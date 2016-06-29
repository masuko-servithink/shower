<?php

namespace AppBundle\Service;

use Doctrine\ORM\EntityManager;
use AppBundle\Entity\Shower;
use AppBundle\Event\ConsoleDebugEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class GeoConverter
{
    private $em;
    private $showerRepository;
    private $dispatcher;

    public function __construct(EntityManager $entityManager, EventDispatcherInterface $dispatcher)
    {
        $this->em = $entityManager;
        $this->showerRepository = $this->em->getRepository('AppBundle:Shower');
        $this->dispatcher = $dispatcher;
    }
    public function convertAddressToLatLng(){
        $showers = $this->getShowerNotConverted();

        foreach($showers as $shower){
            $address = $shower->getAddress();

            $location = $this->geocode($address);
            if (!$location){
                continue;
            }
            $this->updateShower($shower, $location);
        }

    }

    private function updateShower($shower, $location){
        try{
            $shower->setLatitude($location['lat']);
            $shower->setLongitude($location['lng']);
            $shower->setIsConverted(true);
            $this->em->flush();
        }catch(\Exception $e){
            if (!$this->em->isOpen()) {
                $this->em = $this->em->create(
                    $this->em->getConnection(), $this->em->getConfiguration());
            }
            $this->writeToConsole($e->getMessage());
        }
    }
    public function geocode($address){
        // google map geocode api url
        $url = $this->createRequestUrl($address);
        // get the json response
        $resp_json = file_get_contents($url);
        // encode
        mb_convert_encoding($resp_json, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
        // decode the json
        $resp = json_decode($resp_json, true);
        // response status will be 'OK', if able to geocode given address
        if($resp['status']=='OK'){
            // get the important data
            $lati = $resp['results'][0]['geometry']['location']['lat'];
            $longi = $resp['results'][0]['geometry']['location']['lng'];
//            $formatted_address = $resp['results'][0]['formatted_address'];
            // verify if data is complete
            if($lati && $longi){
                // put the data in the array
                $data_arr = [];
                $data_arr['lat'] = round( $lati, 10);
                $data_arr['lng'] = round( $longi, 10);
                return $data_arr;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    private function getShowerNotConverted(){
        $showers = $this->showerRepository->findBy([
            'is_converted' => false
        ]);
        return $showers;
    }
    private function createRequestUrl($address){
        $req = 'https://maps.googleapis.com/maps/api/geocode/json';
        $req .= '?address='. urlencode($address);
        $req .= '&key='. 'YOUR_API_KEY';
        return $req;
}
    private function writeToConsole($message){
        $this->dispatcher->dispatch(
            'console.debug.output',
            new ConsoleDebugEvent($message)
        );
    }
}