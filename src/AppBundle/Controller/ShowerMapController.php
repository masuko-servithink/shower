<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Entity\Shower;

class ShowerMapController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function indexAction(Request $request){

        return $this->render('ShowerMap/index.html.twig');
    }

    /**
     * @Route("/map", name="map")
     */
    public function mapAction(Request $request){

        return $this->render('ShowerMap/map.html.twig');
    }
}
