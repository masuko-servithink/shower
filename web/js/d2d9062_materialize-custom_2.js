$(function () {
    $('.button-collapse').sideNav({
            menuWidth: 230, // Default is 240
            edge: 'left', // Choose the horizontal origin
            closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
        }
    );
})