function splitScroll() {
  const controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({
    duration: "200%",
    triggerElement: ".about__title",
    triggerHook: 0
  })

    .setPin(".about__title")
    .addIndicators()
    .addTo(controller);
}

splitScroll();