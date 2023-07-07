export default {
  startAddress: "http://18.233.101.202",
  clickOnce: {
    container: {
      selector: "#app",
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
      selector: "#app div",
    },
    metadata: {
      link: {
        property: "href",
        selector: "a",
      },
    },
  },
  item: {
    container: {
      selector: "#app div",
    },
    metadata: {
      first: {
        property: "innerText",
        selector: "p.first",
      },
      second: {
        property: "innerText",
        selector: "p.second",
      },
    },
  },
};
