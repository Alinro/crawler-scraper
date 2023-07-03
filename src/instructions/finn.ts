export default {
  startAddress: "https://www.finn.no/bap/browse.html",
  clickOnce: {
    container: {
      selector: ".link--dark",
    },
    metadata: {
      link: {
        property: "href",
        selector: "a",
      },
    },
  },
  click: {
    container: {
      selector: ".pagination",
    },
    metadata: {
      link: {
        property: "a",
        selector: "href",
      },
    },
  },
  item: {
    container: {
      selector: ".ads__unit",
    },
    metadata: {
      price: {
        property: "innerText",
        selector: ".ads__unit__img__ratio__price",
      },
      name: {
        property: "innerText",
        selector: ".ads__unit__content__title a",
      },
    },
  },
};
