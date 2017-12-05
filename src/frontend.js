const $ = require("jquery");

$(".navbar-burger").each(function() {
    const $this = $(this);
    const $target = $this.closest(".navbar").find(".navbar-menu");

    $this.on("click", function() {
        $this.toggleClass("is-active");
        $target.toggleClass("is-active");
    });
});

$("html").removeClass("setting-up");