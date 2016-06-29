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

class ScrapeCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('shower:scraping')
            ->setDescription('scraping')
            ->addArgument('name', InputArgument::OPTIONAL, 'Who do you want to greet?')
            ->addOption('yell', null, InputOption::VALUE_NONE, 'If set, the task will yell in uppercase letters')
        ;
    }
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $crawlers = $container->get('app.crawler_chain')->getCrawlers();
        $showerPersister = $container->get('app.shower_persiter');
        $dispatcher = $container->get('event_dispatcher');

        $dispatcher->addListener(
            'console.debug.output',
            function (ConsoleDebugEvent $event) use ($output) {
                $output->writeLn('<info>'. $event->getMessage() .'</info>');
            }
        );

        foreach ($crawlers as $crawler){
            $showerPersister->setSiteId($crawler->getSiteId());
            foreach ($crawler->next() as $valid){
                if (!$valid){ break; }
                $showers = $crawler->scrapePage();
                $pref_id = $crawler->getPrefId();
                $showerPersister->persistShower($showers, $pref_id);
            }
        }
    }
}