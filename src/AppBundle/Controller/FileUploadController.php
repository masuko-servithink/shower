<?php
/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/10
 * Time: 14:06
 */

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileUploadController extends Controller
{
    /**
     * @Route("/file/", name="file")
     */
    public function indexAction(Request $request)
    {
        $response = new Response();
        if ($request->getMethod() === 'POST'){
            $files = $request->files->get('file1');
//            $test = $files->getClientOriginalName();
//            $files->move();
            foreach($request->files as $uploadedFile) {
                $root_dir = $this->get('kernel')->getRootDir();
                $name = $uploadedFile->getClientOriginalName();
                $status = $uploadedFile->move('../tmp' , $name);
            }
            return $response->setStatusCode(Response::HTTP_OK);
        }
        return $response->setStatusCode(Response::HTTP_METHOD_NOT_ALLOWED);
    }
}