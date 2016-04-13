import 'bootstrap';
import {HttpClient} from 'aurelia-fetch-client';

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging();


  configureContainer(aurelia.container);
  aurelia.start().then(() => aurelia.setRoot());
}

function configureContainer(container) {
  let http = new HttpClient();
  http.configure(config => {
    config
      .withBaseUrl('http://192.168.99.100:8888/')
      .withDefaults({
        headers: {
          'Content-Type': 'application/json',
          'owner-key': 'a4a8f54d601d40f2aee8ec74e71e489e'
        }
      });
  });
  container.registerInstance(HttpClient, http); // <---- this line ensures everyone that `@inject`s a `HttpClient` instance will get the instance we configured above.
}
