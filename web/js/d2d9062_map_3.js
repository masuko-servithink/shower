///**
// * Created by masuko on 2016/06/14.
// */

/////////////////////////////////////////////////////////////////////////
//// 変数設定
/////////////////////////////////////////////////////////////////////////
var Yucho = {
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
    jsonUrl:"http://192.168.100.160/app_dev.php/showers.json",
    jsonData:{},
    boundsData:{}
};

///////////////////////////////////////////////////////////////////////
// 初期化
///////////////////////////////////////////////////////////////////////
Yucho.initMap = function(){

    // googleMaps 初期設定
    Yucho.gMapInit();

    // json読み込み
    Yucho.getJson();

};

///////////////////////////////////////////////////////////////////////
// googleMaps 初期設定
///////////////////////////////////////////////////////////////////////
Yucho.gMapInit = function(){
    Yucho.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: Yucho.defLat, lng: Yucho.defLng},
        zoom: Yucho.defZoom
    });
};

///////////////////////////////////////////////////////////////////////
// JSON読み込み
///////////////////////////////////////////////////////////////////////
Yucho.getJson = function(){

    $.ajax({
        type: "GET",
        url: Yucho.jsonUrl,
        dataType: "json",
        success: function(response){
            Yucho.jsonData = response;
            $('#status_all').html(Yucho.jsonData.length);

            // とりあえず表示
            Yucho.refleshMap();
            // googleMaps アイドル設定
            Yucho.gMapSetIdle();
        },
        error: function(response){
            return response;
        }
    });
};

///////////////////////////////////////////////////////////////////////
// googleMaps アイドル設定
///////////////////////////////////////////////////////////////////////
Yucho.gMapSetIdle = function(){
    google.maps.event.addListener(Yucho.map, 'idle', function(){
        Yucho.refleshMap();
    });
};

///////////////////////////////////////////////////////////////////////
// MAPリフレッシュ
///////////////////////////////////////////////////////////////////////
Yucho.refleshMap = function() {

    // マップサイズ取得
    Yucho.getMapSize();

    // 短形領域削除
    Yucho.deleteRectangle();

    // 短形領域作成
    Yucho.createRectangle();

    // データ格納
    Yucho.boundsData = [];
    for (var i = 0, l = Yucho.jsonData.length; i < l; i++) {
        Yucho.storeDataToRectangle(Yucho.jsonData[i]);
    }

    // マーカー削除
    Yucho.markerArr.forEach(function(marker, idx) {
        marker.setMap(null);
    });

    // マーカー作成
    Yucho.createMarker();

    $('#status_bounds').html(Yucho.boundsLen);

};

///////////////////////////////////////////////////////////////////////
// マップサイズ取得
///////////////////////////////////////////////////////////////////////
Yucho.getMapSize = function() {
    Yucho.boundsLen = 0;
    Yucho.zoom = Yucho.map.getZoom();
    console.log(Yucho.zoom);
    Yucho.bounds = Yucho.map.getBounds();
    Yucho.neLatLng = Yucho.bounds.getNorthEast();
    Yucho.neLat = Yucho.neLatLng.lat();
    Yucho.neLng = Yucho.neLatLng.lng();
    Yucho.swLatLng = Yucho.bounds.getSouthWest();
    Yucho.swLat = Yucho.swLatLng.lat();
    Yucho.swLng = Yucho.swLatLng.lng();
    Yucho.latDiff = (Yucho.neLat-Yucho.swLat)/Yucho.gridRow;
    Yucho.lngDiff = (Yucho.neLng-Yucho.swLng)/Yucho.gridCol;
};

///////////////////////////////////////////////////////////////////////
// 短形領域削除
///////////////////////////////////////////////////////////////////////
Yucho.deleteRectangle = function() {
    Yucho.rectangleArrObj.forEach(function(rectangle, idx) {
        rectangle.setMap(null);
    });
};

