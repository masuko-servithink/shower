<?php
/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/10
 * Time: 14:06
 */

namespace AppBundle\Controller;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Routing\ClassResourceInterface;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\View;

/**
 * @View()
 */
class ShowerController extends FOSRestController implements ClassResourceInterface
{
    public function cgetAction()
    {
        $showerRepository = $this->getDoctrine()->getRepository('AppBundle:Shower');
        $showers = $showerRepository->findBy(['is_converted' => true]);
        return $showers;
    }

    // get the post
    public function getAction($id)
    {
    }

    // create new post
    public function postAction(Request $request)
    {
    }

    // create new post
    public function getAreaAction(Request $request)
    {
        $neLat = $request->get('neLat');
        $swLat = $request->get('swLat');
        $neLng = $request->get('neLng');
        $swLng = $request->get('swLng');

        $showerRepository = $this->getDoctrine()->getRepository('AppBundle:Shower');
        $showers = $showerRepository->findAllByLatLng($neLat, $swLat, $neLng, $swLng);
        return $showers;
    }

    // create new post
    public function getPrefsCountAction(Request $request)
    {
        $showerRepository = $this->getDoctrine()->getRepository('AppBundle:Shower');
        $showers = $showerRepository->findAllByPrefs();
        return $showers;
    }
}