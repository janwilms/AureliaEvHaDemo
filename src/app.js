export class App {
  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'overview'], name: 'overview',      moduleId: 'overview',      nav: true, title: 'Overview' }
    ]);

    this.router = router;
  }
}
