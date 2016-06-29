<?php
/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/09
 * Time: 17:01
 */

namespace AppBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class ConsoleDebugEvent extends Event
{
    const NAME = 'console.debug.output';
    protected $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function getMessage(){
        return $this->message;
    }
}