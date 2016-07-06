///**
// * Created by masuko on 2016/06/14.
// */

/////////////////////////////////////////////////////////////////////////
//// 変数設定
/////////////////////////////////////////////////////////////////////////
var ShowerMap = {
    map:{},
    markerArr:[],
    rectangleArrLatLng:[],
    rectangleArrObj:[],
    rectangleArrData:[],
    gridRow:10,
    gridCol:10,
    defLat:35.6686606,
    defLng:139.659768,
    defZoom:12,
    bounds:{},
    boundsLen:{},
    neLatLng:{},
    neLat:{},
    neLng:{},
    swLatLng:{},
    swLat:{},
    swLng:{},
    jsonUrl:"http://192.168.160.100/app_dev.php/showers.json",
    jsonData:{},
    boundsData:{},
    mc:{}
};

///////////////////////////////////////////////////////////////////////
// 初期化
///////////////////////////////////////////////////////////////////////
ShowerMap.initMap = function(){

    // googleMaps 初期設定
    ShowerMap.gMapInit();

    // json読み込み
    ShowerMap.getJson();

};

///////////////////////////////////////////////////////////////////////
// googleMaps 初期設定
///////////////////////////////////////////////////////////////////////
ShowerMap.gMapInit = function(){
    ShowerMap.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: ShowerMap.defLat, lng: ShowerMap.defLng},
        zoom: ShowerMap.defZoom
    });
};

///////////////////////////////////////////////////////////////////////
// JSON読み込み
///////////////////////////////////////////////////////////////////////
ShowerMap.getJson = function(){

    $.ajax({
        type: "GET",
        url: ShowerMap.jsonUrl,
        dataType: "json",
        success: function(response){
            ShowerMap.jsonData = response;
            $('#status_all').html(ShowerMap.jsonData.length);

            // とりあえず表示
            ShowerMap.createMarker();
            // googleMaps アイドル設定
            ShowerMap.gMapSetIdle();
        },
        error: function(response){
            return response;
        }
    });
};

///////////////////////////////////////////////////////////////////////
// googleMaps アイドル設定
///////////////////////////////////////////////////////////////////////
ShowerMap.gMapSetIdle = function(){
    google.maps.event.addListener(ShowerMap.map, 'idle', function(){
        ShowerMap.refleshMap();
    });
};

///////////////////////////////////////////////////////////////////////
// MAPリフレッシュ
///////////////////////////////////////////////////////////////////////
ShowerMap.refleshMap = function() {

    // マップサイズ取得
    ShowerMap.getMapSize();

    //// 短形領域削除
    //ShowerMap.deleteRectangle();
    //
    //// 短形領域作成
    //ShowerMap.createRectangle();
    //
    //// データ格納
    //ShowerMap.boundsData = [];
    //for (var i = 0, l = ShowerMap.jsonData.length; i < l; i++) {
    //    ShowerMap.storeDataToRectangle(ShowerMap.jsonData[i]);
    //}

    // マーカー削除
    //ShowerMap.markerArr.forEach(function(marker, idx) {
    //    marker.setMap(null);
    //});

    $('#status_bounds').html(ShowerMap.boundsLen);

};

///////////////////////////////////////////////////////////////////////
// マップサイズ取得
///////////////////////////////////////////////////////////////////////
ShowerMap.getMapSize = function() {
    ShowerMap.boundsLen = 0;
    ShowerMap.zoom = ShowerMap.map.getZoom();
    console.log(ShowerMap.zoom);
    ShowerMap.bounds = ShowerMap.map.getBounds();
    ShowerMap.neLatLng = ShowerMap.bounds.getNorthEast();
    ShowerMap.neLat = ShowerMap.neLatLng.lat();
    ShowerMap.neLng = ShowerMap.neLatLng.lng();
    ShowerMap.swLatLng = ShowerMap.bounds.getSouthWest();
    ShowerMap.swLat = ShowerMap.swLatLng.lat();
    ShowerMap.swLng = ShowerMap.swLatLng.lng();
    ShowerMap.latDiff = (ShowerMap.neLat-ShowerMap.swLat)/ShowerMap.gridRow;
    ShowerMap.lngDiff = (ShowerMap.neLng-ShowerMap.swLng)/ShowerMap.gridCol;
};

