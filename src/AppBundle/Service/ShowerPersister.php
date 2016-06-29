<?php

/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/01
 * Time: 14:22
 */
namespace AppBundle\Service;

use AppBundle\Entity\Shower;
use Doctrine\ORM\EntityManager;
use AppBundle\Event\ConsoleDebugEvent;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class ShowerPersister
{
    private $em;
    private $showerRepository;
    private $site_id;
    private $dispatcher;
    private $pref_id;

    public function __construct(EntityManager $entityManager, EventDispatcherInterface $dispatcher)
    {
        $this->em = $entityManager;
        $this->showerRepository = $this->em->getRepository('AppBundle:Shower');
        $this->dispatcher = $dispatcher;
    }
    public function setSiteId($site_id){
        $this->site_id = $site_id;
    }
    public function persistShower($showers, $pref_id){
        $this->pref_id = $pref_id;
        foreach ($showers as $shower){
            $showerExist = $this->showerRepository->findOneBy([
                'name' => $shower['name'],
                'address' => $shower['address'],
            ]);
            // Insert
            try {
                if ($showerExist){
                    $this->updateShower($shower, $showerExist);
                }else{
                    $this->insertShower($shower);
                }
            }catch(\Exception $e){
                if (!$this->em->isOpen()) {
                    $this->em = $this->em->create(
                        $this->em->getConnection(), $this->em->getConfiguration());
                }
                $this->writeToConsole($e->getMessage());
            }
        }
    }
    private function updateShower($shower, $showerExist){
        $columns = ['tel', 'url', 'lat', 'lng'];
        $isUpdated = false;

        foreach ($columns as $column){
            if (!isset($shower[$column])){
                continue;
            }
            if ($shower[$column] != $showerExist->getDynamicProperty($column)){
                $isUpdated = true;
                $showerExist->setDynamicProperty($column, $shower[$column]);
            }
        }
        if ($isUpdated){
            if ($showerExist->hasLatLng()){
                $showerExist->setIsConverted(true);
            }else{
                $showerExist->setIsConverted(false);
            }
            $this->em->persist($showerExist);
            $this->em->flush();
        }
    }
    private function insertShower($shower){
        $showerEntity = new Shower();
        foreach ($shower as $fieldKey => $fieldVal) {
            $showerEntity->setDynamicProperty($fieldKey, $fieldVal);
        }
        if ($showerEntity->hasLatLng()){
            $showerEntity->setIsConverted(true);
        }else{
            $showerEntity->setIsConverted(false);
        }
        $showerEntity->setPrefId($this->pref_id);
        $this->em->persist($showerEntity);
        $this->em->flush();
    }
    private function writeToConsole($message){
        $this->dispatcher->dispatch(
            'console.debug.output',
            new ConsoleDebugEvent($message)
        );
    }
}