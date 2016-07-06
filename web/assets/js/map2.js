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
    defZoom:6,
    bounds:{},
    boundsLen:{},
    neLatLng:{},
    neLat:{},
    neLng:{},
    swLatLng:{},
    swLat:{},
    swLng:{},
    viewportUrl:"http://192.168.100.160/app_dev.php/shower/area.json",
    prefsCountUrl:"http://192.168.100.160/app_dev.php/shower/prefs/count.json",
    jsonData:{},
    boundsData:{},
    ajaxRequest: null,
    borderZoom: 8,
    prevZoom: 0,
    mc:{},
    prefMarker:{}
};

///////////////////////////////////////////////////////////////////////
// 初期化
///////////////////////////////////////////////////////////////////////
ShowerMap.initMap = function(){

    // googleMaps 初期設定
    ShowerMap.gMapInit();
    // googleMaps アイドル設定
    ShowerMap.gMapSetIdle();

};

///////////////////////////////////////////////////////////////////////
// googleMaps 初期設定
///////////////////////////////////////////////////////////////////////
ShowerMap.gMapInit = function(){
    ShowerMap.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: ShowerMap.defLat, lng: ShowerMap.defLng},
        zoom: ShowerMap.defZoom
    });
    ShowerMap.mc = new MarkerClusterer(ShowerMap.map);
    ShowerMap.prefMarker = new PrefClusterer(ShowerMap.map);
};

///////////////////////////////////////////////////////////////////////
// JSON読み込み
///////////////////////////////////////////////////////////////////////
ShowerMap.getShowers = function(url, bound){

    if(ShowerMap.ajaxRequest){
        ShowerMap.ajaxRequest.abort();
    }
    ShowerMap.ajaxRequest = $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(response){
            ShowerMap.jsonData = response;
            ShowerMap.refleshMap();
            $('#status_all').html(ShowerMap.jsonData.length);
        },
        data: bound,
        error: function(response){
            return response;
        }
    });
};

///////////////////////////////////////////////////////////////////////
// JSON読み込み
///////////////////////////////////////////////////////////////////////
ShowerMap.isViewPortMarker = function(zoom){
    return (zoom > ShowerMap.borderZoom);
};

///////////////////////////////////////////////////////////////////////
// googleMaps アイドル設定
///////////////////////////////////////////////////////////////////////
ShowerMap.gMapSetIdle = function(){
    google.maps.event.addListener(ShowerMap.map, 'idle', function(){
        if (typeof(ShowerMap.ajaxRequest) == "undefined"){

        }
        // マップサイズ取得
        ShowerMap.getMapSize();
        // json読み込み
        if (ShowerMap.isViewPortMarker(ShowerMap.zoom)){
            var bounds = {
                neLat: ShowerMap.neLat,
                neLng: ShowerMap.neLng,
                swLat: ShowerMap.swLat,
                swLng: ShowerMap.swLng
            };
            ShowerMap.getShowers(ShowerMap.viewportUrl, bounds);
        }else{
            //県ごと
            ShowerMap.getShowers(ShowerMap.prefsCountUrl);
        }
    });
};

///////////////////////////////////////////////////////////////////////
// MAPリフレッシュ
///////////////////////////////////////////////////////////////////////
ShowerMap.refleshMap = function() {

    // マーカー作成
    if (ShowerMap.isViewPortMarker(ShowerMap.zoom)){
        if (!ShowerMap.isViewPortMarker(ShowerMap.prevZoom)){
            ShowerMap.clearMarker(ShowerMap.prefMarker);
        }
        ShowerMap.createViewPortMarker();
    }else{
        ShowerMap.clearMarker(ShowerMap.mc);
        ShowerMap.createPrefMarker();
    }

};

///////////////////////////////////////////////////////////////////////
// マップサイズ取得
///////////////////////////////////////////////////////////////////////
ShowerMap.getMapSize = function() {
    ShowerMap.boundsLen = 0;
    ShowerMap.prevZoom = ShowerMap.zoom;
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
// マーカー作成
///////////////////////////////////////////////////////////////////////
ShowerMap.setMarker = function(placeLoc) {
    var latlng = new google.maps.LatLng(placeLoc.lat,placeLoc.lng);
    var marker = new google.maps.Marker({
        title: placeLoc.name,
        position: latlng,
        map: ShowerMap.map,
        id: placeLoc.id
    });
    ShowerMap.markerArr.push(marker);
    var infoWindow = new google.maps.InfoWindow({ // 吹き出しの追加
        content: '<div class="sample">' + placeLoc.name + '</div>' // 吹き出しに表示する内容
    });
    marker.addListener('click', function() { // マーカーをクリックしたとき
        infoWindow.open(ShowerMap.map, marker); // 吹き出しの表示
    });
    return marker;
};
///////////////////////////////////////////////////////////////////////
// マーカー再構成
///////////////////////////////////////////////////////////////////////
ShowerMap.ifMarkerExists = function(markerArr){
    return ShowerMap.jsonData.some(function(item, index){
        if (item.id === markerArr.id){
            ShowerMap.jsonData.splice(index,1);
            return true;
        }
    });
};

///////////////////////////////////////////////////////////////////////
// 領域ごとのマーカー作成
///////////////////////////////////////////////////////////////////////
ShowerMap.createViewPortMarker = function() {
    for (i = ShowerMap.markerArr.length - 1; i >= 0; i -= 1) {
        var existed = ShowerMap.ifMarkerExists(ShowerMap.markerArr[i]);
        if (!existed){
            ShowerMap.markerArr[i].setMap(null);
            ShowerMap.markerArr.splice(i, 1);
        }
    }
    ShowerMap.mc.clearMarkers();
    for (var n = 0, l2 = ShowerMap.jsonData.length; n < l2; n++) {
        var marker = ShowerMap.setMarker(ShowerMap.jsonData[n]);
    }
    ShowerMap.mc.addMarkers(ShowerMap.markerArr, false);
};

///////////////////////////////////////////////////////////////////////
// 県ごとのマーカー作成
///////////////////////////////////////////////////////////////////////
ShowerMap.createPrefMarker = function() {
    for (var n = 0, l2 = ShowerMap.jsonData.length; n < l2; n++) {
        ShowerMap.setMarker(ShowerMap.jsonData[n]);
    }
    ShowerMap.prefMarker.addMarkers(ShowerMap.markerArr, false);
};

///////////////////////////////////////////////////////////////////////
// マーカー作成
///////////////////////////////////////////////////////////////////////
ShowerMap.clearMarker = function(cluster) {
    cluster.clearMarkers();
    for (i = ShowerMap.markerArr.length - 1; i >= 0; i -= 1) {
        ShowerMap.markerArr[i].setMap(null);
    }
    ShowerMap.markerArr = [];
    return 0;
};
///////////////////////////////////////////////////////////////////////
// event
///////////////////////////////////////////////////////////////////////
window.onload = ShowerMap.initMap;