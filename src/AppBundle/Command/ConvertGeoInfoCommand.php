<?php

/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/01
 * Time: 14:20
 */
namespace AppBundle\Command;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use AppBundle\Event\ConsoleDebugEvent;

class ConvertGeoInfoCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('shower:convert:geo')
            ->setDescription('scraping')
            ->addArgument('name', InputArgument::OPTIONAL, 'Who do you want to greet?')
            ->addOption('yell', null, InputOption::VALUE_NONE, 'If set, the task will yell in uppercase letters')
        ;
    }
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $dispatcher = $container->get('event_dispatcher');

        $dispatcher->addListener(
            'console.debug.output',
            function (ConsoleDebugEvent $event) use ($output) {
                $output->writeLn('<info>'. $event->getMessage() .'</info>');
            }
        );

        $converter = $container->get('app.geo_converter');
        $converter->convertAddressToLatLng();
    }
}