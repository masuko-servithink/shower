<?php

/**
 * Created by PhpStorm.
 * User: masuko
 * Date: 2016/06/01
 * Time: 14:20
 */
namespace AppBundle\DependencyInjection\Compiler;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Reference;

class CrawlerCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        if (false === $container->hasDefinition('app.crawler_chain')) {
            return;
        }
        $definition = $container->getDefinition('app.crawler_chain');
        foreach ($container->findTaggedServiceIds('app.crawler') as $id => $attributes) {
            $definition->addMethodCall('addCrawler', array(new Reference($id)));
        }
    }
}