///////////////////////////////////////////////////////////////////////
// 短形領域作成
///////////////////////////////////////////////////////////////////////
Yucho.createRectangle = function() {
    for( var x = 0, l1 = Yucho.gridCol; x < l1; x++ ){
        Yucho.rectangleArrLatLng[x] = [];
        Yucho.rectangleArrData[x] = [];
        for( var y = 0, l2 = Yucho.gridRow; y < l2; y++ ){
            var sw = new google.maps.LatLng( Yucho.neLat - ( Yucho.latDiff * ( x + 1 ) ) , Yucho.swLng + ( Yucho.lngDiff * y ) ) ;
            var ne = new google.maps.LatLng( Yucho.neLat - ( Yucho.latDiff * x ) , Yucho.swLng + ( Yucho.lngDiff * ( y + 1 ) ) ) ;
            Yucho.rectangleArrLatLng[x][y] = new google.maps.LatLngBounds( sw , ne ) ;

            Yucho.rectangleArrData[x][y] = [];

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
            //    Yucho.clickRectangle(this);
            //});
        }
    }
};

///////////////////////////////////////////////////////////////////////
// 短形領域クリックイベント
///////////////////////////////////////////////////////////////////////
Yucho.clickRectangle = function(_this) {
    var ce = _this.getBounds().getCenter();
    var x = Math.floor( (Yucho.neLat - ce.lat() ) / Yucho.latDiff );
    var y = Math.floor( (ce.lng() - Yucho.swLng) / Yucho.lngDiff );
    var data = Yucho.rectangleArrData[x][y];
    $('#status_num').html(data.length);
    var html ='';
    for( var i = 0, l = data.length; i < l; i++ ){
        var dataDetail = Yucho.rectangleArrData[x][y][i];
        html +=
            '<li>'+dataDetail.name+'</li>';
    }
    $('#status_shop').html(html);
};

///////////////////////////////////////////////////////////////////////
// データ格納（それぞれの短形領域へ）
///////////////////////////////////////////////////////////////////////
Yucho.storeDataToRectangle = function(place) {
    var latlng = new google.maps.LatLng(place.lat,place.lng);
    if( Yucho.bounds.contains(latlng) ){
        var x = Math.floor( (Yucho.neLat - place.lat ) / Yucho.latDiff );
        var y = Math.floor( (place.lng - Yucho.swLng) / Yucho.lngDiff );
        Yucho.boundsData.push(place);
        Yucho.rectangleArrData[x][y].push(place);
        Yucho.boundsLen++;
    }
};

///////////////////////////////////////////////////////////////////////
// マーカー作成
///////////////////////////////////////////////////////////////////////
Yucho.setMarker = function(x,y,length) {
    for (var i = 0; i < length; i++ ){
        var placeLoc = Yucho.rectangleArrData[x][y][i];
        var latlng = new google.maps.LatLng(placeLoc.lat,placeLoc.lng);
        var marker = new google.maps.Marker({
            title: 'Hello World!',
            position: latlng,
            map: Yucho.map
        });
        Yucho.markerArr.push(marker);
    }
};
///////////////////////////////////////////////////////////////////////
// マーカー作成
///////////////////////////////////////////////////////////////////////
Yucho.createMarker = function() {
    for( var x = 0, l1 = Yucho.gridCol; x < l1; x++ ){
        for( var y = 0, l2 = Yucho.gridRow; y < l2; y++ ){
            var dataLength = Yucho.rectangleArrData[x][y].length;
            if( dataLength > 0 ){
                // クラスタリング
                if (Yucho.zoom < 11){
                    Yucho.setMarker(x , y, 1);
                }else{
                    Yucho.setMarker(x , y, dataLength);
                }
            }
        }
    }
};

///////////////////////////////////////////////////////////////////////
// event
///////////////////////////////////////////////////////////////////////

window.onload = Yucho.initMap;