///////////////////////////////////////////////////////////////////////
// 短形領域削除
///////////////////////////////////////////////////////////////////////
ShowerMap.deleteRectangle = function() {
    ShowerMap.rectangleArrObj.forEach(function(rectangle, idx) {
        rectangle.setMap(null);
    });
};

///////////////////////////////////////////////////////////////////////
// 短形領域作成
///////////////////////////////////////////////////////////////////////
ShowerMap.createRectangle = function() {
    for( var x = 0, l1 = ShowerMap.gridCol; x < l1; x++ ){
        ShowerMap.rectangleArrLatLng[x] = [];
        ShowerMap.rectangleArrData[x] = [];
        for( var y = 0, l2 = ShowerMap.gridRow; y < l2; y++ ){
            var sw = new google.maps.LatLng( ShowerMap.neLat - ( ShowerMap.latDiff * ( x + 1 ) ) , ShowerMap.swLng + ( ShowerMap.lngDiff * y ) ) ;
            var ne = new google.maps.LatLng( ShowerMap.neLat - ( ShowerMap.latDiff * x ) , ShowerMap.swLng + ( ShowerMap.lngDiff * ( y + 1 ) ) ) ;
            ShowerMap.rectangleArrLatLng[x][y] = new google.maps.LatLngBounds( sw , ne ) ;

            ShowerMap.rectangleArrData[x][y] = [];

            //// 矩形領域のイベント登録
            //google.maps.event.addListener(rectangle, 'mouseover', function() {
            //    this.setOptions({fillOpacity: 0.3})
            //});
            //
            //google.maps.event.addListener(rectangle, 'mouseout', function() {
            //    this.setOptions({fillOpacity: 0})
            //});
            //
            //google.maps.event.addListener(rectangle, 'click', function(a) {
            //    ShowerMap.clickRectangle(this);
            //});
        }
    }
};

///////////////////////////////////////////////////////////////////////
// 短形領域クリックイベント
///////////////////////////////////////////////////////////////////////
ShowerMap.clickRectangle = function(_this) {
    var ce = _this.getBounds().getCenter();
    var x = Math.floor( (ShowerMap.neLat - ce.lat() ) / ShowerMap.latDiff );
    var y = Math.floor( (ce.lng() - ShowerMap.swLng) / ShowerMap.lngDiff );
    var data = ShowerMap.rectangleArrData[x][y];
    $('#status_num').html(data.length);
    var html ='';
    for( var i = 0, l = data.length; i < l; i++ ){
        var dataDetail = ShowerMap.rectangleArrData[x][y][i];
        html +=
            '<li>'+dataDetail.name+'</li>';
    }
    $('#status_shop').html(html);
};

///////////////////////////////////////////////////////////////////////
// データ格納（それぞれの短形領域へ）
///////////////////////////////////////////////////////////////////////
ShowerMap.storeDataToRectangle = function(place) {
    var latlng = new google.maps.LatLng(place.lat,place.lng);
    if( ShowerMap.bounds.contains(latlng) ){
        var x = Math.floor( (ShowerMap.neLat - place.lat ) / ShowerMap.latDiff );
        var y = Math.floor( (place.lng - ShowerMap.swLng) / ShowerMap.lngDiff );
        ShowerMap.boundsData.push(place);
        ShowerMap.rectangleArrData[x][y].push(place);
        ShowerMap.boundsLen++;
    }
};

///////////////////////////////////////////////////////////////////////
// マーカー作成
///////////////////////////////////////////////////////////////////////
ShowerMap.setMarker = function(placeLoc) {
    var latlng = new google.maps.LatLng(placeLoc.lat,placeLoc.lng);
    var marker = new google.maps.Marker({
        title: 'Hello World!',
        position: latlng,
        map: ShowerMap.map
    });
    ShowerMap.markerArr.push(marker);
};
///////////////////////////////////////////////////////////////////////
// マーカー作成
///////////////////////////////////////////////////////////////////////
ShowerMap.createMarker = function() {
    for (var i = 0, l = ShowerMap.jsonData.length; i < l; i++) {
        ShowerMap.setMarker(ShowerMap.jsonData[i]);
    }

    ShowerMap.mc = new MarkerClusterer(ShowerMap.map, ShowerMap.markerArr);
    // マーカー作成
    var mcOptions = { imagePath: 'images/m', maxZoom: 15 };
};

///////////////////////////////////////////////////////////////////////
// event
///////////////////////////////////////////////////////////////////////

window.onload = ShowerMap.initMap;