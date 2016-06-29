shower
======

A Symfony project created on May 24, 2016, 6:46 am.

全件取得→フロント側でマーカーの表示を制御
localhost/app_dev.php/
画面内に存在するマーカーのみ取得、ViewPortの値が低い場合は県ごとに表示
→現在動作しない
localhost/app_dev.php/map

シャワー情報収集
php app/console shower:scraping
アドレス座標変換
php app/console shower:convert:geo
