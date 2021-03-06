<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Prefecture
 *
 * @ORM\Table(name="prefecture")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PrefectureRepository")
 */
class Prefecture
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="name_alpha", type="string", length=10, unique=true)
     */
    private $nameAlpha;

    /**
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=10)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="name_kana", type="string", length=10)
     */
    private $nameKana;

    /**
     * @ORM\Column(name="lat", type="decimal", precision=13, scale=10)
     */
    private $lat;

    /**
     * @ORM\Column(name="lng", type="decimal", precision=13, scale=10)
     */
    private $lng;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set nameAlpha
     *
     * @param string $nameAlpha
     *
     * @return Prefecture
     */
    public function setNameAlpha($nameAlpha)
    {
        $this->nameAlpha = $nameAlpha;

        return $this;
    }

    /**
     * Get nameAlpha
     *
     * @return string
     */
    public function getNameAlpha()
    {
        return $this->nameAlpha;
    }

    /**
     * Set name
     *
     * @param string $nameKanji
     *
     * @return Prefecture
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set nameKana
     *
     * @param string $nameKana
     *
     * @return Prefecture
     */
    public function setNameKana($nameKana)
    {
        $this->nameKana = $nameKana;

        return $this;
    }

    /**
     * Get nameKana
     *
     * @return string
     */
    public function getNameKana()
    {
        return $this->nameKana;
    }

    /**
     * Set lat
     *
     * @param string $lat
     *
     * @return Prefecture
     */
    public function setLat($lat)
    {
        $this->lat = $lat;

        return $this;
    }

    /**
     * Get lat
     *
     * @return string
     */
    public function getLat()
    {
        return $this->lat;
    }

    /**
     * Set lng
     *
     * @param string $lng
     *
     * @return Prefecture
     */
    public function setLng($lng)
    {
        $this->lng = $lng;

        return $this;
    }

    /**
     * Get lng
     *
     * @return string
     */
    public function getLng()
    {
        return $this->lng;
    }
}
